export type CheckoutRequestDto = {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  shippingAddress: {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
};

export type CheckoutResponseDto = {
  orderId: string;
  status: "PendingPayment";
  totalCents: number;
  payment: {
    redirectUrl: string | null;
  };
};
