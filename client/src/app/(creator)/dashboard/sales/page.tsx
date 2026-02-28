"use client";

import { useState, useEffect } from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { apiClient } from "@/lib/api/client";

type Sale = {
  productTitle: string;
  buyerEmail?: string;
  buyerName?: string;
  amount: number;
  currency: "INR";
  paidAt: string | null;
};

type SalesRes = { ok: boolean; sales: Sale[]; error?: string };

export default function CreatorSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try simple API first (with authentication)
      let response = await apiClient.get<SalesRes>("/api/creator/sales-simple");
      
      // If simple API works, use it
      if (response.data.ok && response.data.sales) {
        setSales(response.data.sales);
      } else if (response.data.error) {
        // If it's an authentication error, try the original API
        if (response.data.error.includes("Creator access required") || 
            response.data.error.includes("403")) {
          // Try original API as fallback
          response = await apiClient.get<SalesRes>("/api/creator/sales");
          if (response.data.ok && response.data.sales) {
            setSales(response.data.sales);
          } else {
            setError(response.data.error || "Failed to load sales data");
          }
        } else {
          setError(response.data.error || "Failed to load sales data");
        }
      } else {
        // Fallback to original API
        response = await apiClient.get<SalesRes>("/api/creator/sales");
        if (response.data.ok && response.data.sales) {
          setSales(response.data.sales);
        } else {
          setError(response.data.error || "Failed to load sales data");
        }
      }
    } catch (err) {
      console.error("Sales fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (input: string | null) => {
    if (!input) return "-";
    return new Date(input).toLocaleDateString();
  };

  return (
    <main className="relative min-h-screen bg-neutral-950 flex-1 overflow-y-auto">
      {/* Background */}
      <BackgroundBeams />

      {/* Content Layer */}
      <div className="relative z-10">
        <header className="sticky top-0 z-20 bg-transparent p-4 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-white">Sales Dashboard</h1>
            <button
              onClick={fetchSales}
              className="px-4 py-2 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-emerald-500/50 text-white rounded-lg transition-all"
            >
              Refresh
            </button>
          </div>
        </header>

        <section className="p-4 md:p-8">
          {loading ? (
            <div className="rounded-xl border border-neutral-800 bg-black/60 backdrop-blur-lg p-6">
              <p className="text-sm text-neutral-400">Loading sales data...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-800 bg-red-950/60 backdrop-blur-lg p-6">
              <p className="text-sm text-red-400 mb-4">Error: {error}</p>
              {error.includes("Authentication required") && (
                <div className="mt-4 p-4 bg-red-900/50 rounded-lg">
                  <p className="text-xs text-red-300 mb-2">
                    Please log in to view your sales dashboard:
                  </p>
                  <ul className="text-xs text-red-400 list-disc list-inside space-y-1">
                    <li>Make sure you're logged in to your account</li>
                    <li>If you just created products, try logging out and back in</li>
                    <li>Contact support if the issue persists</li>
                  </ul>
                </div>
              )}
              <button
                onClick={fetchSales}
                className="mt-4 px-4 py-2 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-red-500/50 text-white rounded-lg transition-all text-sm"
              >
                Try Again
              </button>
            </div>
          ) : sales.length === 0 ? (
            <div className="rounded-xl border border-neutral-800 bg-black/60 backdrop-blur-lg p-6">
              <p className="text-sm text-neutral-400">No Sales yet</p>
              <p className="text-xs text-neutral-500 mt-2">
                When customers buy your products, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="rounded-xl border border-neutral-800 bg-black/60 backdrop-blur-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Sales Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-neutral-800/50 rounded-lg p-4">
                    <p className="text-xs text-neutral-400">Total Sales</p>
                    <p className="text-2xl font-bold text-white">{sales.length}</p>
                  </div>
                  <div className="bg-neutral-800/50 rounded-lg p-4">
                    <p className="text-xs text-neutral-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      ₹{sales.reduce((sum, sale) => sum + sale.amount, 0)}
                    </p>
                  </div>
                  <div className="bg-neutral-800/50 rounded-lg p-4">
                    <p className="text-xs text-neutral-400">Average Sale</p>
                    <p className="text-2xl font-bold text-blue-400">
                      ₹{Math.round(sales.reduce((sum, sale) => sum + sale.amount, 0) / sales.length)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sales Table */}
              <div className="overflow-hidden rounded-xl border border-neutral-800 bg-black/60 backdrop-blur-lg">
                <div className="px-4 py-3 border-b border-neutral-800">
                  <h3 className="text-sm font-medium text-neutral-400">Recent Sales</h3>
                </div>
                
                <div className="divide-y divide-neutral-800">
                  {sales.map((saleItem, idx) => (
                    <div
                      key={`${saleItem.productTitle}-${idx}`}
                      className="p-4 hover:bg-white/5 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white">
                            {saleItem.productTitle}
                          </h4>
                          <p className="text-xs text-neutral-400 mt-1">
                            {saleItem.buyerName || saleItem.buyerEmail || "Anonymous"}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-emerald-400">
                              ₹{saleItem.amount}
                            </p>
                            <p className="text-xs text-neutral-400">
                              {formatDate(saleItem.paidAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
