import type { CartRepository } from "../../repositories/cartRepository";
import type { CatalogRepository } from "../../repositories/catalogRepository";
import type { OrderRepository } from "../../repositories/orderRepository";
import type { PaymentRepository } from "../../repositories/paymentRepository";
import type { PaymentProvider } from "../payments/paymentProvider";
import { toCheckoutResponse, type CheckoutResponseDto } from "./checkoutDtos";
import { emptyCartError, unavailableProductError } from "./checkoutErrors";
import type { CheckoutRequestDto } from "./dtos";

export async function createCheckout(
  cartRepository: CartRepository,
  catalogRepository: CatalogRepository,
  orderRepository: OrderRepository,
  paymentRepository: PaymentRepository,
  paymentProvider: PaymentProvider,
  input: {
    cartSessionId: string;
    idempotencyKey: string;
    checkout: CheckoutRequestDto;
  },
): Promise<CheckoutResponseDto> {
  const existingOrder = await orderRepository.findByIdempotencyKey(input.idempotencyKey);

  if (existingOrder) {
    return toCheckoutResponse(existingOrder);
  }

  const cart = await cartRepository.findActiveCartBySessionId(input.cartSessionId);

  if (!cart || cart.items.length === 0) {
    throw emptyCartError();
  }

  const orderItems = [];

  for (const item of cart.items) {
    const product = await catalogRepository.findActiveProductById(item.productId);

    if (!product) {
      throw unavailableProductError();
    }

    orderItems.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unitPriceCents: product.priceCents,
      lineTotalCents: item.quantity * product.priceCents,
    });
  }

  const subtotalCents = orderItems.reduce((total, item) => total + item.lineTotalCents, 0);
  const shippingCents = 0;
  const totalCents = subtotalCents + shippingCents;

  const order = await orderRepository.createPendingPaymentOrder({
    cartId: cart.cart.id,
    email: input.checkout.customer.email,
    firstName: input.checkout.customer.firstName,
    lastName: input.checkout.customer.lastName,
    phone: input.checkout.customer.phone ?? null,
    subtotalCents,
    shippingCents,
    totalCents,
    shippingAddressJson: JSON.stringify(input.checkout.shippingAddress),
    idempotencyKey: input.idempotencyKey,
    items: orderItems,
  });

  const payment = await paymentProvider.createPayment({
    orderId: order.order.id,
    amountCents: order.order.totalCents,
    currency: "ARS",
    customerEmail: order.order.email,
    idempotencyKey: `${input.idempotencyKey}:payment`,
  });

  await paymentRepository.createPayment({
    orderId: order.order.id,
    provider: payment.provider,
    providerPaymentId: payment.providerPaymentId,
    status: payment.status,
    amountCents: order.order.totalCents,
    idempotencyKey: `${input.idempotencyKey}:payment`,
  });

  return {
    ...toCheckoutResponse(order),
    payment: {
      redirectUrl: payment.redirectUrl,
    },
  };
}
