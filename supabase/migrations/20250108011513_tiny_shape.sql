/*
  # Reviews and Profiles Schema Update

  1. Tables
    - `profiles` for user data
    - `reviews` for vendor reviews
  
  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and managing profiles/reviews
  
  3. Automation
    - Add trigger for profile creation on user signup
    - Add trigger for vendor rating updates on review changes
*/

-- Drop existing objects if they exist
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_vendor_rating_on_review ON reviews;
  DROP FUNCTION IF EXISTS update_vendor_rating();
  DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
  DROP FUNCTION IF EXISTS create_profile_for_user();
  DROP TABLE IF EXISTS reviews;
  DROP TABLE IF EXISTS profiles;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create profile policies
CREATE POLICY "Anyone can view profiles"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create profile trigger function
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profile trigger
CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- Create reviews table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL CHECK (length(comment) <= 500),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(vendor_id, user_id)
);

-- Enable RLS on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create review policies
CREATE POLICY "Anyone can view reviews"
  ON reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create vendor rating update function
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
DECLARE
  vid uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    vid := OLD.vendor_id;
  ELSE
    vid := NEW.vendor_id;
  END IF;

  UPDATE vendors
  SET rating = COALESCE((
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM reviews
    WHERE vendor_id = vid
  ), 0)
  WHERE id = vid;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create vendor rating trigger
CREATE TRIGGER update_vendor_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_rating();