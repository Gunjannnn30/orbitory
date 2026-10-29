"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui";
import { ShieldCheck, Search, List, BarChart3, ChevronRight } from "lucide-react";
import Link from "next/link";

type Company = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  foundedAt: string | null;
  headquarters: string | null;
  companyStatus: string;
  businessModel: string;
  researchStatus: string;
  industries: Array<{ name: string }>;
  counts: { products: number; timelineEvents: number; metrics: number };
  products: Array<{ name: string }>;
  timelineEvents: Array<{ title: string; eventDate: string | null; eventType: string }>;
  metrics: Array<{ metricDefinition: { name: string }; value: number | null; valueText: string | null; unit: string | null }>;
};

export default function ComparePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const allCompaniesRef = useState<Company[]>([])[0];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/companies?limit=200", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load companies");
        const data = await res.json();
        if (mounted) setCompanies(data.companies);
      } catch {
        if (mounted) setCompanies([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    (c.shortDescription ?? "").toLowerCase().includes(query.toLowerCase()),
  );

  const toggle = (slug: string) => {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };

  const isSelected = (slug: string) => selected.includes(slug);

  if (selected.length < 2) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-semibold">Compare</h1>
            <p className="text-muted-foreground">Select two to five companies to compare side by side.</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search companies…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="p-3 cursor-pointer rounded-xl border border-border bg-card hover:bg-accent/30 transition"
                onClick={() => toggle(c.slug)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{c.name}</h4>
                  <Badge variant="ghost">{c.companyStatus}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{c.shortDescription}</p>
                <div className="mt-2 flex w-full items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{c.businessModel}</span>
                  {isSelected(c.slug) ? (
                    <span className="text-xs font-medium text-primary">Selected</span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">Add to comparison</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">No companies found.</p>}
        </div>
        <div className="rounded-xl border border-border bg-card/50 p-12 text-center text-muted-foreground">
          <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="font-medium">Choose companies to compare</h3>
          <p className="text-sm">Select 2–5 companies above to see a side-by-side comparison of their profiles, products, and metrics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold">Compare</h1>
          <p className="text-muted-foreground">Side-by-side comparison ({selected.length} companies)</p>
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={() => setSelected([])} variant="outline">Clear</Button>
          <Button variant="primary" onClick={() => {
            const ids = selected.join(",");
            // Navigate to a comparison results view
          }}>View comparison</Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="pb-3 font-medium text-muted-foreground">Attribute</th>
              {companies.filter((c) => selected.includes(c.slug)).map((c) => (
                <th key={c.id} className="pb-3 font-medium">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggle(c.slug)} className="text-muted-foreground hover:text-danger transition">
                      <span className="line-through text-xs">✕</span>
                    </button>
                    <Link href={`/companies/${c.slug}`} className="font-medium hover:underline">{c.name}</Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            <tr>
              <td className="py-3 font-medium text-muted-foreground">Status</td>
              {companies.filter((c) => selected.includes(c.slug)).map((c) => (
                <td key={c.id} className="py-3"><Badge variant="ghost">{c.companyStatus}</Badge></td>
              ))}
            </tr>
            <tr>
              <td className="py-3 font-medium text-muted-foreground">Business model</td>
              {companies.filter((c) => selected.includes(c.slug)).map((c) => (
                <td key={c.id} className="py-3 text-muted-foreground">{c.businessModel}</td>
              ))}
            </tr>
            <tr>
              <td className="py-3 font-medium text-muted-foreground">Headquarters</td>
              {companies.filter((c) => selected.includes(c.slug)).map((c) => (
                <td key={c.id} className="py-3 text-muted-foreground">{c.headquarters || "—"}</td>
              ))}
            </tr>
            <tr>
              <td className="py-3 font-medium text-muted-foreground">Founded</td>
              {companies.filter((c) => selected.includes(c.slug)).map((c) => (
                <td key={c.id} className="py-3 text-muted-foreground">{c.foundedAt ? String(c.foundedAt).slice(0, 4) : "—"}</td>
              ))}
            </tr>
            <tr>
              <td className="py-3 font-medium text-muted-foreground">Industry</td>
              {companies.filter((c) => selected.includes(c.slug)).map((c) => (
                <td key={c.id} className="py-3 text-muted-foreground">{c.industries.map((i) => i.name).join(", ") || "—"}</td>
              ))}
            </tr>
            <tr>
              <td className="py-3 font-medium text-muted-foreground">Products</td>
              {companies.filter((c) => selected.includes(c.slug)).map((c) => (
                <td key={c.id} className="py-3 text-muted-foreground">{c.counts.products}</td>
              ))}
            </tr>
            <tr>
              <td className="py-3 font-medium text-muted-foreground">Timeline events</td>
              {companies.filter((c) => selected.includes(c.slug)).map((c) => (
                <td key={c.id} className="py-3 text-muted-foreground">{c.counts.timelineEvents}</td>
              ))}
            </tr>
            <tr>
              <td className="py-3 font-medium text-muted-foreground">Research status</td>
              {companies.filter((c) => selected.includes(c.slug)).map((c) => (
                <td key={c.id} className="py-3"><Badge variant={c.researchStatus === "RESEARCHED" ? "success" : c.researchStatus === "PARTIAL" ? "warn" : "muted"}>{c.researchStatus}</Badge></td>
              ))}
            </tr>
            <tr className="bg-muted/30">
              <td className="py-3 font-medium text-muted-foreground">Metrics available</td>
              {companies.filter((c) => selected.includes(c.slug)).map((c) => (
                <td key={c.id} className="py-3 text-muted-foreground">{c.counts.metrics}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-4">
        <h3 className="font-display text-lg font-semibold">Metrics side by side</h3>
        <p className="text-sm text-muted-foreground">
          Only metrics with comparable definitions, periods, and units can be compared directly. Incomparable values
          are marked clearly.
        </p>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Detailed metric comparison requires aligned definitions. Open a company dossier to review its metric tree,
          then use the Compare API to pull aligned observations.
        </div>
      </div>
    </div>
  );
}
