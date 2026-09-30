import { CategoryFilter } from "../components/CategoryFilter";
import { Pagination } from "../components/Pagination";
import { ProductGrid } from "../components/ProductGrid";
import { SearchBox } from "../components/SearchBox";
import { useCategoriesQuery, useProductsQuery } from "../hooks/useCatalogQueries";
import type { ProductFilters } from "../types/catalog";

type CatalogPageProps = {
  filters: ProductFilters;
  cartItemCount: number;
  addingProductId?: string;
  onFiltersChange: (filters: ProductFilters) => void;
  onOpenProduct: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onOpenCart: () => void;
};

export function CatalogPage({
  filters,
  cartItemCount,
  addingProductId,
  onFiltersChange,
  onOpenProduct,
  onAddToCart,
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
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
              Catalogo
            </p>
            <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
              Productos disponibles
            </h1>
          </div>
          <button
            className="h-11 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-emerald-700 hover:text-emerald-800"
            type="button"
            onClick={onOpenCart}
          >
            Carrito ({cartItemCount})
          </button>
        </header>

        <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:flex-row md:items-end">
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
          <div className="flex flex-col gap-5">
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
      </section>
    </main>
  );
}

function CatalogState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
      <p className="mt-2 text-sm text-zinc-600">{detail}</p>
    </div>
  );
}
