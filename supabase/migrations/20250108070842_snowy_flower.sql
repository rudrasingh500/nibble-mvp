-- Create a function to safely delete a vendor and all related records
CREATE OR REPLACE FUNCTION delete_vendor_with_relations(vendor_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete favorites first
  DELETE FROM favorites WHERE vendor_id = $1;
  
  -- Delete reviews
  DELETE FROM reviews WHERE vendor_id = $1;
  
  -- Finally delete the vendor
  DELETE FROM vendors WHERE id = $1;
END;
$$;