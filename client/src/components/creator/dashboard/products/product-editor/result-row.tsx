import { ReactNode } from "react";

export function ResultRow({
  title,
  description,
  url,
  actions,
}: {
  title?: string;
  description?: string;
  url: string;
  actions?: ReactNode;
}) {
  return (
    <div className="p-4 transition">
      <div className="line-clamp-1 text-sm font-medium text-white">{title || url}</div>
      {description ? (
        <div className="line-clamp-2 mt-1 text-xs text-neutral-400">
          {description}
        </div>
      ) : null}

      <div className="mt-2 break-all text-xs text-neutral-500">{url}</div>
      {actions ? (
        <div className="mt-3 flex flex-wrap gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
