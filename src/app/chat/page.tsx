"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import TypeBadge from "@/components/TypeBadge";
import { TYPE_META, type DistillationType } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DistillEntry {
  slug: string;
  title: string;
  type: DistillationType;
  subtitle: string | null;
  essence: string | null;
}

export default function MixedChatPage() {
  const [entries, setEntries] = useState<DistillEntry[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/chat-mixed")
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || streaming) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    setMessages([...newMessages, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat-mixed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) throw new Error("Failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const { text } = JSON.parse(data);
              if (text) {
                fullText += text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: fullText };
                  return updated;
                });
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Something went wrong. Try again." };
        return updated;
      });
    }
    setStreaming(false);
  }

  const starters = [
    "What connections exist between my distillations?",
    "Compare the thinking styles of the people I've distilled",
    "What's the most surprising insight across all topics?",
    "If Elon Musk debated Stoicism, what would he say?",
    "What mental models apply across all my distilled knowledge?",
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left: Knowledge base */}
      <div className="hidden w-72 shrink-0 overflow-y-auto border-r border-white/5 bg-zinc-950 lg:block">
        <div className="p-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Knowledge Base
          </h2>
          <p className="mt-1 text-[11px] text-zinc-600">
            {entries.length} distillation{entries.length !== 1 ? "s" : ""} loaded
          </p>
        </div>
        <div className="space-y-0.5 px-2 pb-4">
          {entries.map((e) => (
            <a
              key={e.slug}
              href={`/d/${e.slug}`}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/5"
            >
              <span className="text-xs">{TYPE_META[e.type]?.icon || "📄"}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-zinc-300">
                  {e.title}
                </div>
              </div>
            </a>
          ))}
          {entries.length === 0 && (
            <p className="px-2 text-xs text-zinc-600">
              No distillations yet.{" "}
              <a href="/" className="text-amber-400 underline">Create one</a>
            </p>
          )}
        </div>
      </div>

      {/* Right: Chat */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="border-b border-white/5 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 text-lg">
              ⚗️
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Mixed Chat</h1>
              <p className="text-xs text-zinc-500">
                Chat across all {entries.length} distillations — find connections, simulate debates
              </p>
            </div>
          </div>

          {/* Mini badges on mobile */}
          <div className="mt-2 flex flex-wrap gap-1 lg:hidden">
            {entries.slice(0, 8).map((e) => (
              <span key={e.slug} className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                {TYPE_META[e.type]?.icon} {e.title}
              </span>
            ))}
            {entries.length > 8 && (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
                +{entries.length - 8} more
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 text-4xl">⚗️</div>
              <h2 className="text-lg font-semibold text-white">
                Cross-Distillation Chat
              </h2>
              <p className="mt-2 max-w-md text-sm text-zinc-400">
                Ask questions that span all your distilled knowledge. Find connections
                between concepts, simulate debates between thinkers, or explore ideas
                through multiple lenses at once.
              </p>
              <div className="mt-6 flex max-w-lg flex-wrap justify-center gap-2">
                {starters.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="rounded-lg border border-white/5 bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:border-amber-500/20 hover:text-zinc-300"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-amber-500/15 text-amber-100"
                    : "bg-zinc-800/80 text-zinc-300"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="chat-markdown">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {streaming && i === messages.length - 1 && (
                      <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-amber-500/60" />
                    )}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="border-t border-white/5 px-6 py-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask across all distillations..."
              disabled={streaming}
              className="flex-1 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500/50 disabled:opacity-50"
              autoFocus
            />
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-amber-400 disabled:opacity-40"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
