import { FormEvent, useState } from "react";
import { useAdminData } from "../hooks/useAdminData";

type AdminPageProps = { onBack: () => void };
type Tab = "categories" | "products" | "orders";

const tokenKey = "admin-token";
const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export function AdminPage({ onBack }: AdminPageProps) {
  const [token, setToken] = useState(() => sessionStorage.getItem(tokenKey) ?? "");
  const [draftToken, setDraftToken] = useState("");
  const [tab, setTab] = useState<Tab>("categories");
  const admin = useAdminData(token);

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(120deg,rgba(15,31,92,0.94),rgba(193,18,47,0.86))] px-4">
        <form className="w-full max-w-sm rounded-[22px] border border-white/30 bg-white p-6 shadow-[var(--brand-shadow)]" onSubmit={(event) => {
          event.preventDefault();
          sessionStorage.setItem(tokenKey, draftToken);
          setToken(draftToken);
        }}>
          <div className="flex items-center gap-3">
            <img
              className="h-12 w-12 rounded-full border border-[var(--brand-border)] object-cover shadow-[var(--brand-shadow)]"
              src="/brand-logo.svg"
              alt="Distribuidora 87"
            />
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wide text-[#c1122f]">Admin</p>
              <h1 className="text-xl font-extrabold text-[#0f1f5c]">Distribuidora 87</h1>
            </div>
          </div>
          <label className="mt-5 flex flex-col gap-2 text-sm font-bold text-[var(--brand-text)]">
            Token
            <input className="h-11 rounded-xl border border-[var(--brand-border)] px-3 outline-none focus:border-[#0f1f5c] focus:ring-2 focus:ring-[#0f1f5c]/15" type="password" value={draftToken} onChange={(event) => setDraftToken(event.target.value)} />
          </label>
          <button className="mt-4 h-11 w-full rounded-xl bg-gradient-to-br from-[#c1122f] to-[#a90f29] text-sm font-extrabold text-white shadow-[var(--brand-shadow)]" type="submit">Entrar</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--brand-light)] text-zinc-950">
      <header className="bg-[#0f1f5c] text-white shadow-[var(--brand-shadow)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              className="h-12 w-12 rounded-full border border-white/25 object-cover shadow-[var(--brand-shadow)]"
              src="/brand-logo.svg"
              alt="Distribuidora 87"
            />
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wide text-white/75">Admin</p>
              <h1 className="text-2xl font-extrabold">Panel administrativo</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="rounded-xl border border-white/30 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white/10" onClick={onBack}>Storefront</button>
            <button className="rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[#0f1f5c]" onClick={() => { sessionStorage.removeItem(tokenKey); setToken(""); }}>Salir</button>
          </div>
        </div>
      </header>
      <section className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap gap-2">
          {(["categories", "products", "orders"] as const).map((item) => (
            <button key={item} className={`rounded-xl px-4 py-3 text-sm font-extrabold shadow-sm ${tab === item ? "bg-gradient-to-br from-[#c1122f] to-[#a90f29] text-white" : "border border-[var(--brand-border)] bg-white text-[#0f1f5c]"}`} onClick={() => setTab(item)}>{tabLabel(item)}</button>
          ))}
        </nav>
        {tab === "categories" ? <CategoriesPanel admin={admin} /> : null}
        {tab === "products" ? <ProductsPanel admin={admin} /> : null}
        {tab === "orders" ? <OrdersPanel admin={admin} /> : null}
      </section>
    </main>
  );
}

