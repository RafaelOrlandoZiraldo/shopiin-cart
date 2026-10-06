import type { PaymentStatus } from "../../domain/payments/payment";
import { AppError } from "../../shared/http/appError";
import type { PaymentWebhookDto } from "../../application/payments/dtos";

type MercadoPagoWebhookBody = {
  id?: string | number;
  action?: string;
  live_mode?: boolean;
  type?: string;
  data?: {
    id?: string | number;
  };
};

type MercadoPagoPaymentResponse = {
  id: string | number;
  status: string;
  transaction_amount?: number;
  external_reference?: string | null;
};

export async function parseMercadoPagoWebhook(input: {
  request: Request;
  body: unknown;
  accessToken: string;
  webhookSecret?: string;
}): Promise<PaymentWebhookDto> {
  const body = mercadoPagoWebhookBody(input.body);
  const paymentId = getPaymentId(input.request, body);

  if (input.webhookSecret) {
    await validateMercadoPagoSignature({
      request: input.request,
      dataId: paymentId,
      secret: input.webhookSecret,
    });
  }

  const payment = await fetchMercadoPagoPayment(paymentId, input.accessToken);
  const orderId = payment.external_reference;

  if (!orderId) {
    throw invalidMercadoPagoWebhook("Mercado Pago payment is missing external_reference");
  }

  return {
    eventId: String(body.id ?? `${body.action ?? "payment"}:${payment.id}:${payment.status}`),
    orderId,
    providerPaymentId: String(payment.id),
    status: mapMercadoPagoStatus(payment.status),
    amountCents: Math.round((payment.transaction_amount ?? 0) * 100),
  };
}

export function isMercadoPagoWebhookConnectivityTest(body: unknown): boolean {
  if (!body || typeof body !== "object") {
    return false;
  }

  const mercadoPagoBody = body as MercadoPagoWebhookBody;

  return (
    mercadoPagoBody.action === "payment.updated" &&
    mercadoPagoBody.type === "payment" &&
    mercadoPagoBody.live_mode === false &&
    String(mercadoPagoBody.id) === "123456" &&
    String(mercadoPagoBody.data?.id) === "123456"
  );
}

async function validateMercadoPagoSignature(input: {
  request: Request;
  dataId: string;
  secret: string;
}) {
  const xSignature = input.request.headers.get("x-signature");
  const xRequestId = input.request.headers.get("x-request-id");

  if (!xSignature || !xRequestId) {
    throw invalidMercadoPagoSignature();
  }

  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim(), value?.trim()];
    }),
  );
  const ts = parts.ts;
  const expected = parts.v1;

  if (!ts || !expected) {
    throw invalidMercadoPagoSignature();
  }

  const signedTemplate = `id:${input.dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const actual = await hmacSha256Hex(input.secret, signedTemplate);

  if (!constantTimeEqual(actual, expected)) {
    throw invalidMercadoPagoSignature();
  }
}

async function fetchMercadoPagoPayment(
  paymentId: string,
  accessToken: string,
): Promise<MercadoPagoPaymentResponse> {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    console.error("mercadopago_payment_fetch_failed", {
      status: response.status,
      paymentId,
    });
    throw new AppError({
      type: "payment_provider_error",
      title: "Payment provider failed",
      status: 502,
      detail: "Could not fetch payment details",
    });
  }

  return response.json() as Promise<MercadoPagoPaymentResponse>;
}

function mercadoPagoWebhookBody(body: unknown): MercadoPagoWebhookBody {
  if (!body || typeof body !== "object") {
    throw invalidMercadoPagoWebhook("Invalid Mercado Pago webhook body");
  }

  return body as MercadoPagoWebhookBody;
}

function getPaymentId(request: Request, body: MercadoPagoWebhookBody): string {
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("data_id");
  const paymentId = dataId ?? body.data?.id ?? body.id;

  if (paymentId === undefined || paymentId === null || String(paymentId).trim() === "") {
    throw invalidMercadoPagoWebhook("Mercado Pago webhook is missing payment id");
  }

  return String(paymentId);
}

function mapMercadoPagoStatus(status: string): PaymentStatus {
  if (status === "approved" || status === "authorized") {
    return "Paid";
  }

  if (["cancelled", "charged_back", "refunded", "rejected"].includes(status)) {
    return "Failed";
  }

  return "Pending";
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;

  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return result === 0;
}

function invalidMercadoPagoSignature() {
  return new AppError({
    type: "invalid_payment_webhook_signature",
    title: "Invalid payment webhook signature",
    status: 401,
    detail: "Payment webhook signature could not be verified",
  });
}

function invalidMercadoPagoWebhook(detail: string) {
  return new AppError({
    type: "invalid_payment_webhook",
    title: "Invalid payment webhook",
    status: 400,
    detail,
  });
}
