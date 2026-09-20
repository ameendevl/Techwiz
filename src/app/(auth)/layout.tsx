import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Vertex",
    default: "Authentication",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      suppressHydrationWarning
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--color-off-white)",
      }}
    >
      {children}
    </div>
  );
}
