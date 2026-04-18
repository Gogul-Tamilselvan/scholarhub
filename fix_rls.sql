-- Fix: Enable read access for all tables used by the Admin Dashboard.
-- Because the application currently uses a custom local auth session rather than Supabase Auth, 
-- queries from the browser using the public anon key are blocked by Row Level Security (RLS) if no policy exists.

-- Option A: Create a read-only policy for anon users (Recommended over completely disabling RLS)
CREATE POLICY "Enable read access for all users" ON "public"."manuscripts" FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON "public"."reviewers" FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON "public"."assignments" FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON "public"."payments" FOR SELECT USING (true);

-- Option B: If you prefer to completely disable RLS for these tables during development
ALTER TABLE "public"."manuscripts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reviewers" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."assignments" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."payments" DISABLE ROW LEVEL SECURITY;
