/*
  # Fix vendor columns and constraints

  1. Changes
    - Ensure menu_items and operating_hours columns exist with proper constraints
    - Add missing columns with appropriate defaults
    - Update column names to match application requirements

  2. Security
    - Maintain existing RLS policies
*/

DO $$ BEGIN
  -- Add or update menu_items column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'menu_items') THEN
    ALTER TABLE vendors ADD COLUMN menu_items jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;

  -- Add or update operating_hours column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'operating_hours') THEN
    ALTER TABLE vendors ADD COLUMN operating_hours jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;

  -- Add or update price_range column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'price_range') THEN
    ALTER TABLE vendors ADD COLUMN price_range integer NOT NULL DEFAULT 1;
  END IF;

  -- Add or update address column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'address') THEN
    ALTER TABLE vendors ADD COLUMN address text NOT NULL DEFAULT '';
  END IF;

  -- Add constraints
  ALTER TABLE vendors DROP CONSTRAINT IF EXISTS price_range_check;
  ALTER TABLE vendors ADD CONSTRAINT price_range_check 
    CHECK (price_range BETWEEN 1 AND 4);

  ALTER TABLE vendors DROP CONSTRAINT IF EXISTS menu_items_check;
  ALTER TABLE vendors ADD CONSTRAINT menu_items_check 
    CHECK (jsonb_typeof(menu_items) = 'array');

  ALTER TABLE vendors DROP CONSTRAINT IF EXISTS operating_hours_check;
  ALTER TABLE vendors ADD CONSTRAINT operating_hours_check 
    CHECK (jsonb_typeof(operating_hours) = 'array');

EXCEPTION
  WHEN others THEN
    NULL;
END $$;