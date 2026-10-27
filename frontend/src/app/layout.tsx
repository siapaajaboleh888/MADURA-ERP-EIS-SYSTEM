"use client";

import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { usePathname, useRouter } from "next/navigation";
import { ROLE_BACKGROUNDS } from "@/lib/backgrounds";
import "./globals.css";

function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const router = useRouter();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.replace("/login");
    }
  }, [loading, user, isLoginPage, router]);

  if (isLoginPage) {
    return <main className="min-h-screen bg-slate-950">{children}</main>;
  }

  // Tampilkan spinner selama cek auth atau belum login
  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const roleConfig = ROLE_BACKGROUNDS[user.role] || ROLE_BACKGROUNDS.ADMIN;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <main className="relative flex-1 overflow-y-auto p-6 min-h-screen">
        {/* Role-based Dynamic Background */}
        <div
          className="pointer-events-none fixed inset-0 left-64 z-0 bg-cover bg-center transition-all duration-700 ease-in-out"
          style={{
            backgroundImage: `url('${roleConfig.image}')`,
            opacity: roleConfig.opacity,
          }}
        />
        {/* Overlay Gradient for readability */}
        <div
          className={`pointer-events-none fixed inset-0 left-64 z-0 bg-gradient-to-br ${roleConfig.overlay}`}
        />
        {/* Content Container */}
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950">
        <AuthProvider>
          <AppContent>{children}</AppContent>
        </AuthProvider>
      </body>
    </html>
  );
}
