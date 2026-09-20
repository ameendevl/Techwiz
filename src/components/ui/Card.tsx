"use client";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

function Card({ className, children, padding = "md", hover, ...props }: CardProps) {
  const paddingMap = {
    none: "0",
    sm: "16px",
    md: "24px",
    lg: "32px",
  };

  return (
    <div
      className={cn(className)}
      style={{
        background: "var(--color-white)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        padding: paddingMap[padding],
        transition: hover ? "box-shadow 200ms ease, transform 200ms ease" : undefined,
      }}
      onMouseEnter={
        hover
          ? (e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-md)";
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
            }
          : undefined
      }
      onMouseLeave={
        hover
          ? (e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-sm)";
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      style={{ marginBottom: 20 }}
      {...props}
    >
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(className)}
      style={{
        fontSize: "0.9375rem",
        fontWeight: 600,
        color: "var(--color-text-primary)",
        letterSpacing: "-0.02em",
      }}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardSubtitle({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(className)}
      style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: 2 }}
      {...props}
    >
      {children}
    </p>
  );
}

function CardDivider() {
  return (
    <hr
      style={{
        border: "none",
        borderTop: "1px solid var(--color-border)",
        margin: "20px -24px",
      }}
    />
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  change?: { value: number; label?: string };
  icon?: React.ReactNode;
  accent?: boolean;
}

function StatCard({ label, value, change, icon, accent }: StatCardProps) {
  const isPositive = (change?.value ?? 0) >= 0;

  return (
    <Card hover>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: "1.875rem",
              fontWeight: 700,
              color: accent ? "var(--color-accent)" : "var(--color-text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change && (
            <p
              style={{
                fontSize: "0.75rem",
                color: isPositive ? "var(--color-success)" : "var(--color-danger)",
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              {isPositive ? "↑" : "↓"} {Math.abs(change.value)}%{" "}
              {change.label && (
                <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>
                  {change.label}
                </span>
              )}
            </p>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: accent ? "var(--color-accent-light)" : "var(--color-surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: accent ? "var(--color-accent)" : "var(--color-text-muted)",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export { Card, CardHeader, CardTitle, CardSubtitle, CardDivider, StatCard };
