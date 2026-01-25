"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAdminToken, removeAdminToken } from "@/lib/cookies";
import { BarChart3, Users, LogOut, Shield, Key } from "lucide-react";

// Helper to load admin name synchronously
const loadAdminName = (): string => {
  if (typeof window === "undefined") return "Admin";

  const adminUser = localStorage.getItem("adminUser");
  if (!adminUser) return "Admin";

  try {
    const parsed = JSON.parse(adminUser);
    return parsed.name || "Admin";
  } catch {
    return "Admin";
  }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminName] = useState(loadAdminName);

  useEffect(() => {
    // Don't check auth on login page
    if (pathname === "/admin/login") return;

    const token = getAdminToken();

    if (!token) {
      router.push("/admin/login");
      return;
    }
  }, [pathname, router]);

  // Don't wrap login page with admin layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    removeAdminToken();
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/users", label: "Utilisateurs", icon: Users },
    { href: "/admin/licenses", label: "Licences", icon: Key },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold">NutriPlan Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm text-muted-foreground truncate">{adminName}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden border-b border-border bg-card px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm">GoShop Admin</span>
          </div>
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => router.push(item.href)}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
