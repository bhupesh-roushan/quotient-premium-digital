"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  UserCheck,
  Search,
  Ban,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  usersThisMonth: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  isCreator: boolean;
  isAdmin?: boolean;
  isActive?: boolean;
  createdAt: string;
}

interface Product {
  _id: string;
  title: string;
  creatorId: { name: string; email: string };
  visibility: string;
  price: number;
  createdAt: string;
}

interface Order {
  _id: string;
  buyerId: { name: string; email: string };
  productId: { title: string };
  amount: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "products" | "orders">("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "products") fetchProducts();
    if (activeTab === "orders") fetchOrders();
  }, [activeTab, currentPage, searchQuery]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data.stats);
    } catch (error) {
      toast.error("Failed to load admin stats");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(searchQuery && { search: searchQuery }),
      });
      const res = await fetch(`/api/admin/users?${query}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(searchQuery && { search: searchQuery }),
      });
      const res = await fetch(`/api/admin/products?${query}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data.products);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });
      const res = await fetch(`/api/admin/orders?${query}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      toast.success(`User ${isActive ? "activated" : "banned"} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-white/60">Manage users, products, and monitor platform analytics</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "users", label: "Users", icon: Users },
            { id: "products", label: "Products", icon: Package },
            { id: "orders", label: "Orders", icon: ShoppingCart },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => {
                setActiveTab(tab.id as any);
                setCurrentPage(1);
                setSearchQuery("");
              }}
              className={`gap-2 ${
                activeTab === tab.id
                  ? "bg-white text-black"
                  : "border-white/20 text-white hover:bg-white/10"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white/60 text-sm flex items-center gap-2">
                  <Users size={16} /> Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-sm text-white/40 mt-1">
                  +{stats.usersThisMonth} this month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white/60 text-sm flex items-center gap-2">
                  <Package size={16} /> Total Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalProducts.toLocaleString()}</div>
                <p className="text-sm text-white/40 mt-1">
                  Across all categories
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white/60 text-sm flex items-center gap-2">
                  <ShoppingCart size={16} /> Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalOrders.toLocaleString()}</div>
                <p className="text-sm text-white/40 mt-1">
                  +{stats.ordersThisMonth} this month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white/60 text-sm flex items-center gap-2">
                  <DollarSign size={16} /> Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-sm text-white/40 mt-1">
                  +{formatCurrency(stats.revenueThisMonth)} this month
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="text-left p-4 text-white/60 font-medium">User</th>
                      <th className="text-left p-4 text-white/60 font-medium">Role</th>
                      <th className="text-left p-4 text-white/60 font-medium">Joined</th>
                      <th className="text-right p-4 text-white/60 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center">
                          <Loader2 className="animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user._id} className="border-b border-white/5">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-white/40">{user.email}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              {user.isCreator && (
                                <Badge className="bg-blue-500/20 text-blue-400">Creator</Badge>
                              )}
                              {user.isAdmin && (
                                <Badge className="bg-purple-500/20 text-purple-400">Admin</Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-white/60">{formatDate(user.createdAt)}</td>
                          <td className="p-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateUserStatus(user._id, !(user.isActive ?? true))}
                              className={user.isActive === false ? "text-green-400" : "text-red-400"}
                            >
                              {user.isActive === false ? (
                                <><UserCheck size={16} className="mr-1" /> Activate</>
                              ) : (
                                <><Ban size={16} className="mr-1" /> Ban</>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-white/10 text-white"
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="py-2 px-4 text-white/60">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-white/10 text-white"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="text-left p-4 text-white/60 font-medium">Product</th>
                      <th className="text-left p-4 text-white/60 font-medium">Creator</th>
                      <th className="text-left p-4 text-white/60 font-medium">Status</th>
                      <th className="text-right p-4 text-white/60 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center">
                          <Loader2 className="animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product._id} className="border-b border-white/5">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{product.title}</div>
                              <div className="text-sm text-white/40">{formatCurrency(product.price)}</div>
                            </div>
                          </td>
                          <td className="p-4 text-white/60">{product.creatorId?.name}</td>
                          <td className="p-4">
                            <Badge className={
                              product.visibility === "published"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }>
                              {product.visibility}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteProduct(product._id)}
                              className="text-red-400"
                            >
                              <Trash2 size={16} className="mr-1" /> Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-white/10 text-white"
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="py-2 px-4 text-white/60">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-white/10 text-white"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="text-left p-4 text-white/60 font-medium">Order ID</th>
                      <th className="text-left p-4 text-white/60 font-medium">Buyer</th>
                      <th className="text-left p-4 text-white/60 font-medium">Product</th>
                      <th className="text-left p-4 text-white/60 font-medium">Amount</th>
                      <th className="text-left p-4 text-white/60 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center">
                          <Loader2 className="animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order._id} className="border-b border-white/5">
                          <td className="p-4 font-mono text-sm">{order._id.slice(-8)}</td>
                          <td className="p-4">{order.buyerId?.name}</td>
                          <td className="p-4">{order.productId?.title}</td>
                          <td className="p-4">{formatCurrency(order.amount)}</td>
                          <td className="p-4">
                            <Badge className={
                              order.status === "paid"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }>
                              {order.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-white/10 text-white"
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="py-2 px-4 text-white/60">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-white/10 text-white"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
