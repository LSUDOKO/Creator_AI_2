/*
  # Create subscriptions table for Stripe integration

  1. New Tables
    - `subscriptions`
      - `id` (text, primary key) - Stripe subscription ID
      - `user_id` (uuid, foreign key to profiles)
      - `status` (text) - Subscription status
      - `price_id` (text) - Stripe price ID
      - `product_name` (text) - Product name
      - `price_amount` (integer) - Price in cents
      - `current_period_start` (timestamptz) - Current period start
      - `current_period_end` (timestamptz) - Current period end
      - `cancel_at_period_end` (boolean) - Whether to cancel at period end
      - `stripe_customer_id` (text) - Stripe customer ID
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `subscriptions` table
    - Add policies for users to view their own subscriptions
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id text PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL,
  price_id text NOT NULL,
  product_name text NOT NULL,
  price_amount integer NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  stripe_customer_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    user_id IN (
      SELECT id FROM profiles WHERE wallet_address IS NOT NULL
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(stripe_customer_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();