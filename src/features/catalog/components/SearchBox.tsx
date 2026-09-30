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
      <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium text-zinc-700">
        Buscar
        <input
          className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          value={draft}
          placeholder="Nombre o descripcion"
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      <button
        className="mt-7 h-11 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        type="submit"
      >
        Buscar
      </button>
    </form>
  );
}
