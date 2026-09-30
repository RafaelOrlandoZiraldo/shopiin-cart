import { describe, expect, it } from "vitest";
import { createCheckout } from "../server/application/checkout/createCheckout";
import { checkoutRequestSchema } from "../server/application/checkout/dtos";
import type { Cart } from "../server/domain/cart/cart";
import type { CartItem } from "../server/domain/cart/cartItem";
import type { Product } from "../server/domain/catalog/product";
import type { Order } from "../server/domain/orders/order";
import type { OrderItem } from "../server/domain/orders/orderItem";
import type { CartRepository, CartWithItems } from "../server/repositories/cartRepository";
import type { CatalogRepository } from "../server/repositories/catalogRepository";
import type { CreateOrderInput, CreatedOrder, OrderRepository } from "../server/repositories/orderRepository";
import type { CreatePaymentInput, PaymentRepository, RecordWebhookPaymentInput } from "../server/repositories/paymentRepository";
import { FakePaymentProvider } from "../server/infrastructure/payments/fakePaymentProvider";
import { AppError } from "../server/shared/http/appError";
import { parseDto } from "../server/shared/http/validation";

const sessionId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const idempotencyKey = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const productId = "33333333-3333-4333-8333-333333333331";
const checkout = parseDto(checkoutRequestSchema, {
  customer: {
    firstName: "Rafael",
    lastName: "Ziraldo",
    email: "rafael@example.com",
    phone: "",
  },
  shippingAddress: {
    line1: "Calle 123",
    line2: "",
    city: "Villa Regina",
    state: "Rio Negro",
    postalCode: "8336",
    country: "AR",
  },
});

describe("checkout application service", () => {
  it("creates a pending payment order with product snapshots and recalculated prices", async () => {
    const orderRepository = new InMemoryOrderRepository();

    const response = await createCheckout(
      new StaticCartRepository([
        {
          id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          cartId: "cart-id",
          productId,
          quantity: 2,
          unitPriceCents: 1,
          createdAt: "2026-09-29T00:00:00.000Z",
          updatedAt: "2026-09-29T00:00:00.000Z",
        },
      ]),
      new StaticCatalogRepository({
        id: productId,
        categoryId: "category-id",
        name: "Agua mineral 500ml",
        description: null,
        priceCents: 900,
        imageUrl: null,
        active: true,
        createdAt: "2026-09-29T00:00:00.000Z",
        updatedAt: "2026-09-29T00:00:00.000Z",
      }),
      orderRepository,
      new InMemoryPaymentRepository(),
      new FakePaymentProvider(),
      { cartSessionId: sessionId, idempotencyKey, checkout },
    );

    expect(response).toMatchObject({
      status: "PendingPayment",
      totalCents: 1800,
      payment: { redirectUrl: null },
    });
    expect(orderRepository.created?.items[0]).toMatchObject({
      productName: "Agua mineral 500ml",
      unitPriceCents: 900,
      lineTotalCents: 1800,
    });
  });

  it("returns the existing order for the same idempotency key", async () => {
    const orderRepository = new InMemoryOrderRepository();
    const cartRepository = new StaticCartRepository([]);

    orderRepository.existing = makeCreatedOrder(idempotencyKey, 1234);

    const response = await createCheckout(
      cartRepository,
      new StaticCatalogRepository(null),
      orderRepository,
      new InMemoryPaymentRepository(),
      new FakePaymentProvider(),
      { cartSessionId: sessionId, idempotencyKey, checkout },
    );

    expect(response.orderId).toBe(orderRepository.existing.order.id);
    expect(response.totalCents).toBe(1234);
    expect(cartRepository.readCount).toBe(0);
  });

  it("rejects empty carts", async () => {
    await expect(
      createCheckout(
        new StaticCartRepository([]),
        new StaticCatalogRepository(null),
        new InMemoryOrderRepository(),
        new InMemoryPaymentRepository(),
        new FakePaymentProvider(),
        { cartSessionId: sessionId, idempotencyKey, checkout },
      ),
    ).rejects.toBeInstanceOf(AppError);
  });
});

