type StoreHeaderProps = {
  active: "home" | "products" | "contact";
  cartItemCount: number;
  onNavigate: (path: string) => void;
  onOpenCart: () => void;
};

export function StoreHeader({ active, cartItemCount, onNavigate, onOpenCart }: StoreHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0f1f5c]/95 backdrop-blur">
      <div className="mx-auto flex min-h-[82px] w-[min(100%-32px,1180px)] flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <button className="flex items-center gap-3 text-left text-white" type="button" onClick={() => onNavigate("/")}>
          <img
            className="h-[56px] w-[56px] rounded-full border border-white/25 object-cover shadow-[var(--brand-shadow)]"
            src="/brand-logo.svg"
            alt="Distribuidora 87"
          />
          <span>
            <span className="block text-xl font-extrabold">Distribuidora 87</span>
            <span className="block text-sm text-white/80">Soluciones para tu negocio</span>
          </span>
        </button>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-extrabold text-white">
          <NavButton active={active === "home"} onClick={() => onNavigate("/")}>Inicio</NavButton>
          <NavButton active={active === "products"} onClick={() => onNavigate("/products")}>Productos</NavButton>
          <NavButton active={active === "contact"} onClick={() => onNavigate("/contact")}>Contacto</NavButton>
          <button
            className="rounded-xl bg-white px-4 py-3 font-extrabold text-[#0f1f5c]"
            type="button"
            onClick={onOpenCart}
          >
            Carrito ({cartItemCount})
          </button>
        </nav>
      </div>
    </header>
  );
}

function NavButton({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      className={active ? "text-white underline decoration-[#c1122f] decoration-4 underline-offset-8" : "text-white/85 transition hover:text-white"}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
