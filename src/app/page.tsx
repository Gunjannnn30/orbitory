"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Compass, Search, Filter, ZoomIn, ZoomOut, RefreshCw, List, ChevronRight, X } from "lucide-react";
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

export default function UniversePage() {
  const router = useRouter();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightSlug, setHighlightSlug] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [showPreview, setShowPreview] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const industryNodes = useRef<Map<string, { x: number; y: number; r: number }>>(new Map());
  const starPoints = useRef<{ x: number; y: number; size: number; alpha: number }[]>([]);

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

  // Deterministic layout: place industries in a spiral, companies around their industry
  useEffect(() => {
    if (!industries.length) return;
    const nodes = new Map<string, { x: number; y: number; r: number }>();
    const centerX = 0;
    const centerY = 0;
    const n = industries.length;
    const radiusStep = 340;
    const angleStep = (2 * Math.PI) / n;
    industries.forEach((ind, i) => {
      const angle = i * angleStep;
      const r = 260 + i * 40;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      nodes.set(ind.id, { x, y, r: 80 + ind.companyCount * 4 });
    });
    industryNodes.current = nodes;

    // Background star field
    const stars: { x: number; y: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 260; i++) {
      stars.push({
        x: (seededRandom(i, 0) - 0.5) * 2200,
        y: (seededRandom(i, 1) - 0.5) * 1400,
        size: seededRandom(i, 2) * 1.6 + 0.4,
        alpha: seededRandom(i, 3),
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

  // Canvas render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const { x: tx, y: ty, scale } = viewTransform;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // Transform helper
    const toScreen = (wx: number, wy: number) => [cx + (wx + tx) * scale, cy + (wy + ty) * scale];

    // Draw stars
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

    // Draw industry orbits / connections
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
    ctx.lineWidth = 1;
    for (const ind of industries) {
      const node = industryNodes.current.get(ind.id);
      if (!node) continue;
      // faint orbit circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Draw nebulae blobs behind industries
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);
    for (const ind of industries) {
      const node = industryNodes.current.get(ind.id);
      if (!node) continue;
      const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 2.2);
      const color = ind.color || "#6366f1";
      grad.addColorStop(0, hexToRgba(color, 0.06));
      grad.addColorStop(1, hexToRgba(color, 0.0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Draw industry nodes
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);
    for (const ind of industries) {
      const node = industryNodes.current.get(ind.id);
      if (!node) continue;
      const [sx, sy] = toScreen(node.x, node.y);
      const isActive = highlightSlug && ind.companies.some((c) => c.slug === highlightSlug);
      const active = selectedCompany ? ind.companies.some((c) => c.slug === selectedCompany.slug) : false;
      ctx.beginPath();
      ctx.arc(node.x, node.y, Math.max(6, node.r * 0.35), 0, Math.PI * 2);
      ctx.fillStyle = active || isActive ? (ind.color || "#6366f1") : "rgba(148,163,184,0.55)";
      ctx.fill();
      ctx.strokeStyle = active || isActive ? "#ffffff" : "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
      // label
      ctx.fillStyle = active || isActive ? "#ffffff" : "#cbd5e1";
      ctx.font = active ? "bold 13px -apple-system, system-ui, sans-serif" : "11px -apple-system, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ind.name.toUpperCase(), node.x, node.y - node.r * 0.35 - 14);
    }
    ctx.restore();

    // Draw company planets
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);
    for (const ind of industries) {
      const node = industryNodes.current.get(ind.id);
      if (!node) continue;
      const count = ind.companies.length;
      if (count === 0) continue;
      const radius = node.r * 0.75;
      ind.companies.forEach((c, i) => {
        const angle = (i / Math.max(count, 1)) * 2 * Math.PI + seededRandom(hashCode(c.id), 5);
        const x = node.x + radius * Math.cos(angle);
        const y = node.y + radius * Math.sin(angle);
        const isActive = selectedCompany ? c.slug === selectedCompany.slug : false;
        const isHighlight = highlightSlug ? c.slug === highlightSlug : false;
        const [sx, sy] = toScreen(x, y) as [number, number];
        // only draw if roughly on screen
        if (sx < -60 || sx > rect.width + 60 || sy < -60 || sy > rect.height + 60) return;
        const size = isActive || isHighlight ? 6.5 : 4.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = statusColor(c.companyStatus);
        ctx.fill();
        ctx.strokeStyle = isActive || isHighlight ? "#ffffff" : "rgba(255,255,255,0.35)";
        ctx.lineWidth = isActive ? 2.5 : 1;
        ctx.stroke();
        if (isActive || isHighlight) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, y, size + 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    }
    ctx.restore();

    // Title legend
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Galaxies = industries  ·  Planets = companies  ·  Size/status encoded by documented company status", 16, 26);
  }, [industries, viewTransform, highlightSlug, selectedCompany, searchQuery]);

  const pan = useCallback((dx: number, dy: number) => {
    setViewTransform((t) => ({ x: t.x + dx, y: t.y + dy, scale: t.scale }));
  }, []);
  const zoom = useCallback((factor: number) => {
    setViewTransform((t) => ({ x: t.x, y: t.y, scale: Math.min(4, Math.max(0.4, t.scale * factor)) }));
  }, []);
  const reset = useCallback(() => setViewTransform({ x: 0, y: 0, scale: 1 }), []);

  useEffect(() => {
    let frame: number;
    const render = () => {
      renderUniverse();
      frame = requestAnimationFrame(render);
    };
    const renderUniverse = () => {
      // trigger re-render via state is handled by effects; we just need canvas redraw on transform change
    };
    return () => cancelAnimationFrame(frame);
  }, []);

  // handle canvas click
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const { x: tx, y: ty, scale } = viewTransform;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      // inverse transform
      const wx = (mx - cx) / scale - tx;
      const wy = (my - cy) / scale - ty;
      let hit: Company | null = null;
      let hitDist = 1 / scale;
      for (const ind of industries) {
        const node = industryNodes.current.get(ind.id);
        if (!node) continue;
        for (const c of ind.companies) {
          const angle = (ind.companies.indexOf(c) / Math.max(ind.companies.length, 1)) * 2 * Math.PI + seededRandom(hashCode(c.id), 5);
          const radius = node.r * 0.75;
          const x = node.x + radius * Math.cos(angle);
          const y = node.y + radius * Math.sin(angle);
          const d = Math.hypot(wx - x, wy - y);
          if (d < hitDist) {
            hitDist = d;
            hit = c;
          }
        }
      }
      if (hit) {
        setSelectedCompany(hit);
        setShowPreview(true);
        setHighlightSlug(hit.slug);
      }
    },
    [industries, viewTransform],
  );

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
      {/* Canvas background */}
      <div className="absolute inset-0 z-0">
        <canvas ref={canvasRef} className="w-full h-full cursor-pointer" onClick={handleCanvasClick} />
      </div>

      {/* Controls */}
      <div className="absolute z-20 top-6 left-6 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            className="h-9 rounded-l-lg border border-input bg-input/60 px-3 py-1 pl-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-64 transition"
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

      {/* Legend */}
      <div className="absolute z-20 bottom-6 left-6 text-[11px] text-muted-foreground bg-card/60 backdrop-blur px-3 py-2 rounded-lg border border-border/70">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="h-2 w-2 rounded-full bg-primary" /> <span>Galaxy (industry)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-white/40" /> <span>Planet (company)</span>
        </div>
      </div>

      {/* Directory hint */}
      <div className="absolute z-20 bottom-6 right-6">
        <Link href="/explore" className="flex items-center gap-2 rounded-lg border border-border bg-card/80 px-3 py-2 text-sm text-foreground hover:bg-accent/30 transition backdrop-blur">
          <List className="h-3.5 w-3.5 text-muted-foreground" /> Conventional directory
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
      </div>

      {/* Company preview sheet */}
      {selectedCompany && showPreview && (
        <CompanyPreview
          company={selectedCompany}
          onClose={() => { setShowPreview(false); setSelectedCompany(null); setHighlightSlug(null); }}
          onOpen={() => router.push(`/companies/${selectedCompany.slug}`)}
        />
      )}
    </div>
  );
}

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
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

function CompanyPreview({ company, onClose, onOpen }: { company: Company; onClose: () => void; onOpen: () => void }) {
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
              <span className="badge">{company.researchStatus}</span>
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
            <Button variant="primary" onClick={onOpen}>
              Open dossier <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
