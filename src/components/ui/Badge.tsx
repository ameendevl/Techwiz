"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium select-none",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]",
        success: "bg-[var(--color-success-light)] text-[var(--color-success)]",
        danger: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
        warning: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
        info: "bg-[var(--color-info-light)] text-[var(--color-info)]",
        accent: "bg-[var(--color-accent-light)] text-[var(--color-accent-text)]",
        active: "bg-[var(--color-success-light)] text-[var(--color-success)]",
        suspended: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
        pending: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
        admin: "bg-[var(--color-accent-light)] text-[var(--color-accent-text)]",
        superadmin: "bg-[#fdf2f8] text-[#9d174d]",
        user: "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]",
      },
      size: {
        sm: "px-1.5 py-0 text-[10px]",
        md: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "currentColor",
            display: "inline-block",
            opacity: 0.8,
          }}
        />
      )}
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "active" | "suspended" | "pending" | "default" }> = {
    ACTIVE: { label: "Active", variant: "active" },
    SUSPENDED: { label: "Suspended", variant: "suspended" },
    PENDING_VERIFICATION: { label: "Pending", variant: "pending" },
    DELETED: { label: "Deleted", variant: "danger" as "suspended" },
  };
  const config = map[status] ?? { label: status, variant: "default" };
  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; variant: "superadmin" | "admin" | "user" }> = {
    SUPER_ADMIN: { label: "Super Admin", variant: "superadmin" },
    ADMIN: { label: "Admin", variant: "admin" },
    USER: { label: "User", variant: "user" },
  };
  const config = map[role] ?? { label: role, variant: "user" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export { Badge, StatusBadge, RoleBadge, badgeVariants };
