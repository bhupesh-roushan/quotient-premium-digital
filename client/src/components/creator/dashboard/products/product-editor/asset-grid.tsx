"use client";

import { Button } from "@/components/ui/button";
import { ImageAsset } from "@/lib/types/product";

export default function AssetsGrid({
  assets,
  title,
  actionLabel,
  isActionActive,
  onAction,
  onRemove,
  emptyText,
}: {
  assets: ImageAsset[];
  title: string;
  actionLabel?: (asset: ImageAsset) => string;
  isActionActive: (asset: ImageAsset) => Boolean;
  onAction: (asset: ImageAsset) => void;
  onRemove?: (asset: ImageAsset) => void;
  emptyText: string;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-base font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">
            {assets.length} Total
          </div>
        </div>
      </div>

      {assets.length === 0 ? (
        <p className="text-md text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {assets.map((asset) => {
            const url = asset.cloudinary?.secureUrl;
            const active = isActionActive?.(asset) ?? false;

            return (
              <div
                key={asset._id}
                className={`group relative overflow-hidden bg-neutral-900/50 hover:bg-neutral-800/50 transition border border-neutral-800 rounded-md backdrop-blur-sm ${
                  active
                    ? "ring-1 ring-violet-500/70 shadow-lg shadow-violet-500/20"
                    : ""
                }`}
              >
                <div className="aspect-4/3 w-full bg-muted rounded-md ">
                  {url ? (
                    <img
                      src={url}
                      alt="asset"
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-[1.02] rounded-md"
                    />
                  ) : null}
                </div>
                {active ? (
                  <div className="absolute left-2 top-2 border border-border bg-card px-2 py-1 text-[11px] font-medium text-black rounded-md z-30">
                    Cover
                  </div>
                ) : null}

                {/* Delete Button */}
                <div className="pointer-events-none absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 z-30">
                  <Button
                    className="pointer-events-auto border border-red-500/30 shadow-lg shadow-red-500/20 rounded-full bg-red-600/50 backdrop-blur-sm text-white hover:bg-red-500/70 px-2 py-1 text-xs h-6 transition-all"
                    onClick={() => onRemove && onRemove(asset)}
                  >
                    Delete
                  </Button>
                </div>

                {actionLabel && onAction ? (
                  <div className="pointer-events-none absolute top-10 right-2 opacity-0 transition-opacity group-hover:opacity-100 z-30">
                    <Button
                      className={`pointer-events-auto border shadow-lg rounded-full backdrop-blur-sm px-2 py-1 text-xs h-6 transition-all
                            ${
                              active
                                ? "bg-green-500/50 border-green-500/30 shadow-green-500/20 text-white hover:bg-green-500/70"
                                : "bg-pink-500/50 border-pink-500/30 shadow-pink-500/20 text-white hover:bg-pink-500/70"
                            } 
                            `}
                      onClick={() => onAction(asset)}
                    >
                      {active ? "Cover" : actionLabel(asset)}
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
