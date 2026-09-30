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
    <form className="flex min-w-0 flex-1 gap-2" onSubmit={handleSubmit}>
      <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-bold text-[#0f1f5c]">
        Buscar
        <input
          className="h-12 rounded-xl border border-[var(--brand-border)] bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#1a2f80] focus:ring-4 focus:ring-[#1a2f80]/10"
          value={draft}
          placeholder="Nombre o descripcion"
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      <button
        className="mt-7 h-12 rounded-xl bg-gradient-to-br from-[#c1122f] to-[#a90f29] px-5 text-sm font-extrabold text-white shadow-[var(--brand-shadow)] transition hover:-translate-y-0.5"
        type="submit"
      >
        Buscar
      </button>
    </form>
  );
}
