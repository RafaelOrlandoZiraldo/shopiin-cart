type CartSummaryProps = {
  subtotalCents: number;
  disabled?: boolean;
  onClear: () => void;
  onCheckout: () => void;
};

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function CartSummary({ subtotalCents, disabled, onClear, onCheckout }: CartSummaryProps) {
  return (
    <div className="border-t border-zinc-200 pt-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-zinc-700">Subtotal</span>
        <span className="text-lg font-semibold text-zinc-950">
          {currencyFormatter.format(subtotalCents / 100)}
        </span>
      </div>
      <button
        className="mt-4 h-11 w-full rounded-md bg-emerald-700 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        disabled={disabled}
        onClick={onCheckout}
      >
        Ir a checkout
      </button>
      <button
        className="mt-4 h-11 w-full rounded-md border border-zinc-300 text-sm font-semibold text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        disabled={disabled}
        onClick={onClear}
      >
        Vaciar carrito
      </button>
    </div>
  );
}
