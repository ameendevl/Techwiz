"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { editUserSchema, type EditUserInput } from "@/lib/validations";

interface EditUserModalProps {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    status: string;
  };
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  isSuperAdmin: boolean;
}

const roleOptions = [
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING_VERIFICATION", label: "Pending Verification" },
  { value: "SUSPENDED", label: "Suspended" },
];

export function EditUserModal({ user, open, onClose, onSave, isSuperAdmin }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<EditUserInput>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role as EditUserInput["role"],
      status: user.status as EditUserInput["status"],
    },
  });

  const onSubmit = async (data: EditUserInput) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.message ?? "Failed to update user");
        return;
      }

      toast.success("User updated successfully");
      onSave();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit User" description={`Editing ${user.name}'s account`} size="md">
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Full name" error={errors.name?.message} {...register("name")} />
          <Input label="Username" error={errors.username?.message} {...register("username")} />
        </div>

        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)" }}>Role</label>
            <select
              {...register("role")}
              disabled={!isSuperAdmin}
              style={{
                height: 40, padding: "0 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                background: "var(--color-white)",
                color: "var(--color-text-primary)",
                fontSize: "0.875rem",
                cursor: isSuperAdmin ? "pointer" : "not-allowed",
                opacity: isSuperAdmin ? 1 : 0.6,
              }}
            >
              {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)" }}>Status</label>
            <select
              {...register("status")}
              style={{
                height: 40, padding: "0 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                background: "var(--color-white)",
                color: "var(--color-text-primary)",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <ModalFooter>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" size="sm" loading={loading}>Save changes</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
