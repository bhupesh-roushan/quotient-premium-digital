"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Eye,
  Download,
  Calendar,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import CreatorSidebar from "@/components/creator/common/sidebar";
import { BackgroundBeams } from "@/components/ui/background-beams";

interface ProductStats {
  productId: string;
  title: string;
  viewCount: number;
  soldCount: number;
  revenue: number;
  conversionRate: number;
  averageRating: number;
}

interface RevenueData {
  _id: string;
  revenue: number;
  orders: number;
}

interface StatsRes {
  ok: boolean;
  products?: ProductStats[];
  error?: string;
}

interface RevenueRes {
  ok: boolean;
  data?: RevenueData[];
  error?: string;
}

export default function CreatorAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [stats, setStats] = useState<ProductStats[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalViews: 0,
    avgConversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      console.log("Fetching analytics...");
      
      const statsRes = await apiClient.get<StatsRes>("/api/creator/products/stats");
      console.log("Stats response:", statsRes.data);
      
      if (statsRes.data.ok && statsRes.data.products) {
        setStats(statsRes.data.products);
        
        const totalRevenue = statsRes.data.products.reduce((sum: number, p: ProductStats) => sum + p.revenue, 0);
        const totalOrders = statsRes.data.products.reduce((sum: number, p: ProductStats) => sum + p.soldCount, 0);
        const totalViews = statsRes.data.products.reduce((sum: number, p: ProductStats) => sum + p.viewCount, 0);
        const avgConversion = statsRes.data.products.length 
          ? statsRes.data.products.reduce((sum: number, p: ProductStats) => sum + p.conversionRate, 0) / statsRes.data.products.length 
          : 0;
        
        console.log("Calculated summary:", { totalRevenue, totalOrders, totalViews, avgConversion });
        
        setSummary({
          totalRevenue,
          totalOrders,
          totalViews,
          avgConversionRate: avgConversion,
        });
      } else {
        console.error("Stats error:", statsRes.data.error);
      }

      const revenueRes = await apiClient.get<RevenueRes>(`/api/creator/products/revenue?days=${timeRange}`);
      console.log("Revenue response:", revenueRes.data);
      
      if (revenueRes.data.ok) {
        setRevenueData(revenueRes.data.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const exportData = () => {
    const data = {
      summary,
      products: stats,
      revenueData,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    
    toast.success("Analytics data exported");
  };

  return (
    <div className="flex h-screen flex-col lg:flex-row bg-black">
      <CreatorSidebar />
      <main className="flex-1 overflow-y-auto relative">
        <div className="min-h-screen bg-neutral-950 text-white p-6 pb-24 relative">
          <BackgroundBeams className="fixed inset-0 z-0" />
          <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-start"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-white/60">Track your product performance and revenue</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchAnalytics}
              className="bg-neutral-900/50 border-neutral-700 text-white hover:bg-neutral-800 hover:text-white"
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={exportData}
              className="bg-neutral-900/50 border-neutral-700 text-white hover:bg-neutral-800 hover:text-white"
            >
              <Download size={18} className="mr-2" /> Export
            </Button>
          </div>
        </motion.div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          {[7, 30, 90].map((days) => (
            <Button
              key={days}
              variant={timeRange === days ? "default" : "outline"}
              onClick={() => setTimeRange(days as 7 | 30 | 90)}
              className={`${
                timeRange === days
                  ? "bg-neutral-800 text-white border-neutral-600"
                  : "bg-neutral-900/50 border-neutral-700 text-white hover:bg-neutral-800 hover:text-white"
              }`}
            >
              Last {days} Days
            </Button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white/60 text-sm flex items-center gap-2">
                <DollarSign size={16} /> Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white">
              <div className="text-3xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
              <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
                <ArrowUpRight size={16} />
                <span>All time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white/60 text-sm flex items-center gap-2">
                <ShoppingCart size={16} /> Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white">
              <div className="text-3xl font-bold">{formatNumber(summary.totalOrders)}</div>
              <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
                <ArrowUpRight size={16} />
                <span>All time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white/60 text-sm flex items-center gap-2">
                <Eye size={16} /> Total Views
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white">
              <div className="text-3xl font-bold">{formatNumber(summary.totalViews)}</div>
              <div className="flex items-center gap-1 mt-2 text-blue-400 text-sm">
                <TrendingUp size={16} />
                <span>All time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white/60 text-sm flex items-center gap-2">
                <TrendingUp size={16} /> Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white">
              <div className="text-3xl font-bold">{summary.avgConversionRate.toFixed(1)}%</div>
              <div className="flex items-center gap-1 mt-2 text-purple-400 text-sm">
                <Calendar size={16} />
                <span>Average</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Info */}
        {!loading && (
          <Card className="bg-white/5 border-white/10 mb-4">
            <CardContent className="p-4">
              <div className="text-sm text-white/60">
                <span className="font-medium">Products found:</span> {stats.length} | 
                <span className="font-medium"> Total Revenue:</span> {formatCurrency(summary.totalRevenue)} | 
                <span className="font-medium"> Total Orders:</span> {summary.totalOrders}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Performance Table */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Product Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 text-white/60 font-medium">Product</th>
                    <th className="text-right p-4 text-white/60 font-medium">Views</th>
                    <th className="text-right p-4 text-white/60 font-medium">Sales</th>
                    <th className="text-right p-4 text-white/60 font-medium">Revenue</th>
                    <th className="text-right p-4 text-white/60 font-medium">Conversion</th>
                    <th className="text-right p-4 text-white/60 font-medium">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full mx-auto" />
                      </td>
                    </tr>
                  ) : stats.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-white/40">
                        No products yet. Create your first product to see analytics.
                      </td>
                    </tr>
                  ) : (
                    stats.map((product) => (
                      <tr key={product.productId} className="border-b border-white/5">
                        <td className="p-4">
                          <div className="font-medium text-white">{product.title}</div>
                        </td>
                        <td className="p-4 text-right text-white">{formatNumber(product.viewCount)}</td>
                        <td className="p-4 text-right text-white">{product.soldCount}</td>
                        <td className="p-4 text-right text-white">{formatCurrency(product.revenue)}</td>
                        <td className="p-4 text-right">
                          <Badge className={`${
                            product.conversionRate > 5 
                              ? "bg-green-500/20 text-green-400" 
                              : product.conversionRate > 2 
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                          }`}>
                            {product.conversionRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-white">{product.averageRating.toFixed(1)}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        {revenueData.length > 0 && (
          <Card className="bg-white/5 border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent className="text-white">
              <div className="h-64 flex items-end gap-2">
                {revenueData.map((day, index) => {
                  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
                  const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                  
                  return (
                    <div
                      key={day._id}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="w-full bg-blue-500 rounded-t-sm"
                        style={{ minHeight: "4px", opacity: 0.7 }}
                      />
                      <div className="text-xs text-white/40 rotate-45 origin-left whitespace-nowrap">
                        {day._id.slice(5)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Performing Products */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Your Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.length === 0 ? (
                <p className="text-white/40 text-center py-8">No sales data available yet</p>
              ) : (
                [...stats]
                  .sort((a, b) => b.revenue - a.revenue)
                  .slice(0, 5)
                  .map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{product.title}</div>
                        <div className="text-sm text-white/40">
                          {product.soldCount} orders
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{formatCurrency(product.revenue)}</div>
                        <div className="text-sm text-green-400">
                          <ArrowUpRight size={14} className="inline" /> Top seller
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
        </div>
        </div>
      </main>
    </div>
  );
}
