"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Search, ZoomIn, ZoomOut, RefreshCw, List, ChevronRight, Filter, Globe, Star as StarIcon, X } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type Company = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  foundedAt: string | null;
  headquarters: string | null;
  website: string | null;
  logoUrl: string | null;
  companyStatus: string;
  businessModel: string;
  researchStatus: string;
  industries: Array<{ name: string; slug: string; color: string | null }>;
  niches: Array<{ name: string; slug: string }>;
  counts: { products: number; timelineEvents: number; metrics: number; claims: number };
};

type Industry = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  companyCount: number;
  companies: Company[];
};

function seededHash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0) / 0xffffffff;
}
function random(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
function seededRandom(seed: number, idx: number) {
  return random(seed + idx * 0.3183098861837907);
}

function hexToRgba(hex: string, alpha: number) {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function statusColor(status: string) {
  switch (status) {
    case "ACTIVE": return "#34d399";
    case "ACQUIRED": return "#60a5fa";
    case "IPO": return "#a855f7";
    case "CLOSED": return "#f87171";
    default: return "#94a3b8";
  }
}

export default function UniversePage() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightSlug, setHighlightSlug] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [showPreview, setShowPreview] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const industryNodes = useRef<Map<string, { x: number; y: number; r: number }>>(new Map());
  const starPoints = useRef<{ x: number; y: number; size: number; alpha: number }[]>([]);
  const nebulae = useRef<{ x: number; y: number; r: number; color: string }[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/industries", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load industries");
        const data = await res.json();
        setIndustries(data.industries);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load universe");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!industries.length) return;
    const nodes = new Map<string, { x: number; y: number; r: number }>();
    const n = industries.length;
    const angleStep = (2 * Math.PI) / n;

    // Nebula background blobs
    const neb: { x: number; y: number; r: number; color: string }[] = [];
    for (let i = 0; i < 8; i++) {
      neb.push({
        x: (seededRandom(i, 10) - 0.5) * 2600,
        y: (seededRandom(i, 11) - 0.5) * 1800,
        r: 400 + seededRandom(i, 12) * 600,
        color: industries[Math.floor(i % industries.length)]!.color ?? "#6366f1",
      });
    }
    nebulae.current = neb;

    industries.forEach((ind, i) => {
      // Spiral galaxy arrangement
      const angle = i * angleStep;
      const r = 420 + i * 55;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      nodes.set(ind.id, { x, y, r: 90 + ind.companyCount * 3 });
    });
    industryNodes.current = nodes;

    const stars: { x: number; y: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 320; i++) {
      stars.push({
        x: (seededRandom(i, 20) - 0.5) * 2600,
        y: (seededRandom(i, 21) - 0.5) * 1800,
        size: seededRandom(i, 22) * 1.8 + 0.3,
        alpha: seededRandom(i, 23),
      });
    }
    starPoints.current = stars;
  }, [industries]);

  const allCompanies = useMemo(() => industries.flatMap((i) => i.companies), [industries]);
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return allCompanies;
    return allCompanies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.shortDescription ?? "").toLowerCase().includes(q) ||
        c.industries.some((ii) => ii.name.toLowerCase().includes(q)) ||
        c.niches.some((nn) => nn.name.toLowerCase().includes(q)),
    );
  }, [searchQuery, allCompanies]);

  const pan = useCallback((dx: number, dy: number) => {
    setViewTransform((t) => ({ x: t.x + dx, y: t.y + dy, scale: t.scale }));
  }, []);
  const zoom = useCallback((factor: number) => {
    setViewTransform((t) => ({ x: t.x, y: t.y, scale: Math.min(5, Math.max(0.3, t.scale * factor)) }));
  }, []);
  const reset = useCallback(() => setViewTransform({ x: 0, y: 0, scale: 1 }), []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const { x: tx, y: ty, scale } = viewTransform;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const wx = (mx - cx) / scale - tx;
      const wy = (my - cy) / scale - ty;
      const best: { company: Company | null; dist: number } = { company: null, dist: 1 / scale };
      for (const ind of industries) {
        const node = industryNodes.current.get(ind.id);
        if (!node) continue;
        const count = ind.companies.length;
        if (count === 0) continue;
        const radius = node.r * 0.8;
        ind.companies.forEach((c, i) => {
          const angle = (i / Math.max(count, 1)) * 2 * Math.PI + seededRandom(hashCode(c.id), 30);
          const px = node.x + radius * Math.cos(angle);
          const py = node.y + radius * Math.sin(angle);
          const d = Math.hypot(wx - px, wy - py);
          if (!best.company || d < best.dist) {
            best.company = c;
            best.dist = d;
          }
        });
      }
      if (best.company) {
        setSelectedCompany(best.company);
        setShowPreview(true);
        setHighlightSlug(best.company.slug);
      }
    },
    [industries, viewTransform],
  );

  function hashCode(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return h;
  }

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const { x: tx, y: ty, scale } = viewTransform;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const toScreen = (wx: number, wy: number): [number, number] => [cx + (wx + tx) * scale, cy + (wy + ty) * scale];

    // Stars
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);
    for (const s of starPoints.current) {
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Nebulae
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);
    for (const nb of nebulae.current) {
      const grad = ctx.createRadialGradient(nb.x, nb.y, 0, nb.x, nb.y, nb.r);
      grad.addColorStop(0, hexToRgba(nb.color, 0.04));
      grad.addColorStop(1, hexToRgba(nb.color, 0.0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(nb.x, nb.y, nb.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Industry orbits
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.06)";
    ctx.lineWidth = 1;
    for (const ind of industries) {
      const node = industryNodes.current.get(ind.id);
      if (!node) continue;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Industry nodes (galaxies)
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);
    for (const ind of industries) {
      const node = industryNodes.current.get(ind.id);
      if (!node) continue;
      const [sx, sy] = toScreen(node.x, node.y);
      if (sx < -200 || sx > rect.width + 200 || sy < -200 || sy > rect.height + 200) continue;
      const isActive = highlightSlug && ind.companies.some((c) => c.slug === highlightSlug);
      const active = selectedCompany ? ind.companies.some((c) => c.slug === selectedCompany.slug) : false;
      const glow = active || isActive;
      // Outer glow
      ctx.save();
      ctx.translate(node.x, node.y);
      ctx.scale(scale, scale);
      const gGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, node.r * 1.5);
      gGrad.addColorStop(0, hexToRgba(ind.color ?? "#6366f1", glow ? 0.3 : 0.12));
      gGrad.addColorStop(1, hexToRgba(ind.color ?? "#6366f1", 0));
      ctx.fillStyle = gGrad;
      ctx.beginPath();
      ctx.arc(0, 0, node.r * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Core
      ctx.beginPath();
      ctx.arc(node.x, node.y, Math.max(7, node.r * 0.35), 0, Math.PI * 2);
      ctx.fillStyle = glow ? (ind.color ?? "#6366f1") : "rgba(148,163,184,0.55)";
      ctx.fill();
      ctx.strokeStyle = glow ? "#ffffff" : "rgba(255,255,255,0.35)";
      ctx.lineWidth = glow ? 2.5 : 1;
      ctx.stroke();
      // Label
      ctx.fillStyle = glow ? "#ffffff" : "#cbd5e1";
      ctx.font = glow ? "bold 13px -apple-system, system-ui, sans-serif" : "11px -apple-system, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ind.name.toUpperCase(), node.x, node.y - node.r * 0.35 - 16);
      if (ind.companyCount > 0) {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "10px -apple-system, system-ui, sans-serif";
        ctx.fillText(`${ind.companyCount} companies`, node.x, node.y + node.r * 0.35 + 14);
      }
    }
    ctx.restore();

    // Company planets
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);
    for (const ind of industries) {
      const node = industryNodes.current.get(ind.id);
      if (!node) continue;
      const count = ind.companies.length;
      if (count === 0) continue;
      const radius = node.r * 0.82;
      ind.companies.forEach((c, i) => {
        const angle = (i / Math.max(count, 1)) * 2 * Math.PI + seededRandom(hashCode(c.id), 30);
        const px = node.x + radius * Math.cos(angle);
        const py = node.y + radius * Math.sin(angle);
        const [sx, sy] = toScreen(px, py);
        if (sx < -60 || sx > rect.width + 60 || sy < -60 || sy > rect.height + 60) return;
        const isActive = selectedCompany ? c.slug === selectedCompany.slug : false;
        const isHighlight = highlightSlug ? c.slug === highlightSlug : false;
        const size = isActive || isHighlight ? 7 : 4.5;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = statusColor(c.companyStatus);
        ctx.fill();
        ctx.strokeStyle = isActive || isHighlight ? "#ffffff" : "rgba(255,255,255,0.3)";
        ctx.lineWidth = isActive ? 2.5 : 1;
        ctx.stroke();
        if (isActive || isHighlight) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(px, py, size + 3.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    }
    ctx.restore();

    // Legend
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Galaxies = industries  ·  Planets = companies  ·  Color = documented company status", 16, 28);
  }, [industries, viewTransform, highlightSlug, selectedCompany, searchQuery]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="flex h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground">Loading universe…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center p-6">
        <h2 className="text-lg font-semibold">Unable to load universe</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden bg-background">
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer" onClick={handleCanvasClick} />

      <div className="absolute z-20 top-6 left-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 w-80">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            className="h-9 rounded-l-xl border border-input bg-input/60 px-3 py-1 pl-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full transition"
            placeholder="Find a company…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          <Button variant="outline" onClick={() => zoom(1.2)}>
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" onClick={() => zoom(1 / 1.2)}>
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" onClick={reset}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="absolute z-20 bottom-6 left-6 text-[11px] text-muted-foreground bg-card/70 backdrop-blur px-3 py-2 rounded-xl border border-border/70">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="h-2 w-2 rounded-full bg-primary" /> <span>Galaxy (industry)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-white/40" /> <span>Planet (company)</span>
        </div>
      </div>

      <div className="absolute z-20 bottom-6 right-6">
        <Link href="/explore" className="flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground hover:bg-accent/30 transition backdrop-blur">
          <List className="h-3.5 w-3.5 text-muted-foreground" /> Conventional directory
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
      </div>

      {selectedCompany && showPreview && (
        <CompanyPreview
          company={selectedCompany}
          onClose={() => { setShowPreview(false); setSelectedCompany(null); setHighlightSlug(null); }}
        />
      )}
    </div>
  );
}

function CompanyPreview({ company, onClose }: { company: Company; onClose: () => void }) {
  return (
    <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] flex flex-col">
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 flex h-full flex-col rounded-2xl border border-border bg-card shadow-lift overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-border/60">
          <h2 className="font-display text-lg font-semibold">{company.name}</h2>
          <button className="p-1.5 rounded-md text-muted-foreground hover:bg-accent/30" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg border border-border bg-muted flex items-center justify-center">
              {company.logoUrl ? (
                <img className="h-9 w-9 rounded object-cover" src={company.logoUrl} alt="" />
              ) : (
                <span className="text-xs font-medium text-muted-foreground">{company.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex flex-col">
              <Badge variant={company.researchStatus === "RESEARCHED" ? "success" : company.researchStatus === "PARTIAL" ? "warn" : "muted"}>{company.researchStatus}</Badge>
              <span className="text-xs text-muted-foreground">{company.companyStatus} · {company.businessModel}</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed">{company.shortDescription ?? "No description available."}</p>
          <div className="space-y-2">
            {company.industries.map((ind) => (
              <Link key={ind.slug} href={`/explore?industry=${ind.slug}`} className="text-xs text-primary hover:underline">
                {ind.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <p className="text-xs text-muted-foreground">{company.counts.products} products · {company.counts.timelineEvents} events · {company.counts.metrics} metrics</p>
            <Button variant="primary" onClick={() => {
              onClose();
              setTimeout(() => { window.location.href = `/companies/${company.slug}`; }, 120);
            }}>
              Open dossier <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ className, variant = "default", children, ...props }: any) {
  const variants: Record<string, string> = {
    default: "border-border bg-secondary text-secondary-foreground",
    primary: "bg-primary text-primary-foreground",
    success: "border-success/30 bg-success/10 text-success",
    warn: "border-warn/30 bg-warn/10 text-warn",
    danger: "border-destructive/30 bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
    ghost: "border-border bg-transparent text-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.12em]",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
