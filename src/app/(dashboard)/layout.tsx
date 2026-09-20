import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserSidebar } from "@/components/navigation/UserSidebar";
import { TopNavbar } from "@/components/navigation/TopNavbar";
import { db } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const unreadCount = await db.notification.count({
    where: { userId: session.user.id, read: false },
  });

  return (
    <div className="layout-sidebar">
      <UserSidebar unreadCount={unreadCount} />
      <div
        className="main-content"
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <TopNavbar unreadCount={unreadCount} />
        <main
          style={{
            flex: 1,
            padding: "32px 24px",
            maxWidth: 1200,
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
