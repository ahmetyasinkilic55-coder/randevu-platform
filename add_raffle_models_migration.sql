-- Add time field to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS time VARCHAR(5);

-- Add userId field to appointments table for registered users
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add foreign key constraint for user_id
ALTER TABLE appointments ADD CONSTRAINT fk_appointments_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);

-- Create prizes table
CREATE TABLE IF NOT EXISTS prizes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    value INTEGER NOT NULL, -- Prize value in Turkish Lira
    image TEXT NOT NULL, -- Prize image URL
    sponsor TEXT,
    category TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create raffles table
CREATE TABLE IF NOT EXISTS raffles (
    id TEXT PRIMARY KEY,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    prize_id TEXT NOT NULL REFERENCES prizes(id),
    draw_date TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    winner_announced BOOLEAN NOT NULL DEFAULT false,
    winner_id TEXT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    
    UNIQUE(month, year)
);

-- Create raffle_participations table
CREATE TABLE IF NOT EXISTS raffle_participations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    raffle_id TEXT NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    rights_used INTEGER NOT NULL CHECK (rights_used > 0),
    participated_at TIMESTAMP NOT NULL DEFAULT now(),
    won BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_raffles_month_year ON raffles(month, year);
CREATE INDEX IF NOT EXISTS idx_raffles_winner_id ON raffles(winner_id);
CREATE INDEX IF NOT EXISTS idx_raffle_participations_user_id ON raffle_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_raffle_participations_raffle_id ON raffle_participations(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_participations_month_year ON raffle_participations(month, year);

-- Insert sample prize for current month
INSERT INTO prizes (id, title, description, value, image, sponsor, category, created_at, updated_at)
VALUES (
    'prize-sample-2024-12',
    'iPhone 15 Pro Max',
    '256GB Titan Blue renk iPhone 15 Pro Max. En son teknoloji ve şık tasarımın buluştuğu bu telefon, günlük yaşamınızı kolaylaştıracak.',
    65000,
    'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=512&h=512&fit=crop&crop=center',
    'RandeVur',
    'Teknoloji',
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

-- Update existing appointments to have a default time if NULL
UPDATE appointments SET time = '09:00' WHERE time IS NULL OR time = '';

-- Make time field NOT NULL after setting defaults
ALTER TABLE appointments ALTER COLUMN time SET NOT NULL;

COMMENT ON TABLE prizes IS 'Table for storing raffle prizes';
COMMENT ON TABLE raffles IS 'Table for storing monthly raffles';
COMMENT ON TABLE raffle_participations IS 'Table for storing user participations in raffles';
COMMENT ON COLUMN appointments.time IS 'Appointment time in HH:MM format';
COMMENT ON COLUMN appointments.user_id IS 'Reference to registered user (NULL for guest appointments)';
