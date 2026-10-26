"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  Factory,
  Plus,
  Check,
  AlertCircle,
  Clock,
  CheckCircle2,
  Boxes,
  X,
  Search,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface ProductionMaterial {
  id?: number;
  product_id: number;
  product?: {
    sku: string;
    name: string;
  };
  required_quantity: number;
  consumed_quantity: number;
}

interface ProductionOrder {
  id: number;
  prod_number: string;
  product_id: number;
  warehouse_id: number;
  target_quantity: number;
  actual_quantity: number;
  start_date: string;
  end_date?: string;
  status: "DRAFT" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "CLOSED" | "REJECTED";
  notes?: string;
  product?: {
    sku: string;
    name: string;
    type: string;
  };
  warehouse?: {
    name: string;
    code: string;
  };
  materials: ProductionMaterial[];
}

export default function ProductionPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [targetProductId, setTargetProductId] = useState<number | "">("");
  const [warehouseId, setWarehouseId] = useState<number | "">("");
  const [targetQty, setTargetQty] = useState(500);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [materials, setMaterials] = useState<{ product_id: number; required_quantity: number }[]>([
    { product_id: 0, required_quantity: 15 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setStartDate(new Date().toISOString().split("T")[0]);
    fetchOrders();
    fetchProducts();
    fetchWarehouses();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await apiRequest("/production-orders?per_page=50");
    if (res.success && res.data) {
      setOrders(res.data.data || res.data);
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    const res = await apiRequest("/products?per_page=100");
    if (res.success && res.data) {
      const prods = res.data.data || res.data;
      setProducts(prods);
      const finished = prods.filter((p: any) => p.type === "FINISHED_GOOD");
      const raw = prods.filter((p: any) => p.type === "RAW_MATERIAL");

      if (finished.length > 0) setTargetProductId(finished[0].id);
      if (raw.length > 0) setMaterials([{ product_id: raw[0].id, required_quantity: 15 }]);
    }
  };

  const fetchWarehouses = async () => {
    const res = await apiRequest("/warehouses");
    if (res.success && res.data) {
      setWarehouses(res.data);
      if (res.data.length > 0) setWarehouseId(res.data[0].id);
    }
  };

  const handleApprove = async (id: number) => {
    setActionMsg("");
    setErrorMsg("");
    const res = await apiRequest(`/production-orders/${id}/approve`, { method: "POST" });
    if (res.success) {
      setActionMsg(`Production Order #${id} approved for processing`);
      fetchOrders();
    } else {
      setErrorMsg(res.message || "Failed to approve production order");
    }
  };

  const handleComplete = async (id: number) => {
    setActionMsg("");
    setErrorMsg("");
    const res = await apiRequest(`/production-orders/${id}/complete`, { method: "POST" });
    if (res.success) {
      setActionMsg(`Production Order #${id} completed! Raw salt consumed and refined goods added to stock.`);
      fetchOrders();
    } else {
      setErrorMsg(res.message || "Failed to complete production order");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProductId || !warehouseId) {
      setErrorMsg("Please fill in target product and warehouse");
      return;
    }

    setActionMsg("");
    setErrorMsg("");
    setSubmitting(true);

    const payload = {
      product_id: Number(targetProductId),
      warehouse_id: Number(warehouseId),
      target_quantity: Number(targetQty),
      start_date: startDate,
      end_date: endDate || null,
      notes: notes || "Refining & iodization production batch",
      materials: materials.map((m) => ({
        product_id: Number(m.product_id),
        required_quantity: Number(m.required_quantity),
      })),
    };

    const res = await apiRequest("/production-orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setSubmitting(false);
    if (res.success) {
      setActionMsg("Production Order created in DRAFT state!");
      setShowCreateModal(false);
      fetchOrders();
    } else {
      setErrorMsg(res.message || "Failed to create production order");
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.prod_number.toLowerCase().includes(search.toLowerCase()) ||
      o.product?.name.toLowerCase().includes(search.toLowerCase()) ||
      o.warehouse?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Factory className="h-5 w-5 text-amber-500" />
            Salt Production & Refinement
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manufacturing workflow: Washing, iodization (KIO3), milling, and packaging of raw Madura salt
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Production Order
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Batches</p>
            <p className="text-2xl font-bold text-white mt-1">{orders.length}</p>
          </div>
          <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
            <Factory className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Pending Approval</p>
            <p className="text-2xl font-bold text-sky-400 mt-1">
              {orders.filter((o) => o.status === "DRAFT").length}
            </p>
          </div>
          <div className="h-10 w-10 bg-sky-500/10 rounded-lg flex items-center justify-center text-sky-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">In Processing</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {orders.filter((o) => o.status === "APPROVED" || o.status === "IN_PROGRESS").length}
            </p>
          </div>
          <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Completed Output</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {orders.filter((o) => o.status === "COMPLETED").length}
            </p>
          </div>
          <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {actionMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search */}
      <div className="flex justify-end">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search Batch ID, output product..."
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
                  <th className="p-3">Order Number</th>
                  <th className="p-3">Target Output Product</th>
                  <th className="p-3">Facility Warehouse</th>
                  <th className="p-3 text-right">Target Output</th>
                  <th className="p-3 text-right">Actual Output</th>
                  <th className="p-3">Schedule</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="font-mono font-bold text-amber-400 hover:underline cursor-pointer"
                      >
                        {ord.prod_number}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-200">{ord.product?.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{ord.product?.sku}</div>
                    </td>
                    <td className="p-3 text-slate-300">{ord.warehouse?.name}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-200">
                      {ord.target_quantity}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-400">
                      {ord.actual_quantity || "-"}
                    </td>
                    <td className="p-3 text-slate-400">
                      <div>{ord.start_date}</div>
                      {ord.end_date && <div className="text-[10px] text-slate-500">to {ord.end_date}</div>}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-1 text-[10px] rounded-full font-bold border ${
                          ord.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : ord.status === "APPROVED"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : "bg-sky-500/10 text-sky-400 border-sky-500/30"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium border border-slate-700 cursor-pointer"
                        >
                          BOM
                        </button>

                        {ord.status === "DRAFT" && (
                          <button
                            onClick={() => handleApprove(ord.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold cursor-pointer shadow-sm"
                          >
                            Approve
                          </button>
                        )}

                        {ord.status === "APPROVED" && (
                          <button
                            onClick={() => handleComplete(ord.id)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[11px] cursor-pointer shadow-sm"
                          >
                            Execute & Complete
                          </button>
                        )}

                        {ord.status === "COMPLETED" && (
                          <span className="text-[11px] text-emerald-400 font-medium">Finished Goods Stored</span>
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

      {/* Modal: Create Production Order */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Factory className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">Create Production Batch</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Output Product</label>
                  <select
                    value={targetProductId}
                    onChange={(e) => setTargetProductId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  >
                    {products
                      .filter((p) => p.type === "FINISHED_GOOD")
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} [{p.sku}]
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Facility Warehouse</label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={targetQty}
                    onChange={(e) => setTargetQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Raw Materials Consumed */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Raw Material Consumed (BOM / Bahan Baku Tambak)
                </label>
                {materials.map((m, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select
                      value={m.product_id}
                      onChange={(e) => {
                        const copy = [...materials];
                        copy[idx].product_id = Number(e.target.value);
                        setMaterials(copy);
                      }}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {products
                        .filter((p) => p.type === "RAW_MATERIAL")
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} [{p.sku}]
                          </option>
                        ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty required"
                      value={m.required_quantity}
                      onChange={(e) => {
                        const copy = [...materials];
                        copy[idx].required_quantity = Number(e.target.value);
                        setMaterials(copy);
                      }}
                      className="w-28 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono text-right"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: BOM Details */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Factory className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">Bill of Materials & Consumption</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Batch Code:</span>
                <span className="font-mono text-amber-400 font-bold">{selectedOrder.prod_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Output Product:</span>
                <span className="text-white font-medium">{selectedOrder.product?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Output Quantity:</span>
                <span className="font-mono text-white font-bold">{selectedOrder.target_quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-400">{selectedOrder.status}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2">Required Raw Materials</h4>
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="p-2.5">Raw Material</th>
                      <th className="p-2.5 text-right">Required</th>
                      <th className="p-2.5 text-right">Consumed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedOrder.materials?.map((mat, i) => (
                      <tr key={i} className="bg-slate-900/50">
                        <td className="p-2.5 text-slate-200">
                          {mat.product?.name || `Material #${mat.product_id}`}
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-300">{mat.required_quantity}</td>
                        <td className="p-2.5 text-right font-mono text-emerald-400">
                          {mat.consumed_quantity || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
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
