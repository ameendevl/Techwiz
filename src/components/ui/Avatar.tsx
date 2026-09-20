"use client";

import { useState } from "react";
import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  xs: { px: 24, fontSize: "0.625rem" },
  sm: { px: 32, fontSize: "0.75rem" },
  md: { px: 40, fontSize: "0.875rem" },
  lg: { px: 48, fontSize: "1rem" },
  xl: { px: 64, fontSize: "1.25rem" },
  "2xl": { px: 96, fontSize: "1.75rem" },
};

const colorPalette = [
  { bg: "#e2e8e4", text: "#2d6a4f" },
  { bg: "#e2e4e8", text: "#1e40af" },
  { bg: "#e8e2e4", text: "#9d174d" },
  { bg: "#e4e8e2", text: "#3f6212" },
  { bg: "#e8e4e2", text: "#9a3412" },
  { bg: "#e2e8e8", text: "#134e4a" },
  { bg: "#e6e2e8", text: "#581c87" },
];

function getAvatarColor(name: string) {
  const idx = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colorPalette[idx % colorPalette.length];
}

function Avatar({ src, name = "", size = "md", className, onClick }: AvatarProps) {
  const { px, fontSize } = sizeMap[size];
  const initials = getInitials(name);
  const color = getAvatarColor(name);
  const [imgError, setImgError] = useState(false);

  const style: React.CSSProperties = {
    width: px,
    height: px,
    borderRadius: "50%",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    cursor: onClick ? "pointer" : undefined,
    fontSize,
    fontWeight: 600,
    background: color.bg,
    color: color.text,
    border: "2px solid var(--color-border)",
    position: "relative",
    transition: "opacity 150ms ease",
  };

  return (
    <div
      style={style}
      className={cn(onClick && "hover:opacity-90", className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {src && !imgError ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={`${px}px`}
          style={{ objectFit: "cover" }}
          onError={() => setImgError(true)}
          unoptimized={src.startsWith("http")}
        />
      ) : (
        <span>{initials || "?"}</span>
      )}
    </div>
  );
}

function AvatarGroup({
  users,
  max = 3,
}: {
  users: Array<{ name: string; image?: string | null }>;
  max?: number;
}) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div style={{ display: "flex" }}>
      {visible.map((user, i) => (
        <div
          key={i}
          style={{
            marginLeft: i === 0 ? 0 : -10,
            zIndex: visible.length - i,
            position: "relative",
          }}
        >
          <Avatar src={user.image} name={user.name} size="sm" />
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{
            marginLeft: -10,
            zIndex: 0,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--color-surface)",
            border: "2px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.7rem",
            fontWeight: 600,
            color: "var(--color-text-muted)",
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

export { Avatar, AvatarGroup };
