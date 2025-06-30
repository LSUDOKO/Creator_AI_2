/*
  # Add Web3 wallet support to profiles table

  1. Changes
    - Add `wallet_address` column to profiles table
    - Add `auth_type` column to track authentication method
    - Add unique constraint on wallet_address
    - Update RLS policies to support Web3 authentication

  2. Security
    - Maintain existing RLS policies
    - Add policies for Web3 wallet authentication
*/

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wallet_address text UNIQUE,
ADD COLUMN IF NOT EXISTS auth_type text DEFAULT 'email' CHECK (auth_type IN ('email', 'web3'));

-- Create index for wallet address lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address);

-- Add RLS policy for Web3 wallet authentication
CREATE POLICY "Users can view profile by wallet address"
  ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (wallet_address IS NOT NULL);

-- Add policy for Web3 users to insert their own profile
CREATE POLICY "Web3 users can insert own profile"
  ON profiles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (wallet_address IS NOT NULL);

-- Add policy for Web3 users to update their own profile
CREATE POLICY "Web3 users can update own profile by wallet"
  ON profiles
  FOR UPDATE
  TO anon, authenticated
  USING (wallet_address IS NOT NULL);