"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { Search, Calculator, List, BarChart3, FlaskConical, AlertCircle } from "lucide-react";

type MetricDef = {
  id: string;
  name: string;
  slug: string;
  category: string;
  definition: string | null;
  formula: string | null;
  unit: string | null;
  interpretation: string | null;
  limitations: string | null;
};

export default function MetricsLabPage() {
  const [metrics, setMetrics] = useState<MetricDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/metrics", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load metrics");
        const data = await res.json();
        if (mounted) setMetrics(data.metrics);
      } catch {
        if (mounted) setMetrics([]);
      } finally {
        if (mounted) setLoading(false);
    }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = metrics.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.category.toLowerCase().includes(query.toLowerCase()) ||
      (m.definition ?? "").toLowerCase().includes(query.toLowerCase()),
  );

  // Calculator state
  const [calc, setCalc] = useState<{
    kind: "conversion" | "retention" | "churn" | "cac" | "mrr" | null;
    inputs: Record<string, string>;
    result: number | null;
    error: string | null;
  }>({ kind: null, inputs: {}, result: null, error: null });

  const calculate = useCallback(() => {
    if (!calc.kind) return;
    let result: number | null = null;
    let error: string | null = null;
    const num = (k: string) => parseFloat(calc.inputs[k] || "");
    try {
      switch (calc.kind) {
        case "conversion": {
          const conversions = num("conversions");
          const opportunities = num("opportunities");
          if (!opportunities) throw new Error("Eligible opportunities must be greater than 0.");
          result = (conversions / opportunities) * 100;
          break;
        }
        case "retention": {
          const retained = num("retained");
          const cohort = num("cohort");
          if (!cohort) throw new Error("Original cohort must be greater than 0.");
          result = (retained / cohort) * 100;
          break;
        }
        case "churn": {
          const lost = num("lost");
          const start = num("start");
          if (!start) throw new Error("Users at start of period must be greater than 0.");
          result = (lost / start) * 100;
          break;
        }
        case "cac": {
          const spend = num("spend");
          const customers = num("customers");
          if (!customers) throw new Error("New customers must be greater than 0.");
          result = spend / customers;
          break;
        }
        case "mrr": {
          result = num("mrr");
          break;
        }
      }
    } catch (e) {
      error = e instanceof Error ? e.message : "Invalid inputs.";
      result = null;
    }
    setCalc((c) => ({ ...c, result, error }));
  }, [calc]);

  const setInput = (k: string, v: string) => {
    setCalc((c) => ({ ...c, inputs: { ...c.inputs, [k]: v } }));
  };

  const calcConfigs: Record<string, { title: string; desc: string; fields: Array<{ key: string; label: string; placeholder: string }>; formula: string }> = {
    conversion: {
      title: "Conversion rate",
      desc: "successful conversions / eligible opportunities × 100",
      fields: [
        { key: "conversions", label: "Successful conversions", placeholder: "e.g. 1,250" },
        { key: "opportunities", label: "Eligible opportunities", placeholder: "e.g. 10,000" },
      ],
      formula: "Conversion rate = conversions / eligible opportunities × 100",
    },
    retention: {
      title: "Retention rate",
      desc: "retained cohort users / original cohort × 100",
      fields: [
        { key: "retained", label: "Users retained in period", placeholder: "e.g. 7,500" },
        { key: "cohort", label: "Users in original cohort", placeholder: "e.g. 10,000" },
      ],
      formula: "Retention rate = retained / original cohort × 100",
    },
    churn: {
      title: "Churn rate",
      desc: "users lost during period / users at start of period × 100",
      fields: [
        { key: "lost", label: "Users lost during period", placeholder: "e.g. 500" },
        { key: "start", label: "Users at start of period", placeholder: "e.g. 10,000" },
      ],
      formula: "Churn rate = lost / start of period × 100",
    },
    cac: {
      title: "Customer acquisition cost (CAC)",
      desc: "acquisition expenditure / new customers acquired",
      fields: [
        { key: "spend", label: "Acquisition expenditure", placeholder: "e.g. 50,000" },
        { key: "customers", label: "New customers acquired", placeholder: "e.g. 1,000" },
      ],
      formula: "CAC = acquisition expenditure / new customers",
    },
    mrr: {
      title: "Monthly recurring revenue (MRR)",
      desc: "sum of eligible recurring revenue for the month",
      fields: [{ key: "mrr", label: "Eligible recurring revenue", placeholder: "e.g. 125,000" }],
      formula: "MRR = sum of eligible recurring revenue",
    },
  };

  if (loading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center">
        <div className="flex h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground">Loading metric library…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold">PM Metrics Lab</h1>
          <p className="text-muted-foreground">Metric definitions, formulas, and a working calculator.</p>
        </div>
      </div>

      <Tabs defaultValue="library">
        <TabsList className="grid w-full grid-cols-2 border-none">
          <TabsTrigger value="library">Metric library</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="border-none">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search metrics…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.length === 0 ? (
                <p className="col-span-2 text-sm text-muted-foreground">No metrics match your search.</p>
              ) : (
                filtered.map((m) => (
                  <Card key={m.id} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex flex-col">
                        <h4 className="font-medium">{m.name}</h4>
                        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {m.category}
                        </div>
                      </div>
                      <Badge variant="muted">{m.unit ?? "—"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{m.definition ?? "No definition available."}</p>
                    {m.formula && (
                      <p className="mt-1 text-[10px] font-mono text-muted-foreground">{m.formula}</p>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calculator" className="border-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="font-display text-lg font-semibold">Calculator</h2>
              <p className="text-sm text-muted-foreground">
                Select a metric, enter inputs, and calculate. Results are illustrative unless you supply actuals.
              </p>
              <div className="space-y-3">
                {Object.entries(calcConfigs).map(([kind, cfg]) => (
                  <Button
                    key={kind}
                    onClick={() => setCalc({ kind: kind as any, inputs: {}, result: null, error: null })}
                    className={cn(
                      "w-full text-left border border-input bg-input/40 hover:bg-accent/30 transition",
                      calc.kind === kind
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cfg.title}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">{cfg.desc}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {calc.kind && (
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>{calcConfigs[calc.kind as keyof typeof calcConfigs]!.title}</CardTitle>
                  <CardDescription>{calcConfigs[calc.kind as keyof typeof calcConfigs]!.desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pb-2">
                  {calcConfigs[calc.kind as keyof typeof calcConfigs]!.fields.map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs text-muted-foreground mb-1">{f.label}</label>
                      <Input
                        value={calc.inputs[f.key] ?? ""}
                        onChange={(e) => setInput(f.key, e.target.value)}
                        placeholder={f.placeholder}
                      />
                    </div>
                  ))}
                  <Button
                    onClick={calculate}
                    className="w-full bg-primary text-primary-foreground shadow-glow-signal"
                  >
                    Calculate
                  </Button>
                  {calc.error && (
                    <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                      <AlertCircle className="h-4 w-4 mr-2" /> {calc.error}
                    </div>
                  )}
                  {calc.result !== null && (
                    <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">
                      <div className="text-xs text-primary/70">Result</div>
                      <div className="font-mono font-semibold text-primary">
                        {calc.kind === "conversion" || calc.kind === "retention" || calc.kind === "churn"
                          ? calc.result.toFixed(2) + "%"
                          : calc.kind === "cac" || calc.kind === "mrr"
                            ? "INR " + calc.result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : calc.result.toString()}
                      </div>
                    </div>
                  )}
                  <div className="text-[10px] text-muted-foreground mt-2">
                    {calcConfigs[calc.kind as keyof typeof calcConfigs]!.formula}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-display text-lg font-semibold mb-4">How to read metric labels</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Badge variant="success">Reported</Badge> <span className="text-muted-foreground">Figure appears in a cited source.</span>
          <Badge variant="muted">Calculated</Badge> <span className="text-muted-foreground">Derived from reported observations.</span>
          <Badge variant="warn">Estimated</Badge> <span className="text-muted-foreground">Inferred; not directly reported.</span>
          <Badge variant="ghost">Illustrative</Badge> <span className="text-muted-foreground">Example only; not a real measurement.</span>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
