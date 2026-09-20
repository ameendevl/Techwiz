import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/navigation/AdminSidebar";
import { TopNavbar } from "@/components/navigation/TopNavbar";
import { db } from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const unreadCount = await db.notification.count({
    where: { userId: session.user.id, read: false },
  });

  return (
    <div className="layout-sidebar">
      <AdminSidebar />
      <div
        className="main-content"
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <TopNavbar unreadCount={unreadCount} adminMode />
        <main
          style={{
            flex: 1,
            padding: "32px 24px",
            maxWidth: 1400,
            width: "100%",
            margin: "0 auto",
          }}
          className="pt-[var(--topnav-height)] lg:pt-0"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
