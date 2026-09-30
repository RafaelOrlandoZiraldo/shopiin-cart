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
    <main className="min-h-screen bg-[var(--brand-light)] text-zinc-950">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <button
            className="w-fit rounded-xl border border-[var(--brand-border)] bg-white px-4 py-3 text-sm font-extrabold text-[#0f1f5c] shadow-sm transition hover:border-[#0f1f5c]"
            type="button"
            onClick={onBack}
          >
            Volver
          </button>
          <button
            className="h-11 rounded-xl bg-[#0f1f5c] px-4 text-sm font-extrabold text-white shadow-sm"
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
          <article className="grid overflow-hidden rounded-[22px] border border-[var(--brand-border)] bg-white shadow-[var(--brand-shadow)] lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
            <div className="flex aspect-[4/3] items-center justify-center bg-[#0f1f5c]/5 lg:aspect-auto">
              {product.imageUrl ? (
                <img
                  className="h-full w-full object-cover"
                  src={product.imageUrl}
                  alt={product.name}
                />
              ) : (
                <span className="grid h-full w-full place-items-center bg-gradient-to-br from-[#0f1f5c] to-[#c1122f] px-4 text-center text-sm font-extrabold text-white">
                  Distribuidora 87
                </span>
              )}
            </div>
            <div className="flex flex-col gap-4 p-5 sm:p-8">
              <p className="text-sm font-extrabold uppercase tracking-wide text-[#c1122f]">
                Producto
              </p>
              <h1 className="text-3xl font-extrabold tracking-normal text-[#0f1f5c]">{product.name}</h1>
              <p className="text-2xl font-extrabold text-[#c1122f]">
                {currencyFormatter.format(product.priceCents / 100)}
              </p>
              <p className="text-base leading-7 text-[var(--brand-text)]">
                {product.description ?? "Sin descripcion disponible."}
              </p>
              <button
                className="mt-2 h-12 rounded-xl bg-gradient-to-br from-[#c1122f] to-[#a90f29] px-4 text-sm font-extrabold text-white shadow-[var(--brand-shadow)] transition focus:outline-none focus:ring-2 focus:ring-[#c1122f]/20 disabled:cursor-not-allowed disabled:opacity-60"
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
    <div className="rounded-[22px] border border-dashed border-[var(--brand-border)] bg-white px-6 py-12 text-center shadow-[var(--brand-shadow)]">
      <h1 className="text-lg font-extrabold text-[#0f1f5c]">{title}</h1>
      <p className="mt-2 text-sm text-[var(--brand-text)]">{detail}</p>
    </div>
  );
}
