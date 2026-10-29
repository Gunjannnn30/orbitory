import Link from "next/link";
import { Card } from "@/components/ui";
import { Save } from "lucide-react";

export default function SavedPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold">Saved Research</h1>
          <p className="text-muted-foreground">Bookmarks, collections, and saved comparisons.</p>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <Save className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-medium mb-2">Your collections</h3>
        <p className="text-sm text-muted-foreground mb-4">Save companies, comparisons, and reports to private collections here.</p>
        <Link href="/" className="text-primary hover:underline font-medium">Back to Universe</Link>
      </div>
    </div>
  );
}
