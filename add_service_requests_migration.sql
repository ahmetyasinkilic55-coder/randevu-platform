-- Service Request System Migration
-- This migration adds service request functionality

-- Create service request urgency enum
CREATE TYPE "ServiceRequestUrgency" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- Create service request status enum  
CREATE TYPE "ServiceRequestStatus" AS ENUM ('PENDING', 'ACTIVE', 'RESPONDED', 'ACCEPTED', 'EXPIRED', 'CANCELLED', 'COMPLETED');

-- Create service request response status enum
CREATE TYPE "ServiceRequestResponseStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- Create service_requests table
CREATE TABLE "service_requests" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "categoryId" TEXT,
    "subcategoryId" TEXT,
    "serviceName" TEXT NOT NULL,
    "serviceDetails" TEXT,
    "budget" DOUBLE PRECISION,
    "urgency" "ServiceRequestUrgency" NOT NULL DEFAULT 'NORMAL',
    "provinceId" INTEGER,
    "districtId" INTEGER,
    "province" TEXT,
    "district" TEXT,
    "address" TEXT,
    "preferredDate" TIMESTAMP(3),
    "preferredTime" TEXT,
    "flexibleTiming" BOOLEAN NOT NULL DEFAULT true,
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- Create service_request_responses table
CREATE TABLE "service_request_responses" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "message" TEXT,
    "proposedPrice" DOUBLE PRECISION,
    "proposedDate" TIMESTAMP(3),
    "proposedTime" TEXT,
    "availability" TEXT,
    "status" "ServiceRequestResponseStatus" NOT NULL DEFAULT 'PENDING',
    "customerViewed" BOOLEAN NOT NULL DEFAULT false,
    "customerRating" INTEGER,
    "customerFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_request_responses_pkey" PRIMARY KEY ("id")
);

-- Create unique index for service request responses (business can respond only once per request)
CREATE UNIQUE INDEX "service_request_responses_serviceRequestId_businessId_key" ON "service_request_responses"("serviceRequestId", "businessId");

-- Add foreign key constraints
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "service_request_responses" ADD CONSTRAINT "service_request_responses_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "service_request_responses" ADD CONSTRAINT "service_request_responses_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for performance
CREATE INDEX "service_requests_status_idx" ON "service_requests"("status");
CREATE INDEX "service_requests_urgency_idx" ON "service_requests"("urgency");
CREATE INDEX "service_requests_provinceId_idx" ON "service_requests"("provinceId");
CREATE INDEX "service_requests_districtId_idx" ON "service_requests"("districtId");
CREATE INDEX "service_requests_categoryId_idx" ON "service_requests"("categoryId");
CREATE INDEX "service_requests_subcategoryId_idx" ON "service_requests"("subcategoryId");
CREATE INDEX "service_requests_expiresAt_idx" ON "service_requests"("expiresAt");
CREATE INDEX "service_requests_createdAt_idx" ON "service_requests"("createdAt");

CREATE INDEX "service_request_responses_businessId_idx" ON "service_request_responses"("businessId");
CREATE INDEX "service_request_responses_status_idx" ON "service_request_responses"("status");
CREATE INDEX "service_request_responses_createdAt_idx" ON "service_request_responses"("createdAt");
