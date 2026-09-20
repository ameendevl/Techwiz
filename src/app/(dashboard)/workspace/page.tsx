import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Briefcase, Puzzle, ArrowRight, Layers } from "lucide-react";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Project Workspace" };

export default async function WorkspacePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--color-accent-light)",
            color: "var(--color-accent-text)",
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "4px 12px",
            borderRadius: "var(--radius-full)",
            marginBottom: 16,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          <Layers size={12} />
          Vertex Project Workspace
        </div>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            marginBottom: 12,
          }}
        >
          Your project lives here
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.7,
            maxWidth: 560,
          }}
        >
          This workspace is reserved for the main Vertex competition project module.
          The authentication, dashboard, and admin infrastructure is fully operational
          and ready to support any feature set you integrate here.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {[
          {
            icon: <Briefcase size={22} />,
            title: "Ready for Integration",
            desc: "The workspace is scaffolded and waiting. Add your project routes, components, and database tables.",
            status: "Ready",
            statusColor: "var(--color-success)",
          },
          {
            icon: <Puzzle size={22} />,
            title: "Modular Architecture",
            desc: "Built with extensibility in mind — add new pages, API routes, and DB models without touching the auth system.",
            status: "Designed",
            statusColor: "var(--color-accent)",
          },
          {
            icon: <Layers size={22} />,
            title: "Full Stack Available",
            desc: "Next.js App Router, Prisma ORM, NextAuth, and all UI components are available for your project features.",
            status: "Active",
            statusColor: "var(--color-info)",
          },
        ].map((item, i) => (
          <Card key={i} hover>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-lg)",
                background: "var(--color-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-accent)",
                marginBottom: 16,
              }}
            >
              {item.icon}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                {item.title}
              </h3>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  background: `${item.statusColor}20`,
                  color: item.statusColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {item.status}
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
              {item.desc}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 20 }}>
          How to integrate your project module
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            {
              step: "01",
              title: "Add project pages",
              desc: "Create new pages inside `src/app/(dashboard)/workspace/[feature]/` for each module.",
              code: "src/app/(dashboard)/workspace/your-feature/page.tsx",
            },
            {
              step: "02",
              title: "Extend the database",
              desc: "Add new models to `prisma/schema.prisma` and run `npx prisma migrate dev`.",
              code: "prisma/schema.prisma → add your models",
            },
            {
              step: "03",
              title: "Create API routes",
              desc: "Add API handlers in `src/app/api/` — they inherit auth automatically via the session.",
              code: "src/app/api/your-feature/route.ts",
            },
            {
              step: "04",
              title: "Add admin features",
              desc: "Extend the admin panel by adding items to `AdminSidebar` and creating admin pages.",
              code: "src/components/navigation/AdminSidebar.tsx",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 16,
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "var(--color-accent)",
                  opacity: 0.5,
                  flexShrink: 0,
                  minWidth: 32,
                  letterSpacing: "-0.02em",
                }}
              >
                {item.step}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>
                  {item.title}
                </p>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: 8, lineHeight: 1.6 }}>
                  {item.desc}
                </p>
                <code
                  style={{
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    background: "var(--color-white)",
                    border: "1px solid var(--color-border)",
                    padding: "3px 8px",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--color-accent-text)",
                  }}
                >
                  {item.code}
                </code>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
