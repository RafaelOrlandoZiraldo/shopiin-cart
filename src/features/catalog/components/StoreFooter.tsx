type StoreFooterProps = {
  onOpenCart: () => void;
};

export function StoreFooter({ onOpenCart }: StoreFooterProps) {
  return (
    <footer className="bg-[#0f1f5c] py-6 text-white">
      <div className="mx-auto flex w-[min(100%-32px,1180px)] flex-wrap items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} Distribuidora 87</p>
        <button className="font-bold" type="button" onClick={onOpenCart}>Ver carrito</button>
      </div>
    </footer>
  );
}
