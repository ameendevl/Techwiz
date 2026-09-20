"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthLayout } from "@/components/auth/AuthLayout";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      setSentEmail(data.email);
      setSent(true);
    } catch {
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout
        heading="Check your inbox"
        subheading={`We sent a password reset link to ${sentEmail}`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "24px 0",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--color-success-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <CheckCircle2 size={28} style={{ color: "var(--color-success)" }} />
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.7, maxWidth: 340 }}>
            If an account exists for <strong>{sentEmail}</strong>, you&apos;ll receive a reset link shortly.
            The link expires in 1 hour.
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
            Didn&apos;t receive it?{" "}
            <button
              onClick={() => setSent(false)}
              style={{ color: "var(--color-accent)", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}
            >
              Try again
            </button>
          </p>
          <Link href="/login" style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", marginTop: 8 }}>
            ← Back to sign in
          </Link>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      heading="Forgot your password?"
      subheading="Enter your email and we'll send you a reset link"
      footerText="Remember your password?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
        noValidate
      >
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail size={15} />}
          error={errors.email?.message}
          autoComplete="email"
          {...register("email")}
        />

        <Button
          type="submit"
          size="lg"
          loading={loading}
          style={{ width: "100%" }}
          rightIcon={!loading ? <ArrowRight size={16} /> : undefined}
        >
          {loading ? "Sending link…" : "Send reset link"}
        </Button>
      </form>
    </AuthLayout>
  );
}
