import type { D1Database } from "@cloudflare/workers-types";
import type { Order, OrderStatus } from "../../domain/orders/order";
import type { OrderItem } from "../../domain/orders/orderItem";
import type { PaymentStatus } from "../../domain/payments/payment";
import type {
  CreateOrderInput,
  CreatedOrder,
  OrderRepository,
} from "../../repositories/orderRepository";

type OrderRow = {
  Id: string;
  CartId: string | null;
  Email: string;
  FirstName: string;
  LastName: string;
  Phone: string | null;
  Status: OrderStatus;
  PaymentStatus: PaymentStatus;
  SubtotalCents: number;
  ShippingCents: number;
  TotalCents: number;
  ShippingAddressJson: string;
  IdempotencyKey: string | null;
  CreatedAt: string;
  UpdatedAt: string;
};

type OrderItemRow = {
  Id: string;
  OrderId: string;
  ProductId: string;
  ProductName: string;
  Quantity: number;
  UnitPriceCents: number;
  LineTotalCents: number;
};

export class D1OrderRepository implements OrderRepository {
  constructor(private readonly db: D1Database) {}

  async findByIdempotencyKey(idempotencyKey: string): Promise<CreatedOrder | null> {
    const order = await this.db
      .prepare(
        `SELECT Id, CartId, Email, FirstName, LastName, Phone, Status, PaymentStatus,
                SubtotalCents, ShippingCents, TotalCents, ShippingAddressJson,
                IdempotencyKey, CreatedAt, UpdatedAt
         FROM Orders
         WHERE IdempotencyKey = ?`,
      )
      .bind(idempotencyKey)
      .first<OrderRow>();

    if (!order) {
      return null;
    }

    return {
      order: mapOrderRow(order),
      items: await this.listOrderItems(order.Id),
    };
  }

  async createPendingPaymentOrder(input: CreateOrderInput): Promise<CreatedOrder> {
    const existing = await this.findByIdempotencyKey(input.idempotencyKey);

    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const orderId = crypto.randomUUID();
    const orderItems = input.items.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
      orderId,
    }));

    const statements = [
      this.db
        .prepare(
          `INSERT INTO Orders (
             Id, CartId, Email, FirstName, LastName, Phone, Status, PaymentStatus,
             SubtotalCents, ShippingCents, TotalCents, ShippingAddressJson,
             CreatedAt, UpdatedAt, IdempotencyKey
           )
           VALUES (?, ?, ?, ?, ?, ?, 'PendingPayment', 'Pending', ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          orderId,
          input.cartId,
          input.email,
          input.firstName,
          input.lastName,
          input.phone,
          input.subtotalCents,
          input.shippingCents,
          input.totalCents,
          input.shippingAddressJson,
          now,
          now,
          input.idempotencyKey,
        ),
      ...orderItems.map((item) =>
        this.db
          .prepare(
            `INSERT INTO OrderItems (
               Id, OrderId, ProductId, ProductName, Quantity, UnitPriceCents, LineTotalCents
             )
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            item.id,
            item.orderId,
            item.productId,
            item.productName,
            item.quantity,
            item.unitPriceCents,
            item.lineTotalCents,
          ),
      ),
      this.db
        .prepare(
          `UPDATE Carts
           SET Status = 'CheckedOut', UpdatedAt = ?
           WHERE Id = ? AND Status = 'Active'`,
        )
        .bind(now, input.cartId),
    ];

    try {
      await this.db.batch(statements);
    } catch (error) {
      const existingAfterConflict = await this.findByIdempotencyKey(input.idempotencyKey);

      if (existingAfterConflict) {
        return existingAfterConflict;
      }

      throw error;
    }

    const created = await this.findByIdempotencyKey(input.idempotencyKey);

    if (!created) {
      throw new Error("Order could not be loaded after creation");
    }

    return created;
  }

  async updatePaymentState(
    orderId: string,
    paymentStatus: PaymentStatus,
    orderStatus: OrderStatus,
  ): Promise<Order | null> {
    const now = new Date().toISOString();
    const result = await this.db
      .prepare(
        `UPDATE Orders
         SET PaymentStatus = ?, Status = ?, UpdatedAt = ?
         WHERE Id = ?
           AND Status = 'PendingPayment'
           AND PaymentStatus = 'Pending'`,
      )
      .bind(paymentStatus, orderStatus, now, orderId)
      .run();

    if (result.meta.changes === 0) {
      return this.findOrderById(orderId);
    }

    return this.findOrderById(orderId);
  }

  private async findOrderById(orderId: string): Promise<Order | null> {
    const row = await this.db
      .prepare(
        `SELECT Id, CartId, Email, FirstName, LastName, Phone, Status, PaymentStatus,
                SubtotalCents, ShippingCents, TotalCents, ShippingAddressJson,
                IdempotencyKey, CreatedAt, UpdatedAt
         FROM Orders
         WHERE Id = ?`,
      )
      .bind(orderId)
      .first<OrderRow>();

    return row ? mapOrderRow(row) : null;
  }

  private async listOrderItems(orderId: string): Promise<OrderItem[]> {
    const result = await this.db
      .prepare(
        `SELECT Id, OrderId, ProductId, ProductName, Quantity, UnitPriceCents, LineTotalCents
         FROM OrderItems
         WHERE OrderId = ?
         ORDER BY Id ASC`,
      )
      .bind(orderId)
      .all<OrderItemRow>();

    return result.results.map(mapOrderItemRow);
  }
}

function mapOrderRow(row: OrderRow): Order {
  return {
    id: row.Id,
    cartId: row.CartId,
    email: row.Email,
    firstName: row.FirstName,
    lastName: row.LastName,
    phone: row.Phone,
    status: row.Status,
    paymentStatus: row.PaymentStatus,
    subtotalCents: row.SubtotalCents,
    shippingCents: row.ShippingCents,
    totalCents: row.TotalCents,
    shippingAddressJson: row.ShippingAddressJson,
    idempotencyKey: row.IdempotencyKey,
    createdAt: row.CreatedAt,
    updatedAt: row.UpdatedAt,
  };
}

function mapOrderItemRow(row: OrderItemRow): OrderItem {
  return {
    id: row.Id,
    orderId: row.OrderId,
    productId: row.ProductId,
    productName: row.ProductName,
    quantity: row.Quantity,
    unitPriceCents: row.UnitPriceCents,
    lineTotalCents: row.LineTotalCents,
  };
}
