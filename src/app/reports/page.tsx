"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui";
import { FileText, Save, RefreshCw, Download } from "lucide-react";
import Link from "next/link";

type Report = {
  id: string;
  type: string;
  status: string;
  fileUrl: string | null;
  generatedAt: string | null;
  createdAt: string;
  company: { id: string; slug: string; name: string } | null;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState("");
  const [type, setType] = useState("COMPANY_INTELLIGENCE");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/reports", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load reports");
        const data = await res.json();
        if (mounted) setReports(data.reports);
      } catch {
        if (mounted) setReports([]);
      } finally {
        if (mounted) setLoading(false);
    }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const generate = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, type: type as any, sections: [] }),
      });
      if (!res.ok) throw new Error("Failed to generate report");
      const data = await res.json();
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to generate report.");
    }
  }, [companyId, type]);

  if (loading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center">
        <div className="flex h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground">Loading reports…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold">Reports</h1>
          <p className="text-muted-foreground">Generated company intelligence and PM metrics reports.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Company</label>
            <input
              placeholder="Company ID"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full rounded-lg border border-input bg-input/40 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full rounded-lg border border-input bg-input/40 px-3 py-2 text-sm"
            >
              <option value="COMPANY_INTELLIGENCE">Company intelligence</option>
              <option value="PM_METRICS">PM metrics</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={generate} variant="primary" disabled={!companyId}>
              <Save className="h-4 w-4 mr-2" /> Generate
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-medium">Generated reports</h2>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
            <h3 className="mt-4 font-medium">No reports yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Generate a company intelligence or PM metrics report.</p>
          </div>
        ) : (
          reports.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={r.type === "COMPANY_INTELLIGENCE" ? "primary" : "muted"}>{r.type.replace(/_/g, " ")}</Badge>
                    <Badge variant={r.status === "COMPLETED" ? "success" : r.status === "FAILED" ? "danger" : "muted"}>
                      {r.status}
                    </Badge>
                  </div>
                  <Link href={`/companies/${r.company?.slug}`} className="font-medium hover:underline">
                    {r.company?.name || "Unknown company"}
                  </Link>
                </div>
                <div className="ml-auto text-right text-[11px] text-muted-foreground">
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                </div>
              </div>
              {r.fileUrl && (
                <a
                  href={`/api/reports/download/${encodeURIComponent(r.fileUrl.replace(/^\//, ""))}`}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-input/40 px-3 py-2 text-sm text-primary hover:bg-accent/30 transition"
                  download
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </a>
              )}
              {!r.fileUrl && r.status !== "COMPLETED" && (
                <p className="mt-3 text-xs text-muted-foreground">Report is being generated.</p>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
