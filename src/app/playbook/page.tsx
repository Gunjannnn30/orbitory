import Link from "next/link";
import { Card } from "@/components/ui";
import { Badge } from "@/components/ui";
import { BookOpen, Save, ShieldCheck } from "lucide-react";

export default function PlaybookPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold">PM Playbook</h1>
          <p className="text-muted-foreground">Cross-company lessons and case studies.</p>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-medium mb-2">Coming soon</h3>
        <p className="text-sm text-muted-foreground mb-4">
          A cross-company learning library organized by problem type, business model, and growth strategy — each
          lesson linked to its source company, decision, evidence, and counterexamples.
        </p>
        <Link href="/" className="text-primary hover:underline font-medium">Back to Universe</Link>
      </div>
    </div>
  );
}
