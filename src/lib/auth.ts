import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import LinkedIn from "next-auth/providers/linkedin";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations";
import type { UserRole, UserStatus } from "@/types/database";

const baseAdapter = PrismaAdapter(db);

const customAdapter: any = {
  ...baseAdapter,
  async createUser(data: any) {
    const base = (data.name ?? data.email ?? "user")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 15) || "user";
    const username = `${base}_${Math.floor(1000 + Math.random() * 9000)}`;

    return db.user.create({
      data: {
        ...data,
        username,
        status: "ACTIVE",
        role: "USER",
        emailVerified: data.emailVerified ?? new Date(),
        profile: {
          create: {},
        },
      },
    });
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: customAdapter,
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || "vertex-super-secure-production-auth-secret-key-32chars!",

  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-email",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isDemoOAuth: { label: "isDemoOAuth", type: "text" },
        demoProvider: { label: "demoProvider", type: "text" },
      },
      async authorize(credentials) {
        if (credentials?.isDemoOAuth === "true" && credentials?.demoProvider) {
          const provider = String(credentials.demoProvider).toLowerCase();
          const demoProfiles: Record<string, { email: string; name: string; username: string; image: string; providerUpper: string }> = {
            google: {
              email: "alex.google@vertex.app",
              name: "Alex Rivera",
              username: "alex_google",
              image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              providerUpper: "GOOGLE",
            },
            github: {
              email: "jordan.github@vertex.app",
              name: "Jordan Lee",
              username: "jordan_github",
              image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
              providerUpper: "GITHUB",
            },
            linkedin: {
              email: "taylor.linkedin@vertex.app",
              name: "Taylor Kim",
              username: "taylor_linkedin",
              image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
              providerUpper: "LINKEDIN",
            },
          };

          const profile = demoProfiles[provider] ?? demoProfiles.google;

          let user = await db.user.findUnique({
            where: { email: profile.email },
            include: { profile: true },
          });

          if (!user) {
            user = await db.user.create({
              data: {
                email: profile.email,
                name: profile.name,
                username: profile.username,
                role: "USER",
                status: "ACTIVE",
                emailVerified: new Date(),
                image: profile.image,
                profile: {
                  create: {
                    bio: `Full-stack enthusiast and Vertex competition participant (${profile.providerUpper} Account).`,
                    location: "Karachi, Pakistan",
                  },
                },
                accounts: {
                  create: {
                    type: "oauth",
                    provider: provider,
                    providerAccountId: `demo_${provider}_${Date.now()}`,
                  },
                },
              },
              include: { profile: true },
            });
          }

          await db.loginActivity.create({
            data: {
              userId: user.id,
              provider: profile.providerUpper,
              status: "success",
              ip: "127.0.0.1",
              device: "Desktop Browser (Simulated OAuth)",
            },
          });

          await db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role as UserRole,
            status: user.status as UserStatus,
            image: user.image,
            emailVerified: user.emailVerified,
          };
        }

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
          include: { profile: true },
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        if (user.status === "SUSPENDED") {
          throw new Error("ACCOUNT_SUSPENDED");
        }

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role as UserRole,
          status: user.status as UserStatus,
          image: user.image,
          emailVerified: user.emailVerified,
        };
      },
    }),

    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    LinkedIn({
      clientId: process.env.AUTH_LINKEDIN_ID!,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account && account.provider !== "credentials") {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
          include: { profile: true },
        });

        if (existingUser) {
          if (existingUser.status === "SUSPENDED") return false;

          await db.user.update({
            where: { id: existingUser.id },
            data: {
              lastLoginAt: new Date(),
              emailVerified: existingUser.emailVerified ?? new Date(),
              image: user.image ?? existingUser.image,
            },
          });

          if (!existingUser.profile) {
            await db.profile.create({ data: { userId: existingUser.id } });
          }
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        const searchConditions = [];
        if (user.id) searchConditions.push({ id: user.id as string });
        if (user.email) searchConditions.push({ email: user.email as string });

        const dbUser = searchConditions.length > 0
          ? await db.user.findFirst({ where: { OR: searchConditions } })
          : null;

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.username = dbUser.username;
          token.emailVerified = dbUser.emailVerified?.toISOString() ?? null;
        } else {
          token.id = user.id;
          token.role = "USER";
          token.status = "ACTIVE";
        }
      }

      if (trigger === "update" && session) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
        });
        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.image = dbUser.image;
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.username = dbUser.username;
          token.emailVerified = dbUser.emailVerified?.toISOString() ?? null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = (token.id as string) ?? session.user.id;
        session.user.role = ((token.role as UserRole) || "USER");
        session.user.status = ((token.status as UserStatus) || "ACTIVE");
        session.user.username = (token.username as string) ?? "";
        session.user.emailVerified = token.emailVerified
          ? new Date(token.emailVerified as string)
          : null;
      }
      return session;
    },
  },

  events: {
    async createUser({ user }) {
      await db.profile.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });

      const dbUser = await db.user.findUnique({ where: { id: user.id } });
      if (!dbUser?.username) {
        const base = (user.name ?? user.email ?? "user")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        const username = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
        await db.user.update({
          where: { id: user.id },
          data: { username, status: "ACTIVE" },
        });
      }
    },
  },
});
