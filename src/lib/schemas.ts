import { z } from "zod";
import {
  CompanyStatus,
  OwnershipType,
  BusinessModel,
  ResearchStatus,
  EventType,
  EvidenceStatus,
  ConfidenceLevel,
  MetricValueType,
  SourceType,
  RelationshipType,
  ReportType,
  CollectionVisibility,
} from "@prisma/client";

export const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters.")
  .max(80, "Slug must be at most 80 characters.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens only.",
  );

export const companySearchSchema = z.object({
  q: z.string().trim().min(1).max(200).optional(),
  industry: z.string().optional(),
  niche: z.string().optional(),
  country: z.string().optional(),
  status: z.string().optional(),
  stage: z.string().optional(),
  businessModel: z.string().optional(),
  ownership: z.string().optional(),
  researchStatus: z.string().optional(),
  sort: z.enum(["name", "founded", "updated", "status"]).default("name"),
  direction: z.enum(["asc", "desc"]).default("asc"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).max(1000).default(0),
});

export type CompanySearchInput = z.infer<typeof companySearchSchema>;

export const createCompanySchema = z.object({
  name: z.string().trim().min(2, "Company name is required.").max(200),
  slug: slugSchema.optional(),
  description: z.string().trim().max(4000).optional(),
  shortDescription: z.string().trim().max(300).optional(),
  foundedAt: z.string().datetime().optional().nullable(),
  headquarters: z.string().trim().max(200).optional().nullable(),
  website: z.string().url().max(500).optional().nullable(),
  logoUrl: z.string().url().max(500).optional().nullable(),
  companyStatus: z.nativeEnum(CompanyStatus).optional(),
  ownershipType: z.nativeEnum(OwnershipType).optional(),
  businessModel: z.nativeEnum(BusinessModel).optional(),
  researchStatus: z.nativeEnum(ResearchStatus).default("PARTIAL"),
  industryIds: z.array(z.string().min(1)).default([]),
  nicheIds: z.array(z.string().min(1)).default([]),
});

export const updateCompanySchema = createCompanySchema.partial();

export const createIndustrySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
  description: z.string().trim().max(1000).optional(),
  color: z.string().trim().max(20).optional(),
  parentIndustryId: z.string().optional().nullable(),
});

export const createNicheSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
  description: z.string().trim().max(1000).optional(),
  industryId: z.string().min(1, "Industry is required."),
});

export const createProductSchema = z.object({
  companyId: z.string().min(1),
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  status: z.string().trim().max(40).optional(),
  launchDate: z.string().datetime().optional().nullable(),
  pricingModel: z.string().trim().max(100).optional().nullable(),
});

export const createTimelineEventSchema = z.object({
  companyId: z.string().min(1),
  eventType: z.nativeEnum(EventType),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(4000).optional(),
  eventDate: z.string().datetime().optional().nullable(),
  evidenceStatus: z.nativeEnum(EvidenceStatus).default("REPORTED"),
  sourceExcerpt: z.string().trim().max(2000).optional().nullable(),
});

export const createStrategicDecisionSchema = z.object({
  companyId: z.string().min(1),
  title: z.string().trim().min(2).max(200),
  context: z.string().trim().max(4000).optional().nullable(),
  decision: z.string().trim().max(4000).optional().nullable(),
  documentedOutcome: z.string().trim().max(4000).optional().nullable(),
  analysis: z.string().trim().max(4000).optional().nullable(),
  limitations: z.string().trim().max(2000).optional().nullable(),
  evidenceStatus: z.nativeEnum(EvidenceStatus).default("INTERPRETATION"),
});

export const createSourceSchema = z.object({
  url: z.string().url("Enter a valid URL.").max(2000),
  title: z.string().trim().min(2).max(300),
  publisher: z.string().trim().max(200).optional().nullable(),
  author: z.string().trim().max(200).optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
  accessedAt: z.string().datetime().optional().nullable(),
  sourceType: z.nativeEnum(SourceType).default("OTHER"),
});

export const createMetricDefinitionSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: slugSchema,
  category: z.string().trim().min(2).max(80),
  definition: z.string().trim().max(4000).optional(),
  formula: z.string().trim().max(2000).optional(),
  unit: z.string().trim().max(80).optional().nullable(),
  applicableBusinessModels: z.string().trim().max(500).optional().nullable(),
  interpretation: z.string().trim().max(4000).optional(),
  limitations: z.string().trim().max(2000).optional(),
});

export const createMetricObservationSchema = z.object({
  companyId: z.string().min(1),
  metricDefinitionId: z.string().min(1),
  value: z.preprocess((val) => (val === "" || val === null || val === undefined ? undefined : Number(val)), z.number().optional().nullable()),
  valueText: z.string().trim().max(500).optional().nullable(),
  unit: z.string().trim().max(80).optional().nullable(),
  periodStart: z.string().datetime().optional().nullable(),
  periodEnd: z.string().datetime().optional().nullable(),
  reportedAt: z.string().datetime().optional().nullable(),
  valueType: z.nativeEnum(MetricValueType).default("REPORTED"),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const createClaimSchema = z.object({
  companyId: z.string().min(1),
  relatedEntityType: z.string().trim().max(60).optional().nullable(),
  relatedEntityId: z.string().optional().nullable(),
  claimText: z.string().trim().min(2).max(6000),
  evidenceStatus: z.nativeEnum(EvidenceStatus).default("REPORTED"),
  confidence: z.nativeEnum(ConfidenceLevel).default("MEDIUM"),
  verificationStatus: z.string().trim().max(60).optional().nullable(),
});

export const createCompetitorSchema = z.object({
  companyId: z.string().min(1),
  competitorCompanyId: z.string().min(1),
  relationshipType: z.nativeEnum(RelationshipType).default("DIRECT_COMPETITOR"),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const createCollectionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  visibility: z.nativeEnum(CollectionVisibility).default("PRIVATE"),
});

export const createComparisonSchema = z.object({
  name: z.string().trim().min(2).max(120),
  companyIds: z.array(z.string().min(1)).min(2).max(5),
});

export const generateReportSchema = z.object({
  companyId: z.string().min(1),
  type: z.nativeEnum(ReportType),
  sections: z.array(z.string()).default([]),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short.").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(24, "Username must be at most 24 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers, and underscores only.")
    .transform((v) => v.toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be at most 128 characters.")
    .regex(/[A-Za-z]/, "Password must include a letter.")
    .regex(/[0-9]/, "Password must include a number."),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(254),
  password: z.string().min(1).max(128),
});

