"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, User, Bot, FileText, Loader2, ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sources?: Record<string, any>[];
};

function ChatInterface() {
  const searchParams = useSearchParams();
  const collectionName = searchParams.get("collection");
  const filename = searchParams.get("filename") || "Document";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          collectionName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const sourcesHeader = response.headers.get("x-sources");
      let sources = [];
      if (sourcesHeader) {
        sources = JSON.parse(atob(sourcesHeader));
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;

      setMessages((prev) => [...prev, { role: "assistant", content: "", sources }]);

      while (!done && reader) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === "assistant") {
              lastMessage.content += chunk;
            }
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, there was an error processing your request." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans">
      <aside className="w-64 border-r bg-muted/20 flex flex-col hidden md:flex">
        <div className="p-4 border-b">
          <Link href="/">
            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Button>
          </Link>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Active Document
          </h2>
        </div>
        <div className="p-4 flex-1">
          <div className="bg-background rounded-lg p-3 border shadow-sm break-words text-sm font-medium">
            {filename}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Collection ID: {collectionName?.substring(0, 15)}...</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden border-b p-4 flex items-center gap-2 bg-background z-10">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <span className="font-semibold text-sm truncate">{filename}</span>
        </header>

        <ScrollArea className="flex-1 p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground mt-20">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Ask questions about your document</h3>
                <p className="text-sm">The AI will use retrieved chunks from your document to answer.</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === "assistant" ? "flex-row" : "flex-row-reverse"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border"}`}>
                    {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`p-4 rounded-2xl ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none"}`}>
                      <div className="prose dark:prose-invert max-w-none text-sm break-words">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 w-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-muted-foreground p-0 hover:bg-transparent"
                          onClick={() => setExpandedSources(expandedSources === idx ? null : idx)}
                        >
                          {expandedSources === idx ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                          {msg.sources.length} sources retrieved
                        </Button>
                        
                        {expandedSources === idx && (
                          <div className="mt-2 space-y-2">
                            {msg.sources.map((source, sIdx) => (
                              <div key={sIdx} className="bg-background border rounded p-3 text-xs text-muted-foreground">
                                <div className="font-semibold text-foreground mb-1">
                                  Source {sIdx + 1} • {source.metadata.source} {source.metadata.page ? `(Page ${source.metadata.page})` : ""}
                                </div>
                                <div className="line-clamp-3 hover:line-clamp-none transition-all">{source.content}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl bg-muted rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 bg-background border-t">
          <div className="max-w-3xl mx-auto relative">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about the document..."
                className="pr-12 rounded-full h-12 bg-muted/50 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary/50"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 h-9 w-9 rounded-full"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <div className="text-center text-xs text-muted-foreground mt-2">
              AI can make mistakes. Verify important information.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2" /> Loading...</div>}>
      <ChatInterface />
    </Suspense>
  );
}
