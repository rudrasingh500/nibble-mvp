/*
  # Add additional vendor fields

  1. New Fields
    - `phone` (text): Contact phone number
    - `email` (text): Contact email address
    - `website` (text): Vendor's website URL
    - `price_range` (smallint): Price range from 1-4 ($-$$$$)
    - `opening_time` (time): Daily opening time
    - `closing_time` (time): Daily closing time
    - `menu_items` (jsonb): Array of menu items with names and prices

  2. Changes
    - Add nullable contact fields to vendors table
    - Add operating hours
    - Add menu items as JSON array
*/

DO $$ BEGIN
  -- Add contact information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'phone') THEN
    ALTER TABLE vendors ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'email') THEN
    ALTER TABLE vendors ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'website') THEN
    ALTER TABLE vendors ADD COLUMN website text;
  END IF;

  -- Add price range
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'price_range') THEN
    ALTER TABLE vendors ADD COLUMN price_range smallint DEFAULT 1 CHECK (price_range BETWEEN 1 AND 4);
  END IF;

  -- Add operating hours
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'opening_time') THEN
    ALTER TABLE vendors ADD COLUMN opening_time time;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'closing_time') THEN
    ALTER TABLE vendors ADD COLUMN closing_time time;
  END IF;

  -- Add menu items
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'menu_items') THEN
    ALTER TABLE vendors ADD COLUMN menu_items jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;