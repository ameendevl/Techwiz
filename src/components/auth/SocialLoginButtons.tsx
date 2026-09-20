"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.859-3.047.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

interface SocialLoginButtonsProps {
  callbackUrl?: string;
  compact?: boolean;
}

const providers = [
  { id: "google", label: "Google", Icon: GoogleIcon },
  { id: "github", label: "GitHub", Icon: GitHubIcon },
  { id: "linkedin", label: "LinkedIn", Icon: LinkedInIcon },
];

export function SocialLoginButtons({ callbackUrl = "/dashboard", compact }: SocialLoginButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuth = async (providerId: string) => {
    setLoading(providerId);
    try {
      await signIn(providerId, { callbackUrl });
    } catch {
      toast.error(`Failed to sign in with ${providerId}. Please try again.`);
      setLoading(null);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: compact ? "repeat(3, 1fr)" : "1fr",
        gap: 8,
      }}
    >
      {providers.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => handleOAuth(id)}
          disabled={loading !== null}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: compact ? "center" : "flex-start",
            gap: 10,
            padding: compact ? "9px 12px" : "10px 14px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            background: loading === id ? "var(--color-surface)" : "var(--color-white)",
            cursor: loading !== null ? "not-allowed" : "pointer",
            opacity: loading !== null && loading !== id ? 0.6 : 1,
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "var(--color-text-primary)",
            transition: "all 150ms ease",
            boxShadow: "var(--shadow-xs)",
            width: "100%",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border-strong)";
            }
          }}
          onMouseLeave={(e) => {
            if (loading !== id) {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--color-white)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
            }
          }}
          aria-label={`Continue with ${label}`}
        >
          {loading === id ? (
            <div
              style={{
                width: 18,
                height: 18,
                border: "2px solid var(--color-border)",
                borderTopColor: "var(--color-accent)",
                borderRadius: "50%",
                flexShrink: 0,
                animation: "spin 0.7s linear infinite",
              }}
            />
          ) : (
            <span style={{ flexShrink: 0, lineHeight: 0 }}>
              <Icon />
            </span>
          )}
          {!compact && `Continue with ${label}`}
        </button>
      ))}
    </div>
  );
}
