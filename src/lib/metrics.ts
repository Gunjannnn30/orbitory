/**
 * Orbitory PM metric formula engine.
 *
 * Pure, testable calculations for the most common product and business metrics.
 * Each function documents its convention (denominator, inclusion rules) because
 * these formulas are not universally interchangeable. Results are rounded only
 * for presentation; callers decide precision.
 */

export interface MetricResult {
  value: number;
  label: string;
  note?: string;
}

export type MetricError = { kind: "error"; message: string };

/** Conversion rate = successful conversions / eligible opportunities × 100 */
export function conversionRate(conversions: number, eligibleOpportunities: number): MetricResult | MetricError {
  if (!Number.isFinite(conversions) || !Number.isFinite(eligibleOpportunities)) {
    return { kind: "error", message: "Inputs must be finite numbers." };
  }
  if (eligibleOpportunities <= 0) {
    return { kind: "error", message: "Eligible opportunities must be greater than 0." };
  }
  if (conversions < 0 || eligibleOpportunities < 0) {
    return { kind: "error", message: "Inputs must be non-negative." };
  }
  if (conversions > eligibleOpportunities) {
    return { kind: "error", message: "Conversions cannot exceed eligible opportunities." };
  }
  return { value: (conversions / eligibleOpportunities) * 100, label: "%" };
}

/**
 * Retention rate = retained users from a cohort / original cohort × 100.
 * Uses a precise cohort definition: users active in the original period who are
 * also active in the measured period.
 */
export function retentionRate(retained: number, originalCohort: number): MetricResult | MetricError {
  if (!Number.isFinite(retained) || !Number.isFinite(originalCohort)) {
    return { kind: "error", message: "Inputs must be finite numbers." };
  }
  if (originalCohort <= 0) {
    return { kind: "error", message: "Original cohort must be greater than 0." };
  }
  if (retained < 0 || originalCohort < 0) {
    return { kind: "error", message: "Inputs must be non-negative." };
  }
  if (retained > originalCohort) {
    return { kind: "error", message: "Retained cannot exceed original cohort." };
  }
  return { value: (retained / originalCohort) * 100, label: "%" };
}

/** Churn rate = users lost during a period / users at start of period × 100 */
export function churnRate(lost: number, usersAtStart: number): MetricResult | MetricError {
  if (!Number.isFinite(lost) || !Number.isFinite(usersAtStart)) {
    return { kind: "error", message: "Inputs must be finite numbers." };
  }
  if (usersAtStart <= 0) {
    return { kind: "error", message: "Users at start of period must be greater than 0." };
  }
  if (lost < 0 || usersAtStart < 0) {
    return { kind: "error", message: "Inputs must be non-negative." };
  }
  return { value: (lost / usersAtStart) * 100, label: "%" };
}

/** Customer acquisition cost = eligible acquisition spend / new customers acquired */
export function customerAcquisitionCost(
  spend: number,
  newCustomers: number,
): MetricResult | MetricError {
  if (!Number.isFinite(spend) || !Number.isFinite(newCustomers)) {
    return { kind: "error", message: "Inputs must be finite numbers." };
  }
  if (newCustomers <= 0) {
    return { kind: "error", message: "New customers must be greater than 0." };
  }
  if (spend < 0 || newCustomers < 0) {
    return { kind: "error", message: "Inputs must be non-negative." };
  }
  return { value: spend / newCustomers, label: "currency" };
}

/** Monthly recurring revenue = sum of eligible recurring revenue for the month */
export function monthlyRecurringRevenue(recurringRevenue: number): MetricResult | MetricError {
  if (!Number.isFinite(recurringRevenue)) {
    return { kind: "error", message: "Recurring revenue must be a finite number." };
  }
  if (recurringRevenue < 0) {
    return { kind: "error", message: "Recurring revenue must be non-negative." };
  }
  return { value: recurringRevenue, label: "currency" };
}

/** Round a value for presentation only; never use for further calculation. */
export function forPresentation(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}
