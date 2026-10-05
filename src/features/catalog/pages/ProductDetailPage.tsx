import { ShoppingCart } from "lucide-react";
import { LoadingState } from "../../../components/LoadingState";
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
    <main className="brand-page text-zinc-950">
      <section className="mx-auto flex h-full w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <button
            className="w-fit rounded-2xl border border-[var(--brand-border)] bg-white px-4 py-3 text-sm font-extrabold text-[#243a73] shadow-sm"
            type="button"
            onClick={onBack}
          >
            Volver
          </button>
          <button
            className="relative grid h-12 w-12 place-items-center rounded-2xl bg-[#243a73] text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(36,58,115,0.22)]"
            type="button"
            aria-label={`Abrir carrito con ${cartItemCount} productos`}
            onClick={onOpenCart}
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {cartItemCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-xs font-extrabold text-[#243a73]">
                {cartItemCount}
              </span>
            ) : null}
          </button>
        </div>

        {productQuery.isLoading ? (
          <LoadingState title="Cargando producto" detail="Estamos buscando el detalle." />
        ) : productQuery.isError || !product ? (
          <DetailState title="Producto no disponible" detail="No pudimos cargar este producto." />
        ) : (
          <article className="brand-card grid min-h-0 flex-1 overflow-hidden rounded-[32px] lg:grid-cols-[minmax(0,1fr)_minmax(340px,440px)]">
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#243a73]/5 lg:aspect-auto">
              {product.imageUrl ? (
                <img
                  className="h-full w-full object-cover"
                  src={product.imageUrl}
                  alt={product.name}
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#243a73] to-[#b54a55] px-4">
                  <img className="h-40 w-40 rounded-[28px] border border-white/20 object-cover shadow-[0_24px_55px_rgba(0,0,0,0.28)]" src="/brand-logo.svg" alt="Distribuidora 87" />
                </div>
              )}
              <span className="absolute left-5 top-5 rounded-full bg-white/92 px-3 py-1 text-xs font-extrabold text-[#243a73] shadow-sm">
                Disponible
              </span>
            </div>
            <div className="flex flex-col gap-5 p-6 sm:p-9">
              <p className="text-sm font-extrabold uppercase tracking-wide text-[#b54a55]">
                Producto
              </p>
              <h1 className="text-4xl font-black tracking-normal text-[#243a73]">{product.name}</h1>
              <p className="text-3xl font-black text-[#b54a55]">
                {currencyFormatter.format(product.priceCents / 100)}
              </p>
              <p className="text-base leading-7 text-[var(--brand-text)]">
                {product.description ?? "Sin descripcion disponible."}
              </p>
              <button
                className="mt-2 h-12 rounded-2xl bg-gradient-to-br from-[#b54a55] to-[#9c3c48] px-4 text-sm font-extrabold text-white shadow-[0_18px_38px_rgba(181,74,85,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
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
      <h1 className="text-lg font-extrabold text-[#243a73]">{title}</h1>
      <p className="mt-2 text-sm text-[var(--brand-text)]">{detail}</p>
    </div>
  );
}
