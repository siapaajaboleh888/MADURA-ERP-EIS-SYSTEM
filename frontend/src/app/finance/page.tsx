"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  BadgeDollarSign,
  Search,
  Check,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  Clock,
  X,
  FileSpreadsheet,
  Building,
  ArrowUpRight,
} from "lucide-react";

interface Payment {
  id: number;
  payment_number: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number?: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  sales_order_id: number;
  customer_id: number;
  invoice_date: string;
  due_date: string;
  amount: number;
  paid_amount: number;
  outstanding_amount: number;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
  customer?: {
    name: string;
    code: string;
  };
  sales_order?: {
    so_number: string;
  };
  payments: Payment[];
}

export default function FinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modals
  const [payModalInvoice, setPayModalInvoice] = useState<Invoice | null>(null);
  const [detailModalInvoice, setDetailModalInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState("BANK_TRANSFER");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    const res = await apiRequest("/invoices?per_page=50");
    if (res.success && res.data) {
      setInvoices(res.data.data || res.data);
    }
    setLoading(false);
  };

  const handleOpenPay = (inv: Invoice) => {
    setPayModalInvoice(inv);
    setPayAmount(Number(inv.outstanding_amount));
    setPayRef(`BCA-TRF-${Math.floor(100000 + Math.random() * 900000)}`);
    setPayNotes("Pelunasan tagihan garam");
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalInvoice) return;

    setActionMsg("");
    setErrorMsg("");
    setSubmitting(true);

    const payload = {
      amount: Number(payAmount),
      payment_method: payMethod,
      reference_number: payRef,
      notes: payNotes,
    };

    const res = await apiRequest(`/invoices/${payModalInvoice.id}/payments`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setSubmitting(false);
    if (res.success) {
      setActionMsg(`Payment applied successfully to ${payModalInvoice.invoice_number}!`);
      setPayModalInvoice(null);
      fetchInvoices();
    } else {
      setErrorMsg(res.message || "Failed to record payment");
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.sales_order?.so_number.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalInvoiced = invoices.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const totalPaid = invoices.reduce((acc, i) => acc + (Number(i.paid_amount) || 0), 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + (Number(i.outstanding_amount) || 0), 0);
  const collectionRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BadgeDollarSign className="h-5 w-5 text-amber-500" />
            Finance & Customer Invoices
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Accounts Receivable (AR), billing settlement, and payment reconciliation for Madura salt trade
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Invoiced</p>
            <p className="text-xl font-bold text-white mt-1">{formatIDR(totalInvoiced)}</p>
          </div>
          <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Outstanding (Unpaid)</p>
            <p className="text-xl font-bold text-amber-400 mt-1">{formatIDR(totalOutstanding)}</p>
          </div>
          <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Settled & Collected</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">{formatIDR(totalPaid)}</p>
          </div>
          <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Collection Rate</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">{collectionRate}%</p>
          </div>
          <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
            <CreditCard className="h-5 w-5" />
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

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "UNPAID", "PARTIALLY_PAID", "PAID"].map((st) => (
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
            placeholder="Search invoice, customer, SO..."
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
                  <th className="p-3">Invoice Number</th>
                  <th className="p-3">Customer Buyer</th>
                  <th className="p-3">Sales Order</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3 text-right">Invoice Amount</th>
                  <th className="p-3 text-right">Outstanding</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Settlement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredInvoices.map((inv) => {
                  const isPaid = inv.status === "PAID";
                  const isUnpaid = inv.status === "UNPAID";

                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <button
                          onClick={() => setDetailModalInvoice(inv)}
                          className="font-mono font-bold text-amber-400 hover:underline cursor-pointer"
                        >
                          {inv.invoice_number}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-200">{inv.customer?.name}</div>
                        <div className="text-[10px] text-slate-500">{inv.customer?.code}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-300">{inv.sales_order?.so_number}</td>
                      <td className="p-3 text-slate-400">{inv.due_date}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-100">
                        {formatIDR(inv.amount)}
                      </td>
                      <td className="p-3 text-right font-mono text-amber-400 font-bold">
                        {formatIDR(inv.outstanding_amount)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-1 text-[10px] rounded-full font-bold border ${
                            isPaid
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : isUnpaid
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => setDetailModalInvoice(inv)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium border border-slate-700 cursor-pointer"
                          >
                            Details
                          </button>

                          {!isPaid ? (
                            <button
                              onClick={() => handleOpenPay(inv)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold cursor-pointer shadow-sm"
                            >
                              Pay / Settle
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                              <Check className="h-3 w-3" /> Settled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Record Payment */}
      {payModalInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">Record Invoice Payment</h3>
              </div>
              <button
                onClick={() => setPayModalInvoice(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                <p className="text-slate-400">
                  Invoice: <span className="font-mono text-amber-400 font-bold">{payModalInvoice.invoice_number}</span>
                </p>
                <p className="text-slate-400">
                  Customer: <span className="text-white font-medium">{payModalInvoice.customer?.name}</span>
                </p>
                <p className="text-slate-400">
                  Total Amount: <span className="font-mono text-white">{formatIDR(payModalInvoice.amount)}</span>
                </p>
                <p className="text-slate-400">
                  Outstanding Balance:{" "}
                  <span className="font-mono text-rose-400 font-bold">
                    {formatIDR(payModalInvoice.outstanding_amount)}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Amount (IDR)</label>
                <input
                  type="number"
                  min="1"
                  max={Number(payModalInvoice.outstanding_amount)}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (BCA/Mandiri)</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque / Giro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Reference No.</label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalInvoice(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Confirm & Apply Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Details */}
      {detailModalInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BadgeDollarSign className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">Invoice & Settlements</h3>
              </div>
              <button
                onClick={() => setDetailModalInvoice(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Invoice:</span>
                <span className="font-mono font-bold text-amber-400">{detailModalInvoice.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Buyer Customer:</span>
                <span className="text-white font-medium">{detailModalInvoice.customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sales Order Ref:</span>
                <span className="text-white font-mono">{detailModalInvoice.sales_order?.so_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Due:</span>
                <span className="font-mono font-bold text-white">{formatIDR(detailModalInvoice.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Paid Amount:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {formatIDR(detailModalInvoice.paid_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Remaining Balance:</span>
                <span className="font-mono text-rose-400 font-bold">
                  {formatIDR(detailModalInvoice.outstanding_amount)}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2">Recorded Payment Receipts</h4>
              {detailModalInvoice.payments && detailModalInvoice.payments.length > 0 ? (
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400">
                      <tr>
                        <th className="p-2.5">Receipt #</th>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Method</th>
                        <th className="p-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {detailModalInvoice.payments.map((p) => (
                        <tr key={p.id} className="bg-slate-900/50">
                          <td className="p-2.5 font-mono text-amber-400">{p.payment_number}</td>
                          <td className="p-2.5 text-slate-300">{p.payment_date}</td>
                          <td className="p-2.5 text-slate-400">{p.payment_method}</td>
                          <td className="p-2.5 text-right font-mono text-emerald-400 font-bold">
                            {formatIDR(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded-lg border border-slate-800">
                  No payments recorded yet for this invoice.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailModalInvoice(null)}
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
