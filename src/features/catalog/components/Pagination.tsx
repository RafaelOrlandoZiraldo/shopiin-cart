type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pageSize, total, disabled, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--brand-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--brand-text)]">
        {firstItem}-{lastItem} de {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          className="h-10 rounded-xl border border-[var(--brand-border)] bg-white px-3 text-sm font-bold text-[#0f1f5c] disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </button>
        <span className="min-w-20 text-center text-sm font-bold text-[#0f1f5c]">
          {page} / {totalPages}
        </span>
        <button
          className="h-10 rounded-xl border border-[var(--brand-border)] bg-white px-3 text-sm font-bold text-[#0f1f5c] disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
