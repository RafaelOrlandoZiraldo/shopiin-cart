import { CategoryFilter } from "../components/CategoryFilter";
import { Pagination } from "../components/Pagination";
import { ProductGrid } from "../components/ProductGrid";
import { SearchBox } from "../components/SearchBox";
import { StoreFooter } from "../components/StoreFooter";
import { StoreHeader } from "../components/StoreHeader";
import { useCategoriesQuery, useProductsQuery } from "../hooks/useCatalogQueries";
import type { ProductFilters } from "../types/catalog";

type CatalogPageProps = {
  filters: ProductFilters;
  cartItemCount: number;
  addingProductId?: string;
  onFiltersChange: (filters: ProductFilters) => void;
  onOpenProduct: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onNavigate: (path: string) => void;
  onOpenCart: () => void;
};

export function CatalogPage({
  filters,
  cartItemCount,
  addingProductId,
  onFiltersChange,
  onOpenProduct,
  onAddToCart,
  onNavigate,
  onOpenCart,
}: CatalogPageProps) {
  const categoriesQuery = useCategoriesQuery();
  const productsQuery = useProductsQuery(filters);

  const isLoading = categoriesQuery.isLoading || productsQuery.isLoading;
  const isError = categoriesQuery.isError || productsQuery.isError;
  const productList = productsQuery.data;
  const products = productList?.items ?? [];

  function updateFilters(nextFilters: Partial<ProductFilters>) {
    onFiltersChange({
      ...filters,
      ...nextFilters,
      page: nextFilters.page ?? 1,
    });
  }

  return (
    <main className="min-h-screen bg-[var(--brand-light)] text-zinc-950">
      <StoreHeader active="products" cartItemCount={cartItemCount} onNavigate={onNavigate} onOpenCart={onOpenCart} />
      <section className="py-16">
        <div className="mx-auto flex w-[min(100%-32px,1180px)] flex-col gap-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-[#0f1f5c]/10 px-4 py-2 text-sm font-extrabold text-[#0f1f5c]">
              Productos
            </span>
            <h1 className="mt-4 text-3xl font-extrabold text-[#0f1f5c]">
              Catalogo para tu comercio
            </h1>
            <p className="mt-3 leading-7 text-[var(--brand-text)]">
              Busca por nombre, filtra por categoria y agrega productos al carrito
              para preparar tu compra.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-[22px] border border-[var(--brand-border)] bg-white p-5 shadow-[var(--brand-shadow)] md:flex-row md:items-end">
            <SearchBox value={filters.search} onSearch={(search) => updateFilters({ search })} />
            <div className="md:w-64">
              <CategoryFilter
                categories={categoriesQuery.data ?? []}
                value={filters.category}
                disabled={categoriesQuery.isLoading}
                onChange={(category) => updateFilters({ category })}
              />
            </div>
          </div>

          {isLoading ? (
            <CatalogState title="Cargando catalogo" detail="Estamos buscando productos." />
          ) : isError ? (
            <CatalogState
              title="No pudimos cargar el catalogo"
              detail="Reintenta en unos segundos."
            />
          ) : !productList || products.length === 0 ? (
            <CatalogState
              title="Sin productos"
              detail="No hay resultados para los filtros seleccionados."
            />
          ) : (
            <div className="flex flex-col gap-6">
              <ProductGrid
                products={products}
                onOpenProduct={onOpenProduct}
                onAddToCart={onAddToCart}
                addingProductId={addingProductId}
              />
              <Pagination
                page={productList.page}
                pageSize={productList.pageSize}
                total={productList.total}
                disabled={productsQuery.isFetching}
                onPageChange={(page) => updateFilters({ page })}
              />
            </div>
          )}
        </div>
      </section>
      <StoreFooter onOpenCart={onOpenCart} />
    </main>
  );
}

function CatalogState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-[22px] border border-dashed border-[var(--brand-border)] bg-white px-6 py-12 text-center shadow-[var(--brand-shadow)]">
      <h2 className="text-lg font-extrabold text-[#0f1f5c]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--brand-text)]">{detail}</p>
    </div>
  );
}
