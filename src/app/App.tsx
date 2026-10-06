import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminPage } from "../features/admin/pages/AdminPage";
import { CatalogPage } from "../features/catalog/pages/CatalogPage";
import { ContactPage } from "../features/catalog/pages/ContactPage";
import { HomePage } from "../features/catalog/pages/HomePage";
import { ProductDetailPage } from "../features/catalog/pages/ProductDetailPage";
import type { ProductFilters } from "../features/catalog/types/catalog";
import { CartDrawer } from "../features/cart/components/CartDrawer";
import { useCart } from "../features/cart/hooks/useCart";
import { CheckoutPage } from "../features/checkout/pages/CheckoutPage";
import { queryClient } from "./queryClient";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  );
}

function AppRoutes() {
  const [locationKey, setLocationKey] = useState(() => window.location.href);
  const [cartOpen, setCartOpen] = useState(false);
  const [addingProductId, setAddingProductId] = useState<string | undefined>();
  const cart = useCart();
  const route = getRoute();
  const cartItemCount = cart.cart?.items.reduce((count, item) => count + item.quantity, 0) ?? 0;

  useEffect(() => {
    function handlePopState() {
      setLocationKey(window.location.href);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(url: string) {
    window.history.pushState({}, "", url);
    setLocationKey(window.location.href);
  }

  function addProductToCart(productId: string) {
    setAddingProductId(productId);
    cart.addItem.mutate(
      { productId, quantity: 1 },
      {
        onSettled: () => setAddingProductId(undefined),
        onSuccess: () => setCartOpen(true),
      },
    );
  }

  if (route.admin) {
    return <AdminPage onBack={() => navigate("/")} />;
  }

  if (route.checkout) {
    return (
      <>
        <CheckoutPage paymentResult={route.paymentResult} onBack={() => navigate("/products")} />
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onCheckout={() => {
            setCartOpen(false);
            navigate("/checkout");
          }}
        />
      </>
    );
  }

  if (route.productId) {
    return (
      <>
        <ProductDetailPage
          productId={route.productId}
          adding={addingProductId === route.productId}
          cartItemCount={cartItemCount}
          onBack={() => navigate("/products")}
          onAddToCart={addProductToCart}
          onOpenCart={() => setCartOpen(true)}
        />
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onCheckout={() => {
            setCartOpen(false);
            navigate("/checkout");
          }}
        />
      </>
    );
  }

  if (route.contact) {
    return (
      <>
        <ContactPage
          cartItemCount={cartItemCount}
          onNavigate={navigate}
          onOpenCart={() => setCartOpen(true)}
        />
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onCheckout={() => {
            setCartOpen(false);
            navigate("/checkout");
          }}
        />
      </>
    );
  }

  if (!route.catalog) {
    return (
      <>
        <HomePage
          cartItemCount={cartItemCount}
          onNavigate={navigate}
          onOpenCart={() => setCartOpen(true)}
        />
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onCheckout={() => {
            setCartOpen(false);
            navigate("/checkout");
          }}
        />
      </>
    );
  }

  return (
    <>
      <CatalogPage
        key={locationKey}
        filters={route.filters}
        cartItemCount={cartItemCount}
        addingProductId={addingProductId}
        onFiltersChange={(filters) => navigate(buildCatalogUrl(filters))}
        onOpenProduct={(productId) => navigate(`/products/${productId}`)}
        onAddToCart={addProductToCart}
        onNavigate={navigate}
        onOpenCart={() => setCartOpen(true)}
      />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          navigate("/checkout");
        }}
      />
    </>
  );
}

function getRoute(): {
  admin?: boolean;
  checkout?: boolean;
  paymentResult?: "success" | "pending" | "failure";
  contact?: boolean;
  catalog?: boolean;
  productId?: string;
  filters: ProductFilters;
} {
  const productMatch = window.location.pathname.match(/^\/products\/([^/]+)$/);
  const searchParams = new URLSearchParams(window.location.search);
  const payment = searchParams.get("payment");

  return {
    admin: window.location.pathname === "/admin",
    checkout: window.location.pathname === "/checkout",
    paymentResult: isPaymentResult(payment) ? payment : undefined,
    contact: window.location.pathname === "/contact",
    catalog: window.location.pathname === "/products",
    productId: productMatch?.[1],
    filters: {
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      page: positiveNumber(searchParams.get("page"), 1),
      pageSize: positiveNumber(searchParams.get("pageSize"), 6),
    },
  };
}

function isPaymentResult(value: string | null): value is "success" | "pending" | "failure" {
  return value === "success" || value === "pending" || value === "failure";
}

function buildCatalogUrl(filters: ProductFilters): string {
  const params = new URLSearchParams();

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }

  if (filters.pageSize !== 6) {
    params.set("pageSize", String(filters.pageSize));
  }

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

function positiveNumber(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
