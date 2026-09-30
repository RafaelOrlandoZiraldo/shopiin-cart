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
    <main className="min-h-screen bg-white text-zinc-950">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0f1f5c]/95 backdrop-blur">
        <div className="mx-auto flex min-h-[82px] w-[min(100%-32px,1180px)] flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <button className="flex items-center gap-3 text-left text-white" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img
              className="h-[56px] w-[56px] rounded-full border border-white/25 object-cover shadow-[var(--brand-shadow)]"
              src="/brand-logo.svg"
              alt="Distribuidora 87"
            />
            <span>
              <span className="block text-xl font-extrabold">Distribuidora 87</span>
              <span className="block text-sm text-white/80">Soluciones para tu negocio</span>
            </span>
          </button>
          <nav className="flex flex-wrap items-center gap-4 text-sm font-extrabold text-white">
            <a href="#inicio">Inicio</a>
            <a href="#productos">Productos</a>
            <a href="#contacto">Contacto</a>
            <button
              className="rounded-xl bg-white px-4 py-3 font-extrabold text-[#0f1f5c]"
              type="button"
              onClick={onOpenCart}
            >
              Carrito ({cartItemCount})
            </button>
          </nav>
        </div>
      </header>

      <section
        id="inicio"
        className="relative overflow-hidden bg-[linear-gradient(120deg,rgba(15,31,92,0.94),rgba(193,18,47,0.86))] py-20 text-white sm:py-24"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.16),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.10),rgba(0,0,0,0.22))]" />
        <div className="relative mx-auto grid w-[min(100%-32px,1180px)] gap-8 lg:grid-cols-[1.3fr_0.8fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-extrabold">
              Calidad, atencion y respuesta rapida
            </span>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">
              Todo lo que tu comercio necesita, en un solo lugar
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/90">
              Descartables, bolsas de arranque y cajas de pizza para negocios,
              gastronomia y emprendimientos que necesitan reposicion constante,
              buen precio y atencion directa.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                className="inline-flex rounded-xl bg-gradient-to-br from-[#c1122f] to-[#a90f29] px-6 py-4 text-sm font-extrabold text-white shadow-[var(--brand-shadow)]"
                href="#productos"
              >
                Ver productos
              </a>
              <button
                className="inline-flex rounded-xl border border-[var(--brand-border)] bg-white px-6 py-4 text-sm font-extrabold text-[#0f1f5c]"
                type="button"
                onClick={onOpenCart}
              >
                Abrir carrito
              </button>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Facebook", "Instagram", "WhatsApp"].map((item) => (
                <span key={item} className="rounded-full bg-white/15 px-3 py-2 text-sm font-bold">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <aside className="rounded-[22px] bg-white p-7 text-zinc-950 shadow-[var(--brand-shadow)]">
            <h2 className="text-xl font-extrabold text-[#0f1f5c]">Que vas a encontrar</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-[var(--brand-text)]">
              <li>Descartables para uso comercial</li>
              <li>Bolsas de arranque en distintas opciones</li>
              <li>Cajas de pizza para gastronomia y delivery</li>
            </ul>
            <p className="mt-5 font-bold text-[#c1122f]">Carrito integrado para armar tu pedido.</p>
          </aside>
        </div>
      </section>

      <section id="productos" className="bg-[var(--brand-light)] py-20">
        <div className="mx-auto flex w-[min(100%-32px,1180px)] flex-col gap-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-[#0f1f5c]/10 px-4 py-2 text-sm font-extrabold text-[#0f1f5c]">
              Productos
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-[#0f1f5c]">
              Catalogo para tu comercio
            </h2>
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

      <section id="contacto" className="py-20">
        <div className="mx-auto grid w-[min(100%-32px,1180px)] gap-7 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[22px] bg-white p-7 shadow-[var(--brand-shadow)]">
            <span className="inline-flex rounded-full bg-[#0f1f5c]/10 px-4 py-2 text-sm font-extrabold text-[#0f1f5c]">
              Contacto
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-[#0f1f5c]">Hacenos tu consulta</h2>
            <p className="mt-3 leading-7 text-[var(--brand-text)]">
              Podes armar tu carrito o escribirnos por redes para coordinar precios,
              disponibilidad y entrega.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["Facebook", "Instagram", "WhatsApp"].map((item) => (
                <a key={item} className="rounded-xl bg-[#0f1f5c] px-4 py-3 text-sm font-bold text-white" href="#contacto">
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="rounded-[22px] border border-[var(--brand-border)] bg-[#fbfdff] p-7 shadow-[var(--brand-shadow)]">
            <p className="text-[var(--brand-text)]"><strong className="text-[#0f1f5c]">Facebook:</strong> /distribuidora87</p>
            <p className="mt-3 text-[var(--brand-text)]"><strong className="text-[#0f1f5c]">Instagram:</strong> @distribuidora87</p>
            <p className="mt-3 text-[var(--brand-text)]"><strong className="text-[#0f1f5c]">WhatsApp:</strong> +54 9 0000 000000</p>
          </div>
        </div>
      </section>

      <footer className="bg-[#0f1f5c] py-6 text-white">
        <div className="mx-auto flex w-[min(100%-32px,1180px)] flex-wrap items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Distribuidora 87</p>
          <button className="font-bold" type="button" onClick={onOpenCart}>Ver carrito</button>
        </div>
      </footer>
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
