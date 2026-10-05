import { House, Mail, Package, ShoppingCart } from "lucide-react";

type StoreHeaderProps = {
  active: "home" | "products" | "contact";
  cartItemCount: number;
  onNavigate: (path: string) => void;
  onOpenCart: () => void;
};

export function StoreHeader({ active, cartItemCount, onNavigate, onOpenCart }: StoreHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#243a73]/90 shadow-[0_12px_35px_rgba(36,58,115,0.16)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] w-[min(100%-32px,1180px)] flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <button className="flex items-center gap-3 text-left text-white" type="button" onClick={() => onNavigate("/")}>
          <img
            className="h-12 w-12 rounded-2xl border border-white/25 bg-white/10 object-cover shadow-[0_16px_34px_rgba(0,0,0,0.22)]"
            src="/brand-logo.svg"
            alt="Distribuidora 87"
          />
          <span>
            <span className="brand-display block text-xl font-extrabold leading-none">Distribuidora 87</span>
            <span className="block text-sm text-white/80">Soluciones para tu negocio</span>
          </span>
        </button>
        <nav className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#17233f]/24 p-1 text-sm font-bold text-white shadow-inner">
          <NavButton active={active === "home"} icon={House} onClick={() => onNavigate("/")}>Inicio</NavButton>
          <NavButton active={active === "products"} icon={Package} onClick={() => onNavigate("/products")}>Productos</NavButton>
          <NavButton active={active === "contact"} icon={Mail} onClick={() => onNavigate("/contact")}>Contacto</NavButton>
          <button
            className="relative grid h-11 w-11 place-items-center rounded-xl border border-white/18 bg-[#b54a55]/88 font-extrabold text-white shadow-[0_12px_24px_rgba(23,35,63,0.16)]"
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
        </nav>
      </div>
    </header>
  );
}

function NavButton({
  active,
  children,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  children: string;
  icon: typeof House;
  onClick: () => void;
}) {
  return (
    <button
      className={active ? "inline-flex items-center gap-2 rounded-xl bg-[#b54a55]/78 px-4 py-2.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]" : "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-white/78 hover:bg-white/[0.08] hover:text-white"}
      type="button"
      onClick={onClick}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {children}
    </button>
  );
}
