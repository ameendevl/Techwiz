"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { UserPlus, Sparkles, Eye, EyeOff } from "lucide-react";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isSuperAdmin: boolean;
}

interface CreateUserFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
  status: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED";
}

export function CreateUserModal({ open, onClose, onSuccess, isSuperAdmin }: CreateUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      role: "USER",
      status: "ACTIVE",
    },
  });

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
    let pwd = "";
    for (let i = 0; i < 14; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue("password", pwd, { shouldValidate: true });
    setShowPassword(true);
    toast.info("Secure password generated");
  };

  const onSubmit = async (data: CreateUserFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Failed to create user");
        return;
      }

      toast.success(`User ${data.name} created successfully!`);
      reset();
      onSuccess();
      onClose();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New User" size="md">
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input
            label="Full Name"
            placeholder="e.g. Alex Morgan"
            required
            error={errors.name?.message}
            {...register("name", { required: "Name is required", minLength: { value: 2, message: "Min 2 characters" } })}
          />
          <Input
            label="Username"
            placeholder="e.g. alexmorgan"
            required
            error={errors.username?.message}
            {...register("username", {
              required: "Username is required",
              pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Letters, numbers, underscores only" },
            })}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="alex@example.com"
          required
          error={errors.email?.message}
          {...register("email", { required: "Email is required" })}
        />

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)" }}>
              Password
            </label>
            <button
              type="button"
              onClick={generateRandomPassword}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-accent)",
                fontSize: "0.75rem",
                fontWeight: 500,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Sparkles size={12} />
              Generate
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 characters"
              required
              error={errors.password?.message}
              {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min 8 characters" } })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 }}>
              Role
            </label>
            <select
              {...register("role")}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                background: "var(--color-white)",
                fontSize: "0.8125rem",
                color: "var(--color-text-primary)",
                outline: "none",
              }}
            >
              <option value="USER">User (Default)</option>
              {isSuperAdmin && <option value="ADMIN">Admin</option>}
              {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 }}>
              Status
            </label>
            <select
              {...register("status")}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                background: "var(--color-white)",
                fontSize: "0.8125rem",
                color: "var(--color-text-primary)",
                outline: "none",
              }}
            >
              <option value="ACTIVE">Active</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} leftIcon={<UserPlus size={15} />}>
            Create User
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
