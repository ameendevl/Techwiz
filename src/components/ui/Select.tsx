"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
  wrapperClassName?: string;
}

function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  error,
  disabled,
  id,
  wrapperClassName,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)} ref={ref}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "var(--color-text-primary)",
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: "relative" }}>
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          style={{
            width: "100%",
            height: 40,
            padding: "0 36px 0 12px",
            borderRadius: "var(--radius-md)",
            border: `1px solid ${error ? "var(--color-danger)" : open ? "var(--color-accent)" : "var(--color-border)"}`,
            background: "var(--color-white)",
            color: selected ? "var(--color-text-primary)" : "var(--color-text-placeholder)",
            fontSize: "0.875rem",
            textAlign: "left",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: open ? "0 0 0 3px rgba(45,106,79,0.12)" : undefined,
            transition: "border-color 150ms ease",
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {selected?.icon && <span style={{ flexShrink: 0 }}>{selected.icon}</span>}
          {selected?.label ?? placeholder}
        </button>

        <ChevronDown
          size={16}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
            color: "var(--color-text-muted)",
            pointerEvents: "none",
            transition: "transform 200ms ease",
          }}
        />

        <AnimatePresence>
          {open && (
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                background: "var(--color-white)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg)",
                zIndex: 50,
                overflow: "hidden",
                padding: 4,
                listStyle: "none",
                maxHeight: 240,
                overflowY: "auto",
              }}
            >
              {options.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    if (!option.disabled) {
                      onChange?.(option.value);
                      setOpen(false);
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    borderRadius: "var(--radius-md)",
                    cursor: option.disabled ? "not-allowed" : "pointer",
                    fontSize: "0.875rem",
                    color: option.disabled
                      ? "var(--color-text-muted)"
                      : option.value === value
                      ? "var(--color-accent)"
                      : "var(--color-text-primary)",
                    background:
                      option.value === value ? "var(--color-accent-lighter)" : undefined,
                    fontWeight: option.value === value ? 500 : 400,
                    transition: "background 100ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!option.disabled && option.value !== value) {
                      (e.currentTarget as HTMLLIElement).style.background =
                        "var(--color-surface)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (option.value !== value) {
                      (e.currentTarget as HTMLLIElement).style.background = "";
                    }
                  }}
                >
                  {option.icon}
                  {option.label}
                  {option.value === value && (
                    <span style={{ marginLeft: "auto", fontSize: "0.75rem" }}>✓</span>
                  )}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p role="alert" style={{ fontSize: "0.75rem", color: "var(--color-danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  wrapperClassName?: string;
}

function NativeSelect({ label, error, options, wrapperClassName, id, ...props }: NativeSelectProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      {label && (
        <label
          htmlFor={id}
          style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)" }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <select
          id={id}
          style={{
            width: "100%",
            height: 40,
            padding: "0 36px 0 12px",
            borderRadius: "var(--radius-md)",
            border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border)"}`,
            background: "var(--color-white)",
            color: "var(--color-text-primary)",
            fontSize: "0.875rem",
            cursor: "pointer",
            appearance: "none",
            outline: "none",
          }}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-text-muted)",
            pointerEvents: "none",
          }}
        />
      </div>
      {error && (
        <p role="alert" style={{ fontSize: "0.75rem", color: "var(--color-danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export { Select, NativeSelect };
