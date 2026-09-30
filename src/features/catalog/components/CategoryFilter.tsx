import type { CategoryDto } from "../types/catalog";

type CategoryFilterProps = {
  categories: CategoryDto[];
  value?: string;
  disabled?: boolean;
  onChange: (category?: string) => void;
};

export function CategoryFilter({ categories, value, disabled, onChange }: CategoryFilterProps) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-zinc-700">
      Categoria
      <select
        className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-zinc-100"
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
