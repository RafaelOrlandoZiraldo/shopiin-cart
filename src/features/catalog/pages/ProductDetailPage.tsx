import { useProductQuery } from "../hooks/useCatalogQueries";

type ProductDetailPageProps = {
  productId: string;
  adding?: boolean;
  cartItemCount: number;
  onBack: () => void;
  onAddToCart: (productId: string) => void;
  onOpenCart: () => void;
};

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function ProductDetailPage({
  productId,
  adding,
  cartItemCount,
  onBack,
  onAddToCart,
  onOpenCart,
}: ProductDetailPageProps) {
  const productQuery = useProductQuery(productId);
  const product = productQuery.data;

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <button
            className="w-fit rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-emerald-700 hover:text-emerald-800"
            type="button"
            onClick={onBack}
          >
            Volver
          </button>
          <button
            className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 shadow-sm"
            type="button"
            onClick={onOpenCart}
          >
            Carrito ({cartItemCount})
          </button>
        </div>

        {productQuery.isLoading ? (
          <DetailState title="Cargando producto" detail="Estamos buscando el detalle." />
        ) : productQuery.isError || !product ? (
          <DetailState title="Producto no disponible" detail="No pudimos cargar este producto." />
        ) : (
          <article className="grid overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
            <div className="flex aspect-[4/3] items-center justify-center bg-zinc-100 lg:aspect-auto">
              {product.imageUrl ? (
                <img
                  className="h-full w-full object-cover"
                  src={product.imageUrl}
                  alt={product.name}
                />
              ) : (
                <span className="px-4 text-center text-sm font-medium text-zinc-500">
                  Imagen pendiente
                </span>
              )}
            </div>
            <div className="flex flex-col gap-4 p-5 sm:p-8">
              <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
                Producto
              </p>
              <h1 className="text-3xl font-semibold tracking-normal">{product.name}</h1>
              <p className="text-2xl font-semibold text-emerald-800">
                {currencyFormatter.format(product.priceCents / 100)}
              </p>
              <p className="text-base leading-7 text-zinc-600">
                {product.description ?? "Sin descripcion disponible."}
              </p>
              <button
                className="mt-2 h-11 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                disabled={adding}
                onClick={() => onAddToCart(product.id)}
              >
                Agregar al carrito
              </button>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}

function DetailState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
      <h1 className="text-lg font-semibold text-zinc-950">{title}</h1>
      <p className="mt-2 text-sm text-zinc-600">{detail}</p>
    </div>
  );
}
