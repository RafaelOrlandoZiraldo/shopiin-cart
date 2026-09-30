import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { useCart } from "../hooks/useCart";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
};

export function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const cart = useCart();
  const cartData = cart.cart;
  const isMutating =
    cart.addItem.isPending ||
    cart.updateItem.isPending ||
    cart.removeItem.isPending ||
    cart.clear.isPending;

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 h-full w-full bg-zinc-950/40"
        type="button"
        aria-label="Cerrar carrito"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Carrito</p>
            <h2 className="text-xl font-semibold text-zinc-950">Tu compra</h2>
          </div>
          <button
            className="h-10 rounded-md border border-zinc-300 px-3 text-sm font-semibold text-zinc-800"
            type="button"
            onClick={onClose}
          >
            Cerrar
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col px-5">
          {cart.isLoading ? (
            <CartState title="Cargando carrito" detail="Estamos recuperando tus items." />
          ) : cart.isError ? (
            <CartState title="No pudimos cargar el carrito" detail="Reintenta en unos segundos." />
          ) : !cartData || cartData.items.length === 0 ? (
            <CartState title="Carrito vacio" detail="Agrega productos desde el catalogo." />
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto">
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
      <h3 className="text-lg font-semibold text-zinc-950">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600">{detail}</p>
    </div>
  );
}
