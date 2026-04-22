const fs = require('fs');
const path = 'client/src/components/TabbedJournalPage.tsx';
let c = fs.readFileSync(path, 'utf8');

// 1. Add supabase import after the existing imports
const importTarget = `import GeneralManuscriptSubmissionForm from "./GeneralManuscriptSubmissionForm";`;
const importReplacement = `import GeneralManuscriptSubmissionForm from "./GeneralManuscriptSubmissionForm";
import { supabase } from "@/lib/supabase";`;

if (!c.includes(importTarget)) {
  console.error('Import target not found');
  process.exit(1);
}
c = c.replace(importTarget, importReplacement);

// 2. Add journalId prop to interface
const interfaceTarget = `  indexingPartners?: { name: string; subtext: string; imageUrl: string; }[];
}`;
const interfaceReplacement = `  indexingPartners?: { name: string; subtext: string; imageUrl: string; }[];
  journalId?: string;  // for fetching special issues from DB
}`;
if (!c.includes(interfaceTarget)) {
  console.error('Interface target not found');
  process.exit(1);
}
c = c.replace(interfaceTarget, interfaceReplacement);

// 3. Add journalId to destructured props
const propsTarget = `  indexingPartners = [
    { name: "Crossref", subtext: "DOI Partner", imageUrl: "" },
    { name: "ResearchGate", subtext: "Academic Network", imageUrl: "" },
    { name: "Academia.edu", subtext: "Repository", imageUrl: "" }
  ],
}: TabbedJournalPageProps) {`;
const propsReplacement = `  indexingPartners = [
    { name: "Crossref", subtext: "DOI Partner", imageUrl: "" },
    { name: "ResearchGate", subtext: "Academic Network", imageUrl: "" },
    { name: "Academia.edu", subtext: "Repository", imageUrl: "" }
  ],
  journalId,
}: TabbedJournalPageProps) {`;
if (!c.includes(propsTarget)) {
  console.error('Props target not found');
  process.exit(1);
}
c = c.replace(propsTarget, propsReplacement);

// 4. Add state and fetch after existing state declarations
const stateTarget = `  const [showReviewerForm, setShowReviewerForm] = useState(false);

  // Track visit on mount`;
const stateReplacement = `  const [showReviewerForm, setShowReviewerForm] = useState(false);
  const [specialIssues, setSpecialIssues] = useState<any[]>([]);

  // Fetch special issues
  useEffect(() => {
    if (!journalId) return;
    supabase
      .from('journal_special_issues')
      .select('*')
      .eq('journal_id', journalId)
      .order('sort_order', { ascending: true })
      .then(({ data }) => { if (data) setSpecialIssues(data); });
  }, [journalId]);

  // Track visit on mount`;
if (!c.includes(stateTarget)) {
  console.error('State target not found');
  process.exit(1);
}
c = c.replace(stateTarget, stateReplacement);

// 5. Add special issues section in the overview tab, just before the Aim card
const overviewTarget = `            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardHeader className="bg-[#213361] border-0">
                <CardTitle className="text-2xl font-serif text-white">Aim</CardTitle>`;
const overviewReplacement = `            {/* ── Special Issues ── */}
            {specialIssues.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-1">
                  <div className="h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="m9 9 6 0"/><path d="m9 13 6 0"/></svg>
                  </div>
                  <h2 className="text-xl font-serif font-bold text-[#213361] dark:text-blue-200">Special Issues</h2>
                  <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-widest">
                    {specialIssues.filter(s => s.status === 'Open').length > 0 ? 'Call for Papers Open' : 'View All'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specialIssues.map(si => {
                    const statusColors: Record<string, string> = {
                      'Open':      'bg-emerald-100 text-emerald-700 border-emerald-200',
                      'Closed':    'bg-amber-100 text-amber-700 border-amber-200',
                      'Published': 'bg-blue-100 text-blue-700 border-blue-200',
                    };
                    const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : null;
                    return (
                      <div
                        key={si.id}
                        className="bg-white dark:bg-gray-900 rounded-xl border border-amber-100 dark:border-amber-900/40 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* Top accent */}
                        <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300" />
                        {si.cover_image_url && (
                          <img src={si.cover_image_url} alt={si.title} className="w-full h-32 object-cover" />
                        )}
                        <div className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-bold text-[#213361] dark:text-blue-200 leading-snug">{si.title}</h3>
                            <span className={\`shrink-0 text-[9px] font-bold border px-2 py-0.5 rounded-full \${statusColors[si.status] || statusColors['Open']}\`}>
                              {si.status}
                            </span>
                          </div>
                          {si.theme && (
                            <p className="text-[11px] font-semibold text-amber-600 italic">{si.theme}</p>
                          )}
                          {si.description && (
                            <p className="text-[12px] text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">{si.description}</p>
                          )}
                          <div className="pt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-gray-500 dark:text-gray-400 border-t border-gray-50 dark:border-gray-800">
                            {si.guest_editor && (
                              <div className="flex items-center gap-1 col-span-2">
                                <span className="font-bold text-gray-400">Guest Editor:</span>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{si.guest_editor}</span>
                              </div>
                            )}
                            {si.submission_deadline && (
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-gray-400">Submission Deadline:</span>
                                <span className="font-semibold text-amber-700">{fmtDate(si.submission_deadline)}</span>
                              </div>
                            )}
                            {si.publication_date && (
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-gray-400">Publication:</span>
                                <span className="font-semibold text-blue-600">{fmtDate(si.publication_date)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardHeader className="bg-[#213361] border-0">
                <CardTitle className="text-2xl font-serif text-white">Aim</CardTitle>`;

if (!c.includes(overviewTarget)) {
  console.error('Overview target not found');
  process.exit(1);
}
c = c.replace(overviewTarget, overviewReplacement);

fs.writeFileSync(path, c, 'utf8');
console.log('Done — TabbedJournalPage special issues section added.');
