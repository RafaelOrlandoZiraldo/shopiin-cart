import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";

export function useAdminData(token: string) {
  const queryClient = useQueryClient();
  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminApi.listCategories(token),
    enabled: !!token,
  });
  const products = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => adminApi.listProducts(token),
    enabled: !!token,
  });
  const orders = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminApi.listOrders(token),
    enabled: !!token,
  });
  const invalidateCatalog = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin"] });
    await queryClient.invalidateQueries({ queryKey: ["catalog"] });
  };

  return {
    categories,
    products,
    orders,
    createCategory: useMutation({ mutationFn: (body: Parameters<typeof adminApi.createCategory>[1]) => adminApi.createCategory(token, body), onSuccess: invalidateCatalog }),
    updateCategory: useMutation({ mutationFn: (input: { id: string; body: Parameters<typeof adminApi.updateCategory>[2] }) => adminApi.updateCategory(token, input.id, input.body), onSuccess: invalidateCatalog }),
    deleteCategory: useMutation({ mutationFn: (id: string) => adminApi.deleteCategory(token, id), onSuccess: invalidateCatalog }),
    createProduct: useMutation({ mutationFn: (body: Parameters<typeof adminApi.createProduct>[1]) => adminApi.createProduct(token, body), onSuccess: invalidateCatalog }),
    updateProduct: useMutation({ mutationFn: (input: { id: string; body: Parameters<typeof adminApi.updateProduct>[2] }) => adminApi.updateProduct(token, input.id, input.body), onSuccess: invalidateCatalog }),
    setProductActive: useMutation({ mutationFn: (input: { id: string; active: boolean }) => adminApi.setProductActive(token, input.id, input.active), onSuccess: invalidateCatalog }),
    deleteProduct: useMutation({ mutationFn: (id: string) => adminApi.deleteProduct(token, id), onSuccess: invalidateCatalog }),
    uploadImage: useMutation({ mutationFn: (file: File) => adminApi.uploadImage(token, file) }),
  };
}
