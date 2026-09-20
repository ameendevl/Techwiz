import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge, RoleBadge } from "@/components/ui/Badge";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import {
  Mail, Phone, MapPin, Globe, Calendar,
  Shield, Key, Bell, ExternalLink
} from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon, InstagramIcon } from "@/components/ui/BrandIcons";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      accounts: { select: { provider: true } },
      loginActivities: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!user) redirect("/login");

  let socialLinks: Record<string, string> = {};
  if (user.profile?.socialLinks) {
    try {
      socialLinks = typeof user.profile.socialLinks === "string"
        ? JSON.parse(user.profile.socialLinks)
        : (user.profile.socialLinks as Record<string, string>);
    } catch {
      socialLinks = {};
    }
  }
  const oauthProviders = user.accounts.map((a: { provider: string }) => a.provider);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>
          My Profile
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: 4 }}>
          Manage your personal information and account settings
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "start" }}
           className="profile-grid">

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingBottom: 20, marginBottom: 20, borderBottom: "1px solid var(--color-border)" }}>
              <AvatarUpload userId={user.id} currentImage={user.image} name={user.name} />
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)", marginTop: 12, letterSpacing: "-0.02em" }}>
                {user.name}
              </h2>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: 2 }}>
                @{user.username}
              </p>
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <StatusBadge status={user.status} />
                <RoleBadge role={user.role} />
              </div>
            </div>

            {user.profile?.bio && (
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
                {user.profile.bio}
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: <Mail size={14} />, value: user.email, label: "Email" },
                { icon: <Phone size={14} />, value: user.profile?.phone, label: "Phone" },
                { icon: <MapPin size={14} />, value: user.profile?.location, label: "Location" },
                { icon: <Globe size={14} />, value: user.profile?.website, label: "Website", isLink: true },
                { icon: <Calendar size={14} />, value: `Joined ${formatDate(user.createdAt)}`, label: "Member since" },
              ].filter((item) => item.value).map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--color-text-muted)", flexShrink: 0 }}>{item.icon}</span>
                  {item.isLink && item.value ? (
                    <a
                      href={item.value.startsWith("http") ? item.value : `https://${item.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.8125rem", color: "var(--color-accent)", display: "flex", alignItems: "center", gap: 4 }}
                    >
                      {item.value} <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {Object.keys(socialLinks).filter((k) => socialLinks[k]).length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)", display: "flex", gap: 8 }}>
                {socialLinks.github && (
                  <a
                    href={`https://github.com/${socialLinks.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-md border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] transition-all"
                  >
                    <GithubIcon size={15} />
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${socialLinks.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-md border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] transition-all"
                  >
                    <LinkedinIcon size={15} />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a
                    href={`https://twitter.com/${socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-md border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] transition-all"
                  >
                    <TwitterIcon size={15} />
                  </a>
                )}
              </div>
            )}

            {oauthProviders.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Connected with
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {oauthProviders.map((provider) => (
                    <span
                      key={provider}
                      style={{
                        padding: "3px 10px",
                        borderRadius: "var(--radius-full)",
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        fontSize: "0.75rem",
                        color: "var(--color-text-secondary)",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    >
                      {provider}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Personal Information</CardTitle>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: 3 }}>
                  Update your name, bio, and contact details
                </p>
              </div>
            </CardHeader>
            <EditProfileModal user={{
              id: user.id,
              name: user.name,
              username: user.username ?? "",
              email: user.email,
              bio: user.profile?.bio ?? "",
              phone: user.profile?.phone ?? "",
              location: user.profile?.location ?? "",
              website: user.profile?.website ?? "",
              socialLinks,
            }} />
          </Card>

          <Card id="security">
            <CardHeader>
              <div>
                <CardTitle>Security</CardTitle>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: 3 }}>
                  Update your password and security settings
                </p>
              </div>
              <Shield size={18} style={{ color: "var(--color-text-muted)" }} />
            </CardHeader>
            <ChangePasswordModal userId={user.id} hasPassword={!!user.password} />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Login Activity</CardTitle>
            </CardHeader>
            {user.loginActivities.length === 0 ? (
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", padding: "16px 0" }}>
                No recent login activity recorded.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {user.loginActivities.map((activity, i) => (
                  <div
                    key={activity.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 0",
                      borderBottom: i < user.loginActivities.length - 1 ? "1px solid var(--color-border)" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--radius-md)",
                        background: activity.status === "success" ? "var(--color-success-light)" : "var(--color-danger-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Key size={15} style={{ color: activity.status === "success" ? "var(--color-success)" : "var(--color-danger)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)" }}>
                        {activity.provider === "CREDENTIALS" ? "Password login" : `${activity.provider} OAuth`}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 2 }}>
                        {formatRelativeTime(activity.createdAt)}
                        {activity.ip && ` · ${activity.ip}`}
                        {activity.device && ` · ${activity.device}`}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: activity.status === "success" ? "var(--color-success)" : "var(--color-danger)",
                        background: activity.status === "success" ? "var(--color-success-light)" : "var(--color-danger-light)",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-full)",
                      }}
                    >
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .profile-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
