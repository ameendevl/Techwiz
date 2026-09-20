import type { UserRole, UserStatus } from "@/types/database";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    status: UserStatus;
    username: string;
    emailVerified: Date | null;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      role: UserRole;
      status: UserStatus;
      username: string;
      emailVerified: Date | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    username: string;
    emailVerified: string | null;
  }
}
