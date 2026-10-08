"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Boxes, RefreshCw, ArrowRightLeft, SlidersHorizontal } from "lucide-react";

export default function InventoryPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"balances" | "movements">("balances");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, [activeTab]);

  const fetchInventory = async () => {
    setLoading(true);
    if (activeTab === "balances") {
      const res = await apiRequest("/inventory");
      if (res.success && res.data) {
        setStocks(res.data.data || res.data);
      }
    } else {
      const res = await apiRequest("/inventory/movements");
      if (res.success && res.data) {
        setMovements(res.data.data || res.data);
      }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Boxes className="h-5 w-5 text-amber-500" />
            Inventory Balances & Stock Card
          </h1>
          <p className="text-xs text-slate-400">
            Real-time multi-warehouse stock positions across Kalianget, Sampang, and Pamekasan
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab("balances")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "balances"
                ? "bg-amber-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Warehouse Stock Balances
          </button>
          <button
            onClick={() => setActiveTab("movements")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "movements"
                ? "bg-amber-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Stock Movement Audit Trail
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : activeTab === "balances" ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Warehouse</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3 text-right">Physical On-Hand</th>
                  <th className="p-3 text-right">Reserved (SO)</th>
                  <th className="p-3 text-right">Available to Sell</th>
                  <th className="p-3 text-center">Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stocks.map((item) => {
                  const onHand = parseFloat(item.quantity_on_hand) || 0;
                  const reserved = parseFloat(item.quantity_reserved) || 0;
                  const available = onHand - reserved;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-300">
                        {item.warehouse?.name}
                      </td>
                      <td className="p-3 font-mono text-amber-400">{item.product?.sku}</td>
                      <td className="p-3 text-slate-200">{item.product?.name}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-200">
                        {onHand.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono text-amber-400">
                        {reserved.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        {available.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded font-semibold ${
                            available > 50
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {available > 50 ? "SUFFICIENT" : "LOW STOCK"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Ref Number</th>
                  <th className="p-3">Warehouse</th>
                  <th className="p-3">Product</th>
                  <th className="p-3 text-center">Type</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3 text-right">Balance After</th>
                  <th className="p-3">Source Document</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {movements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-amber-400">{mov.reference_number}</td>
                    <td className="p-3 text-slate-300">{mov.warehouse?.name}</td>
                    <td className="p-3 text-slate-200">{mov.product?.name}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                          mov.type === "IN"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {mov.type}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-100">
                      {mov.quantity}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-300">
                      {mov.balance_after}
                    </td>
                    <td className="p-3 font-mono text-slate-400">{mov.source_document || "-"}</td>
                    <td className="p-3 text-slate-500">
                      {new Date(mov.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
