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
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <form className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" onSubmit={(event) => {
          event.preventDefault();
          sessionStorage.setItem(tokenKey, draftToken);
          setToken(draftToken);
        }}>
          <h1 className="text-xl font-semibold text-zinc-950">Admin</h1>
          <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Token
            <input className="h-11 rounded-md border border-zinc-300 px-3" type="password" value={draftToken} onChange={(event) => setDraftToken(event.target.value)} />
          </label>
          <button className="mt-4 h-11 w-full rounded-md bg-emerald-700 text-sm font-semibold text-white" type="submit">Entrar</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <section className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Admin</p>
            <h1 className="text-3xl font-semibold">Panel administrativo</h1>
          </div>
          <div className="flex gap-2">
            <button className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold" onClick={onBack}>Storefront</button>
            <button className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold" onClick={() => { sessionStorage.removeItem(tokenKey); setToken(""); }}>Salir</button>
          </div>
        </header>
        <nav className="flex gap-2">
          {(["categories", "products", "orders"] as const).map((item) => (
            <button key={item} className={`rounded-md px-3 py-2 text-sm font-semibold ${tab === item ? "bg-emerald-700 text-white" : "border border-zinc-300 bg-white"}`} onClick={() => setTab(item)}>{item}</button>
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
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={(event) => {
        event.preventDefault();
        admin.createCategory.mutate({ name, slug, active: true });
        setName(""); setSlug("");
      }}>
        <input className="h-10 rounded-md border border-zinc-300 px-3" placeholder="Nombre" value={name} onChange={(event) => setName(event.target.value)} />
        <input className="h-10 rounded-md border border-zinc-300 px-3" placeholder="slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
        <button className="rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white">Crear</button>
      </form>
      <div className="mt-4 divide-y divide-zinc-200">
        {(admin.categories.data ?? []).map((category) => (
          <div key={category.id} className="flex items-center justify-between gap-3 py-3">
            <span className="text-sm">{category.name} / {category.slug} / {category.active ? "activa" : "inactiva"}</span>
            <button className="text-sm font-semibold text-red-700" onClick={() => admin.deleteCategory.mutate(category.id)}>Eliminar</button>
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
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <form className="grid gap-3 lg:grid-cols-6" onSubmit={submit}>
        <select className="h-10 rounded-md border border-zinc-300 px-3" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
          <option value="">Categoria</option>
          {(admin.categories.data ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <input className="h-10 rounded-md border border-zinc-300 px-3" placeholder="Nombre" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <input className="h-10 rounded-md border border-zinc-300 px-3" placeholder="Descripcion" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <input className="h-10 rounded-md border border-zinc-300 px-3" type="number" placeholder="Centavos" value={form.priceCents} onChange={(event) => setForm({ ...form, priceCents: Number(event.target.value) })} />
        <input className="h-10 rounded-md border border-zinc-300 px-3" placeholder="Imagen URL" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
        <button className="rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white">Crear</button>
      </form>
      <input className="mt-3 text-sm" type="file" accept="image/*" onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) admin.uploadImage.mutate(file, { onSuccess: (result) => setForm((current) => ({ ...current, imageUrl: result.url })) });
      }} />
      <div className="mt-4 divide-y divide-zinc-200">
        {(admin.products.data ?? []).map((product) => (
          <div key={product.id} className="grid gap-3 py-3 text-sm lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
            <span>{product.name} / {money.format(product.priceCents / 100)} / {product.active ? "activo" : "inactivo"}</span>
            <button className="font-semibold text-emerald-800" onClick={() => admin.setProductActive.mutate({ id: product.id, active: !product.active })}>{product.active ? "Desactivar" : "Activar"}</button>
            <button className="font-semibold text-zinc-800" onClick={() => admin.updateProduct.mutate({ id: product.id, body: { ...product, active: product.active } })}>Guardar</button>
            <button className="font-semibold text-red-700" onClick={() => admin.deleteProduct.mutate(product.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function OrdersPanel({ admin }: { admin: ReturnType<typeof useAdminData> }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="divide-y divide-zinc-200">
        {(admin.orders.data ?? []).map((order) => (
          <div key={order.id} className="grid gap-2 py-3 text-sm lg:grid-cols-[1fr_1fr_auto_auto]">
            <span>{order.id}</span>
            <span>{order.email}</span>
            <span>{order.status} / {order.paymentStatus}</span>
            <span className="font-semibold">{money.format(order.totalCents / 100)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
