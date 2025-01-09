/*
  # Fix vendor rating calculation

  1. Changes
    - Update the vendor rating calculation function to properly calculate the average rating
    - Handle DELETE operations correctly
    - Ensure rating is rounded to 1 decimal place
*/

CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
DECLARE
  vid uuid;
BEGIN
  -- Determine which vendor_id to use based on operation
  IF TG_OP = 'DELETE' THEN
    vid := OLD.vendor_id;
  ELSE
    vid := NEW.vendor_id;
  END IF;

  -- Update the vendor's rating with proper average calculation
  UPDATE vendors
  SET rating = (
    SELECT COALESCE(
      ROUND(
        CAST(AVG(CAST(rating AS numeric)) AS numeric),
        1
      ),
      0
    )
    FROM reviews
    WHERE vendor_id = vid
  )
  WHERE id = vid;

  -- Return appropriate record based on operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;