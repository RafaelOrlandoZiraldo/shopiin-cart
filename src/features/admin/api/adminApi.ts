import type { AdminCategory, AdminOrder, AdminProduct } from "../types/admin";

async function adminJson<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });
  if (!response.ok) throw new Error(`Admin request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export const adminApi = {
  listCategories: (token: string) => adminJson<AdminCategory[]>("/api/admin/categories", token),
  createCategory: (token: string, body: Partial<AdminCategory>) =>
    adminJson<AdminCategory>("/api/admin/categories", token, { method: "POST", body: JSON.stringify(body) }),
  updateCategory: (token: string, id: string, body: Partial<AdminCategory>) =>
    adminJson<AdminCategory>(`/api/admin/categories/${id}`, token, { method: "PUT", body: JSON.stringify(body) }),
  deleteCategory: (token: string, id: string) =>
    adminJson<{ deleted: boolean }>(`/api/admin/categories/${id}`, token, { method: "DELETE" }),
  listProducts: (token: string) => adminJson<AdminProduct[]>("/api/admin/products", token),
  createProduct: (token: string, body: Partial<AdminProduct>) =>
    adminJson<AdminProduct>("/api/admin/products", token, { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (token: string, id: string, body: Partial<AdminProduct>) =>
    adminJson<AdminProduct>(`/api/admin/products/${id}`, token, { method: "PUT", body: JSON.stringify(body) }),
  setProductActive: (token: string, id: string, active: boolean) =>
    adminJson<AdminProduct>(`/api/admin/products/${id}/status`, token, { method: "PATCH", body: JSON.stringify({ active }) }),
  deleteProduct: (token: string, id: string) =>
    adminJson<{ deleted: boolean }>(`/api/admin/products/${id}`, token, { method: "DELETE" }),
  listOrders: (token: string) => adminJson<AdminOrder[]>("/api/admin/orders", token),
  uploadImage: async (token: string, file: File): Promise<{ key: string; url: string }> => {
    const formData = new FormData();
    formData.set("file", file);
    const response = await fetch("/api/admin/images", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
    return response.json() as Promise<{ key: string; url: string }>;
  },
};
