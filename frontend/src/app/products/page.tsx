"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Package, Search, Plus, CheckCircle, AlertCircle } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await apiRequest(`/products${query}`);
    if (res.success && res.data) {
      setProducts(res.data.data || res.data);
    }
    setLoading(false);
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-500" />
            Salt Master Data Catalog
          </h1>
          <p className="text-xs text-slate-400">
            Official SKU registry for Garam Konsumsi, Industri, and Bahan Baku Madura
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by SKU or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3 text-right">Purchase Price</th>
                  <th className="p-3 text-right">Selling Price</th>
                  <th className="p-3 text-center">Type</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500">
                      No salt products found.
                    </td>
                  </tr>
                ) : (
                  products.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-medium text-amber-400">{item.sku}</td>
                      <td className="p-3 font-semibold text-slate-200">{item.name}</td>
                      <td className="p-3 text-slate-400">{item.category?.name || "General"}</td>
                      <td className="p-3 text-slate-300 font-mono">{item.unit?.code}</td>
                      <td className="p-3 text-right font-mono text-slate-400">
                        {formatIDR(item.purchase_price)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-200">
                        {formatIDR(item.selling_price)}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 text-[10px] rounded font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
