-- Migration: Add service types and project/consultation request tables
-- Run this with: npx prisma db push

-- First, add new columns to business_settings if they don't exist
-- Note: SQLite doesn't support some ALTER TABLE operations, so we use CREATE TABLE AS

-- Create backup
CREATE TABLE business_settings_backup AS SELECT * FROM business_settings;

-- Drop and recreate business_settings with new structure
DROP TABLE business_settings;

CREATE TABLE "business_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceType" TEXT NOT NULL DEFAULT 'APPOINTMENT',
    "buttonText" TEXT NOT NULL DEFAULT 'Randevu Al',
    "consultationFee" REAL NOT NULL DEFAULT 0.0,
    "isConsultationFree" BOOLEAN NOT NULL DEFAULT true,
    "minimumProjectAmount" REAL NOT NULL DEFAULT 0.0,
    "workingRadius" TEXT,
    "supportedMeetingTypes" TEXT,
    "newAppointmentNotification" BOOLEAN NOT NULL DEFAULT true,
    "appointmentCancellationNotification" BOOLEAN NOT NULL DEFAULT true,
    "dailySummaryNotification" BOOLEAN NOT NULL DEFAULT true,
    "weeklyReportNotification" BOOLEAN NOT NULL DEFAULT false,
    "monthlyAnalysisNotification" BOOLEAN NOT NULL DEFAULT true,
    "marketingTipsNotification" BOOLEAN NOT NULL DEFAULT false,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "allowOnlineBooking" BOOLEAN NOT NULL DEFAULT true,
    "requireBookingApproval" BOOLEAN NOT NULL DEFAULT false,
    "bookingLeadTime" INTEGER NOT NULL DEFAULT 60,
    "cancellationPolicy" TEXT,
    "acceptCashPayment" BOOLEAN NOT NULL DEFAULT true,
    "acceptCardPayment" BOOLEAN NOT NULL DEFAULT false,
    "requireDepositForBooking" BOOLEAN NOT NULL DEFAULT false,
    "depositPercentage" REAL NOT NULL DEFAULT 0.0,
    "businessId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "business_settings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy data back from backup
INSERT INTO business_settings (
    id, businessId, createdAt, updatedAt,
    newAppointmentNotification, appointmentCancellationNotification,
    dailySummaryNotification, weeklyReportNotification, monthlyAnalysisNotification,
    marketingTipsNotification, emailNotifications, smsNotifications, pushNotifications,
    allowOnlineBooking, requireBookingApproval, bookingLeadTime, cancellationPolicy,
    acceptCashPayment, acceptCardPayment, requireDepositForBooking, depositPercentage
)
SELECT 
    id, businessId, createdAt, updatedAt,
    newAppointmentNotification, appointmentCancellationNotification,
    dailySummaryNotification, weeklyReportNotification, monthlyAnalysisNotification,
    marketingTipsNotification, emailNotifications, smsNotifications, pushNotifications,
    allowOnlineBooking, requireBookingApproval, bookingLeadTime, cancellationPolicy,
    acceptCashPayment, acceptCardPayment, requireDepositForBooking, depositPercentage
FROM business_settings_backup;

-- Create unique index
CREATE UNIQUE INDEX "business_settings_businessId_key" ON "business_settings"("businessId");

-- Clean up backup
DROP TABLE business_settings_backup;

-- Create project_requests table
CREATE TABLE "project_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "projectDescription" TEXT NOT NULL,
    "estimatedBudget" REAL,
    "preferredDate" DATETIME,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "businessId" TEXT NOT NULL,
    "businessResponse" TEXT,
    "estimatedPrice" REAL,
    "responseDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_requests_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create consultation_requests table
CREATE TABLE "consultation_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "consultationTopic" TEXT NOT NULL,
    "preferredDateTime" DATETIME,
    "meetingType" TEXT NOT NULL DEFAULT 'FACE_TO_FACE',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "businessId" TEXT NOT NULL,
    "businessResponse" TEXT,
    "proposedDateTime" DATETIME,
    "proposedMeetingUrl" TEXT,
    "responseDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "consultation_requests_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
