"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GithubIcon, LayoutDashboard, Settings } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  // Check if a path is active
  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <LayoutDashboard className="h-6 w-6" />
            <span className="hidden sm:inline-block font-bold">
              AI Model Benchmarking
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/benchmark"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/benchmark") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Benchmark
            </Link>
            <Link
              href="/models"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/models") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Models
            </Link>
            <Link
              href="/reports"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/reports") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Reports
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://github.com/yourusername/ai-model-benchmarking-tool" target="_blank" rel="noopener noreferrer">
              <GithubIcon className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
