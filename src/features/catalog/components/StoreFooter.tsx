import { ShoppingCart } from "lucide-react";

type StoreFooterProps = {
  onOpenCart: () => void;
};

export function StoreFooter({ onOpenCart }: StoreFooterProps) {
  return (
    <footer className="shrink-0 border-t border-white/10 bg-[#243a73] py-5 text-white">
      <div className="mx-auto flex w-[min(100%-32px,1180px)] flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img className="h-12 w-12 rounded-xl border border-white/20 object-cover" src="/brand-logo.svg" alt="Distribuidora 87" />
          <p className="font-bold">&copy; {new Date().getFullYear()} Distribuidora 87</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-extrabold text-[#243a73]" type="button" onClick={onOpenCart}>
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          Ver carrito
        </button>
      </div>
    </footer>
  );
}
