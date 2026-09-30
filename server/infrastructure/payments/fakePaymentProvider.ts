import type {
  CreatePaymentRequest,
  CreatePaymentResult,
  PaymentProvider,
} from "../../application/payments/paymentProvider";

export class FakePaymentProvider implements PaymentProvider {
  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResult> {
    return {
      provider: "fake",
      providerPaymentId: `fake_${request.orderId}`,
      status: "Pending",
      redirectUrl: null,
    };
  }
}
