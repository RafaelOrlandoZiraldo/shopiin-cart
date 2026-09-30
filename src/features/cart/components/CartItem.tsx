import type { CartItemDto } from "../types/cart";

type CartItemProps = {
  item: CartItemDto;
  disabled?: boolean;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
};

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function CartItem({ item, disabled, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--brand-border)] py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-extrabold text-[#0f1f5c]">Producto {item.productId}</p>
          <p className="mt-1 text-sm text-[var(--brand-text)]">
            {currencyFormatter.format(item.unitPriceCents / 100)} c/u
          </p>
        </div>
        <button
          className="h-9 rounded-xl border border-[var(--brand-border)] px-3 text-sm font-extrabold text-[#c1122f] transition hover:border-[#c1122f] disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={disabled}
          onClick={() => onRemove(item.id)}
        >
          Eliminar
        </button>
      </div>
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-bold text-[var(--brand-text)]">
          Cantidad
          <input
            className="h-10 w-20 rounded-xl border border-[var(--brand-border)] bg-white px-2 text-center text-sm text-zinc-950 outline-none focus:border-[#0f1f5c] focus:ring-2 focus:ring-[#0f1f5c]/15 disabled:cursor-not-allowed disabled:bg-zinc-100"
            type="number"
            min={1}
            step={1}
            value={item.quantity}
            disabled={disabled}
            onChange={(event) => {
              const quantity = Number(event.target.value);
              if (Number.isInteger(quantity) && quantity > 0) {
                onUpdateQuantity(item.id, quantity);
              }
            }}
          />
        </label>
        <p className="text-sm font-extrabold text-[#0f1f5c]">
          {currencyFormatter.format(item.lineTotalCents / 100)}
        </p>
      </div>
    </div>
  );
}
