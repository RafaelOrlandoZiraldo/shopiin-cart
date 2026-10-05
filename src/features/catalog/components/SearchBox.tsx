import { Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type SearchBoxProps = {
  value?: string;
  onSearch: (search?: string) => void;
};

export function SearchBox({ value, onSearch }: SearchBoxProps) {
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSearch = draft.trim();
    onSearch(nextSearch || undefined);
  }

  return (
    <form className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
      <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-bold text-[#243a73]">
        Buscar
        <input
          className="h-12 rounded-2xl border border-[var(--brand-border)] bg-white px-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#365487] focus:ring-4 focus:ring-[#365487]/10"
          value={draft}
          placeholder="Nombre o descripcion"
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      <button
        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#b54a55] to-[#9c3c48] px-6 text-sm font-extrabold text-white shadow-[0_16px_34px_rgba(181,74,85,0.22)]"
        type="submit"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        Buscar
      </button>
    </form>
  );
}
