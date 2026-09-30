import type { CategoryDto, ProductDto } from "../../catalog/types/catalog";

export type AdminCategory = CategoryDto & {
  active: boolean;
  createdAt: string;
};

export type AdminProduct = ProductDto & {
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminOrder = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  paymentStatus: string;
  totalCents: number;
  itemCount: number;
  createdAt: string;
};
