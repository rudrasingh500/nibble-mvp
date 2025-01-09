-- Drop the existing function first
DROP FUNCTION IF EXISTS delete_vendor_with_relations(uuid);

-- Create the function
CREATE FUNCTION delete_vendor_with_relations(target_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete favorites first
  DELETE FROM favorites f WHERE f.vendor_id = target_id;
  
  -- Delete reviews
  DELETE FROM reviews r WHERE r.vendor_id = target_id;
  
  -- Finally delete the vendor
  DELETE FROM vendors v WHERE v.id = target_id;
END;
$$;