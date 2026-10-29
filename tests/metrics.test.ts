import { describe, it, expect } from "vitest";
import {
  conversionRate,
  retentionRate,
  churnRate,
  customerAcquisitionCost,
  monthlyRecurringRevenue,
  type MetricError,
  type MetricResult,
} from "@/lib/metrics";

function isError(r: MetricResult | MetricError): r is MetricError {
  return "kind" in r;
}

describe("conversionRate", () => {
  it("calculates percentage", () => {
    const r = conversionRate(1250, 10000);
    if (isError(r)) throw new Error(r.message);
    expect(r.value).toBe(12.5);
  });

  it("rejects zero denominator", () => {
    const r = conversionRate(5, 0);
    expect(isError(r)).toBe(true);
  });

  it("rejects conversions exceeding opportunities", () => {
    const r = conversionRate(120, 100);
    expect(isError(r)).toBe(true);
  });
});

describe("retentionRate", () => {
  it("calculates percentage", () => {
    const r = retentionRate(7500, 10000);
    if (isError(r)) throw new Error(r.message);
    expect(r.value).toBe(75);
  });

  it("rejects retained exceeding cohort", () => {
    const r = retentionRate(11000, 10000);
    expect(isError(r)).toBe(true);
  });
});

describe("churnRate", () => {
  it("calculates percentage", () => {
    const r = churnRate(500, 10000);
    if (isError(r)) throw new Error(r.message);
    expect(r.value).toBe(5);
  });
});

describe("customerAcquisitionCost", () => {
  it("calculates cost per customer", () => {
    const r = customerAcquisitionCost(50000, 1000);
    if (isError(r)) throw new Error(r.message);
    expect(r.value).toBe(50);
  });

  it("rejects zero customers", () => {
    const r = customerAcquisitionCost(50000, 0);
    expect(isError(r)).toBe(true);
  });
});

describe("monthlyRecurringRevenue", () => {
  it("returns the recurring revenue", () => {
    const r = monthlyRecurringRevenue(125000);
    if (isError(r)) throw new Error(r.message);
    expect(r.value).toBe(125000);
  });
});
