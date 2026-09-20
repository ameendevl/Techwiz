"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Mail, Loader2, Sparkles } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import Link from "next/link";

type State = "loading" | "success" | "error" | "waiting";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [state, setState] = useState<State>(token ? "loading" : "waiting");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [instantLoading, setInstantLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    let mounted = true;

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!mounted) return;
        setState(res.ok ? "success" : "error");
        if (res.ok) {
          setTimeout(() => router.push("/dashboard"), 2500);
        }
      } catch {
        if (mounted) setState("error");
      }
    };

    verify();
    return () => { mounted = false; };
  }, [token, router]);

  const handleResend = async () => {
    if (!email || resendSent) return;
    setResendLoading(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendSent(true);
    } finally {
      setResendLoading(false);
    }
  };

  const handleInstantVerify = async () => {
    if (!email) {
      router.push("/login");
      return;
    }
    setInstantLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email/instant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      toast.success("Account verified successfully!");
      setState("success");
      setTimeout(() => router.push("/login?verified=true"), 1500);
    } catch {
      toast.error("Failed to verify account.");
    } finally {
      setInstantLoading(false);
    }
  };

  if (state === "loading") {
    return (
      <AuthLayout heading="Verifying your email…" subheading="Please wait a moment">
        <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
          <Loader2 size={40} style={{ color: "var(--color-accent)", animation: "spin 1s linear infinite" }} />
        </div>
      </AuthLayout>
    );
  }

  if (state === "success") {
    return (
      <AuthLayout heading="Email verified!" subheading="Your account is now active">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 0" }}
        >
          <div
            style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "var(--color-success-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <CheckCircle2 size={36} style={{ color: "var(--color-success)" }} />
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", textAlign: "center" }}>
            Your email has been verified. Redirecting you to your dashboard…
          </p>
        </motion.div>
      </AuthLayout>
    );
  }

  if (state === "error") {
    return (
      <AuthLayout heading="Verification failed" subheading="This link may be invalid or expired">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 0" }}
        >
          <div
            style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "var(--color-danger-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <XCircle size={36} style={{ color: "var(--color-danger)" }} />
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>
            We couldn&apos;t verify your email. The link may have expired or already been used.
          </p>
          <Link href="/forgot-password">
            <Button variant="secondary" size="sm">
              Request a new link
            </Button>
          </Link>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      heading="Check your email"
      subheading={email ? `We sent a verification link to ${email}` : "We sent you a verification email"}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "16px 0" }}
      >
        <div
          style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "var(--color-accent-light)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Mail size={32} style={{ color: "var(--color-accent)" }} />
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.7, maxWidth: 340 }}>
            Click the link in the email to activate your account. Check your spam folder if you don&apos;t see it.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 320 }}>
          {email && (
            <Button
              variant="primary"
              size="md"
              loading={instantLoading}
              onClick={handleInstantVerify}
              leftIcon={<Sparkles size={16} />}
            >
              ⚡ Instant Verify Account (Demo)
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            loading={resendLoading}
            disabled={resendSent}
            onClick={handleResend}
          >
            {resendSent ? "Verification email resent ✓" : "Resend verification email"}
          </Button>
        </div>

        <Link href="/login" style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
          ← Back to sign in
        </Link>
      </motion.div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
