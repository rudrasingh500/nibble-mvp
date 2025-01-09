/*
  # Add favorites functionality
  
  1. New Tables
    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `vendor_id` (uuid, references vendors)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `favorites` table
    - Add policies for users to manage their favorites
    - Add policy for vendors to see who favorited them
*/

CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  vendor_id uuid REFERENCES vendors(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, vendor_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own favorites
CREATE POLICY "Users can view their own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to add favorites
CREATE POLICY "Users can add favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to remove their own favorites
CREATE POLICY "Users can remove their own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);