import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UsersTable } from "@/components/admin/UsersTable";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Users — Admin" };

interface SearchParams {
  page?: string;
  search?: string;
  status?: string;
  role?: string;
  sort?: string;
  order?: string;
  [key: string]: string | undefined;
}

const PAGE_SIZE = 15;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const search = params.search ?? "";
  const statusFilter = params.status ?? "";
  const roleFilter = params.role ?? "";
  const sortField = params.sort ?? "createdAt";
  const sortOrder = (params.order ?? "desc") as "asc" | "desc";

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } },
      ],
    }),
    ...(statusFilter && { status: statusFilter as never }),
    ...(roleFilter && { role: roleFilter as never }),
    status: { not: "DELETED" as const },
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        status: true,
        image: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        accounts: { select: { provider: true } },
      },
    }),
    db.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>
          Users
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: 4 }}>
          {total.toLocaleString()} total users
        </p>
      </div>

      <UsersTable
        users={users.map((u) => ({
          ...u,
          emailVerified: u.emailVerified?.toISOString() ?? null,
          lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
          createdAt: u.createdAt.toISOString(),
          providers: u.accounts.map((a) => a.provider),
        }))}
        currentPage={page}
        totalPages={totalPages}
        total={total}
        searchParams={params}
        currentUserId={session.user.id}
        isSuperAdmin={session.user.role === "SUPER_ADMIN"}
      />
    </div>
  );
}
