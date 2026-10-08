"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { ShoppingCart, Check, Send, Box, Truck, Receipt, AlertCircle } from "lucide-react";

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await apiRequest("/sales-orders");
    if (res.success && res.data) {
      setOrders(res.data.data || res.data);
    }
    setLoading(false);
  };

  const handleAction = async (endpoint: string, id: number, successText: string) => {
    setActionMsg("");
    setErrorMsg("");
    const res = await apiRequest(`/sales-orders/${id}/${endpoint}`, { method: "POST" });
    if (res.success) {
      setActionMsg(`${successText} successfully`);
      fetchOrders();
    } else {
      setErrorMsg(res.message || "Action failed");
    }
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
            <ShoppingCart className="h-5 w-5 text-amber-500" />
            Sales Orders & 7-Stage Workflow
          </h1>
          <p className="text-xs text-slate-400">
            DRAFT → SUBMITTED → APPROVED → STOCK_RESERVED → DELIVERED → INVOICED → PAID
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{actionMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

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
                  <th className="p-3">SO Number</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Warehouse</th>
                  <th className="p-3 text-right">Total Amount</th>
                  <th className="p-3 text-center">Current State</th>
                  <th className="p-3 text-center">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-medium text-amber-400">
                      {order.so_number}
                    </td>
                    <td className="p-3 font-semibold text-slate-200">
                      {order.customer?.name}
                    </td>
                    <td className="p-3 text-slate-400">{order.warehouse?.name}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-100">
                      {formatIDR(order.total_amount)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-1 text-[10px] rounded font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {order.status === "DRAFT" && (
                          <button
                            onClick={() => handleAction("submit", order.id, "Order submitted")}
                            className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[11px] font-semibold"
                          >
                            Submit
                          </button>
                        )}
                        {order.status === "SUBMITTED" && (
                          <button
                            onClick={() => handleAction("approve", order.id, "Order approved")}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold"
                          >
                            Approve
                          </button>
                        )}
                        {order.status === "APPROVED" && (
                          <button
                            onClick={() => handleAction("reserve-stock", order.id, "Stock reserved")}
                            className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[11px] font-semibold"
                          >
                            Reserve Stock
                          </button>
                        )}
                        {order.status === "STOCK_RESERVED" && (
                          <button
                            onClick={() => handleAction("deliver", order.id, "Goods delivered")}
                            className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-[11px]"
                          >
                            Ship / Deliver
                          </button>
                        )}
                        {order.status === "DELIVERED" && (
                          <button
                            onClick={() => handleAction("invoice", order.id, "Invoice generated")}
                            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold"
                          >
                            Generate Invoice
                          </button>
                        )}
                        {(order.status === "INVOICED" || order.status === "PAID") && (
                          <span className="text-[11px] text-emerald-400 font-medium">
                            {order.status === "PAID" ? "Settled & Closed" : "Awaiting Payment"}
                          </span>
                        )}
                      </div>
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
