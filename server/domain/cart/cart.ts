export type CartStatus = "Active" | "CheckedOut" | "Abandoned";

export type Cart = {
  id: string;
  sessionId: string;
  status: CartStatus;
  createdAt: string;
  updatedAt: string;
};
