"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations";
import { Lock } from "lucide-react";

interface ChangePasswordModalProps {
  userId: string;
  hasPassword: boolean;
}

export function ChangePasswordModal({ userId, hasPassword }: ChangePasswordModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPassword = watch("newPassword", "");

  const onSubmit = async (data: ChangePasswordInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.message ?? "Failed to change password");
        return;
      }

      toast.success("Password changed successfully");
      reset();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!hasPassword) {
    return (
      <div
        style={{
          padding: "20px",
          background: "var(--color-surface)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)",
        }}
      >
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          Your account uses OAuth (Google, GitHub, or LinkedIn) for authentication. Password-based login is not configured.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Input
        label="Current password"
        type="password"
        leftIcon={<Lock size={14} />}
        error={errors.currentPassword?.message}
        autoComplete="current-password"
        {...register("currentPassword")}
      />

      <div>
        <Input
          label="New password"
          type="password"
          leftIcon={<Lock size={14} />}
          error={errors.newPassword?.message}
          autoComplete="new-password"
          {...register("newPassword")}
        />
        <PasswordStrength password={newPassword} />
      </div>

      <Input
        label="Confirm new password"
        type="password"
        leftIcon={<Lock size={14} />}
        error={errors.confirmPassword?.message}
        autoComplete="new-password"
        {...register("confirmPassword")}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid var(--color-border)" }}>
        <Button type="submit" loading={loading}>
          Update password
        </Button>
      </div>
    </form>
  );
}
