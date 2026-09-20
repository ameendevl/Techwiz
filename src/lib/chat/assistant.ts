// Vertex Intelligent Assistant Engine & Gemini API Client

export interface ChatContext {
  userId?: string;
  userName?: string;
  userRole?: string;
  channel?: string;
}

export interface AssistantResponse {
  content: string;
  suggestions: string[];
  provider: "gemini" | "vertex-engine";
}

const VERTEX_SYSTEM_PROMPT = `You are Vertex Copilot, an elite AI assistant embedded in the Vertex Enterprise Web Application Platform.
You help users navigate the platform, understand roles (SUPER_ADMIN, ADMIN, USER), build competition modules in the Workspace (/workspace), manage their profile, and answer technical and general questions.
Always be polite, concise, structured (use markdown bullet points and bold headers when helpful), and professional. Respond in English or Roman Urdu if the user asks in Roman Urdu.`;

export async function generateChatResponse(
  message: string,
  history: Array<{ role: string; content: string }> = [],
  context: ChatContext = {}
): Promise<AssistantResponse> {
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();

  // Try calling Gemini API if a potentially valid Google API key is configured
  if (geminiApiKey && geminiApiKey.startsWith("AIzaSy")) {
    try {
      const geminiResult = await callGeminiApi(message, history, geminiApiKey, context);
      if (geminiResult) {
        return {
          content: geminiResult,
          suggestions: getDynamicSuggestions(message),
          provider: "gemini",
        };
      }
    } catch (err) {
      console.warn("[Vertex Copilot] Gemini API error, falling back to Vertex Engine:", err);
    }
  }

  // Built-in Vertex Knowledge & Intent Engine
  const engineResult = processVertexIntent(message, context);
  return {
    content: engineResult.content,
    suggestions: engineResult.suggestions,
    provider: "vertex-engine",
  };
}

async function callGeminiApi(
  message: string,
  history: Array<{ role: string; content: string }>,
  apiKey: string,
  context: ChatContext
): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `${VERTEX_SYSTEM_PROMPT}\nCurrent user: ${context.userName || "User"} (Role: ${
            context.userRole || "USER"
          }).`,
        },
      ],
    },
    {
      role: "model",
      parts: [{ text: "Understood. I am ready to assist as Vertex Copilot." }],
    },
    ...history.slice(-6).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    {
      role: "user",
      parts: [{ text: message }],
    },
  ];

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("[Gemini API Error]", res.status, errorText);
    return null;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || null;
}

