"use client";

import { getPasswordStrength } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const { score, label, color } = getPasswordStrength(password);
  const bars = 6;
  const filled = score;

  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter", met: /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special character", met: /[^a-zA-Z0-9]/.test(password) },
  ];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i < filled ? color : "var(--color-border)",
              transition: "background 200ms ease",
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <span style={{ fontSize: "0.75rem", color, fontWeight: 500 }}>{label}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {requirements.map((req) => (
          <div
            key={req.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.75rem",
              color: req.met ? "var(--color-success)" : "var(--color-text-muted)",
              transition: "color 200ms ease",
            }}
          >
            <span style={{ fontSize: "0.75rem", lineHeight: 1 }}>{req.met ? "✓" : "○"}</span>
            {req.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export { PasswordStrength };
