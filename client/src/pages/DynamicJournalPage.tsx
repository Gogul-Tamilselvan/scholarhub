import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import TabbedJournalPage from "@/components/TabbedJournalPage";
import SEO from "@/components/SEO";
import StructuredData, { createPeriodicalData } from "@/components/StructuredData";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, Loader2 } from "lucide-react";

export default function DynamicJournalPage() {
  const [, params] = useRoute("/journal/:slug");
  const slug = params?.slug;

  const [journal, setJournal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [dynamicArchives, setDynamicArchives] = useState<any>(null);
  const [editorialBoard, setEditorialBoard] = useState<any[]>([]);
  const [currentIssueArticles, setCurrentIssueArticles] = useState<any[]>([]);
  const [currentIssueMeta, setCurrentIssueMeta] = useState<any>(null);

  useEffect(() => {
    async function loadJournal() {
      if (!slug) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.from('journals').select('*').eq('slug', slug).single();
        if (error || !data) {
           setNotFound(true);
        } else {
           setJournal(data);
           // Fetch archives, editorial board, and current issue in parallel
           await Promise.all([
             loadArchives(data.id),
             loadEditorialBoard(data.id),
           ]);
        }
      } catch (err) {
        console.error("Failed to load journal", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadJournal();
  }, [slug]);

  const loadArchives = async (journalId: string) => {
    try {
      const [volRes, issRes, artRes] = await Promise.all([
        supabase.from('journal_volumes').select('*').eq('journal_id', journalId).order('volume_number', { ascending: false }),
        supabase.from('journal_issues').select('*').eq('journal_id', journalId).order('issue_number', { ascending: true }),
        supabase.from('journal_articles').select('*').eq('journal_id', journalId).order('sort_order', { ascending: true }),
      ]);
      const volumes = volRes.data || [];
      const issues = issRes.data || [];
      const articles = artRes.data || [];

      setDynamicArchives({ volumes, issues, articles });

      // Find the current issue (is_current = true)
      const currentIssue = issues.find((i: any) => i.is_current);
      if (currentIssue) {
        const currentVol = volumes.find((v: any) => v.id === currentIssue.volume_id);
        const ciArticles = articles
          .filter((a: any) => a.issue_id === currentIssue.id)
          .map((a: any, idx: number) => ({
            id: idx + 1,
            articleId: a.article_id,
            title: a.title,
            authors: a.authors,
            affiliation: a.affiliation || '',
            pages: a.pages || '',
            doi: a.doi || undefined,
          }));
        setCurrentIssueArticles(ciArticles);
        setCurrentIssueMeta({
          volume: String(currentVol?.volume_number || '1'),
          issue: String(currentIssue.issue_number || '1'),
          period: currentIssue.period || currentIssue.label || '',
        });
      }
    } catch (err) {
      console.error("Failed to load archives", err);
      setDynamicArchives({ volumes: [], issues: [], articles: [] });
    }
  };

  const loadEditorialBoard = async (journalId: string) => {
    try {
      const { data, error } = await supabase
        .from('editorial_board')
        .select('*')
        .eq('journal_id', journalId)
        .order('sort_order', { ascending: true });
      if (!error && data) {
        setEditorialBoard(data);
      }
    } catch (err) {
      console.error("Failed to load editorial board", err);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
           <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
        </div>
      </>
    );
  }

  if (notFound || !journal) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
           <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
           <h2 className="text-2xl font-bold text-slate-700">Journal Not Found</h2>
           <p className="text-slate-500 mt-2">The journal you are looking for does not exist.</p>
        </div>
      </>
    );
  }

  // Parse subject covers
  const subjectCoversList = journal.subject_covers 
     ? journal.subject_covers.split(',').map((s: string) => s.trim()).filter(Boolean)
     : [];

  // Find current volume / issue from dynamic archives
  let currentVolume = "1";
  let currentIssue = "1";
  if (dynamicArchives && dynamicArchives.volumes.length > 0) {
    const latestVol = dynamicArchives.volumes[0]; // Already sorted desc
    currentVolume = String(latestVol.volume_number);
    const currentIssueData = dynamicArchives.issues.find((i: any) => i.is_current && i.volume_id === latestVol.id);
    if (currentIssueData) {
      currentIssue = String(currentIssueData.issue_number);
    }
  }

  // Map editorial board members by role
  const toMember = (m: any) => ({
    name: m.name,
    designation: m.designation || '',
    institution: m.institution || '',
    location: m.location || '',
    email: m.email || '',
  });

  const editorInChiefData = editorialBoard.find((m: any) => m.role === 'editor-in-chief');
  const managingEditorData = editorialBoard.find((m: any) => m.role === 'managing-editor');
  const associateEditorsList = editorialBoard.filter((m: any) => m.role === 'associate-editor').map(toMember);
  const boardMembersList = editorialBoard.filter((m: any) => m.role === 'board-member').map(toMember);

  // Journal particulars from DB
  const journalParticulars = {
    issn: journal.issn || 'XXXXX',
    frequency: journal.frequency || 'Quarterly',
    language: journal.language || 'English',
    publisherName: journal.publisher_name || 'Scholar India Publishers',
    publisherAddress: journal.publisher_address || '',
    publicationFormat: journal.publication_format || 'Online (Open Access)',
    email: journal.email || '',
  };

  return (
    <>
      <SEO
        title={`${journal.title} | Publisher`}
        description={journal.aim || journal.scope || `Official page for ${journal.title}`}
        type="website"
      />
      {journal.aim && (
        <StructuredData 
          type="Periodical" 
          data={createPeriodicalData(journal.title, journal.aim)} 
        />
      )}
      <Header />
      <section className="w-full py-6 md:py-8 bg-[#213361] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-yellow-500 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="flex items-start gap-4 md:gap-6">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/20 shadow-xl shrink-0 mt-1">
                <BookOpen className="w-10 h-10 md:w-12 h-12 text-yellow-400" />
              </div>
              <div className="flex-1">
                <Badge className="bg-yellow-500 text-blue-900 font-bold mb-2 px-3 py-0.5 text-[10px] uppercase tracking-wider border-none rounded-full">
                  International Peer-Reviewed
                </Badge>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white mb-3 tracking-tight leading-tight">
                  {journal.title}
                </h1>
                <div className="flex flex-wrap gap-3 text-blue-100">
                  <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[11px] md:text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Subject: {journal.subject || 'Multidisciplinary'}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[11px] md:text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Est: {journal.starting_year || new Date().getFullYear()}
                  </span>
                  {journal.issn && journal.issn !== 'XXXXX' && (
                    <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[11px] md:text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> ISSN: {journal.issn}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <TabbedJournalPage
        title={journal.title}
        startingYear={journal.starting_year || new Date().getFullYear().toString()}
        aim={journal.aim || "To publish advanced research..."}
        scope={journal.scope || "Various disciplines..."}
        publicationTypes={journal.publication_types || "Original Research, Review Papers"}
        researchFocus={journal.research_focus || "Empirical Research"}
        targetAudience={journal.target_audience || "Academics"}
        subject={journal.subject || "Multidisciplinary"}
        subjectCovers={subjectCoversList}
        editorInChief={editorInChiefData ? toMember(editorInChiefData) : null}
        managingEditor={managingEditorData ? toMember(managingEditorData) : null}
        associateEditors={associateEditorsList}
        boardMembers={boardMembersList}
        articles={[]}
        archivedArticles={[]}
        v2i1Articles={[]}
        currentVolume={currentVolume}
        currentIssue={currentIssue}
        referenceStyle={journal.reference_style || "APA"}
        dynamicArchives={dynamicArchives}
        journalParticulars={journalParticulars}
        currentIssueArticles={currentIssueArticles}
        currentIssueMeta={currentIssueMeta || undefined}
      />
    </>
  );
}

