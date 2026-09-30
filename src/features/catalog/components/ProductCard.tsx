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
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="flex aspect-[4/3] items-center justify-center bg-zinc-100">
        {product.imageUrl ? (
          <img
            className="h-full w-full object-cover"
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <span className="px-4 text-center text-sm font-medium text-zinc-500">
            Imagen pendiente
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h2 className="text-base font-semibold text-zinc-950">{product.name}</h2>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-zinc-600">
          {product.description ?? "Sin descripcion disponible."}
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-semibold text-emerald-800">
            {currencyFormatter.format(product.priceCents / 100)}
          </p>
          <div className="flex gap-2">
            <button
              className="h-10 flex-1 rounded-md border border-zinc-300 px-3 text-sm font-semibold text-zinc-800 transition hover:border-emerald-700 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 sm:flex-none"
              type="button"
              onClick={() => onOpen(product.id)}
            >
              Ver
            </button>
            <button
              className="h-10 flex-1 rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
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
