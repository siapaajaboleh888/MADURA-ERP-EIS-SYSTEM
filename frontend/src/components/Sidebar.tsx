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
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between border-r border-slate-800">
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="h-9 w-9 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xl shadow-md">
            M
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-wide">MADURA ERP</h1>
            <p className="text-xs text-amber-400 font-medium">Salt Enterprise & EIS</p>
          </div>
        </div>

        {user && (
          <div className="px-5 py-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Signed in as</p>
              <p className="text-sm font-semibold truncate max-w-[140px]">{user.name}</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
              {user.role}
            </span>
          </div>
        )}

        <nav className="p-3 space-y-1">
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
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors font-medium"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
