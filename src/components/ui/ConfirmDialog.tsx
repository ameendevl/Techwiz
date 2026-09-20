"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: "danger" | "warning" | "default";
}

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading,
  variant = "danger",
}: ConfirmDialogProps) {
  const iconMap = {
    danger: { icon: <Trash2 size={20} />, bg: "var(--color-danger-light)", color: "var(--color-danger)" },
    warning: { icon: <AlertTriangle size={20} />, bg: "var(--color-warning-light)", color: "var(--color-warning)" },
    default: { icon: <AlertTriangle size={20} />, bg: "var(--color-surface)", color: "var(--color-text-muted)" },
  };
  const { icon, bg, color } = iconMap[variant];

  return (
    <Modal open={open} onClose={onClose} size="sm" showClose={false}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "var(--radius-md)",
            background: bg,
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
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
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
              {description}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 24 }}>
        <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === "danger" ? "danger" : "primary"}
          size="sm"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export { ConfirmDialog };
