/*
  # Fix vendor rating calculation trigger

  1. Changes
    - Drop and recreate trigger to handle all operations properly
    - Update function to handle all cases correctly
    - Ensure trigger fires for INSERT, UPDATE, and DELETE
*/

-- Drop existing trigger
DROP TRIGGER IF EXISTS update_vendor_rating_on_review ON reviews;

-- Update the function
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
DECLARE
  affected_vendor_id uuid;
BEGIN
  -- Get the affected vendor_id based on operation type
  IF TG_OP = 'DELETE' THEN
    affected_vendor_id := OLD.vendor_id;
  ELSE
    affected_vendor_id := NEW.vendor_id;
  END IF;

  -- Update the vendor's rating
  UPDATE vendors v
  SET rating = (
    SELECT COALESCE(
      ROUND(
        SUM(CAST(r.rating AS decimal))::decimal / COUNT(r.id),
        1
      ),
      0
    )
    FROM reviews r
    WHERE r.vendor_id = affected_vendor_id
  )
  WHERE v.id = affected_vendor_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to handle all operations
CREATE TRIGGER update_vendor_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_rating();