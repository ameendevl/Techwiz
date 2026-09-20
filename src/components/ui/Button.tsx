"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium text-sm",
    "rounded-[8px]",
    "transition-all duration-200",
    "cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-[var(--color-accent)] text-white",
          "hover:bg-[var(--color-accent-hover)]",
          "focus-visible:ring-[var(--color-accent)]",
          "shadow-sm",
        ].join(" "),
        secondary: [
          "bg-[var(--color-surface)] text-[var(--color-text-primary)]",
          "border border-[var(--color-border)]",
          "hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-strong)]",
          "focus-visible:ring-[var(--color-accent)]",
        ].join(" "),
        ghost: [
          "text-[var(--color-text-secondary)]",
          "hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]",
          "focus-visible:ring-[var(--color-accent)]",
        ].join(" "),
        danger: [
          "bg-[var(--color-danger)] text-white",
          "hover:opacity-90",
          "focus-visible:ring-[var(--color-danger)]",
          "shadow-sm",
        ].join(" "),
        "danger-ghost": [
          "text-[var(--color-danger)]",
          "hover:bg-[var(--color-danger-light)]",
          "focus-visible:ring-[var(--color-danger)]",
        ].join(" "),
        outline: [
          "border border-[var(--color-border-strong)] text-[var(--color-text-primary)]",
          "hover:bg-[var(--color-surface)]",
          "focus-visible:ring-[var(--color-accent)]",
        ].join(" "),
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-[6px]",
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-base",
        xl: "h-12 px-8 text-base",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-xs": "h-7 w-7 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2
            className="animate-spin"
            style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }}
          />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
