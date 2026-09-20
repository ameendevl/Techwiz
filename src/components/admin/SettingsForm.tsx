"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Save, ShieldCheck, Database, Key } from "lucide-react";

interface SettingsFormProps {
  initialSettings: Record<string, string>;
  isSuperAdmin: boolean;
}

export function SettingsForm({ initialSettings, isSuperAdmin }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [appName, setAppName] = useState(initialSettings["site_name"] ?? "Vertex Platform");
  const [supportEmail, setSupportEmail] = useState(initialSettings["support_email"] ?? "admin@vertex.app");
  const [registrationEnabled, setRegistrationEnabled] = useState(
    initialSettings["registration_enabled"] !== "false"
  );
  const [maintenanceMode, setMaintenanceMode] = useState(
    initialSettings["maintenance_mode"] === "true"
  );
  const [requireEmailVerification, setRequireEmailVerification] = useState(
    initialSettings["require_verification"] === "true"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast.error("Only Super Admins can alter system configuration");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_name: appName,
          support_email: supportEmail,
          registration_enabled: String(registrationEnabled),
          maintenance_mode: String(maintenanceMode),
          require_verification: String(requireEmailVerification),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save");

      toast.success(json.message || "Settings updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 14 }}>
          General Information
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Input
            label="Application Name"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            disabled={!isSuperAdmin}
          />
          <Input
            label="Support Email"
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            disabled={!isSuperAdmin}
          />
        </div>
      </div>

      <div style={{ height: 1, background: "var(--color-border)" }} />

      <div>
        <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 14 }}>
          Access & Registration Controls
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: isSuperAdmin ? "pointer" : "default" }}>
            <input
              type="checkbox"
              checked={registrationEnabled}
              onChange={(e) => setRegistrationEnabled(e.target.checked)}
              disabled={!isSuperAdmin}
              style={{ marginTop: 3, accentColor: "var(--color-accent)" }}
            />
            <div>
              <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)" }}>
                Allow Public User Registration
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                When disabled, new accounts can only be provisioned directly by an administrator.
              </p>
            </div>
          </label>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: isSuperAdmin ? "pointer" : "default" }}>
            <input
              type="checkbox"
              checked={requireEmailVerification}
              onChange={(e) => setRequireEmailVerification(e.target.checked)}
              disabled={!isSuperAdmin}
              style={{ marginTop: 3, accentColor: "var(--color-accent)" }}
            />
            <div>
              <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)" }}>
                Enforce Email Verification
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                Users must verify their email token before they can access dashboard features.
              </p>
            </div>
          </label>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: isSuperAdmin ? "pointer" : "default" }}>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              disabled={!isSuperAdmin}
              style={{ marginTop: 3, accentColor: "var(--color-danger)" }}
            />
            <div>
              <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: maintenanceMode ? "var(--color-danger)" : "var(--color-text-primary)" }}>
                Maintenance Mode
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                Restricts non-admin users from accessing protected workspace modules.
              </p>
            </div>
          </label>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--color-border)" }} />

      {isSuperAdmin ? (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="submit" variant="primary" loading={loading} leftIcon={<Save size={15} />}>
            Save System Settings
          </Button>
        </div>
      ) : (
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
          * Read-only mode: Only users with the Super Admin role can save platform settings.
        </p>
      )}
    </form>
  );
}
