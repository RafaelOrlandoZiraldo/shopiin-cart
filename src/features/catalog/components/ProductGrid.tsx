import { ProductCard } from "./ProductCard";
import type { ProductDto } from "../types/catalog";

type ProductGridProps = {
  products: ProductDto[];
  onOpenProduct: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  addingProductId?: string;
};

export function ProductGrid({
  products,
  onOpenProduct,
  onAddToCart,
  addingProductId,
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onOpen={onOpenProduct}
          onAddToCart={onAddToCart}
          adding={addingProductId === product.id}
        />
      ))}
    </div>
  );
}
