"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations";
import { User, AtSign, Mail, Phone, MapPin, Globe } from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon, InstagramIcon } from "@/components/ui/BrandIcons";

interface EditProfileModalProps {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    bio: string;
    phone: string;
    location: string;
    website: string;
    socialLinks: Record<string, string>;
  };
}

export function EditProfileModal({ user }: EditProfileModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      username: user.username,
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      website: user.website,
      socialLinks: {
        github: user.socialLinks.github ?? "",
        linkedin: user.socialLinks.linkedin ?? "",
        twitter: user.socialLinks.twitter ?? "",
        instagram: user.socialLinks.instagram ?? "",
      },
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.message ?? "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input
          label="Full name"
          leftIcon={<User size={14} />}
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Username"
          leftIcon={<AtSign size={14} />}
          error={errors.username?.message}
          {...register("username")}
        />
      </div>

      <Textarea
        label="Bio"
        placeholder="Tell us a little about yourself…"
        error={errors.bio?.message}
        style={{ minHeight: 80 }}
        {...register("bio")}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input
          label="Phone"
          type="tel"
          leftIcon={<Phone size={14} />}
          error={errors.phone?.message}
          placeholder="+1 (555) 000-0000"
          {...register("phone")}
        />
        <Input
          label="Location"
          leftIcon={<MapPin size={14} />}
          error={errors.location?.message}
          placeholder="City, Country"
          {...register("location")}
        />
      </div>

      <Input
        label="Website"
        type="url"
        leftIcon={<Globe size={14} />}
        error={errors.website?.message}
        placeholder="https://yourwebsite.com"
        {...register("website")}
      />

      <div>
        <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 10 }}>
          Social Links
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Input
            placeholder="GitHub username"
            leftIcon={<GithubIcon size={14} />}
            {...register("socialLinks.github")}
          />
          <Input
            placeholder="LinkedIn username"
            leftIcon={<LinkedinIcon size={14} />}
            {...register("socialLinks.linkedin")}
          />
          <Input
            placeholder="Twitter / X handle"
            leftIcon={<TwitterIcon size={14} />}
            {...register("socialLinks.twitter")}
          />
          <Input
            placeholder="Instagram username"
            leftIcon={<InstagramIcon size={14} />}
            {...register("socialLinks.instagram")}
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 8, borderTop: "1px solid var(--color-border)" }}>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!isDirty}
        >
          Save changes
        </Button>
      </div>
    </form>
  );
}
