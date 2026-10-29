-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'ACQUIRED', 'CLOSED', 'IPO', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('PUBLIC', 'PRIVATE', 'SUBSIDIARY', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "BusinessModel" AS ENUM ('SAAS', 'MARKETPLACE', 'SUBSCRIPTION', 'TRANSACTION', 'ADVERTISING', 'BROKERAGE', 'ECOMMERCE', 'FREEMIUM', 'OTHER');

-- CreateEnum
CREATE TYPE "ResearchStatus" AS ENUM ('UNRESEARCHED', 'PARTIAL', 'RESEARCHED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('VERIFIED', 'REPORTED', 'ESTIMATED', 'INTERPRETATION', 'ILLUSTRATIVE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "MetricValueType" AS ENUM ('REPORTED', 'CALCULATED', 'ESTIMATED', 'ILLUSTRATIVE');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('COMPANY_FILING', 'COMPANY_ANNOUNCEMENT', 'COMPANY_DOCUMENTATION', 'REGULATORY_FILING', 'FOUNDER_INTERVIEW', 'BUSINESS_JOURNALISM', 'RESEARCH_PAPER', 'INDUSTRY_REPORT', 'CUSTOMER_FEEDBACK', 'OTHER');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('FOUNDED', 'PRODUCT_LAUNCH', 'PIVOT', 'MARKET_EXPANSION', 'FUNDING', 'PARTNERSHIP', 'ACQUISITION', 'MERGER', 'LEADERSHIP_CHANGE', 'FAILURE', 'RECOVERY', 'CLOSURE', 'RESTRUCTURING', 'OTHER');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('DIRECT_COMPETITOR', 'INDIRECT_COMPETITOR', 'ALTERNATIVE', 'PARTNER', 'ACQUIRED_BY', 'ACQUIRED', 'INVESTOR', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('COMPANY_INTELLIGENCE', 'PM_METRICS');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CollectionVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "reducedMotion" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Industry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "parentIndustryId" TEXT,
    "companyCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Niche" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "industryId" TEXT NOT NULL,
    "companyCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Niche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "foundedAt" TIMESTAMP(3),
    "headquarters" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "companyStatus" "CompanyStatus" NOT NULL DEFAULT 'UNKNOWN',
    "ownershipType" "OwnershipType" NOT NULL DEFAULT 'PRIVATE',
    "businessModel" "BusinessModel" NOT NULL DEFAULT 'OTHER',
    "researchStatus" "ResearchStatus" NOT NULL DEFAULT 'UNRESEARCHED',
    "lastResearchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyIndustry" (
    "companyId" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyIndustry_pkey" PRIMARY KEY ("companyId","industryId")
);

-- CreateTable
CREATE TABLE "CompanyNiche" (
    "companyId" TEXT NOT NULL,
    "nicheId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyNiche_pkey" PRIMARY KEY ("companyId","nicheId")
);

-- CreateTable
CREATE TABLE "Founder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "biography" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Founder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyFounder" (
    "companyId" TEXT NOT NULL,
    "founderId" TEXT NOT NULL,
    "role" TEXT,
    "joinedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "CompanyFounder_pkey" PRIMARY KEY ("companyId","founderId")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT,
    "launchDate" TIMESTAMP(3),
    "pricingModel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventDate" TIMESTAMP(3),
    "evidenceStatus" "EvidenceStatus" NOT NULL DEFAULT 'REPORTED',
    "sourceExcerpt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEventSource" (
    "timelineEventId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "context" TEXT,

    CONSTRAINT "TimelineEventSource_pkey" PRIMARY KEY ("timelineEventId","sourceId")
);

-- CreateTable
CREATE TABLE "StrategicDecision" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "context" TEXT,
    "decision" TEXT,
    "documentedOutcome" TEXT,
    "analysis" TEXT,
    "limitations" TEXT,
    "evidenceStatus" "EvidenceStatus" NOT NULL DEFAULT 'INTERPRETATION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategicDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategicDecisionSource" (
    "strategicDecisionId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "context" TEXT,

    CONSTRAINT "StrategicDecisionSource_pkey" PRIMARY KEY ("strategicDecisionId","sourceId")
);

-- CreateTable
CREATE TABLE "MetricDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "definition" TEXT,
    "formula" TEXT,
    "unit" TEXT,
    "applicableBusinessModels" TEXT,
    "interpretation" TEXT,
    "limitations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetricDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricObservation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "metricDefinitionId" TEXT NOT NULL,
    "value" DECIMAL(65,30),
    "valueText" TEXT,
    "unit" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "reportedAt" TIMESTAMP(3),
    "valueType" "MetricValueType" NOT NULL DEFAULT 'REPORTED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetricObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricObservationSource" (
    "metricObservationId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "MetricObservationSource_pkey" PRIMARY KEY ("metricObservationId","sourceId")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publisher" TEXT,
    "author" TEXT,
    "publishedAt" TIMESTAMP(3),
    "accessedAt" TIMESTAMP(3),
    "sourceType" "SourceType" NOT NULL DEFAULT 'OTHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "claimText" TEXT NOT NULL,
    "evidenceStatus" "EvidenceStatus" NOT NULL DEFAULT 'REPORTED',
    "confidence" "ConfidenceLevel" NOT NULL DEFAULT 'MEDIUM',
    "verificationStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimSource" (
    "claimId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "supportingContext" TEXT,

    CONSTRAINT "ClaimSource_pkey" PRIMARY KEY ("claimId","sourceId")
);

-- CreateTable
CREATE TABLE "CompetitorRelationship" (
    "companyId" TEXT NOT NULL,
    "competitorCompanyId" TEXT NOT NULL,
    "relationshipType" "RelationshipType" NOT NULL DEFAULT 'DIRECT_COMPETITOR',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorRelationship_pkey" PRIMARY KEY ("companyId","competitorCompanyId")
);

-- CreateTable
CREATE TABLE "UserCollection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "CollectionVisibility" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionItem" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "relatedEntityType" TEXT NOT NULL,
    "relatedEntityId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedComparison" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyIds" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "companyId" TEXT,
    "type" "ReportType" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "fileUrl" TEXT,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchEdit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchEdit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_slug_key" ON "Industry"("slug");

-- CreateIndex
CREATE INDEX "Industry_slug_idx" ON "Industry"("slug");

-- CreateIndex
CREATE INDEX "Industry_parentIndustryId_idx" ON "Industry"("parentIndustryId");

-- CreateIndex
CREATE UNIQUE INDEX "Niche_slug_key" ON "Niche"("slug");

-- CreateIndex
CREATE INDEX "Niche_slug_idx" ON "Niche"("slug");

-- CreateIndex
CREATE INDEX "Niche_industryId_idx" ON "Niche"("industryId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_slug_idx" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_companyStatus_idx" ON "Company"("companyStatus");

-- CreateIndex
CREATE INDEX "Company_businessModel_idx" ON "Company"("businessModel");

-- CreateIndex
CREATE INDEX "Company_researchStatus_idx" ON "Company"("researchStatus");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Founder_name_idx" ON "Founder"("name");

-- CreateIndex
CREATE INDEX "Product_companyId_idx" ON "Product"("companyId");

-- CreateIndex
CREATE INDEX "TimelineEvent_companyId_idx" ON "TimelineEvent"("companyId");

-- CreateIndex
CREATE INDEX "TimelineEvent_eventDate_idx" ON "TimelineEvent"("eventDate");

-- CreateIndex
CREATE INDEX "StrategicDecision_companyId_idx" ON "StrategicDecision"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "MetricDefinition_slug_key" ON "MetricDefinition"("slug");

-- CreateIndex
CREATE INDEX "MetricDefinition_slug_idx" ON "MetricDefinition"("slug");

-- CreateIndex
CREATE INDEX "MetricDefinition_category_idx" ON "MetricDefinition"("category");

-- CreateIndex
CREATE INDEX "MetricObservation_companyId_idx" ON "MetricObservation"("companyId");

-- CreateIndex
CREATE INDEX "MetricObservation_metricDefinitionId_idx" ON "MetricObservation"("metricDefinitionId");

-- CreateIndex
CREATE INDEX "MetricObservation_periodEnd_idx" ON "MetricObservation"("periodEnd");

-- CreateIndex
CREATE INDEX "Source_url_idx" ON "Source"("url");

-- CreateIndex
CREATE INDEX "Claim_companyId_idx" ON "Claim"("companyId");

-- CreateIndex
CREATE INDEX "UserCollection_userId_idx" ON "UserCollection"("userId");

-- CreateIndex
CREATE INDEX "CollectionItem_collectionId_idx" ON "CollectionItem"("collectionId");

-- CreateIndex
CREATE INDEX "CollectionItem_relatedEntityType_relatedEntityId_idx" ON "CollectionItem"("relatedEntityType", "relatedEntityId");

-- CreateIndex
CREATE INDEX "SavedComparison_userId_idx" ON "SavedComparison"("userId");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE INDEX "Report_companyId_idx" ON "Report"("companyId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "ResearchEdit_companyId_idx" ON "ResearchEdit"("companyId");

-- CreateIndex
CREATE INDEX "ResearchEdit_userId_createdAt_idx" ON "ResearchEdit"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Industry" ADD CONSTRAINT "Industry_parentIndustryId_fkey" FOREIGN KEY ("parentIndustryId") REFERENCES "Industry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Niche" ADD CONSTRAINT "Niche_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyIndustry" ADD CONSTRAINT "CompanyIndustry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyIndustry" ADD CONSTRAINT "CompanyIndustry_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyNiche" ADD CONSTRAINT "CompanyNiche_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyNiche" ADD CONSTRAINT "CompanyNiche_nicheId_fkey" FOREIGN KEY ("nicheId") REFERENCES "Niche"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFounder" ADD CONSTRAINT "CompanyFounder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFounder" ADD CONSTRAINT "CompanyFounder_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "Founder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEventSource" ADD CONSTRAINT "TimelineEventSource_timelineEventId_fkey" FOREIGN KEY ("timelineEventId") REFERENCES "TimelineEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEventSource" ADD CONSTRAINT "TimelineEventSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategicDecision" ADD CONSTRAINT "StrategicDecision_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategicDecisionSource" ADD CONSTRAINT "StrategicDecisionSource_strategicDecisionId_fkey" FOREIGN KEY ("strategicDecisionId") REFERENCES "StrategicDecision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategicDecisionSource" ADD CONSTRAINT "StrategicDecisionSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricObservation" ADD CONSTRAINT "MetricObservation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricObservation" ADD CONSTRAINT "MetricObservation_metricDefinitionId_fkey" FOREIGN KEY ("metricDefinitionId") REFERENCES "MetricDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricObservationSource" ADD CONSTRAINT "MetricObservationSource_metricObservationId_fkey" FOREIGN KEY ("metricObservationId") REFERENCES "MetricObservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricObservationSource" ADD CONSTRAINT "MetricObservationSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimSource" ADD CONSTRAINT "ClaimSource_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimSource" ADD CONSTRAINT "ClaimSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorRelationship" ADD CONSTRAINT "CompetitorRelationship_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorRelationship" ADD CONSTRAINT "CompetitorRelationship_competitorCompanyId_fkey" FOREIGN KEY ("competitorCompanyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCollection" ADD CONSTRAINT "UserCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "UserCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_relatedEntityId_fkey" FOREIGN KEY ("relatedEntityId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedComparison" ADD CONSTRAINT "SavedComparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchEdit" ADD CONSTRAINT "ResearchEdit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchEdit" ADD CONSTRAINT "ResearchEdit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
