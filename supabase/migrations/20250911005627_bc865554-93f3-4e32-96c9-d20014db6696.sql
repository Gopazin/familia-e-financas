-- Fix security vulnerability: Remove overly permissive subscription access
-- Drop the dangerous policy that allows public access to all subscription data
DROP POLICY "Service can manage subscriptions" ON public.subscriptions;

-- Create secure service-only policies for administrative operations
-- Only the service role can insert/update/delete subscription records
CREATE POLICY "Service role can insert subscriptions" ON public.subscriptions
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update subscriptions" ON public.subscriptions
FOR UPDATE 
TO service_role
USING (true);

CREATE POLICY "Service role can delete subscriptions" ON public.subscriptions
FOR DELETE 
TO service_role
USING (true);

-- Service role can read all subscriptions for administrative purposes
CREATE POLICY "Service role can read all subscriptions" ON public.subscriptions
FOR SELECT 
TO service_role
USING (true);

-- Keep the existing user policy (users can only view their own subscription)
-- This policy already exists: "Users can view their own subscription"