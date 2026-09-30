import { StoreFooter } from "../components/StoreFooter";
import { StoreHeader } from "../components/StoreHeader";

type ContactPageProps = {
  cartItemCount: number;
  onNavigate: (path: string) => void;
  onOpenCart: () => void;
};

const mapSrc = "https://www.google.com/maps?q=Distribuidora%2087&output=embed";

export function ContactPage({ cartItemCount, onNavigate, onOpenCart }: ContactPageProps) {
  return (
    <main className="min-h-screen bg-[var(--brand-light)] text-zinc-950">
      <StoreHeader active="contact" cartItemCount={cartItemCount} onNavigate={onNavigate} onOpenCart={onOpenCart} />
      <section className="py-16">
        <div className="mx-auto grid w-[min(100%-32px,1180px)] gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[22px] bg-white p-7 shadow-[var(--brand-shadow)]">
            <span className="inline-flex rounded-full bg-[#0f1f5c]/10 px-4 py-2 text-sm font-extrabold text-[#0f1f5c]">
              Contacto
            </span>
            <h1 className="mt-4 text-3xl font-extrabold text-[#0f1f5c]">Hacenos tu consulta</h1>
            <p className="mt-3 leading-7 text-[var(--brand-text)]">
              Podes armar tu carrito o escribirnos por redes para coordinar precios,
              disponibilidad y entrega.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["Facebook", "Instagram", "WhatsApp"].map((item) => (
                <a key={item} className="rounded-xl bg-[#0f1f5c] px-4 py-3 text-sm font-bold text-white" href="/contact">
                  {item}
                </a>
              ))}
            </div>
            <div className="mt-7 rounded-[18px] border border-[var(--brand-border)] bg-[#fbfdff] p-5">
              <p className="text-[var(--brand-text)]"><strong className="text-[#0f1f5c]">Facebook:</strong> /distribuidora87</p>
              <p className="mt-3 text-[var(--brand-text)]"><strong className="text-[#0f1f5c]">Instagram:</strong> @distribuidora87</p>
              <p className="mt-3 text-[var(--brand-text)]"><strong className="text-[#0f1f5c]">WhatsApp:</strong> +54 9 0000 000000</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-[22px] border border-[var(--brand-border)] bg-white shadow-[var(--brand-shadow)]">
            <iframe
              className="h-[520px] w-full"
              src={mapSrc}
              title="Ubicacion de Distribuidora 87"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
      <StoreFooter onOpenCart={onOpenCart} />
    </main>
  );
}
