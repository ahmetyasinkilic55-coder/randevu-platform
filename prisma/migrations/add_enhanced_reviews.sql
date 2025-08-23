-- Migration to update Review schema for enhanced review system

-- Drop existing review table if needed and recreate with new structure
DROP TABLE IF EXISTS reviews;

-- Create updated reviews table with enhanced features
CREATE TABLE reviews (
    id TEXT PRIMARY KEY,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    
    -- Customer info
    customerName TEXT NOT NULL,
    customerPhone TEXT,
    customerEmail TEXT,
    customerAvatar TEXT,
    
    -- Rating breakdown
    serviceRating INTEGER CHECK (serviceRating >= 1 AND serviceRating <= 5),
    staffRating INTEGER CHECK (staffRating >= 1 AND staffRating <= 5),
    facilitiesRating INTEGER CHECK (facilitiesRating >= 1 AND facilitiesRating <= 5),
    priceRating INTEGER CHECK (priceRating >= 1 AND priceRating <= 5),
    
    -- Review status
    isApproved BOOLEAN NOT NULL DEFAULT 0,
    isVisible BOOLEAN NOT NULL DEFAULT 1,
    canReview BOOLEAN NOT NULL DEFAULT 0,
    
    -- Business relation
    businessId TEXT NOT NULL,
    
    -- Required appointment relation
    appointmentId TEXT NOT NULL UNIQUE,
    
    -- Business owner reply
    ownerReply TEXT,
    ownerReplyAt DATETIME,
    
    -- Media
    photos TEXT, -- JSON array of photo URLs
    
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (businessId) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_reviews_business ON reviews(businessId);
CREATE INDEX idx_reviews_appointment ON reviews(appointmentId);
CREATE INDEX idx_reviews_approved ON reviews(isApproved);
CREATE INDEX idx_reviews_visible ON reviews(isVisible);
CREATE INDEX idx_reviews_created ON reviews(createdAt);

-- Update appointments table to set some test appointments as COMPLETED
-- This is for testing purposes only
UPDATE appointments 
SET status = 'COMPLETED' 
WHERE id IN (
    SELECT id FROM appointments 
    ORDER BY createdAt DESC 
    LIMIT 5
);
