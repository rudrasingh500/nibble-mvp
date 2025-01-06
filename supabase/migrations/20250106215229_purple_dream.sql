/*
  # Update vendor schema and policies

  1. Changes
    - Add missing columns to vendors table
    - Update RLS policies for vendors table
*/

-- Drop conflicting policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage their own vendors" ON vendors;
  DROP POLICY IF EXISTS "Anyone can view vendors" ON vendors;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Update vendors table with new columns if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'phone') THEN
    ALTER TABLE vendors ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'website') THEN
    ALTER TABLE vendors ADD COLUMN website text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'price_range') THEN
    ALTER TABLE vendors ADD COLUMN price_range integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'opening_time') THEN
    ALTER TABLE vendors ADD COLUMN opening_time time;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'closing_time') THEN
    ALTER TABLE vendors ADD COLUMN closing_time time;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'menu_items') THEN
    ALTER TABLE vendors ADD COLUMN menu_items jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create RLS policies
CREATE POLICY "Anyone can view vendors"
  ON vendors
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own vendors"
  ON vendors
  FOR ALL
  USING (auth.uid() = user_id);