"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { broadcastNotificationSchema, type BroadcastNotificationInput } from "@/lib/validations";
import { Send, Bell, CheckCircle } from "lucide-react";

export function BroadcastForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BroadcastNotificationInput>({
    resolver: zodResolver(broadcastNotificationSchema),
    defaultValues: {
      title: "",
      body: "",
      type: "ANNOUNCEMENT",
      targetRole: "ALL",
      link: "",
    },
  });

  const onSubmit = async (data: BroadcastNotificationInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to broadcast");
      }

      toast.success(json.message || "Notification broadcast sent successfully!");
      reset();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Input
        label="Notification Title"
        placeholder="e.g. Scheduled Maintenance Notice or Competition Announcement"
        error={errors.title?.message}
        {...register("title")}
      />

      <Textarea
        label="Notification Message"
        rows={3}
        placeholder="Provide the details of the announcement here..."
        error={errors.body?.message}
        {...register("body")}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 }}>
            Category Type
          </label>
          <select
            {...register("type")}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontSize: "0.8125rem",
              background: "var(--color-white)",
              color: "var(--color-text-primary)",
              outline: "none",
            }}
          >
            <option value="ANNOUNCEMENT">Announcement</option>
            <option value="SYSTEM">System</option>
            <option value="SECURITY">Security</option>
            <option value="ACCOUNT">Account</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 }}>
            Target Audience
          </label>
          <select
            {...register("targetRole")}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontSize: "0.8125rem",
              background: "var(--color-white)",
              color: "var(--color-text-primary)",
              outline: "none",
            }}
          >
            <option value="ALL">All Users</option>
            <option value="USER">Regular Users Only</option>
            <option value="ADMIN">Administrators Only</option>
            <option value="SUPER_ADMIN">Super Admins Only</option>
          </select>
        </div>
      </div>

      <Input
        label="Optional Link (Action URL)"
        placeholder="https://... or /workspace"
        error={errors.link?.message}
        {...register("link")}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
        <Button type="submit" variant="primary" loading={loading} leftIcon={<Send size={15} />}>
          Send Broadcast
        </Button>
      </div>
    </form>
  );
}
