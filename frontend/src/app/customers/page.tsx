"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  Users,
  Search,
  Plus,
  Check,
  AlertCircle,
  Building,
  CreditCard,
  Percent,
  Phone,
  Mail,
  X,
  UserCheck,
} from "lucide-react";

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState<"customers" | "suppliers">("customers");
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [creditLimit, setCreditLimit] = useState(100000000);
  const [maxDiscount, setMaxDiscount] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const [cRes, sRes] = await Promise.all([
      apiRequest(`/customers${query}`),
      apiRequest(`/suppliers`),
    ]);

    if (cRes.success && cRes.data) {
      setCustomers(cRes.data.data || cRes.data);
    }
    if (sRes.success && sRes.data) {
      setSuppliers(sRes.data.data || sRes.data);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg("");
    setErrorMsg("");
    setSubmitting(true);

    const endpoint = activeTab === "customers" ? "/customers" : "/suppliers";
    const payload =
      activeTab === "customers"
        ? { code, name, email, phone, address, credit_limit: creditLimit, max_discount_rate: maxDiscount }
        : { code, name, email, phone, address };

    const res = await apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setSubmitting(false);
    if (res.success) {
      setActionMsg(`${activeTab === "customers" ? "Customer" : "Supplier"} registered successfully!`);
      setShowModal(false);
      resetForm();
      fetchData();
    } else {
      setErrorMsg(res.message || "Failed to save partner");
    }
  };

  const resetForm = () => {
    setCode("");
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setCreditLimit(100000000);
    setMaxDiscount(10);
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-500" />
            Customers & Trade Partners
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Master database of B2B corporate buyers, wholesale distributors, and local Madura salt cooperatives
          </p>
        </div>
        <button
          onClick={() => {
            setCode(
              activeTab === "customers"
                ? `CUST-${String(customers.length + 1).padStart(3, "0")}`
                : `SUP-${String(suppliers.length + 1).padStart(3, "0")}`
            );
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add {activeTab === "customers" ? "Customer" : "Supplier"}
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">B2B Customers</p>
            <p className="text-2xl font-bold text-white mt-1">{customers.length}</p>
          </div>
          <div className="h-10 w-10 bg-sky-500/10 rounded-lg flex items-center justify-center text-sky-400">
            <Building className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Salt Farmers & Vendors</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{suppliers.length}</p>
          </div>
          <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Average Credit Limit</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">
              {formatIDR(
                customers.length > 0
                  ? customers.reduce((acc, c) => acc + (Number(c.credit_limit) || 0), 0) / customers.length
                  : 0
              )}
            </p>
          </div>
          <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Status</p>
            <p className="text-2xl font-bold text-teal-400 mt-1">100%</p>
          </div>
          <div className="h-10 w-10 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-400">
            <UserCheck className="h-5 w-5" />
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

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-900 p-1 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === "customers"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab("suppliers")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === "suppliers"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Suppliers & Petambak ({suppliers.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
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
      ) : activeTab === "customers" ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Customer Code</th>
                  <th className="p-3">Company / Customer Name</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3 text-right">Credit Limit</th>
                  <th className="p-3 text-center">Max Discount</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-medium text-amber-400">{c.code}</td>
                    <td className="p-3 font-semibold text-slate-200">{c.name}</td>
                    <td className="p-3 text-slate-400">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Mail className="h-3 w-3 text-slate-500" />
                        <span>{c.email || "-"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                        <Phone className="h-3 w-3" />
                        <span>{c.phone || "-"}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-100">
                      {formatIDR(c.credit_limit)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 text-[10px] rounded bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20">
                        {c.max_discount_rate}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 text-[10px] rounded font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Supplier Code</th>
                  <th className="p-3">Vendor / Farmer Group Name</th>
                  <th className="p-3">Contact Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Location / Address</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-medium text-amber-400">{s.code}</td>
                    <td className="p-3 font-semibold text-slate-200">{s.name}</td>
                    <td className="p-3 text-slate-300">{s.email || "-"}</td>
                    <td className="p-3 font-mono text-slate-400">{s.phone || "-"}</td>
                    <td className="p-3 text-slate-400">{s.address || "Madura"}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 text-[10px] rounded font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">
                  Add {activeTab === "customers" ? "Customer" : "Supplier"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {activeTab === "customers" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Credit Limit (IDR)</label>
                    <input
                      type="number"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Max Discount (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
