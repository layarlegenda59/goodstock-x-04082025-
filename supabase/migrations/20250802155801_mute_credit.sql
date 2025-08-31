/*
  # Fix infinite recursion in profiles RLS policy

  1. Security Functions
    - Create `is_admin()` function with SECURITY DEFINER to bypass RLS
    - This prevents infinite recursion when checking admin role

  2. Policy Updates
    - Update "Admins can read all profiles" policy to use the new function
    - Remove recursive dependency on profiles table within its own policy
*/

-- Create security definer function to check admin role without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- Use SECURITY DEFINER to bypass RLS and prevent recursion
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create new policy using the security definer function
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());