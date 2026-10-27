"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  Factory,
  FileText,
  BadgeDollarSign,
  ShieldCheck,
  GraduationCap,
  Boxes,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Menu visibility per role
  const roleMenuMap: Record<string, string[]> = {
    ADMIN:      ["/", "/products", "/customers", "/inventory", "/sales", "/purchasing", "/production", "/deliveries", "/finance", "/course-center", "/qa-traceability"],
    MANAGER:    ["/", "/products", "/customers", "/inventory", "/sales", "/purchasing", "/production", "/deliveries", "/finance", "/qa-traceability"],
    SALES:      ["/sales", "/customers", "/deliveries", "/products"],
    WAREHOUSE:  ["/inventory", "/purchasing", "/deliveries", "/products"],
    PRODUCTION: ["/production", "/inventory", "/products"],
    FINANCE:    ["/finance", "/sales", "/deliveries", "/"],
    CUSTOMER:   ["/sales", "/deliveries"],
  };

  const allowedHrefs = roleMenuMap[user?.role ?? ""] ?? [];

  const allNavItems = [
    { name: "Executive Dashboard",    href: "/",             icon: LayoutDashboard },
    { name: "Master Data (Products)", href: "/products",     icon: Package },
    { name: "Customers & Partners",   href: "/customers",    icon: Users },
    { name: "Inventory & Stock Card", href: "/inventory",    icon: Boxes },
    { name: "Sales & Orders",         href: "/sales",        icon: ShoppingCart },
    { name: "Purchasing & Raw Salt",  href: "/purchasing",   icon: FileText },
    { name: "Production & Refinement",href: "/production",   icon: Factory },
    { name: "Delivery Orders",        href: "/deliveries",   icon: Truck },
    { name: "Finance & Invoices",     href: "/finance",      icon: BadgeDollarSign },
    { name: "Course Control Center",  href: "/course-center",icon: GraduationCap },
    { name: "QA & Traceability",      href: "/qa-traceability", icon: ShieldCheck },
  ];

  const navItems = allNavItems.filter(item => allowedHrefs.includes(item.href));

  return (
    <div className="w-64 bg-slate-900 text-white h-screen sticky top-0 flex flex-col border-r border-slate-800">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3 shrink-0">
        <div className="h-9 w-9 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xl shadow-md">
          M
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight tracking-wide">MADURA ERP</h1>
          <p className="text-xs text-amber-400 font-medium">Salt Enterprise & EIS</p>
        </div>
      </div>

      {/* Nav — scrollable */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User card + Logout — always pinned at bottom */}
      {user && (
        <div className="shrink-0 border-t border-slate-800 p-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/70 mb-2">
            <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <span className="text-[10px] font-bold text-amber-400">{user.role}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 rounded-md transition-all font-medium"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
