import type { CategoryDto } from "../types/catalog";

type CategoryFilterProps = {
  categories: CategoryDto[];
  value?: string;
  disabled?: boolean;
  onChange: (category?: string) => void;
};

export function CategoryFilter({ categories, value, disabled, onChange }: CategoryFilterProps) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-sm font-bold text-[#0f1f5c]">
      Categoria
      <select
        className="h-12 rounded-xl border border-[var(--brand-border)] bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-[#1a2f80] focus:ring-4 focus:ring-[#1a2f80]/10 disabled:cursor-not-allowed disabled:bg-zinc-100"
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value || undefined)}
      >
        <option value="">Todas</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
    </label>
  );
}
