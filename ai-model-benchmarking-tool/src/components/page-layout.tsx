"use client";

import type { ReactNode } from "react";
import { Navigation } from "./navigation";
import { Toaster } from "sonner";

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <div className="container py-6 md:py-8 space-y-6">
          {children}
        </div>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            AI Model Benchmarking Tool - Performance analysis for machine learning models
          </p>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Model Benchmark Inc.
          </p>
        </div>
      </footer>
      <Toaster position="top-right" />
    </div>
  );
}
