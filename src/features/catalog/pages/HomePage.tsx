import { StoreFooter } from "../components/StoreFooter";
import { StoreHeader } from "../components/StoreHeader";

type HomePageProps = {
  cartItemCount: number;
  onNavigate: (path: string) => void;
  onOpenCart: () => void;
};

export function HomePage({ cartItemCount, onNavigate, onOpenCart }: HomePageProps) {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <StoreHeader active="home" cartItemCount={cartItemCount} onNavigate={onNavigate} onOpenCart={onOpenCart} />
      <section className="relative overflow-hidden bg-[linear-gradient(120deg,rgba(15,31,92,0.94),rgba(193,18,47,0.86))] py-20 text-white sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.16),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.10),rgba(0,0,0,0.22))]" />
        <div className="relative mx-auto grid w-[min(100%-32px,1180px)] gap-8 lg:grid-cols-[1.3fr_0.8fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-extrabold">
              Calidad, atencion y respuesta rapida
            </span>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">
              Todo lo que tu comercio necesita, en un solo lugar
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/90">
              Descartables, bolsas de arranque y cajas de pizza para negocios,
              gastronomia y emprendimientos que necesitan reposicion constante,
              buen precio y atencion directa.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                className="inline-flex rounded-xl bg-gradient-to-br from-[#c1122f] to-[#a90f29] px-6 py-4 text-sm font-extrabold text-white shadow-[var(--brand-shadow)]"
                type="button"
                onClick={() => onNavigate("/products")}
              >
                Ver productos
              </button>
              <button
                className="inline-flex rounded-xl border border-[var(--brand-border)] bg-white px-6 py-4 text-sm font-extrabold text-[#0f1f5c]"
                type="button"
                onClick={onOpenCart}
              >
                Abrir carrito
              </button>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Facebook", "Instagram", "WhatsApp"].map((item) => (
                <span key={item} className="rounded-full bg-white/15 px-3 py-2 text-sm font-bold">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <aside className="rounded-[22px] bg-white p-7 text-zinc-950 shadow-[var(--brand-shadow)]">
            <h2 className="text-xl font-extrabold text-[#0f1f5c]">Que vas a encontrar</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-[var(--brand-text)]">
              <li>Descartables para uso comercial</li>
              <li>Bolsas de arranque en distintas opciones</li>
              <li>Cajas de pizza para gastronomia y delivery</li>
            </ul>
            <p className="mt-5 font-bold text-[#c1122f]">Carrito integrado para armar tu pedido.</p>
          </aside>
        </div>
      </section>
      <StoreFooter onOpenCart={onOpenCart} />
    </main>
  );
}
