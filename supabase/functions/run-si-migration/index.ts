import postgres from 'https://deno.land/x/postgresjs@v3.4.4/mod.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const dbUrl = Deno.env.get('SUPABASE_DB_URL');
    if (!dbUrl) throw new Error('SUPABASE_DB_URL not set');

    const sql = postgres(dbUrl, { max: 1 });

    await sql`
      CREATE TABLE IF NOT EXISTS public.si_volumes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        special_issue_id UUID NOT NULL REFERENCES public.journal_special_issues(id) ON DELETE CASCADE,
        volume_number INTEGER NOT NULL DEFAULT 1,
        label TEXT,
        period TEXT,
        status TEXT NOT NULL DEFAULT 'In Progress',
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS public.si_issues (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        si_volume_id UUID NOT NULL REFERENCES public.si_volumes(id) ON DELETE CASCADE,
        special_issue_id UUID NOT NULL,
        issue_number INTEGER NOT NULL DEFAULT 1,
        label TEXT,
        period TEXT,
        is_current BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS public.si_articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        si_issue_id UUID NOT NULL REFERENCES public.si_issues(id) ON DELETE CASCADE,
        special_issue_id UUID NOT NULL,
        article_id TEXT,
        title TEXT NOT NULL,
        authors TEXT NOT NULL,
        affiliation TEXT,
        pages TEXT,
        doi TEXT,
        abstract TEXT,
        pdf_url TEXT,
        keywords TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`ALTER TABLE public.si_volumes ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE public.si_issues ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE public.si_articles ENABLE ROW LEVEL SECURITY`;

    // Policies (ignore errors if already exist)
    for (const stmt of [
      `DO $$ BEGIN CREATE POLICY "Public Read SI Volumes" ON public.si_volumes FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `DO $$ BEGIN CREATE POLICY "Public Read SI Issues" ON public.si_issues FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `DO $$ BEGIN CREATE POLICY "Public Read SI Articles" ON public.si_articles FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `DO $$ BEGIN CREATE POLICY "Admin Full SI Volumes" ON public.si_volumes FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `DO $$ BEGIN CREATE POLICY "Admin Full SI Issues" ON public.si_issues FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `DO $$ BEGIN CREATE POLICY "Admin Full SI Articles" ON public.si_articles FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    ]) {
      await sql.unsafe(stmt);
    }

    await sql.end();

    return new Response(JSON.stringify({ success: true, message: 'SI archive tables created successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
