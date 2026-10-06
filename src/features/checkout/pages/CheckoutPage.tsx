import { FormEvent, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { LoadingState } from "../../../components/LoadingState";
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
    <main className="brand-page text-zinc-950">
      <section className="mx-auto flex h-full w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <button
          className="w-fit rounded-2xl border border-[var(--brand-border)] bg-white px-4 py-3 text-sm font-extrabold text-[#243a73] shadow-sm"
          type="button"
          onClick={onBack}
        >
          Volver al catalogo
        </button>

        <header>
          <p className="text-sm font-extrabold uppercase tracking-wide text-[#b54a55]">Checkout</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-[#243a73] sm:text-5xl">
            Finalizar compra
          </h1>
        </header>

        <div className="grid min-h-0 flex-1 gap-5 overflow-hidden lg:grid-cols-[minmax(0,1fr)_360px]">
          <form className="brand-card rounded-[30px] p-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Nombre" value={form.firstName} error={errors.firstName} onChange={(value) => updateField("firstName", value)} />
              <TextField label="Apellido" value={form.lastName} error={errors.lastName} onChange={(value) => updateField("lastName", value)} />
              <TextField label="Email" type="email" value={form.email} error={errors.email} onChange={(value) => updateField("email", value)} />
              <TextField label="Telefono" value={form.phone} onChange={(value) => updateField("phone", value)} />
            </div>

            <h2 className="mt-8 text-lg font-extrabold text-[#243a73]">Direccion</h2>
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
              <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                No pudimos crear la orden. Revisa el carrito e intenta de nuevo.
              </p>
            ) : null}
            {orderMessage ? (
              <div className="mt-5 rounded-xl border border-[#243a73]/20 bg-[#243a73]/5 px-3 py-3 text-sm font-bold text-[#243a73]">
                <p>{orderMessage}</p>
                {checkout.data?.payment.redirectUrl ? (
                  <a
                    className="mt-3 inline-flex rounded-xl bg-[#243a73] px-4 py-3 text-sm font-extrabold text-white"
                    href={checkout.data.payment.redirectUrl}
                  >
                    Continuar a Mercado Pago
                  </a>
                ) : null}
              </div>
            ) : null}

            <button
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#b54a55] to-[#9c3c48] px-4 text-sm font-extrabold text-white shadow-[var(--brand-shadow)] transition disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={!canSubmit}
            >
              {checkout.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {checkout.isPending ? "Creando orden" : "Crear orden"}
            </button>
          </form>

          <aside className="brand-card h-fit rounded-[30px] p-6">
            <h2 className="text-lg font-extrabold text-[#243a73]">Resumen</h2>
            {cart.isLoading ? (
              <LoadingState compact title="Cargando carrito" detail="Estamos preparando el resumen." />
            ) : !cartData || cartData.items.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--brand-text)]">Tu carrito esta vacio.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {cartData.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3 text-sm">
                    <span className="text-[var(--brand-text)]">{item.quantity} x Producto {item.productId}</span>
                    <span className="font-extrabold text-[#243a73]">
                      {currencyFormatter.format(item.lineTotalCents / 100)}
                    </span>
                  </div>
                ))}
                <div className="mt-3 flex justify-between border-t border-[var(--brand-border)] pt-4">
                  <span className="font-bold text-[var(--brand-text)]">Total</span>
                  <span className="text-lg font-extrabold text-[#b54a55]">
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
    <label className="flex flex-col gap-2 text-sm font-bold text-[var(--brand-text)]">
      {label}
      <input
        className="h-12 rounded-2xl border border-[var(--brand-border)] bg-white px-4 text-sm text-zinc-950 outline-none focus:border-[#243a73] focus:ring-2 focus:ring-[#243a73]/15"
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
