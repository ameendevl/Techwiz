import { PrismaClient } from "@prisma/client";
import { UserRole, UserStatus } from "../src/types/database";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database for Vertex Enterprise Platform...");

  const salt = await bcrypt.genSalt(12);
  const defaultPasswordHash = await bcrypt.hash("Password123!", salt);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@vertex.app" },
    update: {},
    create: {
      email: "superadmin@vertex.app",
      password: defaultPasswordHash,
      name: "Alexander Wright",
      username: "superadmin",
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      profile: {
        create: {
          bio: "Lead Systems Architect & Vertex Platform Administrator.",
          phone: "+1 (555) 019-2834",
          location: "San Francisco, CA",
          website: "https://vertex.app",
          socialLinks: {
            github: "alexander-vertex",
            linkedin: "alexanderwright",
            twitter: "alex_architect",
          },
        },
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@vertex.app" },
    update: {},
    create: {
      email: "admin@vertex.app",
      password: defaultPasswordHash,
      name: "Elena Rostova",
      username: "elena_admin",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      profile: {
        create: {
          bio: "Operations Coordinator & Technical Judge liaison.",
          phone: "+1 (555) 014-9821",
          location: "London, UK",
          website: "https://elena.dev",
          socialLinks: {
            github: "elena-r",
            linkedin: "elenarostova",
          },
        },
      },
    },
  });

  const demoUsers = [
    {
      email: "sarah.chen@example.com",
      name: "Sarah Chen",
      username: "sarah_chen",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      bio: "Full Stack Engineer & Vertex Participant.",
      location: "Singapore",
    },
    {
      email: "marcus.vance@example.com",
      name: "Marcus Vance",
      username: "marcus_v",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      bio: "Data scientist exploring machine learning applications.",
      location: "Toronto, Canada",
    },
    {
      email: "aisha.khan@example.com",
      name: "Aisha Khan",
      username: "aisha_k",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      bio: "UX designer passionate about accessibility and clean interfaces.",
      location: "Dubai, UAE",
    },
    {
      email: "jordan.taylor@example.com",
      name: "Jordan Taylor",
      username: "jtaylor",
      role: UserRole.USER,
      status: UserStatus.PENDING_VERIFICATION,
      bio: "Software developer & tech enthusiast.",
      location: "Austin, TX",
    },
  ];

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password: defaultPasswordHash,
        name: u.name,
        username: u.username,
        role: u.role,
        status: u.status,
        emailVerified: u.status === UserStatus.ACTIVE ? new Date() : null,
        profile: {
          create: {
            bio: u.bio,
            location: u.location,
          },
        },
      },
    });
  }

  await prisma.notification.createMany({
    data: [
      {
        userId: superAdmin.id,
        type: "SYSTEM",
        title: "Welcome to Vertex Platform Foundation",
        body: "The production application foundation has been initialized with role-based access control, security auditing, and modular architecture.",
        read: false,
      },
      {
        userId: superAdmin.id,
        type: "SECURITY",
        title: "Security Baseline Enforced",
        body: "Bcrypt hashing, rate limiting, and Next.js proxy route protection are active.",
        read: false,
      },
      {
        userId: admin.id,
        type: "ANNOUNCEMENT",
        title: "Admin Console Initialized",
        body: "You have been assigned the Admin role. You can manage users, inspect audit logs, and broadcast announcements.",
        read: false,
      },
    ],
  });

  const settings = [
    { key: "site_name", value: "Vertex Platform" },
    { key: "support_email", value: "support@vertex.app" },
    { key: "registration_enabled", value: "true" },
    { key: "maintenance_mode", value: "false" },
    { key: "require_verification", value: "false" },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      create: s,
      update: s,
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: "ADMIN_ACTION",
      targetType: "Database",
      metadata: { event: "seed_completed", timestamp: new Date().toISOString() },
      status: "success",
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("-----------------------------------------");
  console.log("Default Credentials:");
  console.log("Super Admin: superadmin@vertex.app / Password123!");
  console.log("Admin:       admin@vertex.app / Password123!");
  console.log("User:        sarah.chen@example.com / Password123!");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
