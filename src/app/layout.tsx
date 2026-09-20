import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ChatWidget } from "@/components/chat/ChatWidget";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Vertex — Enterprise Platform",
    template: "%s | Vertex",
  },
  description:
    "A premium, production-quality platform built for Vertex. Modern authentication, user management, and extensible project workspace.",
  keywords: ["vertex", "enterprise", "platform", "dashboard", "management"],
  authors: [{ name: "Vertex Team" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Vertex — Enterprise Platform",
    description: "Premium platform built for Vertex.",
    siteName: "Vertex",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const clean = () => document.querySelectorAll('[bis_skin_checked]').forEach(el => el.removeAttribute('bis_skin_checked'));
                clean();
                const observer = new MutationObserver((mutations) => {
                  for (let i = 0; i < mutations.length; i++) {
                    const m = mutations[i];
                    if (m.attributeName === 'bis_skin_checked' && m.target && m.target.removeAttribute) {
                      m.target.removeAttribute('bis_skin_checked');
                    }
                  }
                });
                observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['bis_skin_checked'] });
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <SessionProvider>
          <ThemeProvider>
            {children}
            <ChatWidget />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-lg)",
                },
              }}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
