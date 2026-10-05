import { useEffect, useState } from "react";
import { LoadingState } from "../../../components/LoadingState";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { useCart } from "../hooks/useCart";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
};

export function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const [mounted, setMounted] = useState(open);
  const cart = useCart();
  const cartData = cart.cart;
  const isMutating =
    cart.addItem.isPending ||
    cart.updateItem.isPending ||
    cart.removeItem.isPending ||
    cart.clear.isPending;

  useEffect(() => {
    if (open) {
      setMounted(true);
      return undefined;
    }

    const timeout = window.setTimeout(() => setMounted(false), 240);
    return () => window.clearTimeout(timeout);
  }, [open]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        className={`absolute inset-0 h-full w-full bg-[#243a73]/45 backdrop-blur-sm ${open ? "cart-backdrop-open" : "cart-backdrop-closed"}`}
        type="button"
        aria-label="Cerrar carrito"
        onClick={onClose}
      />
      <aside className={`absolute right-0 top-0 flex h-dvh w-full max-w-md flex-col overflow-hidden bg-white shadow-[var(--brand-shadow-strong)] ${open ? "cart-panel-open" : "cart-panel-closed"}`}>
        <header className="flex items-center justify-between border-b border-white/10 bg-[linear-gradient(135deg,#243a73,#162d78)] px-5 py-5 text-white">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-white/75">Carrito</p>
            <h2 className="text-xl font-extrabold">Tu compra</h2>
          </div>
          <button
            className="h-10 rounded-xl border border-white/30 px-3 text-sm font-extrabold text-white transition hover:bg-white/10"
            type="button"
            onClick={onClose}
          >
            Cerrar
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col bg-[var(--brand-light)] px-5">
          {cart.isLoading ? (
            <LoadingState title="Cargando carrito" detail="Estamos recuperando tus items." />
          ) : cart.isError ? (
            <CartState title="No pudimos cargar el carrito" detail="Reintenta en unos segundos." />
          ) : !cartData || cartData.items.length === 0 ? (
            <CartState title="Carrito vacio" detail="Agrega productos desde el catalogo." />
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {cartData.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    disabled={isMutating}
                    onUpdateQuantity={(itemId, quantity) =>
                      cart.updateItem.mutate({ itemId, quantity })
                    }
                    onRemove={(itemId) => cart.removeItem.mutate(itemId)}
                  />
                ))}
              </div>
              <div className="py-5">
                <CartSummary
                  subtotalCents={cartData.subtotalCents}
                  disabled={isMutating || cartData.items.length === 0}
                  onCheckout={onCheckout}
                  onClear={() => cart.clear.mutate()}
                />
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function CartState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h3 className="text-lg font-extrabold text-[#243a73]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--brand-text)]">{detail}</p>
    </div>
  );
}
