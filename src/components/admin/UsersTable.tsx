"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search, Filter, ChevronUp, ChevronDown,
  MoreHorizontal, Eye, Edit2, Shield, UserX,
  UserCheck, Trash2, CheckCircle2, X, Users, UserPlus
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge, RoleBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, TableRowSkeleton } from "@/components/ui/Skeleton";
import { EditUserModal } from "@/components/admin/EditUserModal";
import { CreateUserModal } from "@/components/admin/CreateUserModal";
import { formatDate, formatRelativeTime } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  status: string;
  image?: string | null;
  emailVerified: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  providers: string[];
}

interface UsersTableProps {
  users: User[];
  currentPage: number;
  totalPages: number;
  total: number;
  searchParams: Record<string, string | undefined>;
  currentUserId: string;
  isSuperAdmin: boolean;
}

const roleOptions = [
  { value: "", label: "All roles" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
];

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING_VERIFICATION", label: "Pending" },
  { value: "SUSPENDED", label: "Suspended" },
];

export function UsersTable({
  users,
  currentPage,
  totalPages,
  total,
  searchParams,
  currentUserId,
  isSuperAdmin,
}: UsersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.search ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null; bulk: boolean }>({ open: false, userId: null, bulk: false });
  const [editUser, setEditUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const updateParams = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { ...searchParams, ...updates, page: updates.page ?? "1" };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }, [pathname, router, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: search || undefined });
  };

  const handleSort = (field: string) => {
    const currentSort = searchParams.sort;
    const currentOrder = searchParams.order;
    if (currentSort === field) {
      updateParams({ sort: field, order: currentOrder === "asc" ? "desc" : "asc" });
    } else {
      updateParams({ sort: field, order: "desc" });
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (searchParams.sort !== field) return <ChevronDown size={12} style={{ opacity: 0.3 }} />;
    return searchParams.order === "asc"
      ? <ChevronUp size={12} style={{ color: "var(--color-accent)" }} />
      : <ChevronDown size={12} style={{ color: "var(--color-accent)" }} />;
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  };

  const performAction = async (action: string, userIds: string[]) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userIds }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.message ?? "Action failed");
        return;
      }
      toast.success(`Action completed successfully`);
      setSelectedIds(new Set());
      startTransition(() => router.refresh());
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(false);
      setDeleteDialog({ open: false, userId: null, bulk: false });
      setOpenMenuId(null);
    }
  };

  return (
    <div>
      <div
        style={{
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "16px",
          marginBottom: 16,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, flex: 1, minWidth: 200 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users…"
              style={{
                width: "100%",
                height: 36,
                paddingLeft: 32,
                paddingRight: 12,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-text-primary)",
                fontSize: "0.8125rem",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-accent)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(45,106,79,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">Search</Button>
        </form>

        <select
          value={searchParams.role ?? ""}
          onChange={(e) => updateParams({ role: e.target.value || undefined })}
          style={{
            height: 36,
            padding: "0 10px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            color: "var(--color-text-secondary)",
            fontSize: "0.8125rem",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select
          value={searchParams.status ?? ""}
          onChange={(e) => updateParams({ status: e.target.value || undefined })}
          style={{
            height: 36,
            padding: "0 10px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            color: "var(--color-text-secondary)",
            fontSize: "0.8125rem",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {selectedIds.size > 0 && (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                {selectedIds.size} selected
              </span>
              <Button size="sm" variant="secondary" onClick={() => performAction("activate", Array.from(selectedIds))} loading={actionLoading}>
                Activate
              </Button>
              <Button size="sm" variant="secondary" onClick={() => performAction("suspend", Array.from(selectedIds))} loading={actionLoading}>
                Suspend
              </Button>
              <Button size="sm" variant="danger-ghost" onClick={() => setDeleteDialog({ open: true, userId: null, bulk: true })}>
                Delete
              </Button>
              <Button size="icon-sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                <X size={14} />
              </Button>
            </div>
          )}

          <Button
            size="sm"
            variant="primary"
            leftIcon={<UserPlus size={14} />}
            onClick={() => setCreateModalOpen(true)}
          >
            Add User
          </Button>
        </div>
      </div>

      <div
        style={{
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ minWidth: 750 }}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === users.length && users.length > 0}
                    onChange={toggleSelectAll}
                    style={{ accentColor: "var(--color-accent)" }}
                  />
                </th>
                <th>
                  <button onClick={() => handleSort("name")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    User <SortIcon field="name" />
                  </button>
                </th>
                <th>Role</th>
                <th>Status</th>
                <th>
                  <button onClick={() => handleSort("createdAt")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Joined <SortIcon field="createdAt" />
                  </button>
                </th>
                <th>
                  <button onClick={() => handleSort("lastLoginAt")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Last login <SortIcon field="lastLoginAt" />
                  </button>
                </th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={<Users size={24} />}
                      title="No users found"
                      description="Try adjusting your search or filter criteria."
                    />
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} style={{ background: selectedIds.has(user.id) ? "var(--color-accent-lighter)" : undefined }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        style={{ accentColor: "var(--color-accent)" }}
                      />
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar src={user.image} name={user.name} size="sm" />
                        <div>
                          <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                            {user.name}
                            {user.id === currentUserId && (
                              <span style={{ fontSize: "0.65rem", marginLeft: 6, color: "var(--color-accent)", fontWeight: 500 }}>you</span>
                            )}
                          </p>
                          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                            @{user.username} · {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td><RoleBadge role={user.role} /></td>
                    <td><StatusBadge status={user.status} /></td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                      {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : "Never"}
                    </td>
                    <td>
                      <div style={{ position: "relative" }}>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                          aria-label="User actions"
                        >
                          <MoreHorizontal size={15} />
                        </Button>

                        <AnimatePresence>
                          {openMenuId === user.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -4, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.97 }}
                              transition={{ duration: 0.12 }}
                              style={{
                                position: "absolute",
                                right: 0,
                                top: "calc(100% + 4px)",
                                background: "var(--color-white)",
                                border: "1px solid var(--color-border)",
                                borderRadius: "var(--radius-lg)",
                                boxShadow: "var(--shadow-lg)",
                                zIndex: 50,
                                minWidth: 180,
                                padding: 6,
                              }}
                            >
                              {[
                                { icon: <Edit2 size={14} />, label: "Edit user", onClick: () => { setEditUser(user); setOpenMenuId(null); } },
                                ...(user.status === "ACTIVE"
                                  ? [{ icon: <UserX size={14} />, label: "Suspend", onClick: () => { performAction("suspend", [user.id]); } }]
                                  : [{ icon: <UserCheck size={14} />, label: "Activate", onClick: () => { performAction("activate", [user.id]); } }]
                                ),
                                ...(user.emailVerified ? [] : [{ icon: <CheckCircle2 size={14} />, label: "Verify email", onClick: () => { performAction("verify", [user.id]); } }]),
                                ...(user.id !== currentUserId && isSuperAdmin ? [{ icon: <Trash2 size={14} />, label: "Delete user", danger: true, onClick: () => { setDeleteDialog({ open: true, userId: user.id, bulk: false }); setOpenMenuId(null); } }] : []),
                              ].map((action, i) => (
                                <button
                                  key={i}
                                  onClick={action.onClick}
                                  style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "8px 10px",
                                    borderRadius: "var(--radius-md)",
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    fontSize: "0.8125rem",
                                    color: (action as { danger?: boolean }).danger ? "var(--color-danger)" : "var(--color-text-secondary)",
                                    transition: "all 150ms ease",
                                    textAlign: "left",
                                  }}
                                  onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background =
                                      (action as { danger?: boolean }).danger ? "var(--color-danger-light)" : "var(--color-surface)";
                                    (e.currentTarget as HTMLButtonElement).style.color =
                                      (action as { danger?: boolean }).danger ? "var(--color-danger)" : "var(--color-text-primary)";
                                  }}
                                  onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                    (e.currentTarget as HTMLButtonElement).style.color =
                                      (action as { danger?: boolean }).danger ? "var(--color-danger)" : "var(--color-text-secondary)";
                                  }}
                                >
                                  {action.icon}
                                  {action.label}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "between",
              padding: "12px 16px",
              borderTop: "1px solid var(--color-border)",
              gap: 8,
            }}
          >
            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", flex: 1 }}>
              Page {currentPage} of {totalPages} · {total} users
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + Math.max(1, currentPage - 3);
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => updateParams({ page: String(p) })}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "var(--radius-md)",
                      border: "1px solid",
                      borderColor: p === currentPage ? "var(--color-accent)" : "var(--color-border)",
                      background: p === currentPage ? "var(--color-accent)" : "transparent",
                      color: p === currentPage ? "#fff" : "var(--color-text-secondary)",
                      cursor: "pointer",
                      fontSize: "0.8125rem",
                      fontWeight: p === currentPage ? 600 : 400,
                      transition: "all 150ms ease",
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {editUser && (
        <EditUserModal
          user={editUser}
          open={!!editUser}
          onClose={() => setEditUser(null)}
          isSuperAdmin={isSuperAdmin}
          onSave={() => {
            setEditUser(null);
            startTransition(() => router.refresh());
          }}
        />
      )}

      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        isSuperAdmin={isSuperAdmin}
        onSuccess={() => {
          startTransition(() => router.refresh());
        }}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, userId: null, bulk: false })}
        onConfirm={() => {
          const ids = deleteDialog.bulk
            ? Array.from(selectedIds)
            : deleteDialog.userId
            ? [deleteDialog.userId]
            : [];
          performAction("delete", ids);
        }}
        title={deleteDialog.bulk ? `Delete ${selectedIds.size} users?` : "Delete user?"}
        description="This action is irreversible. The user's data will be permanently removed."
        confirmLabel="Delete permanently"
        loading={actionLoading}
      />

      {openMenuId && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 40 }}
          onClick={() => setOpenMenuId(null)}
        />
      )}
    </div>
  );
}
