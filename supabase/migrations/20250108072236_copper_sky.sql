-- Drop the existing function
DROP FUNCTION IF EXISTS get_review_with_user_email(uuid);

-- Create a secure function to get user email with review
CREATE OR REPLACE FUNCTION get_review_with_user_email(target_review_id uuid)
RETURNS TABLE (
  review_id uuid,
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
    r.id as review_id,
    r.vendor_id,
    r.user_id,
    r.rating,
    r.comment,
    r.created_at,
    r.updated_at,
    u.email::text as user_email
  FROM reviews r
  JOIN auth.users u ON r.user_id = u.id
  WHERE r.id = target_review_id;
END;
$$ LANGUAGE plpgsql;