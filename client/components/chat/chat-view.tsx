"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Check,
  Copy,
  ExternalLink,
  FileCode,
  GitBranch,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "cn";

import { useRepository, useIndexStatus } from "@/hooks/use-repos";
import { api, type Citation } from "@/lib/api";
import { IndexingState } from "./indexing-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { LoadingScreen } from "@/components/loading-ui/loading-screen";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
};

const STARTER_PROMPTS = [
  "What is the overall architecture and main purpose of this codebase?",
  "Where are the main entry points, configurations, and routes located?",
  "Explain how the core services and components interact with each other.",
  "What dependencies, frameworks, or database models does this project rely on?",
];

export default function ChatView({ repoId }: { repoId: string }) {
  const repoQuery = useRepository(repoId);
  const statusQuery = useIndexStatus(repoId, true);

  const repo = repoQuery.data;
  const status = statusQuery.data;
  const effectiveStatus = status?.indexStatus ?? repo?.indexStatus;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Initial welcome message once ready
  useEffect(() => {
    if (effectiveStatus === "READY" && repo && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hello! I have indexed **${repo.fullName}** (${(status?.chunkCount ?? repo.chunkCount).toLocaleString()} code chunks). Feel free to ask me anything about the architecture, implementation details, functions, or configurations.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [effectiveStatus, repo, status?.chunkCount, messages.length]);

  const handleSend = async (messageText?: string) => {
    const text = (messageText ?? input).trim();
    if (!text || isSending || !repo) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const response = await api.chat(repo.id, text);
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.reply,
        citations: response.citations,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get response from AI";
      toast.add({
        title: "Chat Error",
        description: errorMessage,
        type: "error",
      });
      const errorMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `Sorry, I encountered an error while processing your question: *${errorMessage}*. Please make sure the repository is fully indexed and try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleClearHistory = () => {
    if (!repo) return;
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: `Chat history cleared. What would you like to explore next in **${repo.fullName}**?`,
        timestamp: new Date(),
      },
    ]);
  };

  // Loading repo details
  if (repoQuery.isLoading) {
    return (
      <LoadingScreen
        message="Loading repository..."
        submessage="Connecting codebase context and semantic index"
      />
    );
  }

  // Not found or error
  if (repoQuery.isError || !repo) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background px-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-semibold">Repository Not Found</h2>
          <p className="text-sm text-muted-foreground">
            We couldn't load this repository. It may not exist or you might not have permission to view it.
          </p>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "default" }), "gap-2")}
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // If INDEXING, PENDING, or FAILED: show IndexingState
  if (effectiveStatus !== "READY") {
    return (
      <div className="flex h-screen w-full flex-col bg-background">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 gap-1.5 px-2 text-xs"
              )}
            >
              <ArrowLeft className="size-3.5" />
              Repositories
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-semibold">{repo.fullName}</span>
          </div>
          <Badge
            variant="outline"
            className={
              effectiveStatus === "INDEXING"
                ? "border-primary/40 text-primary"
                : effectiveStatus === "FAILED"
                  ? "border-destructive/40 text-destructive"
                  : "text-muted-foreground"
            }
          >
            {effectiveStatus === "INDEXING" && (
              <Loader2 className="size-3 animate-spin mr-1" />
            )}
            {effectiveStatus}
          </Badge>
        </header>
        <main className="flex flex-1 items-center justify-center p-6">
          <IndexingState repo={repo} status={status} />
        </main>
      </div>
    );
  }

  // Repository is READY: render Interactive Chat View
  return (
    <div className="flex h-screen w-full flex-col bg-background">
      {/* Top Navigation / Repository Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card/60 px-4 backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 gap-1.5 px-2 text-xs"
            )}
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">Repositories</span>
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold">{repo.fullName}</span>
            <Badge variant="secondary" className="hidden sm:inline-flex h-5 gap-1 rounded-full px-2 text-[10px]">
              <GitBranch className="size-2.5" />
              {repo.defaultBranch || "main"}
            </Badge>
            <Badge variant="outline" className="hidden md:inline-flex h-5 border-emerald-500/30 text-[10px] text-emerald-600 dark:text-emerald-400">
              <Check className="size-2.5 mr-0.5" />
              {(status?.chunkCount ?? repo.chunkCount).toLocaleString()} chunks
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Clear chat conversation"
          >
            <RotateCcw className="size-3.5 mr-1" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 gap-1 px-2.5 text-xs"
            )}
          >
            <ExternalLink className="size-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      {/* Chat Messages Scroll Container */}
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-sm ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-xl border ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-primary border-border"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="size-4" />
                ) : (
                  <Sparkles className="size-4" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={`flex max-w-[85%] sm:max-w-[78%] flex-col gap-2 rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-card border border-border/70 text-card-foreground shadow-sm"
                }`}
              >
                <div className="leading-relaxed">
                  {msg.role === "assistant" ? (
                    <FormattedAssistantMessage content={msg.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>

                {/* Citations Pill list */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-border/50">
                    <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1.5">
                      <FileCode className="size-3 text-primary" />
                      Relevant sources from codebase:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((cite, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-2 py-0.5 text-[11px] font-mono text-muted-foreground hover:bg-muted"
                          title={`${cite.filePath} (lines ${cite.startLine}-${cite.endLine})`}
                        >
                          <span className="truncate max-w-[200px]">
                            {cite.filePath.split("/").pop()}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70">
                            :L{cite.startLine}-{cite.endLine}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Assistant is thinking indicator */}
          {isSending && (
            <div className="flex gap-3 text-sm">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border bg-muted text-primary border-border">
                <Sparkles className="size-4 animate-spin text-primary" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card px-4 py-3 text-muted-foreground text-xs shadow-sm">
                <Loader2 className="size-3.5 animate-spin text-primary" />
                Analyzing repository context and generating response...
              </div>
            </div>
          )}

          {/* Starter prompt cards if only welcome message is present */}
          {messages.length === 1 && !isSending && (
            <div className="mt-4 pt-4">
              <p className="mb-2.5 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Bot className="size-3.5 text-primary" />
                Suggested questions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="flex text-left items-start gap-2 rounded-xl border border-border/70 bg-card/60 p-3 text-xs transition-colors hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                  >
                    <span className="text-primary font-bold">Q:</span>
                    <span className="text-card-foreground leading-normal">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Bottom Message Input Bar */}
      <footer className="shrink-0 border-t bg-card/60 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="relative flex items-center rounded-2xl border border-border bg-background focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-sm"
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask DevPilot anything about ${repo.name}... (Enter to send, Shift+Enter for new line)`}
              className="flex-1 resize-none bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none min-h-[46px] max-h-32"
            />
            <div className="pr-2">
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || isSending}
                className="size-8 rounded-xl p-0 bg-primary text-primary-foreground disabled:opacity-40"
              >
                {isSending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </form>
          <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
            DevPilot answers based on embeddings retrieved from pgvector. Press Enter to send.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Markdown-like formatting helper for assistant messages (code blocks, bold, lists)
function FormattedAssistantMessage({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const firstLine = lines[0].trim();
          const hasLang = firstLine && !firstLine.includes(" ");
          const language = hasLang ? firstLine : "";
          const code = hasLang ? lines.slice(1).join("\n") : lines.join("\n");

          return (
            <CodeBlock key={index} code={code} language={language} />
          );
        }

        // Render paragraphs
        const paragraphs = part.split("\n\n").filter(Boolean);
        return (
          <div key={index} className="space-y-2">
            {paragraphs.map((p, pIdx) => (
              <p key={pIdx} className="whitespace-pre-wrap">
                {renderInlineFormatting(p)}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-2 overflow-hidden rounded-xl border border-border/80 bg-zinc-950 font-mono text-xs dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-3.5 py-1.5 text-[11px] text-zinc-400">
        <span>{language || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-zinc-400 transition-colors hover:text-zinc-100 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 text-zinc-100 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderInlineFormatting(text: string): React.ReactNode {
  // Simple regex parser for `inline code` and **bold**
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  const tokens = text.split(regex);

  return tokens.map((token, i) => {
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[12px] font-semibold text-primary"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    }
    return token;
  });
}
