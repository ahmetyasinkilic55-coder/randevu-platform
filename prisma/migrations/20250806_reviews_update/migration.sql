-- CreateTable
CREATE TABLE "reviews_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "ownerReplyAt" DATETIME,
    "photos" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reviews_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy data from old table if exists
INSERT OR IGNORE INTO "reviews_new" ("id", "rating", "comment", "customerName", "customerPhone", "customerEmail", "customerAvatar", "businessId", "appointmentId", "createdAt", "updatedAt", "isApproved", "isVisible")
SELECT "id", "rating", "comment", "customerName", "customerPhone", "customerEmail", "customerAvatar", "businessId", 
       COALESCE("appointmentId", "id"), "createdAt", "updatedAt", 
       COALESCE("isApproved", 0), COALESCE("isVisible", 1)
FROM "reviews" WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='reviews');

-- Drop old table and rename new one
DROP TABLE IF EXISTS "reviews";
ALTER TABLE "reviews_new" RENAME TO "reviews";

-- CreateIndex
CREATE UNIQUE INDEX "reviews_appointmentId_key" ON "reviews"("appointmentId");

-- CreateIndex  
CREATE INDEX "reviews_businessId_idx" ON "reviews"("businessId");

-- CreateIndex
CREATE INDEX "reviews_isApproved_idx" ON "reviews"("isApproved");

-- CreateIndex
CREATE INDEX "reviews_createdAt_idx" ON "reviews"("createdAt");
