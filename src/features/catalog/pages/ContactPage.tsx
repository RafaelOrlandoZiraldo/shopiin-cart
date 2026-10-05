import { Camera, MessageCircle, Share2, type LucideIcon } from "lucide-react";
import { StoreFooter } from "../components/StoreFooter";
import { StoreHeader } from "../components/StoreHeader";

type ContactPageProps = {
  cartItemCount: number;
  onNavigate: (path: string) => void;
  onOpenCart: () => void;
};

const mapSrc = "https://www.google.com/maps?q=Distribuidora%2087&output=embed";
const socialLinks: Array<{ href: string; icon: LucideIcon; label: string }> = [
  { href: "/contact", icon: Share2, label: "Facebook" },
  { href: "/contact", icon: Camera, label: "Instagram" },
  { href: "/contact", icon: MessageCircle, label: "WhatsApp" },
];

export function ContactPage({ cartItemCount, onNavigate, onOpenCart }: ContactPageProps) {
  return (
    <main className="brand-page flex flex-col text-zinc-950">
      <StoreHeader active="contact" cartItemCount={cartItemCount} onNavigate={onNavigate} onOpenCart={onOpenCart} />
      <section className="flex min-h-0 flex-1 items-center overflow-hidden py-5">
        <div className="mx-auto grid max-h-full w-[min(100%-32px,1180px)] items-center gap-5 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="brand-card rounded-[30px] p-5">
            <span className="brand-chip inline-flex rounded-full px-4 py-2 text-sm font-extrabold">
              Contacto
            </span>
            <h1 className="mt-3 text-3xl font-black leading-tight text-[#243a73]">Hacenos tu consulta</h1>
            <p className="mt-3 leading-7 text-[var(--brand-text)]">
              Podes armar tu carrito o escribirnos por redes para coordinar precios,
              disponibilidad y entrega.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {socialLinks.map((item) => (
                <a key={item.label} className="inline-flex items-center gap-3 rounded-2xl bg-[#243a73] px-4 py-4 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(36,58,115,0.20)]" href={item.href}>
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </a>
              ))}
            </div>
            <div className="mt-7 rounded-[22px] border border-[var(--brand-border)] bg-[#fbfdff] p-5">
              <InfoRow label="Facebook" value="/distribuidora87" />
              <InfoRow label="Instagram" value="@distribuidora87" />
              <InfoRow label="WhatsApp" value="+54 9 0000 000000" />
            </div>
          </div>
          <div className="brand-card overflow-hidden rounded-[30px] p-3">
            <iframe
              className="h-[clamp(300px,58dvh,500px)] w-full rounded-[24px]"
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="border-b border-[var(--brand-border)] py-3 text-[var(--brand-text)] last:border-b-0">
      <strong className="text-[#243a73]">{label}:</strong> {value}
    </p>
  );
}
