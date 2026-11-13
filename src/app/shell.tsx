"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Star,
  Compass,
  Search,
  BarChart3,
  BookOpen,
  ShieldCheck,
  Save,
  FileText,
  Settings,
  ChevronLeft,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  LogIn,
  User,
  Globe,
  Layers,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { getSessionUser } from "@/server/auth";

const NAV = [
  { href: "/", label: "Universe", icon: Star },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/metrics", label: "PM Metrics Lab", icon: BarChart3 },
  { href: "/playbook", label: "PM Playbook", icon: BookOpen },
  { href: "/compare", label: "Compare", icon: ShieldCheck },
  { href: "/saved", label: "Saved Research", icon: Save },
  { href: "/reports", label: "Reports", icon: FileText },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<{ name?: string | null; settings?: { theme?: string } | null } | null>(null);
  const [theme, setTheme] = useState("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("orbitory-theme");
      const wantsDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setTheme(wantsDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", wantsDark);
      document.documentElement.style.colorScheme = wantsDark ? "dark" : "light";
    } catch {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (mounted) setSession(data.user ?? null);
        } else if (mounted) setSession(null);
      } catch {
        if (mounted) setSession(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const active = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <div className="relative min-h-dvh bg-background">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" />
      <aside
        className={cn(
          "fixed z-40 left-0 top-0 h-full w-64 border-r border-border bg-card/70 backdrop-blur-xl transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0 md:w-64 md:border-r md:border-border",
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/60">
          <Link href="/" className="flex items-center gap-2" aria-label="Orbitory home">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_40px_-12px_hsl(var(--signal)/0.8)]">
              <Star className="h-5 w-5" />
            </span>
            <span className="font-display font-semibold tracking-tight">Orbitory</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-md text-muted-foreground hover:bg-accent/30"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="px-3 py-4 space-y-0.5" aria-label="Product navigation">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_-10px_hsl(var(--signal)/0.3)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/30 hover:border-border/50",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-4 py-6 border-t border-border/60">
          <div className="space-y-2">
            <button
              onClick={() => {
                const next = theme === "dark" ? "light" : "dark";
                setTheme(next);
                localStorage.setItem("orbitory-theme", next);
                document.documentElement.classList.toggle("dark", next === "dark");
                document.documentElement.style.colorScheme = next;
              }}
              className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span>{theme === "dark" ? "Light theme" : "Dark theme"}</span>
            </button>
            {session ? (
              <>
                <Link
                  href="/admin"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all"
                >
                  <Settings className="h-4 w-4" />
                  <span>Research workspace</span>
                </Link>
                <button
                  onClick={() => router.push("/api/auth/logout")}
                  className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-3 w-full rounded-xl border border-border px-3 py-2.5 text-sm text-foreground hover:bg-accent transition-all"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign in</span>
              </Link>
            )}
          </div>
        </div>
      </aside>

      <header className={cn("sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-md", sidebarOpen ? "" : "md:pl-64")}>
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="md:hidden p-1.5 rounded-md text-muted-foreground hover:bg-accent/30"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            {pathname !== "/" && (
              <button
                onClick={() => router.push("/")}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/30 transition"
                aria-label="Back to Universe"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-2xl px-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search companies, industries, metrics…"
                className="w-full rounded-full border border-input bg-input/50 px-4 py-2 pl-10 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                onChange={(e) => {
                  const q = e.currentTarget.value;
                  if (!q) {
                    router.push("/explore");
                    return;
                  }
                  router.push(`/explore?q=${encodeURIComponent(q)}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const q = (e.currentTarget as HTMLInputElement).value;
                    router.push(`/explore?q=${encodeURIComponent(q)}`);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session ? (
              <button className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/30 transition" aria-label="User profile">
                <User className="h-5 w-5" />
              </button>
            ) : (
              <Link href="/login" className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-[0_0_30px_-8px_hsl(var(--signal)/0.7)] transition hover:brightness-105">
                Sign in
              </Link>
            )}
          </div>
        </div>
        <div className="hidden md:flex justify-center md:pl-64 pb-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Universe of Business
          </span>
        </div>
      </header>

      <main className="pt-4 md:pl-64 pb-16">{children}</main>

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
