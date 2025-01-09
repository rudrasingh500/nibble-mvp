-- Drop existing foreign key constraint if it exists
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Add new foreign key constraint referencing auth.users directly
ALTER TABLE reviews
  ADD CONSTRAINT reviews_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Create a secure function to get user email with review
CREATE OR REPLACE FUNCTION get_review_with_user_email(review_id uuid)
RETURNS TABLE (
  id uuid,
  vendor_id uuid,
  user_id uuid,
  rating integer,
  comment text,
  created_at timestamptz,
  updated_at timestamptz,
  user_email text
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.*,
    u.email as user_email
  FROM reviews r
  JOIN auth.users u ON r.user_id = u.id
  WHERE r.id = review_id;
END;
$$ LANGUAGE plpgsql;