function CategoriesPanel({ admin }: { admin: ReturnType<typeof useAdminData> }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  return (
    <section className="rounded-[22px] border border-[var(--brand-border)] bg-white p-5 shadow-[var(--brand-shadow)]">
      <PanelTitle title="Categorias" detail="Organiza el catalogo visible en la tienda." />
      <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={(event) => {
        event.preventDefault();
        admin.createCategory.mutate({ name, slug, active: true });
        setName(""); setSlug("");
      }}>
        <input className="h-11 rounded-xl border border-[var(--brand-border)] px-3 outline-none focus:border-[#0f1f5c] focus:ring-2 focus:ring-[#0f1f5c]/15" placeholder="Nombre" value={name} onChange={(event) => setName(event.target.value)} />
        <input className="h-11 rounded-xl border border-[var(--brand-border)] px-3 outline-none focus:border-[#0f1f5c] focus:ring-2 focus:ring-[#0f1f5c]/15" placeholder="slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
        <button className="rounded-xl bg-gradient-to-br from-[#c1122f] to-[#a90f29] px-4 text-sm font-extrabold text-white shadow-[var(--brand-shadow)]">Crear</button>
      </form>
      <div className="mt-4 divide-y divide-[var(--brand-border)]">
        {(admin.categories.data ?? []).map((category) => (
          <div key={category.id} className="flex items-center justify-between gap-3 py-2">
            <span className="text-sm text-[var(--brand-text)]"><strong className="text-[#0f1f5c]">{category.name}</strong> / {category.slug} / {category.active ? "activa" : "inactiva"}</span>
            <button className="text-sm font-extrabold text-[#c1122f]" onClick={() => admin.deleteCategory.mutate(category.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductsPanel({ admin }: { admin: ReturnType<typeof useAdminData> }) {
  const [form, setForm] = useState({ categoryId: "", name: "", description: "", priceCents: 0, imageUrl: "" });
  function submit(event: FormEvent) {
    event.preventDefault();
    admin.createProduct.mutate({ ...form, active: true, description: form.description || null, imageUrl: form.imageUrl || null });
  }
  return (
    <section className="rounded-[22px] border border-[var(--brand-border)] bg-white p-5 shadow-[var(--brand-shadow)]">
      <PanelTitle title="Productos" detail="Carga productos, precios e imagenes para el catalogo." />
      <form className="grid gap-3 lg:grid-cols-6" onSubmit={submit}>
        <select className="h-11 rounded-xl border border-[var(--brand-border)] px-3 outline-none focus:border-[#0f1f5c] focus:ring-2 focus:ring-[#0f1f5c]/15" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
          <option value="">Categoria</option>
          {(admin.categories.data ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <input className="h-11 rounded-xl border border-[var(--brand-border)] px-3 outline-none focus:border-[#0f1f5c] focus:ring-2 focus:ring-[#0f1f5c]/15" placeholder="Nombre" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <input className="h-11 rounded-xl border border-[var(--brand-border)] px-3 outline-none focus:border-[#0f1f5c] focus:ring-2 focus:ring-[#0f1f5c]/15" placeholder="Descripcion" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <input className="h-11 rounded-xl border border-[var(--brand-border)] px-3 outline-none focus:border-[#0f1f5c] focus:ring-2 focus:ring-[#0f1f5c]/15" type="number" placeholder="Centavos" value={form.priceCents} onChange={(event) => setForm({ ...form, priceCents: Number(event.target.value) })} />
        <input className="h-11 rounded-xl border border-[var(--brand-border)] px-3 outline-none focus:border-[#0f1f5c] focus:ring-2 focus:ring-[#0f1f5c]/15" placeholder="Imagen URL" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
        <button className="rounded-xl bg-gradient-to-br from-[#c1122f] to-[#a90f29] px-4 text-sm font-extrabold text-white shadow-[var(--brand-shadow)]">Crear</button>
      </form>
      <input className="mt-3 text-sm font-bold text-[var(--brand-text)] file:mr-3 file:rounded-xl file:border-0 file:bg-[#0f1f5c] file:px-4 file:py-2 file:text-sm file:font-extrabold file:text-white" type="file" accept="image/*" onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) admin.uploadImage.mutate(file, { onSuccess: (result) => setForm((current) => ({ ...current, imageUrl: result.url })) });
      }} />
      <div className="mt-4 divide-y divide-[var(--brand-border)]">
        {(admin.products.data ?? []).map((product) => (
          <div key={product.id} className="grid gap-3 py-3 text-sm lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
            <span className="text-[var(--brand-text)]"><strong className="text-[#0f1f5c]">{product.name}</strong> / {money.format(product.priceCents / 100)} / {product.active ? "activo" : "inactivo"}</span>
            <button className="font-extrabold text-[#0f1f5c]" onClick={() => admin.setProductActive.mutate({ id: product.id, active: !product.active })}>{product.active ? "Desactivar" : "Activar"}</button>
            <button className="font-extrabold text-[var(--brand-text)]" onClick={() => admin.updateProduct.mutate({ id: product.id, body: { ...product, active: product.active } })}>Guardar</button>
            <button className="font-extrabold text-[#c1122f]" onClick={() => admin.deleteProduct.mutate(product.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function OrdersPanel({ admin }: { admin: ReturnType<typeof useAdminData> }) {
  return (
    <section className="rounded-[22px] border border-[var(--brand-border)] bg-white p-5 shadow-[var(--brand-shadow)]">
      <PanelTitle title="Ordenes" detail="Consulta pedidos creados desde el checkout." />
      <div className="divide-y divide-[var(--brand-border)]">
        {(admin.orders.data ?? []).map((order) => (
          <div key={order.id} className="grid gap-2 py-3 text-sm lg:grid-cols-[1fr_1fr_auto_auto]">
            <span className="break-all text-[var(--brand-text)]">{order.id}</span>
            <span className="text-[#0f1f5c]">{order.email}</span>
            <span className="font-bold text-[var(--brand-text)]">{order.status} / {order.paymentStatus}</span>
            <span className="font-extrabold text-[#c1122f]">{money.format(order.totalCents / 100)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PanelTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <header className="mb-4">
      <h2 className="text-xl font-extrabold text-[#0f1f5c]">{title}</h2>
      <p className="mt-1 text-sm text-[var(--brand-text)]">{detail}</p>
    </header>
  );
}

function tabLabel(tab: Tab) {
  const labels: Record<Tab, string> = {
    categories: "Categorias",
    products: "Productos",
    orders: "Ordenes",
  };

  return labels[tab];
}
