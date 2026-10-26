"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  FileText,
  Plus,
  Check,
  AlertCircle,
  Clock,
  CheckCircle2,
  PackageCheck,
  X,
  Search,
  Building2,
  Warehouse as WarehouseIcon,
  Layers,
} from "lucide-react";

interface PurchaseOrderItem {
  id?: number;
  product_id: number;
  product?: {
    sku: string;
    name: string;
    type: string;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
  received_quantity?: number;
}

interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  warehouse_id: number;
  order_date: string;
  expected_delivery_date?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: "DRAFT" | "APPROVED" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";
  notes?: string;
  supplier?: {
    id: number;
    code: string;
    name: string;
  };
  warehouse?: {
    id: number;
    code: string;
    name: string;
  };
  items: PurchaseOrderItem[];
  created_at: string;
}

export default function PurchasingPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
  const [receiveModalPo, setReceiveModalPo] = useState<PurchaseOrder | null>(null);
  const [grNotes, setGrNotes] = useState("");

  // New PO form state
  const [formSupplierId, setFormSupplierId] = useState<number | "">("");
  const [formWarehouseId, setFormWarehouseId] = useState<number | "">("");
  const [formOrderDate, setFormOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [formExpectedDate, setFormExpectedDate] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formItems, setFormItems] = useState<{ product_id: number; quantity: number; unit_price: number }[]>([
    { product_id: 0, quantity: 10, unit_price: 850000 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
    fetchWarehouses();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await apiRequest("/purchase-orders?per_page=50");
    if (res.success && res.data) {
      setOrders(res.data.data || res.data);
    }
    setLoading(false);
  };

  const fetchSuppliers = async () => {
    const res = await apiRequest("/suppliers?per_page=100");
    if (res.success && res.data) {
      setSuppliers(res.data.data || res.data);
      if (res.data.data?.length > 0) {
        setFormSupplierId(res.data.data[0].id);
      }
    }
  };

  const fetchWarehouses = async () => {
    const res = await apiRequest("/warehouses");
    if (res.success && res.data) {
      setWarehouses(res.data);
      if (res.data.length > 0) {
        setFormWarehouseId(res.data[0].id);
      }
    }
  };

  const fetchProducts = async () => {
    const res = await apiRequest("/products?per_page=100");
    if (res.success && res.data) {
      const prods = res.data.data || res.data;
      setProducts(prods);
      if (prods.length > 0) {
        // default to first raw material or first product
        const raw = prods.find((p: any) => p.type === "RAW_MATERIAL") || prods[0];
        setFormItems([{ product_id: raw.id, quantity: 20, unit_price: Number(raw.purchase_price) || 850000 }]);
      }
    }
  };

  const handleApprove = async (id: number) => {
    setActionMsg("");
    setErrorMsg("");
    const res = await apiRequest(`/purchase-orders/${id}/approve`, { method: "POST" });
    if (res.success) {
      setActionMsg(`Purchase Order #${id} approved successfully`);
      fetchOrders();
    } else {
      setErrorMsg(res.message || "Failed to approve purchase order");
    }
  };

  const handleReceiveGoods = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiveModalPo) return;

    setActionMsg("");
    setErrorMsg("");
    setSubmitting(true);

    const res = await apiRequest(`/purchase-orders/${receiveModalPo.id}/receive-goods`, {
      method: "POST",
      body: JSON.stringify({ notes: grNotes || "Goods receipt confirmed by warehouse" }),
    });

    setSubmitting(false);
    if (res.success) {
      setActionMsg(`Goods Receipt created for ${receiveModalPo.po_number}! Raw salt stock has been added.`);
      setReceiveModalPo(null);
      setGrNotes("");
      fetchOrders();
    } else {
      setErrorMsg(res.message || "Failed to receive goods");
    }
  };

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSupplierId || !formWarehouseId || formItems.length === 0) {
      setErrorMsg("Please complete all required fields");
      return;
    }

    setActionMsg("");
    setErrorMsg("");
    setSubmitting(true);

    const payload = {
      supplier_id: Number(formSupplierId),
      warehouse_id: Number(formWarehouseId),
      order_date: formOrderDate,
      expected_delivery_date: formExpectedDate || null,
      notes: formNotes || "Raw salt procurement batch",
      items: formItems.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
      })),
    };

    const res = await apiRequest("/purchase-orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setSubmitting(false);
    if (res.success) {
      setActionMsg(`Purchase Order created in DRAFT state!`);
      setShowCreateModal(false);
      fetchOrders();
    } else {
      setErrorMsg(res.message || "Failed to create purchase order");
    }
  };

  const addItemRow = () => {
    const raw = products.find((p: any) => p.type === "RAW_MATERIAL") || products[0];
    setFormItems([
      ...formItems,
      { product_id: raw ? raw.id : 0, quantity: 10, unit_price: raw ? Number(raw.purchase_price) : 500000 },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (formItems.length <= 1) return;
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const updateItemRow = (index: number, field: string, val: any) => {
    const copy = [...formItems];
    copy[index] = { ...copy[index], [field]: val };
    if (field === "product_id") {
      const prod = products.find((p: any) => p.id === Number(val));
      if (prod) {
        copy[index].unit_price = Number(prod.purchase_price) || 0;
      }
    }
    setFormItems(copy);
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const filteredOrders = orders.filter((po) => {
    const matchesStatus = statusFilter === "ALL" || po.status === statusFilter;
    const matchesSearch =
      po.po_number.toLowerCase().includes(search.toLowerCase()) ||
      po.supplier?.name.toLowerCase().includes(search.toLowerCase()) ||
      po.warehouse?.name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalCount = orders.length;
  const draftCount = orders.filter((o) => o.status === "DRAFT").length;
  const approvedCount = orders.filter((o) => o.status === "APPROVED" || o.status === "PARTIALLY_RECEIVED").length;
  const receivedCount = orders.filter((o) => o.status === "RECEIVED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" />
            Purchasing & Raw Salt Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Procurement lifecycle: Raw salt purchasing from farmers (petambak) & chemical/packaging suppliers
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Purchase Order
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-white mt-1">{totalCount}</p>
          </div>
          <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Awaiting Approval</p>
            <p className="text-2xl font-bold text-sky-400 mt-1">{draftCount}</p>
          </div>
          <div className="h-10 w-10 bg-sky-500/10 rounded-lg flex items-center justify-center text-sky-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Approved / In Transit</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{approvedCount}</p>
          </div>
          <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Goods Received</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{receivedCount}</p>
          </div>
          <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
            <PackageCheck className="h-5 w-5" />
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "DRAFT", "APPROVED", "RECEIVED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search PO, supplier, warehouse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Orders Table */}
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
                  <th className="p-3">PO Number</th>
                  <th className="p-3">Supplier (Petambak/Vendor)</th>
                  <th className="p-3">Destination Warehouse</th>
                  <th className="p-3">Order Date</th>
                  <th className="p-3 text-right">Total Amount</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No purchase orders found matching current filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const statusColor =
                      order.status === "DRAFT"
                        ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                        : order.status === "APPROVED" || order.status === "PARTIALLY_RECEIVED"
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        : order.status === "RECEIVED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700";

                    return (
                      <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3">
                          <button
                            onClick={() => setSelectedPo(order)}
                            className="font-mono font-bold text-amber-400 hover:underline cursor-pointer"
                          >
                            {order.po_number}
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-200">{order.supplier?.name || "Supplier"}</div>
                          <div className="text-[11px] text-slate-500">{order.supplier?.code}</div>
                        </td>
                        <td className="p-3 text-slate-300 font-medium">
                          {order.warehouse?.name || "Gudang Madura"}
                        </td>
                        <td className="p-3 text-slate-400">{order.order_date}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-100">
                          {formatIDR(order.total_amount)}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 text-[10px] rounded-full font-bold border ${statusColor}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => setSelectedPo(order)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium border border-slate-700 cursor-pointer"
                            >
                              Details
                            </button>

                            {order.status === "DRAFT" && (
                              <button
                                onClick={() => handleApprove(order.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold cursor-pointer shadow-sm"
                              >
                                Approve
                              </button>
                            )}

                            {(order.status === "APPROVED" || order.status === "PARTIALLY_RECEIVED") && (
                              <button
                                onClick={() => setReceiveModalPo(order)}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[11px] cursor-pointer shadow-sm"
                              >
                                Receive Goods (GR)
                              </button>
                            )}

                            {order.status === "RECEIVED" && (
                              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                                <Check className="h-3 w-3" /> In Stock
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create PO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">Create Purchase Order (Bahan Baku Garam)</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Supplier (Petambak/Vendor)</label>
                  <select
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Warehouse</label>
                  <select
                    value={formWarehouseId}
                    onChange={(e) => setFormWarehouseId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Order Date</label>
                  <input
                    type="date"
                    value={formOrderDate}
                    onChange={(e) => setFormOrderDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={formExpectedDate}
                    onChange={(e) => setFormExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Order Items (Bahan Baku / Produk)</label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400">
                      <tr>
                        <th className="p-2.5">Product</th>
                        <th className="p-2.5 w-24">Qty</th>
                        <th className="p-2.5 w-32">Unit Price (Rp)</th>
                        <th className="p-2.5 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {formItems.map((item, idx) => (
                        <tr key={idx} className="bg-slate-900">
                          <td className="p-2">
                            <select
                              value={item.product_id}
                              onChange={(e) => updateItemRow(idx, "product_id", e.target.value)}
                              className="w-full p-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-amber-500"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} [{p.sku}]
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItemRow(idx, "quantity", Number(e.target.value))}
                              className="w-full p-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-amber-500 text-right font-mono"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              value={item.unit_price}
                              onChange={(e) => updateItemRow(idx, "unit_price", Number(e.target.value))}
                              className="w-full p-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-amber-500 text-right font-mono"
                              required
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeItemRow(idx)}
                              className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                              title="Remove item"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Keterangan</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Catatan pengadaan petambak atau spesifikasi garam..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                ></textarea>
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
                  {submitting ? "Saving..." : "Save Purchase Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Goods Receipt Confirmation */}
      {receiveModalPo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">Receive Goods (Penerimaan Garam)</h3>
              </div>
              <button
                onClick={() => setReceiveModalPo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReceiveGoods} className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <p className="text-slate-400">
                  PO Number: <span className="font-mono text-amber-400 font-bold">{receiveModalPo.po_number}</span>
                </p>
                <p className="text-slate-400">
                  Supplier: <span className="text-white font-medium">{receiveModalPo.supplier?.name}</span>
                </p>
                <p className="text-slate-400">
                  Warehouse: <span className="text-white font-medium">{receiveModalPo.warehouse?.name}</span>
                </p>
                <p className="text-slate-400">
                  Total Value:{" "}
                  <span className="font-mono text-emerald-400 font-bold">{formatIDR(receiveModalPo.total_amount)}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Goods Receipt Notes / Petugas Gudang
                </label>
                <textarea
                  value={grNotes}
                  onChange={(e) => setGrNotes(e.target.value)}
                  placeholder="Kondisi fisik garam baik, kadar air sesuai standar petambak..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <p className="text-[11px] text-amber-400/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                Penerimaan barang akan otomatis menambah saldo stok fisik garam di gudang terkait dan mencatat kartu stok
                (Goods Receipt).
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReceiveModalPo(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Confirm Receipt & Stock-In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View PO Details */}
      {selectedPo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">Purchase Order Details</h3>
              </div>
              <button
                onClick={() => setSelectedPo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div>
                <p className="text-slate-500">PO Number</p>
                <p className="font-mono font-bold text-amber-400">{selectedPo.po_number}</p>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <span className="font-bold text-slate-200">{selectedPo.status}</span>
              </div>
              <div>
                <p className="text-slate-500">Supplier</p>
                <p className="font-semibold text-slate-200">{selectedPo.supplier?.name}</p>
              </div>
              <div>
                <p className="text-slate-500">Destination Warehouse</p>
                <p className="font-semibold text-slate-200">{selectedPo.warehouse?.name}</p>
              </div>
              <div>
                <p className="text-slate-500">Order Date</p>
                <p className="text-slate-300">{selectedPo.order_date}</p>
              </div>
              <div>
                <p className="text-slate-500">Total Value (inc. tax)</p>
                <p className="font-mono font-bold text-emerald-400">{formatIDR(selectedPo.total_amount)}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2">Item Breakdown</h4>
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="p-2.5">Product SKU & Name</th>
                      <th className="p-2.5 text-right">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedPo.items?.map((item, idx) => (
                      <tr key={idx} className="bg-slate-900/50">
                        <td className="p-2.5 text-slate-200">
                          <div className="font-medium">{item.product?.name || `Product #${item.product_id}`}</div>
                          <div className="font-mono text-[10px] text-slate-500">{item.product?.sku}</div>
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-300">{item.quantity}</td>
                        <td className="p-2.5 text-right font-mono text-slate-400">{formatIDR(item.unit_price)}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-200">
                          {formatIDR(item.total_price || item.quantity * item.unit_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPo(null)}
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
