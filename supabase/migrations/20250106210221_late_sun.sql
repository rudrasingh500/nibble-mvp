/*
  # Create vendors table

  1. New Tables
    - `vendors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `image` (text)
      - `rating` (numeric)
      - `cuisine` (text)
      - `lat` (numeric)
      - `lng` (numeric)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key)

  2. Security
    - Enable RLS on `vendors` table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  image text NOT NULL,
  rating numeric NOT NULL DEFAULT 0,
  cuisine text NOT NULL,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Allow users to read all vendors
CREATE POLICY "Anyone can view vendors"
  ON vendors
  FOR SELECT
  USING (true);

-- Allow authenticated users to create vendors
CREATE POLICY "Authenticated users can create vendors"
  ON vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own vendors
CREATE POLICY "Users can update own vendors"
  ON vendors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own vendors
CREATE POLICY "Users can delete own vendors"
  ON vendors
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);