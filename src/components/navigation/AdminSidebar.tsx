"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard, Users, Shield, FileText,
  Bell, Settings, BookOpen, User, LogOut,
  ChevronLeft, ChevronRight, Activity, Menu,
  BarChart3, ChevronDown
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

interface NavGroup {
  label: string;
  items: Array<{
    label: string;
    href: string;
    icon: React.ReactNode;
  }>;
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={17} /> },
      { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 size={17} /> },
    ],
  },
  {
    label: "User Management",
    items: [
      { label: "All Users", href: "/admin/users", icon: <Users size={17} /> },
      { label: "Roles & Permissions", href: "/admin/roles", icon: <Shield size={17} /> },
      { label: "Login Activity", href: "/admin/activity", icon: <Activity size={17} /> },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Notifications", href: "/admin/notifications", icon: <Bell size={17} /> },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: <BookOpen size={17} /> },
      { label: "Reports", href: "/admin/reports", icon: <FileText size={17} /> },
      { label: "Settings", href: "/admin/settings", icon: <Settings size={17} /> },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Admin Profile", href: "/admin/profile", icon: <User size={17} /> },
    ],
  },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          padding: collapsed ? "20px 0" : "20px",
          borderBottom: "1px solid var(--color-border)",
          height: "var(--topnav-height)",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          flexShrink: 0,
        }}
      >
        {!collapsed ? (
          <div>
            <Link
              href="/admin"
              style={{
                fontWeight: 700,
                fontSize: "1.0625rem",
                color: "var(--color-accent)",
                letterSpacing: "-0.03em",
                textDecoration: "none",
                display: "block",
              }}
            >
              Vertex
            </Link>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 500,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Admin Console
            </span>
          </div>
        ) : (
          <Link href="/admin" style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-accent)", textDecoration: "none" }}>
            V
          </Link>
        )}
      </div>

      <nav style={{ flex: 1, padding: "8px", overflowY: "auto" }}>
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 4 }}>
            {!collapsed && (
              <p
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-text-muted)",
                  padding: "10px 10px 4px",
                }}
              >
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: collapsed ? "9px 0" : "8px 10px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: "var(--radius-md)",
                    textDecoration: "none",
                    color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
                    background: isActive ? "var(--color-accent-lighter)" : "transparent",
                    fontWeight: isActive ? 500 : 400,
                    fontSize: "0.8125rem",
                    marginBottom: 1,
                    transition: "all 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
                      (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
                    }
                  }}
                >
                  <span style={{ flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && item.label}
                </Link>
              );
            })}
            {!collapsed && gi < navGroups.length - 1 && (
              <div style={{ height: 1, background: "var(--color-border)", margin: "6px 8px" }} />
            )}
          </div>
        ))}
      </nav>

      <div
        style={{
          padding: "12px 8px",
          borderTop: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        {!collapsed && session?.user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-surface)",
              marginBottom: 4,
            }}
          >
            <Avatar src={session.user.image} name={session.user.name ?? ""} size="sm" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.user.name}
              </p>
              <p style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.user.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: collapsed ? "9px 0" : "8px 10px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "transparent",
            color: "var(--color-text-muted)",
            fontSize: "0.8125rem",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--color-danger-light)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-danger)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)";
          }}
        >
          <LogOut size={17} />
          {!collapsed && "Sign out"}
        </button>
      </div>

      <button
        onClick={() => setCollapsed((v) => !v)}
        style={{
          position: "absolute",
          top: 22,
          right: -14,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--color-text-muted)",
          zIndex: 1,
          boxShadow: "var(--shadow-sm)",
        }}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden lg:flex"
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </div>
  );

  return (
    <>
      <aside
        className="sidebar hidden lg:block"
        style={{ width: collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)" }}
      >
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 49 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={{
              position: "fixed", top: 0, left: 0,
              width: "var(--sidebar-width)", height: "100vh",
              background: "var(--color-white)", borderRight: "1px solid var(--color-border)", zIndex: 50,
            }}
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      <div
        className="lg:hidden"
        style={{
          position: "fixed", top: 0, left: 0, right: 0,
          height: "var(--topnav-height)",
          background: "var(--color-white)", borderBottom: "1px solid var(--color-border)",
          display: "flex", alignItems: "center", padding: "0 16px", zIndex: 40, gap: 12,
        }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: "var(--radius-sm)", color: "var(--color-text-secondary)", display: "flex" }}
        >
          <Menu size={20} />
        </button>
        <div>
          <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-accent)", letterSpacing: "-0.02em" }}>
            Vertex
          </span>
          <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginLeft: 6 }}>Admin</span>
        </div>
      </div>
    </>
  );
}
