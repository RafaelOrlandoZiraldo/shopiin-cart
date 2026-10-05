import { LoadingState } from "../../../components/LoadingState";
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
    <main className="brand-page flex flex-col text-zinc-950">
      <StoreHeader active="products" cartItemCount={cartItemCount} onNavigate={onNavigate} onOpenCart={onOpenCart} />
      <section className="min-h-0 flex-1 overflow-hidden py-5">
        <div className="mx-auto flex h-full w-[min(100%-32px,1180px)] flex-col gap-4">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <span className="brand-chip inline-flex rounded-full px-4 py-2 text-sm font-extrabold">
              Productos
              </span>
              <h1 className="mt-3 text-3xl font-black leading-tight text-[#243a73] sm:text-4xl">
                Catalogo para tu comercio
              </h1>
            </div>
            <p className="max-w-2xl leading-7 text-[var(--brand-text)] lg:justify-self-end">
              Busca por nombre, filtra por categoria y agrega productos al carrito
              para preparar tu compra con rapidez.
            </p>
          </div>

          <div className="brand-card flex flex-col gap-3 rounded-[28px] p-4 md:flex-row md:items-end">
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
            <LoadingState title="Cargando catalogo" detail="Estamos buscando productos." />
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
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
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
    <div className="brand-card rounded-[28px] border-dashed px-6 py-14 text-center">
      <h2 className="text-lg font-extrabold text-[#243a73]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--brand-text)]">{detail}</p>
    </div>
  );
}
