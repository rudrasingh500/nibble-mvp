/*
  # Update vendor schema with new fields

  1. Changes
    - Add address field
    - Add operating_hours JSONB array
    - Add menu_items JSONB array
    - Add website field
    - Update existing fields with proper constraints

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns if they don't exist
DO $$ BEGIN
  -- Add address field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'address') THEN
    ALTER TABLE vendors ADD COLUMN address text NOT NULL DEFAULT '';
  END IF;

  -- Add operating hours
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'operating_hours') THEN
    ALTER TABLE vendors ADD COLUMN operating_hours jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;

  -- Add menu items
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'menu_items') THEN
    ALTER TABLE vendors ADD COLUMN menu_items jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;

  -- Add website
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'website') THEN
    ALTER TABLE vendors ADD COLUMN website text;
  END IF;

  -- Update existing columns with proper constraints
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'price_range') THEN
    ALTER TABLE vendors ALTER COLUMN price_range SET DEFAULT 1;
    ALTER TABLE vendors ADD CONSTRAINT price_range_check CHECK (price_range BETWEEN 1 AND 4);
  END IF;

END $$;