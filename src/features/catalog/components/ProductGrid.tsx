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
    <div className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
      <div className="grid auto-rows-[320px] grid-cols-1 gap-4 pb-2 sm:auto-rows-[300px] sm:grid-cols-2 lg:auto-rows-[282px] lg:grid-cols-3">
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
    </div>
  );
}
