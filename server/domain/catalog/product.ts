export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
