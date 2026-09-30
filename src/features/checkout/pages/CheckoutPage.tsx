import { FormEvent, useMemo, useState } from "react";
import { useCart } from "../../cart/hooks/useCart";
import { useCheckout } from "../hooks/useCheckout";
import type { CheckoutRequestDto } from "../types/checkout";

type CheckoutPageProps = {
  onBack: () => void;
};

type CheckoutFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const initialForm: CheckoutFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "AR",
};

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function CheckoutPage({ onBack }: CheckoutPageProps) {
  const cart = useCart();
  const checkout = useCheckout();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const cartData = cart.cart;
  const canSubmit = !!cartData && cartData.items.length > 0 && !checkout.isPending;

  const orderMessage = useMemo(() => {
    if (!checkout.data) {
      return null;
    }

    return `Orden ${checkout.data.orderId} creada con estado ${checkout.data.status}.`;
  }, [checkout.data]);

  function updateField(field: keyof CheckoutFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateForm(form);

    setErrors(validation.errors);

    if (!validation.valid || !canSubmit) {
      return;
    }

    checkout.mutate(
      {
        idempotencyKey,
        checkout: toCheckoutRequest(form),
      },
      {
        onSuccess: () => setIdempotencyKey(crypto.randomUUID()),
      },
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <button
          className="w-fit rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm"
          type="button"
          onClick={onBack}
        >
          Volver al catalogo
        </button>

        <header>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Checkout</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal sm:text-4xl">
            Finalizar compra
          </h1>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Nombre" value={form.firstName} error={errors.firstName} onChange={(value) => updateField("firstName", value)} />
              <TextField label="Apellido" value={form.lastName} error={errors.lastName} onChange={(value) => updateField("lastName", value)} />
              <TextField label="Email" type="email" value={form.email} error={errors.email} onChange={(value) => updateField("email", value)} />
              <TextField label="Telefono" value={form.phone} onChange={(value) => updateField("phone", value)} />
            </div>

            <h2 className="mt-8 text-lg font-semibold text-zinc-950">Direccion</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField label="Direccion" value={form.line1} error={errors.line1} onChange={(value) => updateField("line1", value)} />
              </div>
              <div className="sm:col-span-2">
                <TextField label="Piso/depto" value={form.line2} onChange={(value) => updateField("line2", value)} />
              </div>
              <TextField label="Ciudad" value={form.city} error={errors.city} onChange={(value) => updateField("city", value)} />
              <TextField label="Provincia/estado" value={form.state} error={errors.state} onChange={(value) => updateField("state", value)} />
              <TextField label="Codigo postal" value={form.postalCode} error={errors.postalCode} onChange={(value) => updateField("postalCode", value)} />
              <TextField label="Pais" value={form.country} error={errors.country} onChange={(value) => updateField("country", value.toUpperCase())} />
            </div>

            {checkout.isError ? (
              <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                No pudimos crear la orden. Revisa el carrito e intenta de nuevo.
              </p>
            ) : null}
            {orderMessage ? (
              <p className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {orderMessage}
              </p>
            ) : null}

            <button
              className="mt-6 h-11 w-full rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={!canSubmit}
            >
              Crear orden
            </button>
          </form>

          <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Resumen</h2>
            {cart.isLoading ? (
              <p className="mt-4 text-sm text-zinc-600">Cargando carrito.</p>
            ) : !cartData || cartData.items.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-600">Tu carrito esta vacio.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {cartData.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3 text-sm">
                    <span className="text-zinc-600">{item.quantity} x Producto {item.productId}</span>
                    <span className="font-semibold text-zinc-950">
                      {currencyFormatter.format(item.lineTotalCents / 100)}
                    </span>
                  </div>
                ))}
                <div className="mt-3 flex justify-between border-t border-zinc-200 pt-4">
                  <span className="font-medium text-zinc-700">Total</span>
                  <span className="text-lg font-semibold text-zinc-950">
                    {currencyFormatter.format(cartData.subtotalCents / 100)}
                  </span>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

function TextField({
  label,
  type = "text",
  value,
  error,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
      {label}
      <input
        className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className="text-xs font-medium text-red-700">{error}</span> : null}
    </label>
  );
}

function validateForm(form: CheckoutFormState): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const field of ["firstName", "lastName", "line1", "city", "state", "postalCode"] as const) {
    if (!form[field].trim()) {
      errors[field] = "Requerido";
    }
  }

  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = "Email invalido";
  }

  if (form.country.trim().length !== 2) {
    errors.country = "Usa codigo de 2 letras";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

function toCheckoutRequest(form: CheckoutFormState): CheckoutRequestDto {
  return {
    customer: {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
    },
    shippingAddress: {
      line1: form.line1.trim(),
      line2: form.line2.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      country: form.country.trim().toUpperCase(),
    },
  };
}
