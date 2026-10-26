"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  Calendar,
  X,
  FileText,
} from "lucide-react";

interface DeliveryItem {
  id?: number;
  product_id: number;
  product?: {
    sku: string;
    name: string;
  };
  quantity_shipped: number;
}

interface Delivery {
  id: number;
  do_number: string;
  sales_order_id: number;
  warehouse_id: number;
  delivery_date: string;
  shipping_carrier?: string;
  tracking_number?: string;
  status: string;
  notes?: string;
  sales_order?: {
    so_number: string;
    customer?: {
      name: string;
      code: string;
      address?: string;
    };
  };
  warehouse?: {
    name: string;
    code: string;
  };
  items: DeliveryItem[];
  shipper?: {
    name: string;
  };
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDo, setSelectedDo] = useState<Delivery | null>(null);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    const res = await apiRequest("/deliveries?per_page=50");
    if (res.success && res.data) {
      setDeliveries(res.data.data || res.data);
    }
    setLoading(false);
  };

  const filteredDeliveries = deliveries.filter(
    (d) =>
      d.do_number.toLowerCase().includes(search.toLowerCase()) ||
      d.sales_order?.so_number.toLowerCase().includes(search.toLowerCase()) ||
      d.sales_order?.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      d.warehouse?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="h-5 w-5 text-amber-500" />
            Delivery Orders (Surat Jalan Pengiriman)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Outbound logistics tracking, armada shipments, and customer delivery confirmations
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Deliveries</p>
            <p className="text-2xl font-bold text-white mt-1">{deliveries.length}</p>
          </div>
          <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
            <Truck className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Delivered & Confirmed</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {deliveries.filter((d) => d.status === "DELIVERED").length}
            </p>
          </div>
          <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">In Transit / Shipped</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {deliveries.filter((d) => d.status === "SHIPPED").length}
            </p>
          </div>
          <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Carrier Fleet</p>
            <p className="text-lg font-bold text-purple-400 mt-1">Madura Logistics</p>
          </div>
          <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
            <MapPin className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex justify-end">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search DO, Sales Order, Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Table */}
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
                  <th className="p-3">DO Number</th>
                  <th className="p-3">Sales Order Ref</th>
                  <th className="p-3">Customer Buyer</th>
                  <th className="p-3">Origin Warehouse</th>
                  <th className="p-3">Delivery Date</th>
                  <th className="p-3">Carrier / Tracking</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredDeliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-400">{d.do_number}</td>
                    <td className="p-3 font-mono text-slate-300">{d.sales_order?.so_number}</td>
                    <td className="p-3 font-semibold text-slate-200">
                      {d.sales_order?.customer?.name || "Customer"}
                    </td>
                    <td className="p-3 text-slate-400">{d.warehouse?.name}</td>
                    <td className="p-3 text-slate-300 font-mono">{d.delivery_date}</td>
                    <td className="p-3 text-slate-400">
                      <div>{d.shipping_carrier || "Fleet armada"}</div>
                      {d.tracking_number && (
                        <div className="font-mono text-[10px] text-amber-400/80">{d.tracking_number}</div>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-1 text-[10px] rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {d.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedDo(d)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium border border-slate-700 cursor-pointer"
                      >
                        View Items
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: DO Details */}
      {selectedDo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">Surat Jalan (Delivery Order)</h3>
              </div>
              <button
                onClick={() => setSelectedDo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">DO Number:</span>
                <span className="font-mono font-bold text-amber-400">{selectedDo.do_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sales Order:</span>
                <span className="font-mono text-white">{selectedDo.sales_order?.so_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient Customer:</span>
                <span className="text-white font-medium">{selectedDo.sales_order?.customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Origin Warehouse:</span>
                <span className="text-white">{selectedDo.warehouse?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Carrier / Resi:</span>
                <span className="text-slate-300 font-mono">
                  {selectedDo.shipping_carrier} — {selectedDo.tracking_number}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2">Shipped Products</h4>
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="p-2.5">Product SKU & Name</th>
                      <th className="p-2.5 text-right">Quantity Shipped</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedDo.items?.map((item, idx) => (
                      <tr key={idx} className="bg-slate-900/50">
                        <td className="p-2.5 text-slate-200">
                          {item.product?.name || `Product #${item.product_id}`}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-amber-400">
                          {item.quantity_shipped}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDo(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
