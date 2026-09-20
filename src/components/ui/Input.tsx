"use client";

import { forwardRef, useState, useId } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      success,
      leftIcon,
      rightIcon,
      type,
      className,
      wrapperClassName,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    const hasError = !!error;
    const hasSuccess = !!success && !error;

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--color-text-primary)",
              display: "block",
              letterSpacing: "-0.01em",
            }}
          >
            {label}
          </label>
        )}

        <div style={{ position: "relative" }}>
          {leftIcon && (
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted)",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={cn("input-base", className)}
            style={{
              width: "100%",
              height: 40,
              paddingLeft: leftIcon ? 40 : 12,
              paddingRight: isPassword || rightIcon || hasError || hasSuccess ? 40 : 12,
              paddingTop: 0,
              paddingBottom: 0,
              borderRadius: "var(--radius-md)",
              border: `1px solid ${hasError ? "var(--color-danger)" : hasSuccess ? "var(--color-success)" : "var(--color-border)"}`,
              background: "var(--color-white)",
              color: "var(--color-text-primary)",
              fontSize: "0.875rem",
              outline: "none",
              transition: "border-color 150ms ease, box-shadow 150ms ease",
              boxShadow: hasError ? "0 0 0 3px rgba(220,38,38,0.08)" : undefined,
            }}
            onFocus={(e) => {
              const el = e.currentTarget;
              if (!hasError) {
                el.style.borderColor = "var(--color-accent)";
                el.style.boxShadow = "0 0 0 3px rgba(45,106,79,0.12)";
              }
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = hasError
                ? "var(--color-danger)"
                : hasSuccess
                ? "var(--color-success)"
                : "var(--color-border)";
              el.style.boxShadow = hasError ? "0 0 0 3px rgba(220,38,38,0.08)" : "none";
              props.onBlur?.(e);
            }}
            {...props}
          />

          <span
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {hasError && !isPassword && (
              <AlertCircle size={15} style={{ color: "var(--color-danger)" }} />
            )}
            {hasSuccess && !isPassword && (
              <CheckCircle2 size={15} style={{ color: "var(--color-success)" }} />
            )}
            {rightIcon && !isPassword && rightIcon}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  display: "flex",
                  padding: 0,
                  lineHeight: 1,
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            )}
          </span>
        </div>

        {hasError && (
          <p
            role="alert"
            style={{
              fontSize: "0.75rem",
              color: "var(--color-danger)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {error}
          </p>
        )}
        {hasSuccess && (
          <p style={{ fontSize: "0.75rem", color: "var(--color-success)" }}>
            {success}
          </p>
        )}
        {hint && !hasError && !hasSuccess && (
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, wrapperClassName, id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const hasError = !!error;

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--color-text-primary)",
              display: "block",
            }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          style={{
            width: "100%",
            minHeight: 96,
            padding: "10px 12px",
            borderRadius: "var(--radius-md)",
            border: `1px solid ${hasError ? "var(--color-danger)" : "var(--color-border)"}`,
            background: "var(--color-white)",
            color: "var(--color-text-primary)",
            fontSize: "0.875rem",
            outline: "none",
            resize: "vertical",
            fontFamily: "inherit",
            lineHeight: 1.6,
          }}
          onFocus={(e) => {
            if (!hasError) {
              e.currentTarget.style.borderColor = "var(--color-accent)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(45,106,79,0.12)";
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = hasError
              ? "var(--color-danger)"
              : "var(--color-border)";
            e.currentTarget.style.boxShadow = "none";
          }}
          {...props}
        />
        {hasError && (
          <p role="alert" style={{ fontSize: "0.75rem", color: "var(--color-danger)" }}>
            {error}
          </p>
        )}
        {hint && !hasError && (
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Input, Textarea };
