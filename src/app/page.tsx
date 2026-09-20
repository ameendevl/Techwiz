import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vertex — Enterprise Platform",
};

export default async function HomePage() {
  const session = await auth();

  if (session) {
    const role = session.user.role;
    if (role === "SUPER_ADMIN" || role === "ADMIN") {
      redirect("/admin");
    }
    redirect("/dashboard");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-off-white)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <nav
        style={{
          position: "sticky",
          top: 0,
          height: 64,
          borderBottom: "1px solid var(--color-border)",
          background: "rgba(250,250,250,0.85)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          padding: "0 40px",
          gap: 16,
          zIndex: 10,
        }}
      >
        <div style={{ flex: 1 }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: "1.125rem",
              color: "var(--color-accent)",
              letterSpacing: "-0.04em",
            }}
          >
            Vertex
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link
            href="/login"
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              textDecoration: "none",
              transition: "color 150ms ease",
            }}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              fontSize: "0.875rem",
              fontWeight: 500,
              background: "var(--color-accent)",
              color: "#fff",
              textDecoration: "none",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            Get started
          </Link>
        </div>
      </nav>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--color-accent-light)",
            color: "var(--color-accent-text)",
            fontSize: "0.8125rem",
            fontWeight: 500,
            padding: "6px 16px",
            borderRadius: "var(--radius-full)",
            marginBottom: 28,
            border: "1px solid rgba(45,106,79,0.2)",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent)", display: "inline-block" }} />
          Vertex Enterprise Platform
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 800,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.05em",
            lineHeight: 1.0,
            maxWidth: 800,
            marginBottom: 24,
          }}
        >
          Built for the{" "}
          <span style={{ color: "var(--color-accent)" }}>next generation</span>
          {" "}of builders
        </h1>

        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.7,
            maxWidth: 540,
            marginBottom: 40,
          }}
        >
          A premium, production-quality platform with enterprise authentication, admin management, and a modular workspace — ready for your Vertex project.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-accent)",
              color: "#fff",
              fontSize: "0.9375rem",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "var(--shadow-md)",
              transition: "all 200ms ease",
            }}
          >
            Create account →
          </Link>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-white)",
              color: "var(--color-text-primary)",
              fontSize: "0.9375rem",
              fontWeight: 500,
              textDecoration: "none",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            Sign in
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            maxWidth: 900,
            width: "100%",
            marginTop: 80,
          }}
        >
          {[
            { label: "Secure Auth", desc: "OAuth + credentials with bcrypt, rate limiting, and audit logs" },
            { label: "Admin Console", desc: "Full user management, roles, permissions, and audit trail" },
            { label: "Role-Based Access", desc: "Super Admin, Admin, and User roles with granular permissions" },
            { label: "Modular Workspace", desc: "Plug in your project without rebuilding the foundation" },
          ].map((f) => (
            <div
              key={f.label}
              style={{
                background: "var(--color-white)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "20px",
                textAlign: "left",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-accent-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  fontSize: "0.875rem",
                  color: "var(--color-accent)",
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 6 }}>
                {f.label}
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "20px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
          © {new Date().getFullYear()} Vertex. Built for Aptech competition.
        </span>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Support"].map((link) => (
            <a
              key={link}
              href="#"
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-text-muted)",
                textDecoration: "none",
              }}
            >
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
