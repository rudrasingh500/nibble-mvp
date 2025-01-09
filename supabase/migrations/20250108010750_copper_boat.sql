-- Drop existing objects if they exist
DO $$ BEGIN
  -- Drop trigger if it exists
  DROP TRIGGER IF EXISTS update_vendor_rating_on_review ON reviews;
  
  -- Drop function if it exists
  DROP FUNCTION IF EXISTS update_vendor_rating();
  
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
  DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
  DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
  DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;

EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Create or replace the reviews table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
    CREATE TABLE reviews (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
      user_id uuid REFERENCES auth.users(id),
      rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment text NOT NULL CHECK (length(comment) <= 500),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      UNIQUE(vendor_id, user_id)
    );
  END IF;
END $$;

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view reviews"
  ON reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update vendor rating
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vendors
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM reviews
    WHERE vendor_id = NEW.vendor_id
  )
  WHERE id = NEW.vendor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update vendor rating
CREATE TRIGGER update_vendor_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_rating();