import Link from "next/link";
import { Card } from "@/components/ui";
import { Settings, ShieldCheck } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold">Research workspace</h1>
          <p className="text-muted-foreground">Company creation, research editing, and source management.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <ShieldCheck className="h-6 w-6 text-primary mb-3" />
          <h3 className="font-medium mb-2">Create company</h3>
          <p className="text-sm text-muted-foreground mb-4">Add a new company record and classify it by industry and niche.</p>
          <Link href="#" className="text-primary text-sm hover:underline">Create company →</Link>
        </Card>
        <Card className="p-5">
          <Settings className="h-6 w-6 text-primary mb-3" />
          <h3 className="font-medium mb-2">Edit dossier</h3>
          <p className="text-sm text-muted-foreground mb-4">Attach sources, mark evidence status, and record timeline events and decisions.</p>
          <Link href="#" className="text-primary text-sm hover:underline">Edit dossier →</Link>
        </Card>
        <Card className="p-5">
          <Settings className="h-6 w-6 text-primary mb-3" />
          <h3 className="font-medium mb-2">Source management</h3>
          <p className="text-sm text-muted-foreground mb-4">Maintain the source registry with URLs, publishers, and confidence labels.</p>
          <Link href="#" className="text-primary text-sm hover:underline">Manage sources →</Link>
        </Card>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-medium mb-3">Note</h3>
        <p className="text-sm text-muted-foreground">
          The full research-editing workflow (company creation, source attachment, evidence labeling, import/export)
          is specified in the build plan. The MVP ships with a curated seed dataset and read-only dossier views.
        </p>
      </div>
    </div>
  );
}
