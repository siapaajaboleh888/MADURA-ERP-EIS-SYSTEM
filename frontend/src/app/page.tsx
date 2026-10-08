"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  DollarSign,
  TrendingUp,
  Boxes,
  Truck,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    const res = await apiRequest("/eis/dashboard");
    if (res.success) {
      setData(res.data);
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

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Executive Information System
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
              Live EIS
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time aggregate analytics for Madura Salt Enterprise operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">System Status:</span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Operational
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Settled Revenue</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{formatIDR(metrics.total_revenue)}</p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            <span>Fully paid client invoices</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Outstanding Invoices</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {formatIDR(metrics.outstanding_invoices)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-amber-400">
            <span>Pending receivables</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Inventory Value</span>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {formatIDR(metrics.total_inventory_value)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-sky-400">
            <span>Across 3 Madura Warehouses</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Orders & Deliveries</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{metrics.total_sales_orders} Orders</p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-purple-400">
            <span>{metrics.total_deliveries} Delivered shipments</span>
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Top Selling Salt Products
          </h2>
          <div className="space-y-3">
            {data?.top_products?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800/80 rounded-lg text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-200">{item.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sold: {item.total_qty} units
                  </p>
                </div>
                <span className="font-bold text-amber-400">{formatIDR(item.total_sales)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-sky-400" />
            Sales Orders by Workflow State
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {data?.order_status_distribution?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between"
              >
                <span className="text-xs font-medium text-slate-300">{item.status}</span>
                <span className="px-2 py-0.5 text-xs font-bold bg-slate-800 text-amber-400 rounded">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
