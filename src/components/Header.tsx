"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SessionUser {
  name?: string;
  email?: string;
  image?: string;
}

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setUser(d?.user || null))
      .catch(() => {});
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-sm font-bold text-black">
            D
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            distillers
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1">
            <NavLink href="/" active={pathname === "/"}>Home</NavLink>
            <NavLink href="/gallery" active={pathname === "/gallery"}>Gallery</NavLink>
            <NavLink href="/chat" active={pathname === "/chat"}>Mixed Chat</NavLink>
          </nav>

          {user && (
            <div className="flex items-center gap-2 border-l border-white/5 pl-3">
              {user.image && (
                <img src={user.image} alt="" className="h-7 w-7 rounded-full" />
              )}
              <a
                href="/api/auth/signout"
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                Sign out
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
        active
          ? "bg-white/10 text-white"
          : "text-zinc-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
