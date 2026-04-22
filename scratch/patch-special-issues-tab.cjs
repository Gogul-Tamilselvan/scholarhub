const fs = require('fs');
const path = 'client/src/components/TabbedJournalPage.tsx';
let c = fs.readFileSync(path, 'utf8');

// ── 1. Add BookMarked to lucide imports ──────────────────────────────────────
const lucideTarget = `  ChevronRight,\n} from "lucide-react";`;
const lucideReplacement = `  ChevronRight,\n  BookMarked,\n  Tag,\n  Globe,\n} from "lucide-react";`;
if (!c.includes(lucideTarget)) { console.error('lucide target not found'); process.exit(1); }
c = c.replace(lucideTarget, lucideReplacement);

// ── 2. Insert "Special Issues" into nav array (after archives, before guidelines) ──
const navTarget = `                    { value: "archives", label: "Archives", icon: Archive },
                    { value: "guidelines", label: "Author Guidelines", icon: Edit },`;
const navReplacement = `                    { value: "archives", label: "Archives", icon: Archive },
                    { value: "special-issues", label: "Special Issues", icon: BookMarked },
                    { value: "guidelines", label: "Author Guidelines", icon: Edit },`;
if (!c.includes(navTarget)) { console.error('nav target not found'); process.exit(1); }
c = c.replace(navTarget, navReplacement);

// ── 3. Add Special Issues TabsContent — insert before the guidelines TabsContent ──
// Find the guidelines tab content opener
const guidelinesTarget = `          <TabsContent value="guidelines"`;
if (!c.includes(guidelinesTarget)) { console.error('guidelines TabsContent not found'); process.exit(1); }

const specialIssuesTabContent = `          {/* ── Special Issues Tab ── */}
          <TabsContent value="special-issues" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              {/* Header card */}
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
                <CardHeader className="bg-[#213361] border-0 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                      <BookMarked className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl md:text-2xl font-serif text-white">Special Issues</CardTitle>
                      <p className="text-sm font-medium text-blue-100 mt-1">
                        {specialIssues.filter(s => s.status === 'Open').length > 0
                          ? specialIssues.filter(s => s.status === 'Open').length + ' open call(s) for papers'
                          : 'Thematic collections curated by guest editors'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {specialIssues.length === 0 ? (
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
                  <CardContent className="pt-16 pb-16 text-center">
                    <BookMarked className="h-20 w-20 text-blue-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold mb-3 text-blue-900 dark:text-blue-300">No Special Issues Yet</h3>
                    <p className="text-base text-blue-600 dark:text-blue-400 max-w-md mx-auto">
                      Special issues will appear here when announced by the editorial team.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-5">
                  {specialIssues.map(si => {
                    const statusStyles: Record<string, { badge: string; glow: string; bar: string }> = {
                      'Open':      { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', glow: 'ring-1 ring-emerald-200 dark:ring-emerald-800', bar: 'from-emerald-400 via-teal-400 to-emerald-300' },
                      'Closed':    { badge: 'bg-amber-100 text-amber-700 border-amber-200',       glow: 'ring-1 ring-amber-200 dark:ring-amber-800',   bar: 'from-amber-400 via-orange-400 to-amber-300' },
                      'Published': { badge: 'bg-blue-100 text-blue-700 border-blue-200',           glow: 'ring-1 ring-blue-200 dark:ring-blue-800',     bar: 'from-blue-500 via-indigo-400 to-blue-400' },
                    };
                    const st = statusStyles[si.status] || statusStyles['Open'];
                    const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : null;
                    return (
                      <Card key={si.id} className={\`bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all \${st.glow}\`}>
                        {/* Accent bar */}
                        <div className={\`h-1.5 bg-gradient-to-r \${st.bar}\`} />
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row gap-0">
                            {/* Cover image */}
                            {si.cover_image_url && (
                              <div className="md:w-48 shrink-0 overflow-hidden">
                                <img src={si.cover_image_url} alt={si.title} className="w-full h-full object-cover min-h-[140px]" />
                              </div>
                            )}
                            <div className="flex-1 p-5 space-y-3">
                              {/* Title + status */}
                              <div className="flex flex-wrap items-start gap-3 justify-between">
                                <h3 className="text-lg font-serif font-bold text-[#213361] dark:text-blue-200 leading-snug">{si.title}</h3>
                                <span className={\`shrink-0 text-[10px] font-bold border px-2.5 py-1 rounded-full \${st.badge}\`}>
                                  {si.status === 'Open' ? '🟢 Open — Call for Papers' : si.status === 'Closed' ? '🟡 Closed' : '🔵 Published'}
                                </span>
                              </div>

                              {/* Theme */}
                              {si.theme && (
                                <div className="flex items-center gap-2">
                                  <Tag className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                  <p className="text-sm font-semibold text-amber-600 italic">{si.theme}</p>
                                </div>
                              )}

                              {/* Description */}
                              {si.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{si.description}</p>
                              )}

                              {/* Meta grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                {si.guest_editor && (
                                  <div className="flex items-center gap-2">
                                    <Users className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                    <div>
                                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Guest Editor</span>
                                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{si.guest_editor}</span>
                                    </div>
                                  </div>
                                )}
                                {si.submission_deadline && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                    <div>
                                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Submission Deadline</span>
                                      <span className="text-sm font-bold text-amber-700">{fmtDate(si.submission_deadline)}</span>
                                    </div>
                                  </div>
                                )}
                                {si.publication_date && (
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                    <div>
                                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Expected Publication</span>
                                      <span className="text-sm font-semibold text-blue-600">{fmtDate(si.publication_date)}</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* CTA for Open issues */}
                              {si.status === 'Open' && (
                                <div className="pt-2">
                                  <button
                                    onClick={() => handleTabChange('submit')}
                                    className="inline-flex items-center gap-2 bg-[#213361] hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                                  >
                                    <Send className="h-3.5 w-3.5" />
                                    Submit Manuscript for This Issue
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          `;

c = c.replace(guidelinesTarget, specialIssuesTabContent + guidelinesTarget);
fs.writeFileSync(path, c, 'utf8');
console.log('Done — Special Issues nav item + tab content added.');
