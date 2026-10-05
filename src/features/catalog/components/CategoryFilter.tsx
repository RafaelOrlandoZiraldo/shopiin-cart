import { Tags } from "lucide-react";
import type { CategoryDto } from "../types/catalog";

type CategoryFilterProps = {
  categories: CategoryDto[];
  value?: string;
  disabled?: boolean;
  onChange: (category?: string) => void;
};

export function CategoryFilter({ categories, value, disabled, onChange }: CategoryFilterProps) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-sm font-bold text-[#243a73]">
      <span className="inline-flex items-center gap-2">
        <Tags className="h-4 w-4" aria-hidden="true" />
        Categoria
      </span>
      <select
        className="h-12 rounded-2xl border border-[var(--brand-border)] bg-white px-4 text-sm text-zinc-950 outline-none transition focus:border-[#365487] focus:ring-4 focus:ring-[#365487]/10 disabled:cursor-not-allowed disabled:bg-zinc-100"
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