class StaticCartRepository implements CartRepository {
  readCount = 0;
  private readonly cart: Cart = {
    id: "cart-id",
    sessionId,
    status: "Active",
    createdAt: "2026-09-29T00:00:00.000Z",
    updatedAt: "2026-09-29T00:00:00.000Z",
  };

  constructor(private readonly items: CartItem[]) {}

  async findActiveCartBySessionId(): Promise<CartWithItems | null> {
    this.readCount += 1;
    return { cart: this.cart, items: this.items };
  }

  async createCart() {
    return this.cart;
  }

  async addItem() {
    return {
      id: "unused",
      cartId: this.cart.id,
      productId,
      quantity: 1,
      unitPriceCents: 1,
      createdAt: "2026-09-29T00:00:00.000Z",
      updatedAt: "2026-09-29T00:00:00.000Z",
    };
  }

  async updateItemQuantity() {
    return null;
  }

  async removeItem() {
    return false;
  }

  async clearCart() {}
}

class StaticCatalogRepository implements CatalogRepository {
  constructor(private readonly product: Product | null) {}

  async listActiveCategories() {
    return [];
  }

  async searchActiveProducts() {
    return { items: [], page: 1, pageSize: 20, total: 0 };
  }

  async findActiveProductById(productIdToFind: string) {
    return this.product?.id === productIdToFind ? this.product : null;
  }
}

class InMemoryOrderRepository implements OrderRepository {
  existing: CreatedOrder | null = null;
  created: CreatedOrder | null = null;

  async findByIdempotencyKey(key: string): Promise<CreatedOrder | null> {
    return this.existing?.order.idempotencyKey === key ? this.existing : null;
  }

  async createPendingPaymentOrder(input: CreateOrderInput): Promise<CreatedOrder> {
    this.created = makeCreatedOrder(input.idempotencyKey, input.totalCents, input.items);
    this.existing = this.created;
    return this.created;
  }

  async updatePaymentState() {
    return this.existing?.order ?? null;
  }
}

class InMemoryPaymentRepository implements PaymentRepository {
  async createPayment(input: CreatePaymentInput) {
    return {
      id: "payment-id",
      orderId: input.orderId,
      provider: input.provider,
      providerPaymentId: input.providerPaymentId,
      status: input.status,
      amountCents: input.amountCents,
      idempotencyKey: input.idempotencyKey,
      createdAt: "2026-09-29T00:00:00.000Z",
      updatedAt: "2026-09-29T00:00:00.000Z",
    };
  }

  async findByIdempotencyKey() {
    return null;
  }

  async recordWebhookPayment(input: RecordWebhookPaymentInput) {
    return {
      id: "payment-id",
      orderId: input.orderId,
      provider: input.provider,
      providerPaymentId: input.providerPaymentId,
      status: input.status,
      amountCents: input.amountCents,
      idempotencyKey: input.idempotencyKey,
      createdAt: "2026-09-29T00:00:00.000Z",
      updatedAt: "2026-09-29T00:00:00.000Z",
    };
  }
}

function makeCreatedOrder(
  key: string,
  totalCents: number,
  items: CreateOrderInput["items"] = [],
): CreatedOrder {
  const order: Order = {
    id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    cartId: "cart-id",
    email: "rafael@example.com",
    firstName: "Rafael",
    lastName: "Ziraldo",
    phone: null,
    status: "PendingPayment",
    paymentStatus: "Pending",
    subtotalCents: totalCents,
    shippingCents: 0,
    totalCents,
    shippingAddressJson: "{}",
    idempotencyKey: key,
    createdAt: "2026-09-29T00:00:00.000Z",
    updatedAt: "2026-09-29T00:00:00.000Z",
  };

  return {
    order,
    items: items.map<OrderItem>((item, index) => ({
      id: `item-${index}`,
      orderId: order.id,
      ...item,
    })),
  };
}
