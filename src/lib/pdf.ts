import PDFDocumentKit from "pdfkit";
import { format, formatDistanceToNowStrict } from "date-fns";
import fs from "node:fs";
import path from "node:path";

const PDFDocument = PDFDocumentKit as any;

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;

export async function generateCompanyReport(
  company: any,
  type: "COMPANY_INTELLIGENCE" | "PM_METRICS",
  sections: string[],
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "LETTER", margin: MARGIN, info: { Title: `Orbitory — ${company.name}`, Author: "Orbitory", CreationDate: new Date(), ModDate: new Date() } });

      const dir = path.join(process.cwd(), "storage", "reports");
      fs.mkdirSync(dir, { recursive: true });
      const fileName = `orbitory-${company.slug}-${type.toLowerCase().replace(/_/g, "-")}-report.pdf`;
      const filePath = path.join(dir, fileName);
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      doc.on("error", reject);

      const H1 = (text: string) => {
        doc.font("Helvetica-Bold").fontSize(17).fillColor("#0f172a").text(text, { align: "left" }).moveDown(0.6);
        doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(MARGIN, doc.y).lineTo(PAGE_WIDTH - MARGIN, doc.y).stroke();
        doc.moveDown(0.4);
      };
      const H2 = (text: string) => {
        doc.font("Helvetica-Bold").fontSize(12.5).fillColor("#334155").text(text).moveDown(0.35);
      };
      const P = (text: string, opts: { size?: number; color?: string; indent?: number } = {}) => {
        doc.font("Helvetica").fontSize(opts.size ?? 9.5).fillColor(opts.color ?? "#1e293b").text(text, { indent: opts.indent, align: "justify" }).moveDown(0.5);
      };
      const BULLET = (text: string) => {
        doc.font("Helvetica").fontSize(9.5).fillColor("#1e293b").text("•  " + text, { indent: 14, align: "justify" }).moveDown(0.35);
      };

      // ---------------- cover ----------------
      doc.font("Helvetica-Bold").fontSize(26).fillColor("#0f172a").text("Orbitory", { align: "left" });
      doc.font("Helvetica").fontSize(11).fillColor("#64748b").text("The Universe of Business · Product Management Intelligence").moveDown(1);
      doc.font("Helvetica-Bold").fontSize(20).fillColor("#0f172a").text(company.name, { align: "left" }).moveDown(0.4);
      doc.font("Helvetica").fontSize(11).fillColor("#475569").text(company.shortDescription ?? company.description ?? "").moveDown(1.2);
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#475569").text("Company Intelligence Report").moveDown(0.2);
      doc.font("Helvetica").fontSize(9).fillColor("#64748b").text(`Generated: ${format(new Date(), "MMMM d, yyyy h:mm a")}`).moveDown(0.2);
      doc.text(`Company: ${company.name}`).moveDown(0.15);
      doc.text(`Industry: ${company.industries?.map((i: any) => i.industry.name).join(", ") || "—"}`).moveDown(0.15);
      doc.text(`Status: ${company.companyStatus} · Model: ${company.businessModel} · Research: ${company.researchStatus}`).moveDown(1.5);
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#475569").text("Contents").moveDown(0.2);
      const contents = [
        "Company overview and key milestones",
        "Business model and target customer",
        "Product portfolio and strategic positioning",
        "Competitor comparison",
        "What worked, what failed, and what remains uncertain",
        "PM metric tree and available metrics",
        "Key lessons for product managers",
        "Sources, confidence labels, and report date",
      ];
      contents.forEach((c) => BULLET(c));

      doc.addPage();

      // ---------------- overview ----------------
      H1("Company Overview");
      P(company.description ?? "No description available.");
      doc.moveDown(0.3);
      H2("Identity");
      const rows: [string, string][] = [
        ["Founded", company.foundedAt ? format(new Date(company.foundedAt), "yyyy") : "—"],
        ["Headquarters", company.headquarters || "—"],
        ["Website", company.website || "—"],
        ["Status", String(company.companyStatus)],
        ["Ownership", String(company.ownershipType)],
        ["Business model", String(company.businessModel)],
        ["Research status", String(company.researchStatus)],
        ["Last researched", company.lastResearchedAt ? formatDistanceToNowStrict(new Date(company.lastResearchedAt), { addSuffix: true }) : "—"],
      ];
      rows.forEach(([k, v]) => {
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#475569").text(k, { width: 130, continued: true });
        doc.font("Helvetica").fontSize(9).fillColor("#1e293b").text(v);
        doc.moveDown(0.2);
      });

      // ---------------- timeline ----------------
      doc.addPage();
      H1("Key Milestones");
      const byYear: Record<string, any[]> = {};
      for (const e of company.timelineEvents ?? []) {
        const year = e.eventDate ? String(new Date(e.eventDate).getFullYear()) : "undated";
        if (!byYear[year]) byYear[year] = [];
        byYear[year].push(e);
      }
      if (company.timelineEvents?.length === 0) {
        P("No timeline events recorded for this company.");
      } else {
        for (const [year, events] of Object.entries(byYear)) {
          H2(year);
          for (const e of events) {
            const need = 70;
            if (doc.y + need > PAGE_HEIGHT - MARGIN - 40) doc.addPage();
            doc.font("Helvetica-Bold").fontSize(9).fillColor("#2563eb").text(e.title, { continued: true });
            doc.font("Helvetica").fontSize(9).fillColor("#64748b").text(` · ${e.eventDate ? format(new Date(e.eventDate), "MMM yyyy") : "undated"} · ${e.eventType}`);
            P(e.description ?? "", { size: 8.5 });
            doc.font("Helvetica-Oblique").fontSize(7.5).fillColor("#94a3b8").text(`Evidence: ${e.evidenceStatus}`).moveDown(0.4);
          }
        }
      }

      // ---------------- products ----------------
      doc.addPage();
      H1("Product Portfolio");
      if (company.products?.length === 0) {
        P("No products recorded.");
      } else {
        for (const p of company.products) {
          const need = 75;
          if (doc.y + need > PAGE_HEIGHT - MARGIN - 40) doc.addPage();
          H2(p.name);
          P(p.description ?? "", { size: 9 });
          doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#475569").text("Status: ", { continued: true });
          doc.font("Helvetica").fontSize(8.5).fillColor("#1e293b").text(String(p.status)).moveDown(0.2);
          doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#475569").text("Pricing: ", { continued: true });
          doc.font("Helvetica").fontSize(8.5).fillColor("#1e293b").text(p.pricingModel ?? "—").moveDown(0.5);
        }
      }

      // ---------------- metrics ----------------
      doc.addPage();
      H1("PM Metric Tree");
      if (company.metrics?.length === 0) {
        P("No metrics recorded for this company.");
      } else {
        const byCat: Record<string, any[]> = {};
        for (const m of company.metrics) {
          (byCat[m.metricDefinition.category] ??= []).push(m);
        }
        for (const [cat, mets] of Object.entries(byCat)) {
          const need = 30;
          if (doc.y + need > PAGE_HEIGHT - MARGIN - 40) doc.addPage();
          H2(String(cat).charAt(0).toUpperCase() + String(cat).slice(1));
          for (const m of mets) {
            const need2 = 60;
            if (doc.y + need2 > PAGE_HEIGHT - MARGIN - 40) doc.addPage();
            doc.font("Helvetica-Bold").fontSize(9).fillColor("#0f172a").text(m.metricDefinition.name, { continued: true });
            doc.font("Helvetica").fontSize(8.5).fillColor("#64748b").text(` (${m.valueType})`);
            doc.moveDown(0.15);
            doc.font("Helvetica").fontSize(8.5).fillColor("#1e293b").text(`Value: ${m.valueText ?? m.value?.toString() ?? "—"} ${m.unit || ""}`).moveDown(0.15);
            if (m.periodEnd) doc.text(`Period: ${format(new Date(m.periodEnd), "MMM yyyy")}`).moveDown(0.15);
            if (m.metricDefinition.formula) doc.text(`Formula: ${m.metricDefinition.formula}`).moveDown(0.15);
            if (m.notes) doc.font("Helvetica-Oblique").fontSize(7.5).fillColor("#94a3b8").text(`Note: ${m.notes}`).moveDown(0.35);
            else doc.moveDown(0.1);
          }
        }
      }

      // ---------------- lessons ----------------
      doc.addPage();
      H1("Product Management Lessons");
      P("Strategic decisions, outcomes, and limitations are captured per decision with source attribution and evidence status.", { size: 9 });
      doc.moveDown(0.2);
      for (const d of company.strategicDecisions?.slice(0, 5) ?? []) {
        const need = 70;
        if (doc.y + need > PAGE_HEIGHT - MARGIN - 40) doc.addPage();
        H2(d.title);
        P(d.decision ?? "Decision not recorded.", { size: 9 });
        if (d.documentedOutcome) {
          doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#475569").text("Outcome: ", { continued: true });
          doc.font("Helvetica").fontSize(8.5).fillColor("#1e293b").text(d.documentedOutcome).moveDown(0.15);
        }
        if (d.limitations) {
          doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#475569").text("Limitations: ", { continued: true });
          doc.font("Helvetica").fontSize(8.5).fillColor("#1e293b").text(d.limitations).moveDown(0.35);
        }
      }

      // ---------------- sources ----------------
      doc.addPage();
      H1("Sources & Data Quality");
      P("Every factual claim in Orbitory carries an evidence status: Verified, Reported, Estimated, Interpretation, Illustrative, or Unknown. Reported figures are not treated as verified unless a primary source supports them.", { size: 9 });
      doc.moveDown(0.2);
      if (company.claims?.length === 0) {
        P("No claims recorded.");
      } else {
        for (const c of company.claims.slice(0, 15)) {
          const need = 45;
          if (doc.y + need > PAGE_HEIGHT - MARGIN - 40) doc.addPage();
          doc.font("Helvetica").fontSize(8.5).fillColor("#1e293b").text("• " + c.claimText, { indent: 10, align: "justify" }).moveDown(0.15);
          doc.font("Helvetica-Oblique").fontSize(7.5).fillColor("#94a3b8").text(`Evidence: ${c.evidenceStatus} · Confidence: ${c.confidence} ${c.verificationStatus ? `· ${c.verificationStatus}` : ""}`).moveDown(0.3);
        }
      }

      doc.font("Helvetica").fontSize(7.5).fillColor("#94a3b8").moveDown(1);
      doc.text(`Orbitory — The Universe of Business · Report generated ${format(new Date(), "yyyy-MM-dd HH:mm")} · Reflects available public data and clearly labeled estimates; not investment advice.`, { align: "center" });

      stream.on("finish", () => resolve(`/storage/reports/${fileName}`));
      stream.on("error", reject);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
