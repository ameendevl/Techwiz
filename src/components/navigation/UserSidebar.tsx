"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, User, Bell, Briefcase, LogOut,
  ChevronLeft, ChevronRight, Menu, X
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Profile", href: "/profile", icon: <User size={18} /> },
  { label: "Notifications", href: "/notifications", icon: <Bell size={18} /> },
  { label: "Workspace", href: "/workspace", icon: <Briefcase size={18} /> },
];

interface UserSidebarProps {
  unreadCount?: number;
}

export function UserSidebar({ unreadCount = 0 }: UserSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const items = navItems.map((item) =>
    item.label === "Notifications" ? { ...item, badge: unreadCount } : item
  );

  const SidebarContent = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: collapsed ? "20px 0" : "20px 20px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          flexShrink: 0,
          height: "var(--topnav-height)",
        }}
      >
        {!collapsed && (
          <Link
            href="/dashboard"
            style={{
              fontWeight: 700,
              fontSize: "1.125rem",
              color: "var(--color-accent)",
              letterSpacing: "-0.03em",
              textDecoration: "none",
            }}
          >
            Vertex
          </Link>
        )}
        {collapsed && (
          <Link
            href="/dashboard"
            style={{
              fontWeight: 700,
              fontSize: "1.125rem",
              color: "var(--color-accent)",
              textDecoration: "none",
            }}
          >
            V
          </Link>
        )}
      </div>

      <nav
        style={{
          flex: 1,
          padding: "12px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
        }}
      >
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "10px 0" : "9px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
                background: isActive ? "var(--color-accent-lighter)" : "transparent",
                fontWeight: isActive ? 500 : 400,
                fontSize: "0.875rem",
                transition: "all 150ms ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-surface)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-secondary)";
                }
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && (
                <span style={{ flex: 1 }}>{item.label}</span>
              )}
              {!collapsed && item.badge ? (
                <span
                  style={{
                    background: "var(--color-danger)",
                    color: "#fff",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    padding: "1px 6px",
                    lineHeight: "16px",
                    minWidth: 18,
                    textAlign: "center",
                  }}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          padding: collapsed ? "12px 8px" : "12px 8px",
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
              marginBottom: 4,
            }}
          >
            <Avatar
              src={session.user.image}
              name={session.user.name ?? ""}
              size="sm"
            />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <p
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {session.user.name}
              </p>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "var(--color-text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {session.user.email}
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
            gap: 10,
            padding: collapsed ? "10px 0" : "9px 12px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "transparent",
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
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
          <LogOut size={18} />
          {!collapsed && "Sign out"}
        </button>
      </div>

      <button
        onClick={() => setCollapsed((v) => !v)}
        style={{
          position: "absolute",
          top: 20,
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
          transition: "all 150ms ease",
        }}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden lg:flex"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  );

  return (
    <>
      <aside
        className="sidebar hidden lg:block"
        style={{
          width: collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
        }}
      >
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 49,
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "var(--sidebar-width)",
              height: "100vh",
              background: "var(--color-white)",
              borderRight: "1px solid var(--color-border)",
              zIndex: 50,
            }}
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      <div
        className="lg:hidden"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "var(--topnav-height)",
          background: "var(--color-white)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          zIndex: 40,
          gap: 12,
        }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 6,
            borderRadius: "var(--radius-sm)",
            color: "var(--color-text-secondary)",
            display: "flex",
          }}
        >
          <Menu size={20} />
        </button>
        <span
          style={{
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--color-accent)",
            letterSpacing: "-0.02em",
          }}
        >
          Vertex
        </span>
      </div>
    </>
  );
}
