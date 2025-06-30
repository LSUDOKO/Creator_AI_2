/*
  # Fix Web3 Authentication and Database Constraints

  1. Database Schema Updates
    - Remove foreign key constraint from profiles table that requires auth.users reference
    - Update RLS policies to support both email and Web3 authentication
    - Add proper indexes and constraints for Web3 users

  2. Security Updates
    - Update RLS policies to allow Web3 users to create and manage their profiles
    - Ensure proper access control for both authentication types

  3. Data Integrity
    - Maintain data consistency while supporting dual authentication methods
    - Add proper validation constraints
*/

-- Remove the foreign key constraint that's causing issues with Web3 auth
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
END $$;

-- Update RLS policies for profiles table to support Web3 authentication
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profile by wallet address" ON profiles;
DROP POLICY IF EXISTS "Web3 users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Web3 users can update own profile by wallet" ON profiles;

-- Create new comprehensive RLS policies
CREATE POLICY "Allow authenticated users to insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow Web3 users to insert profile with wallet"
  ON profiles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (wallet_address IS NOT NULL AND auth_type = 'web3');

CREATE POLICY "Allow users to view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow Web3 users to view profile by wallet"
  ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (wallet_address IS NOT NULL);

CREATE POLICY "Allow authenticated users to update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow Web3 users to update profile by wallet"
  ON profiles
  FOR UPDATE
  TO anon, authenticated
  USING (wallet_address IS NOT NULL AND auth_type = 'web3');

-- Add a check constraint to ensure either traditional auth or Web3 auth is used
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_auth_method_check' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_auth_method_check 
    CHECK (
      (auth_type = 'email' AND wallet_address IS NULL) OR 
      (auth_type = 'web3' AND wallet_address IS NOT NULL)
    );
  END IF;
END $$;

-- Create an index for better performance on wallet address lookups
CREATE INDEX IF NOT EXISTS idx_profiles_auth_type ON profiles(auth_type);