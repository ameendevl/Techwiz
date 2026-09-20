"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  heading: string;
  subheading: string;
  children: React.ReactNode;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
}

export function AuthLayout({
  heading,
  subheading,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthLayoutProps) {
  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
      <div
        className="hidden lg:flex"
        style={{
          width: "45%",
          background: "var(--color-surface)",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px",
          position: "relative",
          overflow: "hidden",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.04,
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#18181b" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <div style={{ position: "relative" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                background: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1rem",
                letterSpacing: "-0.03em",
              }}
            >
              V
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: "1.125rem",
                color: "var(--color-text-primary)",
                letterSpacing: "-0.03em",
              }}
            >
              Vertex
            </span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "relative" }}
        >
          <div
            style={{
              display: "inline-block",
              background: "var(--color-accent-light)",
              color: "var(--color-accent-text)",
              fontSize: "0.75rem",
              fontWeight: 500,
              padding: "4px 12px",
              borderRadius: "var(--radius-full)",
              marginBottom: 20,
              letterSpacing: "0.03em",
            }}
          >
            Vertex Enterprise Platform
          </div>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.04em",
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            Built for the
            <br />
            <span style={{ color: "var(--color-accent)" }}>next generation</span>
            <br />
            of builders.
          </h2>
          <p
            style={{
              fontSize: "0.9375rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
              maxWidth: 340,
            }}
          >
            A professional-grade platform with enterprise authentication, real-time collaboration, and a modular workspace — ready for your project.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {[
            "Secure authentication & OAuth",
            "Role-based access control",
            "Professional admin console",
            "Modular project workspace",
          ].map((feat, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: "0.8125rem",
                color: "var(--color-text-secondary)",
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "var(--color-accent-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.625rem",
                  color: "var(--color-accent)",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                ✓
              </div>
              {feat}
            </div>
          ))}
        </motion.div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          background: "var(--color-white)",
          overflowY: "auto",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%", maxWidth: 420 }}
        >
          <div style={{ display: "block" }} className="lg:hidden" >
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.875rem",
                }}
              >
                V
              </div>
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
                Vertex
              </span>
            </Link>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h1
              style={{
                fontSize: "1.625rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                letterSpacing: "-0.04em",
                marginBottom: 8,
              }}
            >
              {heading}
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              {subheading}
            </p>
          </div>

          {children}

          {footerText && footerLinkText && footerLinkHref && (
            <p
              style={{
                textAlign: "center",
                marginTop: 28,
                fontSize: "0.8125rem",
                color: "var(--color-text-muted)",
              }}
            >
              {footerText}{" "}
              <Link
                href={footerLinkHref}
                style={{ color: "var(--color-accent)", fontWeight: 500 }}
              >
                {footerLinkText}
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
