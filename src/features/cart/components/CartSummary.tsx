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
    <div className="border-t border-[var(--brand-border)] pt-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-[var(--brand-text)]">Subtotal</span>
        <span className="text-lg font-extrabold text-[#243a73]">
          {currencyFormatter.format(subtotalCents / 100)}
        </span>
      </div>
      <button
        className="mt-4 h-11 w-full rounded-xl bg-gradient-to-br from-[#b54a55] to-[#9c3c48] text-sm font-extrabold text-white shadow-[var(--brand-shadow)] disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        disabled={disabled}
        onClick={onCheckout}
      >
        Ir a checkout
      </button>
      <button
        className="mt-4 h-11 w-full rounded-xl border border-[var(--brand-border)] text-sm font-extrabold text-[#243a73] disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        disabled={disabled}
        onClick={onClear}
      >
        Vaciar carrito
      </button>
    </div>
  );
}
