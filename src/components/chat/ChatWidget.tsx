"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Trash2,
  Copy,
  Check,
  Minimize2,
  Maximize2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface ChatMessageItem {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string | Date;
  provider?: string;
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  "What is Vertex Platform?",
  "What is the difference between roles?",
  "How to edit my profile?",
  "Tell me about the Workspace",
];

export function ChatWidget() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen, isMinimized]);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/chat/history?channel=ai");
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          // Add default welcome message
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: `Hello **${
                session?.user?.name || "there"
              }**! 👋 Welcome to **Vertex Copilot**.\n\nI am your platform AI assistant. Ask me anything about Vertex, roles, workspace integration, or account features!`,
              createdAt: new Date().toISOString(),
              suggestions: DEFAULT_SUGGESTIONS,
            },
          ]);
        }
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessageId = "temp-" + Date.now();
    const newUserMsg: ChatMessageItem = {
      id: userMessageId,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, channel: "ai" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMsg: ChatMessageItem = {
        id: data.message.id,
        role: "assistant",
        content: data.message.content,
        createdAt: data.message.createdAt,
        provider: data.message.provider,
        suggestions: data.message.suggestions,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to communicate with Vertex Copilot");
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: "⚠️ I encountered an issue processing your request. Please try again in a moment.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch("/api/chat/history?channel=ai", { method: "DELETE" });
      if (res.ok) {
        setMessages([
          {
            id: "welcome-reset",
            role: "assistant",
            content: "Conversation history cleared! How can I assist you now?",
            createdAt: new Date().toISOString(),
            suggestions: DEFAULT_SUGGESTIONS,
          },
        ]);
        toast.success("Chat history cleared");
      }
    } catch {
      toast.error("Failed to clear history");
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copied to clipboard");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "60px" : "560px",
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[380px] max-w-[calc(100vw-32px)] mb-3 rounded-2xl border shadow-2xl flex flex-col overflow-hidden"
            style={{
              background: "var(--color-white)",
              borderColor: "var(--color-border)",
              boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--color-border)",
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between border-b select-none"
              style={{
                background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)",
                color: "#ffffff",
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <Sparkles size={16} className="text-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm tracking-tight text-white">Vertex Copilot</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_#34d399]" />
                  </div>
                  <p className="text-[11px] text-white/80">AI Platform Assistant</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-white/80">
                <button
                  type="button"
                  onClick={handleClearHistory}
                  title="Clear conversation"
                  className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? "Expand" : "Minimize"}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                  }}
                  title="Close chat"
                  className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            {!isMinimized && (
              <>
                <div
                  className="flex-1 p-4 overflow-y-auto space-y-4"
                  style={{ background: "var(--color-surface)" }}
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white shadow-xs"
                          style={{ background: "var(--color-accent)" }}
                        >
                          <Bot size={14} />
                        </div>
                      )}

                      <div
                        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed relative group ${
                          msg.role === "user"
                            ? "text-white rounded-br-xs shadow-xs"
                            : "rounded-bl-xs border shadow-xs"
                        }`}
                        style={{
                          background: msg.role === "user" ? "var(--color-accent)" : "var(--color-white)",
                          color: msg.role === "user" ? "#ffffff" : "var(--color-text-primary)",
                          borderColor: msg.role === "user" ? "transparent" : "var(--color-border)",
                        }}
                      >
                        {/* Message Content */}
                        <div className="whitespace-pre-wrap break-words">
                          <FormattedText text={msg.content} isUser={msg.role === "user"} />
                        </div>

                        {/* Copy button on hover for assistant messages */}
                        {msg.role === "assistant" && (
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-surface-elevated rounded transition-opacity text-text-muted hover:text-text-primary"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        )}

                        {/* Suggestions pills if present */}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-border/50 flex flex-wrap gap-1.5">
                            {msg.suggestions.map((sug, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleSend(sug)}
                                className="text-[11px] px-2.5 py-1 rounded-full border transition-all text-left"
                                style={{
                                  background: "var(--color-surface)",
                                  borderColor: "var(--color-border-strong)",
                                  color: "var(--color-text-secondary)",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = "var(--color-accent)";
                                  e.currentTarget.style.color = "var(--color-accent)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = "var(--color-border-strong)";
                                  e.currentTarget.style.color = "var(--color-text-secondary)";
                                }}
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {msg.role === "user" && (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-text-secondary border shadow-xs"
                          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
                        >
                          <UserIcon size={14} />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading Typing Indicator */}
                  {loading && (
                    <div className="flex gap-2.5 justify-start">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                        style={{ background: "var(--color-accent)" }}
                      >
                        <Bot size={14} />
                      </div>
                      <div
                        className="rounded-2xl rounded-bl-xs px-3.5 py-2.5 border shadow-xs flex items-center gap-1.5"
                        style={{
                          background: "var(--color-white)",
                          borderColor: "var(--color-border)",
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" />
                        <span className="text-[11px] text-text-muted ml-1 font-medium">Vertex is thinking…</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div
                  className="p-3 border-t flex items-end gap-2"
                  style={{
                    background: "var(--color-white)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Vertex Copilot anything…"
                    className="flex-1 resize-none max-h-24 py-2 px-3 text-[13px] rounded-xl border outline-none focus:ring-1 transition-all"
                    style={{
                      background: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSend()}
                    disabled={!input.trim() || loading}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-white flex-shrink-0 shadow-xs"
                    style={{
                      background: "var(--color-accent)",
                    }}
                    title="Send message (Enter)"
                  >
                    {loading ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setHasUnread(false);
          setIsMinimized(false);
        }}
        className="relative w-13 h-13 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer transition-shadow"
        style={{
          background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)",
          boxShadow: "0 8px 25px -4px rgba(45, 106, 79, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.2)",
        }}
        aria-label="Open Vertex Chat Copilot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageSquare size={22} />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

// Clean Formatter for Markdown / Bold / Code / Bullet Points
function FormattedText({ text, isUser }: { text: string; isUser?: boolean }) {
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        // Multi-line code block
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const firstLine = lines[0]?.trim();
          const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const code = (hasLang ? lines.slice(1) : lines).join("\n");

          return (
            <pre
              key={index}
              className="my-2 p-2.5 rounded-lg text-[11.5px] font-mono overflow-x-auto border"
              style={{
                background: isUser ? "rgba(0,0,0,0.2)" : "var(--color-surface)",
                borderColor: isUser ? "rgba(255,255,255,0.2)" : "var(--color-border)",
                color: isUser ? "#ffffff" : "var(--color-text-primary)",
              }}
            >
              <code>{code}</code>
            </pre>
          );
        }

        // Inline code
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={index}
              className="px-1.5 py-0.5 rounded text-[12px] font-mono"
              style={{
                background: isUser ? "rgba(0,0,0,0.25)" : "var(--color-surface)",
                color: isUser ? "#ffffff" : "var(--color-accent-text)",
              }}
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        // Bold text
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
}
