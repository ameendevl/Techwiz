"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Lock, User, AtSign, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { terms: false },
  });

  const watchedPassword = watch("password", "");

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.field) {
          setError(json.field as keyof RegisterInput, { message: json.message });
        } else {
          toast.error(json.message ?? "Registration failed. Please try again.");
        }
        return;
      }

      toast.success("Account created! Please check your email to verify your account.");
      router.push("/verify-email?email=" + encodeURIComponent(data.email));
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Create your account"
      subheading="Join Vertex and get started in seconds"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
        noValidate
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input
            label="Full name"
            type="text"
            placeholder="John Doe"
            leftIcon={<User size={15} />}
            error={errors.name?.message}
            autoComplete="name"
            {...register("name")}
          />
          <Input
            label="Username"
            type="text"
            placeholder="johndoe"
            leftIcon={<AtSign size={15} />}
            error={errors.username?.message}
            autoComplete="username"
            {...register("username")}
          />
        </div>

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail size={15} />}
          error={errors.email?.message}
          autoComplete="email"
          {...register("email")}
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            leftIcon={<Lock size={15} />}
            error={errors.password?.message}
            autoComplete="new-password"
            {...register("password", {
              onChange: (e) => setPassword(e.target.value),
            })}
          />
          <PasswordStrength password={watchedPassword} />
        </div>

        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          leftIcon={<Lock size={15} />}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          {...register("confirmPassword")}
        />

        <div>
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              cursor: "pointer",
              fontSize: "0.8125rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.5,
            }}
          >
            <input
              type="checkbox"
              {...register("terms")}
              style={{
                width: 15,
                height: 15,
                marginTop: 2,
                accentColor: "var(--color-accent)",
                cursor: "pointer",
                flexShrink: 0,
              }}
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" style={{ color: "var(--color-accent)", fontWeight: 500 }}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" style={{ color: "var(--color-accent)", fontWeight: 500 }}>
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p role="alert" style={{ fontSize: "0.75rem", color: "var(--color-danger)", marginTop: 4 }}>
              {errors.terms.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          loading={loading}
          style={{ width: "100%", marginTop: 4 }}
          rightIcon={!loading ? <ArrowRight size={16} /> : undefined}
        >
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <div style={{ position: "relative", margin: "20px 0", display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
        <span style={{ padding: "0 14px", fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 500, background: "var(--color-white)" }}>
          OR
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
      </div>

      <SocialLoginButtons compact />
    </AuthLayout>
  );
}
