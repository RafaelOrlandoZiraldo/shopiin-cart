import { Eye, LoaderCircle, ShoppingCartPlus } from "lucide-react";
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
    <article className="group flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] border border-white bg-white shadow-[var(--brand-shadow)] ring-1 ring-[#243a73]/5 transition hover:-translate-y-1 hover:shadow-[var(--brand-shadow-strong)]">
      <div className="relative flex h-[42%] min-h-[104px] shrink-0 items-center justify-center overflow-hidden bg-[#f4f7fb] lg:min-h-[96px]">
        {product.imageUrl ? (
          <img
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#243a73] to-[#b54a55] px-4 text-center text-sm font-bold text-white">
            <img className="h-20 w-20 rounded-2xl border border-white/20 object-cover shadow-[0_18px_38px_rgba(0,0,0,0.22)]" src="/brand-logo.svg" alt="" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-xs font-extrabold text-[#243a73] shadow-sm">
          Disponible
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4 lg:p-3.5">
        <h2 className="line-clamp-1 text-base font-black leading-snug text-[#243a73]">{product.name}</h2>
        <p className="mt-1 line-clamp-1 text-sm leading-6 text-[var(--brand-text)]">
          {product.description ?? "Sin descripcion disponible."}
        </p>
        <div className="mt-auto flex flex-col gap-2.5 pt-3">
          <p className="text-xl font-black leading-none text-[#b54a55]">
            {currencyFormatter.format(product.priceCents / 100)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--brand-border)] bg-white px-3 text-sm font-extrabold text-[#243a73]"
              type="button"
              onClick={() => onOpen(product.id)}
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              Ver
            </button>
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#b54a55] to-[#9c3c48] px-3 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(181,74,85,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={adding}
              onClick={() => onAddToCart(product.id)}
            >
              {adding ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ShoppingCartPlus className="h-4 w-4" aria-hidden="true" />
              )}
              {adding ? "Agregando" : "Agregar"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
