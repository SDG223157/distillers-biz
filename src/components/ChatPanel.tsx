"use client";

import { useState, useRef, useEffect } from "react";
import type { DistillationType } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPanel({
  slug,
  title,
  type,
}: {
  slug: string;
  title: string;
  type: DistillationType;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || streaming) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, messages: newMessages }),
      });

      if (!res.ok || !res.body) throw new Error("Chat failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const { text } = JSON.parse(data);
              if (text) {
                fullText += text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: fullText,
                  };
                  return updated;
                });
              }
            } catch {
              /* skip malformed chunks */
            }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        };
        return updated;
      });
    }

    setStreaming(false);
  }

  const isPerson = type === "person";
  const placeholder = isPerson
    ? `Ask ${title} anything...`
    : `Ask about ${title}...`;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-500/20 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-500/30"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
          />
        </svg>
        {isPerson ? `Chat with ${title}` : `Ask about ${title}`}
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 flex h-[600px] w-full flex-col border-l border-t border-white/10 bg-zinc-950/95 backdrop-blur-xl sm:bottom-6 sm:right-6 sm:h-[550px] sm:w-[420px] sm:rounded-2xl sm:border">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-sm">
            {isPerson ? "🧠" : "💬"}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              {isPerson ? title : `About ${title}`}
            </div>
            <div className="text-xs text-zinc-500">
              {isPerson
                ? "Thinking with their mental models"
                : "Powered by distilled knowledge"}
            </div>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 text-3xl">{isPerson ? "🧠" : "⚗️"}</div>
            <p className="text-sm text-zinc-400">
              {isPerson
                ? `I'm ${title}. Ask me anything — I'll answer using my mental models and thinking frameworks.`
                : `Ask me anything about ${title}. I'll answer from the distilled knowledge.`}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {(isPerson
                ? [
                    `How would you approach AI regulation?`,
                    `What's your biggest mistake?`,
                    `How do you make decisions?`,
                  ]
                : [
                    `Explain this simply`,
                    `What are the key takeaways?`,
                    `How does this apply today?`,
                  ]
              ).map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="rounded-lg border border-white/5 bg-zinc-900/50 px-2.5 py-1 text-xs text-zinc-500 transition-colors hover:border-amber-500/20 hover:text-zinc-300"
                >
                  {q}
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
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-amber-500/15 text-amber-100"
                  : "bg-zinc-800/80 text-zinc-300"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.role === "assistant" && streaming && i === messages.length - 1 && (
                <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-amber-500/60" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-white/5 p-3">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={streaming}
            className="flex-1 rounded-xl border border-white/10 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="rounded-xl bg-amber-500 px-3.5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-amber-400 disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
