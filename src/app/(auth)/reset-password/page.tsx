"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { AuthLayout } from "@/components/auth/AuthLayout";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password", "");

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.message ?? "Failed to reset password.");
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout heading="Invalid link" subheading="This reset link is invalid or has expired.">
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <Link href="/forgot-password" style={{ color: "var(--color-accent)", fontWeight: 500 }}>
            Request a new reset link →
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout heading="Password updated!" subheading="Your password has been reset successfully.">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 0" }}
        >
          <div
            style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "var(--color-success-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <CheckCircle2 size={28} style={{ color: "var(--color-success)" }} />
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Redirecting you to sign in…
          </p>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      heading="Set new password"
      subheading="Choose a strong password for your account"
      footerText="Remember your password?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
        noValidate
      >
        <div>
          <Input
            label="New password"
            type="password"
            placeholder="Create a strong password"
            leftIcon={<Lock size={15} />}
            error={errors.password?.message}
            autoComplete="new-password"
            {...register("password")}
          />
          <PasswordStrength password={password} />
        </div>

        <Input
          label="Confirm new password"
          type="password"
          placeholder="Repeat your password"
          leftIcon={<Lock size={15} />}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          size="lg"
          loading={loading}
          style={{ width: "100%", marginTop: 4 }}
        >
          {loading ? "Updating password…" : "Reset password"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
