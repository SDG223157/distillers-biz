import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Distillers — Distill Anything Into Its Essence",
  description:
    "Distill concepts, formulas, events, history, and philosophy into structured, actionable knowledge artifacts.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://distillers.biz"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <Header />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
