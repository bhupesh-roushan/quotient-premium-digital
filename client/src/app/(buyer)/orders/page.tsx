import BuyerSell from "@/components/buyer/common/buyer-shell";
import { apiServerGet } from "@/lib/api/server";
import { getMe } from "@/lib/auth/getMe";
import { redirect } from "next/navigation";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Link from "next/link";
import { LibraryRes } from "../library/page";
import { ShoppingBag, Shield, Hash, IndianRupee, Calendar, ExternalLink, Package } from "lucide-react";

function formatDate(input: string | null) {
  if (!input) return "-";
  return new Date(input).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(input: string | null) {
  if (!input) return "";
  return new Date(input).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const LICENSE_COLORS: Record<string, string> = {
  "Personal Use": "bg-blue-500/10 border-blue-500/30 text-blue-400",
  "Commercial Use": "bg-violet-500/10 border-violet-500/30 text-violet-400",
  "Enterprise": "bg-amber-500/10 border-amber-500/30 text-amber-400",
  "Custom": "bg-pink-500/10 border-pink-500/30 text-pink-400",
};

async function OrdersPage() {
  const me = await getMe();
  if (!me.ok) redirect("/login");

  const data = await apiServerGet<LibraryRes>("/api/library");
  const orders = data.items ?? [];

  const totalSpent = orders.reduce((sum, o) => sum + (o.amount ?? o.price ?? 0), 0);

  return (
    <BuyerSell>
      <div className="relative min-h-screen bg-neutral-950">
        <BackgroundBeams className="fixed inset-0 z-0" />

        <div className="relative z-10">
          <header className="px-4 py-8 md:px-8 lg:px-[8vw]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-violet-200 to-pink-200 bg-clip-text text-transparent">
                    Order History
                  </h1>
                  <p className="text-neutral-400 mt-1">
                    {orders.length} {orders.length === 1 ? "purchase" : "purchases"} · ₹{totalSpent.toLocaleString("en-IN")} total spent
                  </p>
                </div>
              </div>

              <Link
                href="/library"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm font-medium hover:bg-violet-500/20 transition-all"
              >
                <Package className="w-4 h-4" />
                My Library
              </Link>
            </div>

            {/* Summary cards */}
            {orders.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                <div className="rounded-xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm p-4">
                  <p className="text-xs text-neutral-500 mb-1">Total Purchases</p>
                  <p className="text-2xl font-bold text-white">{orders.length}</p>
                </div>
                <div className="rounded-xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm p-4">
                  <p className="text-xs text-neutral-500 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-emerald-400">₹{totalSpent.toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm p-4 col-span-2 sm:col-span-1">
                  <p className="text-xs text-neutral-500 mb-1">Latest Purchase</p>
                  <p className="text-sm font-medium text-white line-clamp-1">{orders[0]?.title ?? "—"}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{formatDate(orders[0]?.paidAt ?? null)}</p>
                </div>
              </div>
            )}
          </header>

          <main className="px-4 pb-10 md:px-8 lg:px-[8vw]">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-white font-medium mb-1">No purchases yet</p>
                <p className="text-neutral-500 text-sm mb-4">Browse the discover page to find premium templates</p>
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm hover:bg-violet-500/20 transition-all"
                >
                  Browse Templates
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const licenseColor = LICENSE_COLORS[order.license ?? ""] ?? "bg-neutral-800/50 border-neutral-700 text-neutral-400";
                  const paidDate = order.paidAt ?? order.createdAt ?? null;
                  return (
                    <div
                      key={order.orderId ?? order.productId}
                      className="rounded-2xl border border-neutral-800/50 bg-neutral-900/50 backdrop-blur-sm p-5 flex items-center gap-5 hover:border-neutral-700 transition-all group"
                    >
                      {/* Cover image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700">
                        {order.coverImageUrl ? (
                          <img
                            src={order.coverImageUrl}
                            alt={order.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-7 h-7 text-neutral-500" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                              {order.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {/* License */}
                              {order.license && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${licenseColor}`}>
                                  <Shield className="w-2.5 h-2.5" />
                                  {order.license}
                                </span>
                              )}
                              {/* Category */}
                              {order.category && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-neutral-800/50 border-neutral-700 text-neutral-400 capitalize">
                                  {order.category.replace(/-/g, " ")}
                                </span>
                              )}
                              {/* Order ID */}
                              {order.orderId && (
                                <span className="inline-flex items-center gap-1 text-xs text-neutral-600">
                                  <Hash className="w-2.5 h-2.5" />
                                  {order.orderId.slice(-8).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right side */}
                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-1 justify-end text-emerald-400 font-bold">
                              <IndianRupee className="w-4 h-4" />
                              <span>{order.amount ?? order.price}</span>
                            </div>
                            <div className="flex items-center gap-1 justify-end text-xs text-neutral-500 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(paidDate)}</span>
                            </div>
                            <p className="text-xs text-neutral-600 mt-0.5">{formatTime(paidDate)}</p>
                          </div>
                        </div>

                        {/* Status + actions */}
                        <div className="flex items-center gap-2 mt-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Paid
                          </span>
                          <Link
                            href="/library"
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-neutral-800/50 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 transition-all"
                          >
                            Open in Library
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <Link
                            href={`/discover/${order.productId}#reviews`}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-neutral-800/50 border border-neutral-700 text-neutral-400 hover:text-yellow-400 hover:border-yellow-500/30 transition-all"
                          >
                            Write Review
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </BuyerSell>
  );
}

export default OrdersPage;
