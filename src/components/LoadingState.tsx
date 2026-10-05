import { LoaderCircle } from "lucide-react";

type LoadingStateProps = {
  title: string;
  detail?: string;
  compact?: boolean;
};

export function LoadingState({ title, detail, compact }: LoadingStateProps) {
  return (
    <div className={`flex flex-1 flex-col items-center justify-center px-6 text-center ${compact ? "py-6" : "py-12"}`}>
      <LoaderCircle className="h-8 w-8 animate-spin text-[#b54a55]" aria-hidden="true" />
      <h3 className="mt-4 text-lg font-extrabold text-[#243a73]">{title}</h3>
      {detail ? <p className="mt-2 text-sm text-[var(--brand-text)]">{detail}</p> : null}
    </div>
  );
}
