-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('BUSINESS_OWNER', 'STAFF', 'ADMIN', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "public"."Sector" AS ENUM ('BERBER', 'KUAFOR', 'DISHEKIMI', 'OTOYIKAMA', 'SPORSALONU', 'GUZELLIKMERKEZI', 'VETERINER', 'MASAJ', 'DUGUNSALONU', 'KURSMERKEZI', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "public"."GalleryType" AS ENUM ('WORK', 'SALON', 'STAFF', 'CERTIFICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "public"."VideoCallStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ProjectRequestStatus" AS ENUM ('PENDING', 'RESPONDED', 'ACCEPTED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."ConsultationRequestStatus" AS ENUM ('PENDING', 'RESPONDED', 'SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ConsultationMeetingType" AS ENUM ('FACE_TO_FACE', 'ONLINE', 'PHONE');

-- CreateEnum
CREATE TYPE "public"."StaffLeaveType" AS ENUM ('FULL_DAY', 'PARTIAL', 'MULTI_DAY');

-- CreateEnum
CREATE TYPE "public"."StaffLeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "position" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'BUSINESS_OWNER',
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "birthDate" TIMESTAMP(3),
    "gender" "public"."Gender",
    "city" TEXT,
    "district" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subcategories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."businesses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'BARBER',
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "coverImage" TEXT,
    "categoryId" TEXT,
    "subcategoryId" TEXT,
    "province" TEXT,
    "district" TEXT,
    "provinceId" INTEGER,
    "districtId" INTEGER,
    "profilePhotoUrl" TEXT,
    "coverPhotoUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "established" INTEGER,
    "languages" TEXT,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "tiktokUrl" TEXT,
    "websiteUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "appointmentSettings" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Temel Hizmetler',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "specialty" TEXT,
    "experience" INTEGER,
    "rating" DOUBLE PRECISION,
    "bio" TEXT,
    "photoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."working_hours" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "lunchStartTime" TEXT,
    "lunchEndTime" TEXT,
    "businessId" TEXT NOT NULL,

    CONSTRAINT "working_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."staff_schedules" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "public"."DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isWorking" BOOLEAN NOT NULL DEFAULT true,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "staff_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."staff_leaves" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "type" "public"."StaffLeaveType" NOT NULL DEFAULT 'FULL_DAY',
    "reason" TEXT NOT NULL,
    "status" "public"."StaffLeaveStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "staffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gallery_items" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "type" "public"."GalleryType" NOT NULL DEFAULT 'WORK',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reviews" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "customerAvatar" TEXT,
    "serviceRating" INTEGER,
    "staffRating" INTEGER,
    "facilitiesRating" INTEGER,
    "priceRating" INTEGER,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "canReview" BOOLEAN NOT NULL DEFAULT false,
    "businessId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "ownerReply" TEXT,
    "ownerReplyAt" TIMESTAMP(3),
    "photos" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointments" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "public"."AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "businessId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "staffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."video_calls" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "roomName" TEXT,
    "roomUrl" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "status" "public"."VideoCallStatus" NOT NULL DEFAULT 'SCHEDULED',
    "participants" JSONB,
    "recordingUrl" TEXT,
    "isRecorded" BOOLEAN NOT NULL DEFAULT false,
    "moderatorNotes" TEXT,
    "flaggedContent" BOOLEAN NOT NULL DEFAULT false,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."website_configs" (
    "id" TEXT NOT NULL,
    "urlSlug" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "template" TEXT NOT NULL DEFAULT 'modern',
    "primaryColor" TEXT NOT NULL DEFAULT '#2563eb',
    "secondaryColor" TEXT NOT NULL DEFAULT '#1d4ed8',
    "gradientColors" TEXT NOT NULL DEFAULT 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL DEFAULT 'Randevu Al',
    "showServices" BOOLEAN NOT NULL DEFAULT true,
    "showTeam" BOOLEAN NOT NULL DEFAULT true,
    "showGallery" BOOLEAN NOT NULL DEFAULT true,
    "showReviews" BOOLEAN NOT NULL DEFAULT true,
    "showMap" BOOLEAN NOT NULL DEFAULT true,
    "showContact" BOOLEAN NOT NULL DEFAULT true,
    "profilePhoto" TEXT,
    "coverPhoto" TEXT,
    "galleryPhotos" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "googleAnalyticsId" TEXT,
    "facebookPixelId" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "customCss" TEXT,
    "customJs" TEXT,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."business_settings" (
    "id" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL DEFAULT 'APPOINTMENT',
    "buttonText" TEXT NOT NULL DEFAULT 'Randevu Al',
    "consultationFee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "isConsultationFree" BOOLEAN NOT NULL DEFAULT true,
    "minimumProjectAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
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
    "depositPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT true,
    "appointmentReminders" BOOLEAN NOT NULL DEFAULT true,
    "promotionalMessages" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_requests" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "projectDescription" TEXT NOT NULL,
    "estimatedBudget" DOUBLE PRECISION,
    "preferredDate" TIMESTAMP(3),
    "location" TEXT,
    "status" "public"."ProjectRequestStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "businessId" TEXT NOT NULL,
    "businessResponse" TEXT,
    "estimatedPrice" DOUBLE PRECISION,
    "responseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consultation_requests" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "consultationTopic" TEXT NOT NULL,
    "preferredDateTime" TIMESTAMP(3),
    "meetingType" "public"."ConsultationMeetingType" NOT NULL DEFAULT 'FACE_TO_FACE',
    "status" "public"."ConsultationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "businessId" TEXT NOT NULL,
    "businessResponse" TEXT,
    "proposedDateTime" TIMESTAMP(3),
    "proposedMeetingUrl" TEXT,
    "responseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "public"."accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "public"."sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "public"."categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "public"."categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "subcategories_slug_key" ON "public"."subcategories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_slug_key" ON "public"."businesses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "services_businessId_name_key" ON "public"."services"("businessId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "staff_businessId_name_key" ON "public"."staff"("businessId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "working_hours_businessId_dayOfWeek_key" ON "public"."working_hours"("businessId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "staff_schedules_staffId_dayOfWeek_key" ON "public"."staff_schedules"("staffId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_appointmentId_key" ON "public"."reviews"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "video_calls_appointmentId_key" ON "public"."video_calls"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "website_configs_urlSlug_key" ON "public"."website_configs"("urlSlug");

-- CreateIndex
CREATE UNIQUE INDEX "website_configs_businessId_key" ON "public"."website_configs"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "business_settings_businessId_key" ON "public"."business_settings"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_userId_key" ON "public"."notification_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_businessId_key" ON "public"."favorites"("userId", "businessId");

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subcategories" ADD CONSTRAINT "subcategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."businesses" ADD CONSTRAINT "businesses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."businesses" ADD CONSTRAINT "businesses_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "public"."subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."businesses" ADD CONSTRAINT "businesses_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."services" ADD CONSTRAINT "services_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."staff" ADD CONSTRAINT "staff_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."working_hours" ADD CONSTRAINT "working_hours_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."staff_schedules" ADD CONSTRAINT "staff_schedules_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."staff_leaves" ADD CONSTRAINT "staff_leaves_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gallery_items" ADD CONSTRAINT "gallery_items_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."video_calls" ADD CONSTRAINT "video_calls_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."website_configs" ADD CONSTRAINT "website_configs_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."business_settings" ADD CONSTRAINT "business_settings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_settings" ADD CONSTRAINT "notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_requests" ADD CONSTRAINT "project_requests_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consultation_requests" ADD CONSTRAINT "consultation_requests_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorites" ADD CONSTRAINT "favorites_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
