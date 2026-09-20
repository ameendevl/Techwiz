"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Sun, Moon, Search, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useTheme } from "@/components/providers/ThemeProvider";

interface TopNavbarProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  unreadCount?: number;
  adminMode?: boolean;
}

export function TopNavbar({ title, breadcrumbs, unreadCount = 0, adminMode }: TopNavbarProps) {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const profileHref = adminMode ? "/admin/profile" : "/profile";
  const notificationsHref = adminMode ? "/admin/notifications" : "/notifications";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        height: "var(--topnav-height)",
        background: "var(--color-white)",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 16,
        zIndex: 30,
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {i > 0 && (
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>/</span>
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    style={{
                      fontSize: "0.8125rem",
                      color: i === breadcrumbs.length - 1 ? "var(--color-text-primary)" : "var(--color-text-muted)",
                      fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
                      textDecoration: "none",
                    }}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: i === breadcrumbs.length - 1 ? "var(--color-text-primary)" : "var(--color-text-muted)",
                      fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
                    }}
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        ) : title ? (
          <h1
            style={{
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h1>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text-muted)",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)";
          }}
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <Link
          href={notificationsHref}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text-muted)",
            transition: "all 150ms ease",
            position: "relative",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)";
          }}
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--color-danger)",
                border: "2px solid var(--color-white)",
              }}
            />
          )}
        </Link>

        <div style={{ width: 1, height: 20, background: "var(--color-border)", margin: "0 6px" }} />

        <div ref={profileRef} style={{ position: "relative" }}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 8px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: profileOpen ? "var(--color-surface)" : "transparent",
              cursor: "pointer",
              transition: "background 150ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface)";
            }}
            onMouseLeave={(e) => {
              if (!profileOpen) {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }
            }}
            aria-haspopup="true"
            aria-expanded={profileOpen}
          >
            <Avatar
              src={session?.user?.image}
              name={session?.user?.name ?? ""}
              size="xs"
            />
            <div style={{ textAlign: "left" }} className="hidden sm:block">
              <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.2 }}>
                {session?.user?.name?.split(" ")[0]}
              </p>
            </div>
            <ChevronDown
              size={14}
              style={{
                color: "var(--color-text-muted)",
                transform: `rotate(${profileOpen ? 180 : 0}deg)`,
                transition: "transform 200ms ease",
              }}
            />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  width: 220,
                  background: "var(--color-white)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-lg)",
                  overflow: "hidden",
                  zIndex: 50,
                }}
              >
                <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid var(--color-border)" }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                    {session?.user?.name}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 2 }}>
                    {session?.user?.email}
                  </p>
                </div>

                <div style={{ padding: 6 }}>
                  {[
                    { icon: <User size={15} />, label: "Profile", href: profileHref },
                    { icon: <Settings size={15} />, label: adminMode ? "Admin Settings" : "Settings", href: adminMode ? "/admin/settings" : "/profile#settings" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        borderRadius: "var(--radius-md)",
                        textDecoration: "none",
                        color: "var(--color-text-secondary)",
                        fontSize: "0.8125rem",
                        transition: "all 150ms ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
                        (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid var(--color-border)", padding: 6 }}>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: "var(--radius-md)",
                      border: "none",
                      background: "transparent",
                      color: "var(--color-danger)",
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                      transition: "all 150ms ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "var(--color-danger-light)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
