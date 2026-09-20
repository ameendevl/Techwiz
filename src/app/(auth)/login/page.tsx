"use client";

import { Suspense, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setShake(true);
        setTimeout(() => setShake(false), 400);

        if (result.error === "ACCOUNT_SUSPENDED") {
          toast.error("Your account has been suspended. Please contact support.");
        } else {
          setError("email", { message: " " });
          setError("password", { message: "Invalid email or password" });
        }
        return;
      }

      toast.success("Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Welcome back"
      subheading="Sign in to your Vertex account"
      footerText="Don't have an account?"
      footerLinkText="Create account"
      footerLinkHref="/register"
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className={shake ? "animate-shake" : ""}
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

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          leftIcon={<Lock size={15} />}
          error={errors.password?.message}
          autoComplete="current-password"
          {...register("password")}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontSize: "0.8125rem",
              color: "var(--color-text-secondary)",
            }}
          >
            <input
              type="checkbox"
              {...register("rememberMe")}
              style={{
                width: 15,
                height: 15,
                accentColor: "var(--color-accent)",
                cursor: "pointer",
              }}
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-accent)",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          loading={loading}
          style={{ width: "100%", marginTop: 4 }}
          rightIcon={!loading ? <ArrowRight size={16} /> : undefined}
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div style={{ position: "relative", margin: "24px 0", display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
        <span
          style={{
            padding: "0 14px",
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
            fontWeight: 500,
            background: "var(--color-white)",
          }}
        >
          OR CONTINUE WITH
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
      </div>

      <SocialLoginButtons callbackUrl={callbackUrl} />
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
