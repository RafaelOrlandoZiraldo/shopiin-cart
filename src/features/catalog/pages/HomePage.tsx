import { PackageSearch, ShoppingCart } from "lucide-react";
import { StoreFooter } from "../components/StoreFooter";
import { StoreHeader } from "../components/StoreHeader";

type HomePageProps = {
  cartItemCount: number;
  onNavigate: (path: string) => void;
  onOpenCart: () => void;
};

export function HomePage({ cartItemCount, onNavigate, onOpenCart }: HomePageProps) {
  return (
    <main className="brand-page flex flex-col text-zinc-950">
      <StoreHeader active="home" cartItemCount={cartItemCount} onNavigate={onNavigate} onOpenCart={onOpenCart} />
      <section className="relative min-h-0 flex-1 overflow-hidden bg-[#243a73] py-4 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(255,255,255,0.18),transparent_24rem),radial-gradient(circle_at_84%_16%,rgba(181,74,85,0.40),transparent_28rem),linear-gradient(135deg,rgba(36,58,115,0.96),rgba(10,19,56,0.88)_48%,rgba(181,74,85,0.86))]" />
        <div className="relative mx-auto grid h-full w-[min(100%-32px,1180px)] gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-white/15 bg-white/12 px-4 py-2 text-sm font-extrabold shadow-inner">
              Calidad, atencion y respuesta rapida
            </span>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[0.98] sm:text-5xl xl:text-6xl">
              Todo lo que tu comercio necesita, en un solo lugar
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/90">
              Descartables, bolsas de arranque y cajas de pizza para negocios,
              gastronomia y emprendimientos que necesitan reposicion constante,
              buen precio y atencion directa.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[#b54a55] to-[#9c3c48] px-6 py-4 text-sm font-extrabold text-white shadow-[0_22px_50px_rgba(181,74,85,0.30)]"
                type="button"
                onClick={() => onNavigate("/products")}
              >
                <PackageSearch className="h-5 w-5" aria-hidden="true" />
                Ver productos
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/95 px-6 py-4 text-sm font-extrabold text-[#243a73] shadow-[0_18px_44px_rgba(0,0,0,0.16)]"
                type="button"
                onClick={onOpenCart}
              >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                Abrir carrito
              </button>
            </div>
            <div className="mt-5 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
              {["Atencion directa", "Stock comercial", "Pedidos rapidos"].map((item) => (
                <span key={item} className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3 text-sm font-bold backdrop-blur">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <aside className="brand-card relative overflow-hidden rounded-[30px] p-4 text-zinc-950 shadow-[var(--brand-shadow-strong)]">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#b54a55]/12" />
            <div className="relative rounded-[24px] bg-gradient-to-br from-[#243a73] to-[#b54a55] p-5 text-white">
              <img className="mx-auto h-28 w-28 rounded-[28px] border border-white/20 object-cover shadow-[0_24px_55px_rgba(0,0,0,0.28)]" src="/brand-logo.svg" alt="Distribuidora 87" />
              <h2 className="mt-4 text-2xl font-black">Distribuidora 87</h2>
              <p className="mt-2 text-sm leading-6 text-white/86">
                Arma tu pedido desde el catalogo y coordina disponibilidad, entrega y reposicion.
              </p>
            </div>
            <div className="relative mt-3 grid gap-2">
              {["Descartables para uso comercial", "Bolsas de arranque", "Cajas de pizza"].map((item) => (
                <div key={item} className="rounded-2xl border border-[var(--brand-border)] bg-white px-4 py-3 text-sm font-bold text-[var(--brand-text)]">
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
      <StoreFooter onOpenCart={onOpenCart} />
    </main>
  );
}
