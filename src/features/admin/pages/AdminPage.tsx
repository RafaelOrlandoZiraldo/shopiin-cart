import { ClipboardList, FolderTree, Package, type LucideIcon } from "lucide-react";
import { FormEvent, useState } from "react";
import { LoadingState } from "../../../components/LoadingState";
import { useAdminData } from "../hooks/useAdminData";
import type { AdminCategory, AdminProduct } from "../types/admin";

type AdminPageProps = { onBack: () => void };
type Tab = "categories" | "products" | "orders";
type CategoryFormState = {
  name: string;
  slug: string;
  active: boolean;
};
type ProductFormState = {
  categoryId: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  active: boolean;
};

const tokenKey = "admin-token";
const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const emptyCategoryForm: CategoryFormState = {
  name: "",
  slug: "",
  active: true,
};
const emptyProductForm: ProductFormState = {
  categoryId: "",
  name: "",
  description: "",
  priceCents: 0,
  imageUrl: "",
  active: true,
};

export function AdminPage({ onBack }: AdminPageProps) {
  const [token, setToken] = useState(() => sessionStorage.getItem(tokenKey) ?? "");
  const [draftToken, setDraftToken] = useState("");
  const [tab, setTab] = useState<Tab>("categories");
  const admin = useAdminData(token);

  if (!token) {
    return (
      <main className="flex items-center justify-center bg-[linear-gradient(120deg,rgba(36,58,115,0.94),rgba(181,74,85,0.86))] px-4">
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
              <p className="text-sm font-extrabold uppercase tracking-wide text-[#b54a55]">Admin</p>
              <h1 className="text-xl font-extrabold text-[#243a73]">Distribuidora 87</h1>
            </div>
          </div>
          <label className="mt-5 flex flex-col gap-2 text-sm font-bold text-[var(--brand-text)]">
            Token
            <input className="h-11 rounded-xl border border-[var(--brand-border)] px-3 outline-none focus:border-[#243a73] focus:ring-2 focus:ring-[#243a73]/15" type="password" value={draftToken} onChange={(event) => setDraftToken(event.target.value)} />
          </label>
          <button className="mt-4 h-11 w-full rounded-xl bg-gradient-to-br from-[#b54a55] to-[#9c3c48] text-sm font-extrabold text-white shadow-[var(--brand-shadow)]" type="submit">Entrar</button>
        </form>
      </main>
    );
  }

  return (
    <main className="brand-page flex flex-col text-zinc-950">
      <header className="bg-[linear-gradient(135deg,#243a73,#172d78)] text-white shadow-[var(--brand-shadow)]">
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
            <button className="rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[#243a73]" onClick={() => { sessionStorage.removeItem(tokenKey); setToken(""); }}>Salir</button>
          </div>
        </div>
      </header>
      <section className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-4 overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
        <nav className="brand-card flex flex-wrap gap-2 rounded-[24px] p-2">
          {(["categories", "products", "orders"] as const).map((item) => (
            <button key={item} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold ${tab === item ? "bg-gradient-to-br from-[#b54a55] to-[#9c3c48] text-white shadow-[0_14px_28px_rgba(181,74,85,0.22)]" : "text-[#243a73] hover:bg-[#243a73]/10"}`} onClick={() => setTab(item)}>
              <TabIcon tab={item} />
              {tabLabel(item)}
            </button>
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
  const [form, setForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const categories = admin.categories.data ?? [];
  const isEditing = editingCategoryId !== null;

  function submit(event: FormEvent) {
    event.preventDefault();
    const body = toCategoryPayload(form);

    if (editingCategoryId) {
      admin.updateCategory.mutate(
        { id: editingCategoryId, body },
        { onSuccess: resetForm },
      );
      return;
    }

    admin.createCategory.mutate(
      { ...body, active: true },
      { onSuccess: resetForm },
    );
  }

  function editCategory(category: AdminCategory) {
    setEditingCategoryId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      active: category.active,
    });
  }

  function resetForm() {
    setEditingCategoryId(null);
    setForm(emptyCategoryForm);
  }

  return (
    <section className="brand-card rounded-[30px] p-6">
      <PanelTitle
        title="Categorias"
        detail={isEditing ? "Edita la categoria seleccionada y guarda los cambios." : "Organiza el catalogo visible en la tienda."}
      />
      <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={submit}>
        <input className="h-11 rounded-xl border border-[var(--brand-border)] px-3 outline-none focus:border-[#243a73] focus:ring-2 focus:ring-[#243a73]/15" placeholder="Nombre" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <input className="h-11 rounded-xl border border-[var(--brand-border)] px-3 outline-none focus:border-[#243a73] focus:ring-2 focus:ring-[#243a73]/15" placeholder="slug" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
        <button className="rounded-xl bg-gradient-to-br from-[#b54a55] to-[#9c3c48] px-4 text-sm font-extrabold text-white shadow-[var(--brand-shadow)]">
          {isEditing ? "Guardar" : "Crear"}
        </button>
      </form>
      {isEditing ? (
        <button className="mt-3 rounded-xl border border-[var(--brand-border)] px-4 py-2 text-sm font-extrabold text-[#243a73]" type="button" onClick={resetForm}>
          Cancelar edicion
        </button>
      ) : null}
      {admin.categories.isLoading ? (
        <LoadingState compact title="Cargando categorias" detail="Estamos consultando el administrador." />
      ) : (
      <div className="mt-5 overflow-x-auto rounded-[22px] border border-[var(--brand-border)] bg-white">
        <table className="min-w-[720px] w-full border-collapse text-left text-sm">
          <thead className="bg-[linear-gradient(135deg,#243a73,#172d78)] text-white">
            <tr>
              <th className="px-4 py-3 font-extrabold">Categoria</th>
              <th className="px-4 py-3 font-extrabold">Slug</th>
              <th className="px-4 py-3 font-extrabold">Estado</th>
              <th className="px-4 py-3 text-right font-extrabold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--brand-border)] bg-white">
            {categories.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-[var(--brand-text)]" colSpan={4}>
                  Todavia no hay categorias cargadas.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className={editingCategoryId === category.id ? "bg-[#243a73]/5" : undefined}>
                  <td className="px-4 py-3 font-extrabold text-[#243a73]">{category.name}</td>
                  <td className="px-4 py-3 text-[var(--brand-text)]">{category.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${category.active ? "bg-[#243a73]/10 text-[#243a73]" : "bg-[#b54a55]/10 text-[#b54a55]"}`}>
                      {category.active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <button className="font-extrabold text-[#243a73]" type="button" onClick={() => editCategory(category)}>Editar</button>
                      <button className="font-extrabold text-[var(--brand-text)]" type="button" onClick={() => admin.updateCategory.mutate({ id: category.id, body: { active: !category.active } })}>{category.active ? "Desactivar" : "Activar"}</button>
                      <button className="font-extrabold text-[#b54a55]" type="button" onClick={() => admin.deleteCategory.mutate(category.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      )}
    </section>
  );
}

function ProductsPanel({ admin }: { admin: ReturnType<typeof useAdminData> }) {
  const [form, setForm] = useState<ProductFormState>(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const products = admin.products.data ?? [];
  const categories = admin.categories.data ?? [];
  const isEditing = editingProductId !== null;

  function submit(event: FormEvent) {
    event.preventDefault();
    const body = toProductPayload(form);

    if (editingProductId) {
      admin.updateProduct.mutate(
        { id: editingProductId, body },
        { onSuccess: resetForm },
      );
      return;
    }

    admin.createProduct.mutate(
      { ...body, active: true },
      { onSuccess: resetForm },
    );
  }

  function editProduct(product: AdminProduct) {
    setEditingProductId(product.id);
    setForm({
      categoryId: product.categoryId,
      name: product.name,
      description: product.description ?? "",
      priceCents: product.priceCents,
      imageUrl: product.imageUrl ?? "",
      active: product.active,
    });
  }

  function resetForm() {
    setEditingProductId(null);
    setForm(emptyProductForm);
  }

  return (
    <section className="brand-card rounded-[30px] p-6">
      <PanelTitle
        title="Productos"
        detail={isEditing ? "Edita el producto seleccionado y guarda los cambios." : "Carga productos, precios e imagenes para el catalogo."}
      />
      <form className="grid gap-3 lg:grid-cols-6" onSubmit={submit}>
        <select className="h-11 rounded-xl border border-[var(--brand-border)] px-3 outline-none focus:border-[#243a73] focus:ring-2 focus:ring-[#243a73]/15" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
          <option value="">Categoria</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <input className="h-11 rounded-xl border border-[var(--brand-border)] px-3 outline-none focus:border-[#243a73] focus:ring-2 focus:ring-[#243a73]/15" placeholder="Nombre" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <input className="h-11 rounded-xl border border-[var(--brand-border)] px-3 outline-none focus:border-[#243a73] focus:ring-2 focus:ring-[#243a73]/15" placeholder="Descripcion" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <input className="h-11 rounded-xl border border-[var(--brand-border)] px-3 outline-none focus:border-[#243a73] focus:ring-2 focus:ring-[#243a73]/15" type="number" placeholder="Centavos" value={form.priceCents} onChange={(event) => setForm({ ...form, priceCents: Number(event.target.value) })} />
        <input className="h-11 rounded-xl border border-[var(--brand-border)] px-3 outline-none focus:border-[#243a73] focus:ring-2 focus:ring-[#243a73]/15" placeholder="Imagen URL" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
        <button className="rounded-xl bg-gradient-to-br from-[#b54a55] to-[#9c3c48] px-4 text-sm font-extrabold text-white shadow-[var(--brand-shadow)]">
          {isEditing ? "Guardar" : "Crear"}
        </button>
      </form>
      {isEditing ? (
        <button className="mt-3 rounded-xl border border-[var(--brand-border)] px-4 py-2 text-sm font-extrabold text-[#243a73]" type="button" onClick={resetForm}>
          Cancelar edicion
        </button>
      ) : null}
      <input className="mt-3 text-sm font-bold text-[var(--brand-text)] file:mr-3 file:rounded-xl file:border-0 file:bg-[#243a73] file:px-4 file:py-2 file:text-sm file:font-extrabold file:text-white" type="file" accept="image/*" onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) admin.uploadImage.mutate(file, { onSuccess: (result) => setForm((current) => ({ ...current, imageUrl: result.url })) });
      }} />
      {admin.products.isLoading || admin.categories.isLoading ? (
        <LoadingState compact title="Cargando productos" detail="Estamos consultando productos y categorias." />
      ) : (
      <div className="mt-5 overflow-x-auto rounded-[22px] border border-[var(--brand-border)] bg-white">
        <table className="min-w-[920px] w-full border-collapse text-left text-sm">
          <thead className="bg-[linear-gradient(135deg,#243a73,#172d78)] text-white">
            <tr>
              <th className="px-4 py-3 font-extrabold">Producto</th>
              <th className="px-4 py-3 font-extrabold">Categoria</th>
              <th className="px-4 py-3 font-extrabold">Precio</th>
              <th className="px-4 py-3 font-extrabold">Imagen</th>
              <th className="px-4 py-3 font-extrabold">Estado</th>
              <th className="px-4 py-3 text-right font-extrabold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--brand-border)] bg-white">
            {products.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-[var(--brand-text)]" colSpan={6}>
                  Todavia no hay productos cargados.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className={editingProductId === product.id ? "bg-[#243a73]/5" : undefined}>
                  <td className="px-4 py-3">
                    <div className="font-extrabold text-[#243a73]">{product.name}</div>
                    <div className="mt-1 max-w-xs truncate text-xs text-[var(--brand-text)]">
                      {product.description ?? "Sin descripcion"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--brand-text)]">
                    {categoryName(categories, product.categoryId)}
                  </td>
                  <td className="px-4 py-3 font-extrabold text-[#b54a55]">
                    {money.format(product.priceCents / 100)}
                  </td>
                  <td className="px-4 py-3">
                    {product.imageUrl ? (
                      <a className="font-bold text-[#243a73] underline-offset-4 hover:underline" href={product.imageUrl} target="_blank" rel="noreferrer">
                        Ver imagen
                      </a>
                    ) : (
                      <span className="text-[var(--brand-text)]">Sin imagen</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${product.active ? "bg-[#243a73]/10 text-[#243a73]" : "bg-[#b54a55]/10 text-[#b54a55]"}`}>
                      {product.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <button className="font-extrabold text-[#243a73]" type="button" onClick={() => editProduct(product)}>Editar</button>
                      <button className="font-extrabold text-[var(--brand-text)]" type="button" onClick={() => admin.setProductActive.mutate({ id: product.id, active: !product.active })}>{product.active ? "Desactivar" : "Activar"}</button>
                      <button className="font-extrabold text-[#b54a55]" type="button" onClick={() => admin.deleteProduct.mutate(product.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      )}
    </section>
  );
}

function OrdersPanel({ admin }: { admin: ReturnType<typeof useAdminData> }) {
  return (
    <section className="brand-card rounded-[30px] p-6">
      <PanelTitle title="Ordenes" detail="Consulta pedidos creados desde el checkout." />
      {admin.orders.isLoading ? (
        <LoadingState compact title="Cargando ordenes" detail="Estamos consultando los pedidos." />
      ) : (
      <div className="divide-y divide-[var(--brand-border)]">
        {(admin.orders.data ?? []).map((order) => (
          <div key={order.id} className="grid gap-2 py-3 text-sm lg:grid-cols-[1fr_1fr_auto_auto]">
            <span className="break-all text-[var(--brand-text)]">{order.id}</span>
            <span className="text-[#243a73]">{order.email}</span>
            <span className="font-bold text-[var(--brand-text)]">{order.status} / {order.paymentStatus}</span>
            <span className="font-extrabold text-[#b54a55]">{money.format(order.totalCents / 100)}</span>
          </div>
        ))}
      </div>
      )}
    </section>
  );
}

function PanelTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <header className="mb-4">
      <h2 className="text-xl font-extrabold text-[#243a73]">{title}</h2>
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

function TabIcon({ tab }: { tab: Tab }) {
  const icons: Record<Tab, LucideIcon> = {
    categories: FolderTree,
    products: Package,
    orders: ClipboardList,
  };
  const Icon = icons[tab];

  return <Icon className="h-4 w-4" aria-hidden="true" />;
}

function toCategoryPayload(form: CategoryFormState): Partial<AdminCategory> {
  return {
    name: form.name,
    slug: form.slug,
    active: form.active,
  };
}

function toProductPayload(form: ProductFormState): Partial<AdminProduct> {
  return {
    categoryId: form.categoryId,
    name: form.name,
    description: form.description.trim() || null,
    priceCents: form.priceCents,
    imageUrl: form.imageUrl.trim() || null,
    active: form.active,
  };
}

function categoryName(categories: ReturnType<typeof useAdminData>["categories"]["data"], categoryId: string) {
  return categories?.find((category) => category.id === categoryId)?.name ?? "Sin categoria";
}
