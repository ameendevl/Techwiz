"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

function Skeleton({ width, height, circle, className, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton", className)}
      style={{
        width: width ?? "100%",
        height: height ?? 16,
        borderRadius: circle ? "50%" : "var(--radius-md)",
        ...style,
      }}
      {...props}
    />
  );
}

function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <Skeleton height={14} width={i === 0 ? "60%" : i === 1 ? "80%" : "50%"} />
        </td>
      ))}
    </tr>
  );
}

function CardSkeleton() {
  return (
    <div
      style={{
        background: "var(--color-white)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: 24,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Skeleton height={14} width="40%" />
        <Skeleton height={32} width={32} circle />
      </div>
      <Skeleton height={32} width="50%" style={{ marginBottom: 8 }} />
      <Skeleton height={12} width="30%" />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Skeleton circle width={40} height={40} />
      <div style={{ flex: 1 }}>
        <Skeleton height={14} width="60%" style={{ marginBottom: 6 }} />
        <Skeleton height={12} width="40%" />
      </div>
    </div>
  );
}

function PageHeaderSkeleton() {
  return (
    <div style={{ marginBottom: 32 }}>
      <Skeleton height={28} width="30%" style={{ marginBottom: 8 }} />
      <Skeleton height={14} width="50%" />
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 32px",
        textAlign: "center",
      }}
    >
      {icon && (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--radius-xl)",
            background: "var(--color-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text-muted)",
            marginBottom: 16,
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontSize: "0.9375rem",
          fontWeight: 600,
          color: "var(--color-text-primary)",
          marginBottom: 8,
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--color-text-muted)",
            maxWidth: 380,
            lineHeight: 1.6,
            marginBottom: action ? 20 : 0,
          }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

export { Skeleton, TableRowSkeleton, CardSkeleton, ProfileSkeleton, PageHeaderSkeleton, EmptyState };
