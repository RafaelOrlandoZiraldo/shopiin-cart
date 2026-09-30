import type { ProductDto } from "../types/catalog";

type ProductCardProps = {
  product: ProductDto;
  onOpen: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  adding?: boolean;
};

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function ProductCard({ product, onOpen, onAddToCart, adding }: ProductCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[22px] border border-[#e7edf4] bg-white shadow-[var(--brand-shadow)]">
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#f4f7fb]">
        {product.imageUrl ? (
          <img
            className="h-full w-full object-cover"
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <span className="grid h-full w-full place-items-center bg-gradient-to-br from-[#0f1f5c] to-[#c1122f] px-4 text-center text-sm font-bold text-white">
            Distribuidora 87
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-[22px]">
        <h2 className="text-lg font-bold text-[#0f1f5c]">{product.name}</h2>
        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[var(--brand-text)]">
          {product.description ?? "Sin descripcion disponible."}
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-extrabold text-[#c1122f]">
            {currencyFormatter.format(product.priceCents / 100)}
          </p>
          <div className="flex gap-2">
            <button
              className="h-10 flex-1 rounded-xl border border-[var(--brand-border)] bg-white px-3 text-sm font-extrabold text-[#0f1f5c] transition hover:-translate-y-0.5 sm:flex-none"
              type="button"
              onClick={() => onOpen(product.id)}
            >
              Ver
            </button>
            <button
              className="h-10 flex-1 rounded-xl bg-gradient-to-br from-[#c1122f] to-[#a90f29] px-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              type="button"
              disabled={adding}
              onClick={() => onAddToCart(product.id)}
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
