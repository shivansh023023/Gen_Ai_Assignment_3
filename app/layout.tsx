import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "NotebookLM Clone RAG App",
  description: "A production-ready RAG application using Next.js, LangChain, OpenAI, and Qdrant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans dark", inter.variable)}>
      <body
        className="antialiased min-h-screen bg-background text-foreground"
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