function processVertexIntent(
  query: string,
  context: ChatContext
): { content: string; suggestions: string[] } {
  const q = query.toLowerCase().trim();
  const role = context.userRole || "USER";
  const name = context.userName || "Member";

  // Greetings
  if (/^(hi|hello|hey|salam|assalam|aoa|hy|hola|good\s*(morning|afternoon|evening))/i.test(q)) {
    return {
      content: `Hello **${name}**! 👋 Welcome to **Vertex Copilot**.\n\nI am your platform AI assistant. I can help you with:\n* 🧭 Navigating your dashboard & workspace\n* 🛡️ Understanding roles & security permissions\n* 👤 Managing profile & account settings\n* 🚀 Integrating competition modules\n\nHow can I help you today?`,
      suggestions: [
        "What is Vertex Platform?",
        "What can I do in my role?",
        "How to edit my profile?",
        "Tell me about Competition Workspace",
      ],
    };
  }

  // Role comparison & details
  if (q.includes("role") || q.includes("super_admin") || q.includes("admin") || q.includes("permission") || q.includes("farak")) {
    return {
      content: `### 🛡️ Platform Roles & Permissions\n\nVertex has three distinct authority tiers:\n\n1. 👑 **SUPER_ADMIN**\n   * Complete platform authority.\n   * Can modify **Platform Settings** (maintenance mode, site title, registration toggle).\n   * Can promote/demote user roles & **permanently delete users**.\n\n2. 🛡️ **ADMIN**\n   * Operational manager.\n   * Can view user directories, edit details, suspend/activate accounts, broadcast notifications, and view audit logs.\n   * Cannot delete users or change system settings.\n\n3. 👤 **USER**\n   * Standard member access to personal Dashboard (\`/dashboard\`), Profile, Notifications, and Project Workspace (\`/workspace\`).\n\n*Your current role:* **\`${role}\`**`,
      suggestions: [
        "How do I access the Admin Console?",
        "How to update my profile?",
        "Where is the Workspace?",
      ],
    };
  }

  // Workspace & Competition Module
  if (q.includes("workspace") || q.includes("competition") || q.includes("module") || q.includes("project")) {
    return {
      content: `### 🚀 Competition Project Workspace\n\nThe **Vertex Workspace** (\`/workspace\`) is engineered as a plug-and-play extension point for your competition modules.\n\n#### How to integrate your custom module:\n1. **Database Models**: Define new entities in \`prisma/schema.prisma\` related to \`User\`.\n2. **Feature Routes**: Create routes inside \`src/app/(dashboard)/workspace/\` or your own subfolder.\n3. **Navigation Links**: Register links in \`src/components/navigation/UserSidebar.tsx\`.\n4. **Security Enforcement**: Validate user sessions with \`auth()\` from \`@/lib/auth\`.\n\nWould you like guidance on adding a specific feature?`,
      suggestions: [
        "Go to Workspace (/workspace)",
        "Show platform tech stack",
        "How to add database models?",
      ],
    };
  }

  // Profile, Password & Settings
  if (q.includes("profile") || q.includes("password") || q.includes("avatar") || q.includes("bio") || q.includes("setting")) {
    return {
      content: `### 👤 Managing Your Profile\n\nYou can customize your identity in **Profile Settings** (\`/profile\`):\n\n* **Personal Info**: Update your display name, bio, phone, location, and website.\n* **Social Links**: Connect your GitHub, LinkedIn, Twitter/X, and Instagram profiles.\n* **Profile Picture**: Upload or change your custom avatar (supports Google, GitHub, and custom images).\n* **Security**: Change your password or review your connected OAuth accounts.`,
      suggestions: [
        "Go to Profile (/profile)",
        "How does Google login work?",
        "What is my current role?",
      ],
    };
  }

  // Platform overview & tech stack
  if (q.includes("what is vertex") || q.includes("tech stack") || q.includes("platform") || q.includes("framework") || q.includes("about")) {
    return {
      content: `### ⚡ About Vertex Platform\n\nVertex is an enterprise-grade web application platform engineered with modern SaaS design standards:\n\n* ⚡ **Framework**: Next.js 16 (Turbopack + App Router)\n* 🎨 **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens (Linear/Vercel inspired)\n* 🔐 **Authentication**: NextAuth.js v5 (Auth.js) with Google OAuth, GitHub, and Credentials\n* 🗄️ **Database**: Prisma ORM 6 with SQLite (\`prisma/dev.db\`)\n* 📊 **Analytics & UI**: Recharts, Lucide Icons, Framer Motion, and Sonner Toasts.`,
      suggestions: [
        "What are the available roles?",
        "How does Google OAuth work?",
        "Tell me about the Workspace",
      ],
    };
  }

  // Google OAuth
  if (q.includes("google") || q.includes("oauth") || q.includes("login") || q.includes("signin")) {
    return {
      content: `### 🔑 Authentication & Google OAuth\n\nVertex supports direct one-click authentication:\n* **Google OAuth**: Log in securely with your Google account. Your avatar, name, and email are automatically synchronized.\n* **Redirect URL**: Configured with \`http://localhost:3000/api/auth/callback/google\`.\n* **Credentials**: You can also register and log in with email and password (hashed with bcrypt with 12 salt rounds).`,
      suggestions: [
        "What is the difference between roles?",
        "How to edit my profile?",
        "Show platform tech stack",
      ],
    };
  }

  // Support / Help Desk
  if (q.includes("support") || q.includes("contact") || q.includes("help") || q.includes("issue") || q.includes("problem")) {
    return {
      content: `### 🆘 Vertex Support & Help Desk\n\nIf you need assistance or encounter an issue:\n* 💬 **Chat with Copilot**: You can ask me any question about the platform right here.\n* 🛡️ **Contact Admin**: System administrators can review security logs and support requests from the Admin Console.\n* 📧 **Support Email**: Configured in platform settings (\`support@vertex.app\`).`,
      suggestions: [
        "What is my current role?",
        "How to edit my profile?",
        "Tell me about Vertex Platform",
      ],
    };
  }

  // Default intelligent response
  return {
    content: `I understand you are asking about: **"${query}"**.\n\nAs **Vertex Copilot**, I can assist you with:\n1. 🧭 **Navigation**: Directing you to Dashboard, Profile, or Admin tools.\n2. 🛡️ **Role Guidance**: Explaining USER, ADMIN, and SUPER_ADMIN capabilities.\n3. 🚀 **Workspace Development**: Assisting with competition modules and database models.\n4. 💡 **Platform Features**: Real-time notifications, audit logs, and settings.\n\n*Tip: You can also connect a Google Gemini API key (\`AIzaSy...\`) in \`.env.local\` to unlock open-ended conversational AI capabilities!*`,
    suggestions: [
      "What is Vertex Platform?",
      "What is the difference between roles?",
      "How to edit my profile?",
      "Tell me about Competition Workspace",
    ],
  };
}

function getDynamicSuggestions(query: string): string[] {
  const q = query.toLowerCase();
  if (q.includes("code") || q.includes("build")) {
    return ["How do I add a new route?", "Prisma schema guide", "Workspace architecture"];
  }
  if (q.includes("role") || q.includes("admin")) {
    return ["What is SUPER_ADMIN?", "How to invite an Admin?", "View Audit Logs"];
  }
  return [
    "What is Vertex Platform?",
    "How to edit my profile?",
    "What is the Workspace?",
    "Explain platform roles",
  ];
}
