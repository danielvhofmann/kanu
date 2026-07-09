DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker=on) AS
SELECT id, username, created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;