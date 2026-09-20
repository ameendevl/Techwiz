"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { CheckCheck } from "lucide-react";

export function MarkNotificationsRead() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const handleMarkAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/notifications", { method: "PATCH" });
      if (!res.ok) throw new Error();
      toast.success("All notifications marked as read");
      startTransition(() => router.refresh());
    } catch {
      toast.error("Failed to mark notifications as read");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleMarkAll}
      loading={loading || isPending}
      leftIcon={<CheckCheck size={14} />}
    >
      Mark all as read
    </Button>
  );
}
