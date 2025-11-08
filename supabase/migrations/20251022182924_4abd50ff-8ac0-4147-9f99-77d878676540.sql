-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

-- Create new flexible insert policy that allows:
-- 1. Existing admins to insert any role for anyone
-- 2. First user to insert admin role for themselves if no admin exists yet
CREATE POLICY "Insert roles with first admin exception"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Either user is already an admin (can add any role to anyone)
  public.has_role(auth.uid(), 'admin')
  OR
  -- Or user is adding admin role to themselves AND no admin exists yet (first admin)
  (
    auth.uid() = user_id 
    AND role = 'admin'
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles WHERE role = 'admin'
    )
  )
);