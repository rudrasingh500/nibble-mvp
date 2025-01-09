/*
  # Add vendor fields

  1. Changes
    - Add menu_items as JSONB array
    - Add operating_hours as JSONB array
    - Add proper constraints and defaults
*/

DO $$ BEGIN
  -- Add menu_items if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'menu_items') THEN
    ALTER TABLE vendors ADD COLUMN menu_items jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;

  -- Add operating_hours if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'operating_hours') THEN
    ALTER TABLE vendors ADD COLUMN operating_hours jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;

  -- Add JSON validation for menu_items
  ALTER TABLE vendors ADD CONSTRAINT menu_items_check CHECK (
    jsonb_typeof(menu_items) = 'array' AND
    jsonb_array_length(menu_items) >= 0
  );

  -- Add JSON validation for operating_hours
  ALTER TABLE vendors ADD CONSTRAINT operating_hours_check CHECK (
    jsonb_typeof(operating_hours) = 'array' AND
    jsonb_array_length(operating_hours) >= 0
  );

END $$;