import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, ArrowLeft, Edit, Trash, BookOpen, Save, RefreshCw, ChevronRight, Archive, FileText, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type View = 'journals' | 'volumes' | 'issues' | 'articles';

export function AdminArchives() {
  const { toast } = useToast();
  const [view, setView] = useState<View>('journals');
  const [loading, setLoading] = useState(true);

  // Data
  const [journals, setJournals] = useState<any[]>([]);
  const [volumes, setVolumes] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);

  // Selected context
  const [selectedJournal, setSelectedJournal] = useState<any>(null);
  const [selectedVolume, setSelectedVolume] = useState<any>(null);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  // Modals
  const [isVolumeModalOpen, setIsVolumeModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  // Forms
  const [volumeForm, setVolumeForm] = useState({ volumeNumber: '', label: '', period: '', status: 'In Progress' });
  const [issueForm, setIssueForm] = useState({ issueNumber: '', label: '', period: '', isCurrent: false });
  const [articleForm, setArticleForm] = useState({ articleId: '', title: '', authors: '', affiliation: '', pages: '', doi: '', sortOrder: '0' });

  // Fetch all journals (including hardcoded ones represented in DB)
  const fetchJournals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('journals').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      
      // Include hardcoded journals as virtual entries if not already in DB
      const hardcodedJournals = [
        { id: '__sjcm__', title: 'Scholar Journal of Commerce and Management', slug: 'commerce-management', subject: 'Business Management', isHardcoded: true },
        { id: '__sjhss__', title: 'Scholar Journal of Humanities and Social Sciences', slug: 'humanities', subject: 'Humanities', isHardcoded: true },
      ];
      
      const dbTitles = (data || []).map((j: any) => j.title.toLowerCase());
      const combined = [
        ...hardcodedJournals.filter(h => !dbTitles.includes(h.title.toLowerCase())),
        ...(data || [])
      ];
      
      setJournals(combined);
    } catch (err: any) {
      console.error(err);
      setJournals([
        { id: '__sjcm__', title: 'Scholar Journal of Commerce and Management', slug: 'commerce-management', subject: 'Business Management', isHardcoded: true },
        { id: '__sjhss__', title: 'Scholar Journal of Humanities and Social Sciences', slug: 'humanities', subject: 'Humanities', isHardcoded: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolumes = async (journalId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('journal_volumes').select('*').eq('journal_id', journalId).order('volume_number', { ascending: false });
      if (error) throw error;
      setVolumes(data || []);
    } catch (err: any) {
      console.error(err);
      setVolumes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async (volumeId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('journal_issues').select('*').eq('volume_id', volumeId).order('issue_number', { ascending: true });
      if (error) throw error;
      setIssues(data || []);
    } catch (err: any) {
      console.error(err);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async (issueId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('journal_articles').select('*').eq('issue_id', issueId).order('sort_order', { ascending: true });
      if (error) throw error;
      setArticles(data || []);
    } catch (err: any) {
      console.error(err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJournals(); }, []);

  // Navigation
  const selectJournal = (j: any) => {
    setSelectedJournal(j);
    setView('volumes');
    fetchVolumes(j.id);
  };

  const selectVolume = (v: any) => {
    setSelectedVolume(v);
    setView('issues');
    fetchIssues(v.id);
  };

  const selectIssue = (i: any) => {
    setSelectedIssue(i);
    setView('articles');
    fetchArticles(i.id);
  };

  const goBack = () => {
    if (view === 'articles') {
      setView('issues');
      setSelectedIssue(null);
    } else if (view === 'issues') {
      setView('volumes');
      setSelectedVolume(null);
    } else if (view === 'volumes') {
      setView('journals');
      setSelectedJournal(null);
    }
  };

  // CRUD - Volume
  const openVolumeCreate = () => {
    setEditingItem(null);
    setVolumeForm({ volumeNumber: String((volumes[0]?.volume_number || 0) + 1), label: '', period: '', status: 'In Progress' });
    setIsVolumeModalOpen(true);
  };

  const openVolumeEdit = (v: any) => {
    setEditingItem(v);
    setVolumeForm({ volumeNumber: String(v.volume_number), label: v.label || '', period: v.period || '', status: v.status || 'In Progress' });
    setIsVolumeModalOpen(true);
  };

  const saveVolume = async () => {
    if (!volumeForm.volumeNumber) { toast({ title: 'Volume number is required', variant: 'destructive' }); return; }
    setProcessing(true);
    try {
      const payload = {
        journal_id: selectedJournal.id,
        volume_number: parseInt(volumeForm.volumeNumber),
        label: volumeForm.label || `Volume ${volumeForm.volumeNumber}`,
        period: volumeForm.period,
        status: volumeForm.status,
      };
      if (editingItem) {
        const { error } = await supabase.from('journal_volumes').update(payload).eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: 'Volume updated' });
      } else {
        const { error } = await supabase.from('journal_volumes').insert([payload]);
        if (error) throw error;
        toast({ title: 'Volume created' });
      }
      setIsVolumeModalOpen(false);
      fetchVolumes(selectedJournal.id);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const deleteVolume = async (id: string) => {
    if (!confirm('Delete this volume and ALL its issues/articles?')) return;
    try {
      // Delete articles in issues of this volume
      const { data: issuesData } = await supabase.from('journal_issues').select('id').eq('volume_id', id);
      if (issuesData) {
        for (const iss of issuesData) {
          await supabase.from('journal_articles').delete().eq('issue_id', iss.id);
        }
      }
      await supabase.from('journal_issues').delete().eq('volume_id', id);
      await supabase.from('journal_volumes').delete().eq('id', id);
      toast({ title: 'Volume deleted' });
      fetchVolumes(selectedJournal.id);
    } catch (err: any) {
      toast({ title: 'Error deleting', description: err.message, variant: 'destructive' });
    }
  };

  // CRUD - Issue
  const openIssueCreate = () => {
    setEditingItem(null);
    setIssueForm({ issueNumber: String((issues.length || 0) + 1), label: '', period: '', isCurrent: false });
    setIsIssueModalOpen(true);
  };

  const openIssueEdit = (i: any) => {
    setEditingItem(i);
    setIssueForm({ issueNumber: String(i.issue_number), label: i.label || '', period: i.period || '', isCurrent: i.is_current || false });
    setIsIssueModalOpen(true);
  };

  const saveIssue = async () => {
    if (!issueForm.issueNumber) { toast({ title: 'Issue number is required', variant: 'destructive' }); return; }
    setProcessing(true);
    try {
      // If marking as current, un-mark all other issues for this journal first
      if (issueForm.isCurrent) {
        await supabase.from('journal_issues').update({ is_current: false }).eq('journal_id', selectedJournal.id);
      }

      const payload = {
        volume_id: selectedVolume.id,
        journal_id: selectedJournal.id,
        issue_number: parseInt(issueForm.issueNumber),
        label: issueForm.label || `Issue ${issueForm.issueNumber}`,
        period: issueForm.period,
        is_current: issueForm.isCurrent,
      };
      if (editingItem) {
        const { error } = await supabase.from('journal_issues').update(payload).eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: 'Issue updated' });
      } else {
        const { error } = await supabase.from('journal_issues').insert([payload]);
        if (error) throw error;
        toast({ title: 'Issue created' });
      }
      setIsIssueModalOpen(false);
      fetchIssues(selectedVolume.id);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const deleteIssue = async (id: string) => {
    if (!confirm('Delete this issue and ALL its articles?')) return;
    try {
      await supabase.from('journal_articles').delete().eq('issue_id', id);
      await supabase.from('journal_issues').delete().eq('id', id);
      toast({ title: 'Issue deleted' });
      fetchIssues(selectedVolume.id);
    } catch (err: any) {
      toast({ title: 'Error deleting', description: err.message, variant: 'destructive' });
    }
  };

  // CRUD - Article
  const openArticleCreate = () => {
    setEditingItem(null);
    const nextNum = String(articles.length + 1).padStart(3, '0');
    setArticleForm({ articleId: nextNum, title: '', authors: '', affiliation: '', pages: '', doi: '', sortOrder: String(articles.length + 1) });
    setIsArticleModalOpen(true);
  };

  const openArticleEdit = (a: any) => {
    setEditingItem(a);
    setArticleForm({
      articleId: a.article_id || '',
      title: a.title || '',
      authors: a.authors || '',
      affiliation: a.affiliation || '',
      pages: a.pages || '',
      doi: a.doi || '',
      sortOrder: String(a.sort_order || 0)
    });
    setIsArticleModalOpen(true);
  };

  const saveArticle = async () => {
    if (!articleForm.title || !articleForm.authors) { toast({ title: 'Title and Authors required', variant: 'destructive' }); return; }
    setProcessing(true);
    try {
      const payload = {
        issue_id: selectedIssue.id,
        journal_id: selectedJournal.id,
        article_id: articleForm.articleId,
        title: articleForm.title,
        authors: articleForm.authors,
        affiliation: articleForm.affiliation,
        pages: articleForm.pages,
        doi: articleForm.doi,
        sort_order: parseInt(articleForm.sortOrder) || 0,
      };
      if (editingItem) {
        const { error } = await supabase.from('journal_articles').update(payload).eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: 'Article updated' });
      } else {
        const { error } = await supabase.from('journal_articles').insert([payload]);
        if (error) throw error;
        toast({ title: 'Article added' });
      }
      setIsArticleModalOpen(false);
      fetchArticles(selectedIssue.id);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    try {
      await supabase.from('journal_articles').delete().eq('id', id);
      toast({ title: 'Article deleted' });
      fetchArticles(selectedIssue.id);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  // Breadcrumb
  const renderBreadcrumb = () => (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-4 flex-wrap">
      <button onClick={() => { setView('journals'); setSelectedJournal(null); setSelectedVolume(null); setSelectedIssue(null); }} className="hover:text-blue-600 transition-colors">All Journals</button>
      {selectedJournal && (
        <>
          <ChevronRight size={12} />
          <button onClick={() => { setView('volumes'); setSelectedVolume(null); setSelectedIssue(null); fetchVolumes(selectedJournal.id); }} className="hover:text-blue-600 transition-colors truncate max-w-[200px]">{selectedJournal.title}</button>
        </>
      )}
      {selectedVolume && (
        <>
          <ChevronRight size={12} />
          <button onClick={() => { setView('issues'); setSelectedIssue(null); fetchIssues(selectedVolume.id); }} className="hover:text-blue-600 transition-colors">{selectedVolume.label || `Vol ${selectedVolume.volume_number}`}</button>
        </>
      )}
      {selectedIssue && (
        <>
          <ChevronRight size={12} />
          <span className="text-slate-700">{selectedIssue.label || `Issue ${selectedIssue.issue_number}`}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 py-2">
        <div className="pl-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Archives Manager</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Manage Volumes → Issues → Articles for each journal. Data appears on the public journal pages.</p>
        </div>
      </div>

      {renderBreadcrumb()}

      {/* JOURNALS LIST */}
      {view === 'journals' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden mx-2 shadow-sm">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
            <Archive size={18} className="text-blue-900" />
            <span className="font-bold text-sm text-slate-800">Select a Journal to Manage Archives</span>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-16 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-slate-400" /></div>
            ) : journals.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-sm">No journals found. Create one in the Journals tab first.</div>
            ) : (
              journals.map((j) => (
                <div key={j.id} onClick={() => selectJournal(j)} className="flex items-center justify-between px-6 py-5 hover:bg-blue-50/50 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                      <BookOpen size={20} className="text-blue-900" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-900 transition-colors">{j.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{j.subject || 'Multidisciplinary'} {j.isHardcoded ? '• Hardcoded' : ''}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VOLUMES LIST */}
      {view === 'volumes' && selectedJournal && (
        <div className="space-y-4 mx-2">
          <div className="flex items-center justify-between">
            <Button onClick={goBack} variant="ghost" className="gap-2 text-xs font-bold text-slate-600"><ArrowLeft size={14} /> Back</Button>
            <Button onClick={openVolumeCreate} className="bg-[#1e3a8a] hover:bg-blue-900 text-white gap-2 font-bold text-xs h-9 px-4 rounded-lg shadow-sm border-none">
              <Plus size={14} /> Add Volume
            </Button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
              <Archive size={18} className="text-blue-900" />
              <span className="font-bold text-sm text-slate-800">Volumes — {selectedJournal.title}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-16 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-slate-400" /></div>
              ) : volumes.length === 0 ? (
                <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                  <Archive className="w-10 h-10 text-slate-300" />No volumes yet. Click "Add Volume" to get started.
                </div>
              ) : (
                volumes.map((v) => (
                  <div key={v.id} className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/30 transition-colors group">
                    <div onClick={() => selectVolume(v)} className="flex items-center gap-4 cursor-pointer flex-1">
                      <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                        <span className="text-lg font-black text-blue-900">V{v.volume_number}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-900">{v.label || `Volume ${v.volume_number}`}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">{v.period || '—'}</span>
                          <Badge className={`text-[9px] font-bold border-none py-0 ${v.status === 'Published' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{v.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button onClick={() => openVolumeEdit(v)} variant="outline" size="icon" className="h-7 w-7 rounded border-slate-200 text-blue-600 hover:bg-blue-50"><Edit size={12}/></Button>
                      <Button onClick={() => deleteVolume(v.id)} variant="outline" size="icon" className="h-7 w-7 rounded border-slate-200 text-rose-500 hover:bg-rose-50"><Trash size={12}/></Button>
                      <ChevronRight size={16} className="text-slate-400 ml-2 cursor-pointer" onClick={() => selectVolume(v)} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ISSUES LIST */}
      {view === 'issues' && selectedVolume && (
        <div className="space-y-4 mx-2">
          <div className="flex items-center justify-between">
            <Button onClick={goBack} variant="ghost" className="gap-2 text-xs font-bold text-slate-600"><ArrowLeft size={14} /> Back</Button>
            <Button onClick={openIssueCreate} className="bg-[#1e3a8a] hover:bg-blue-900 text-white gap-2 font-bold text-xs h-9 px-4 rounded-lg shadow-sm border-none">
              <Plus size={14} /> Add Issue
            </Button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
              <Calendar size={18} className="text-blue-900" />
              <span className="font-bold text-sm text-slate-800">Issues — {selectedVolume.label || `Volume ${selectedVolume.volume_number}`}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-16 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-slate-400" /></div>
              ) : issues.length === 0 ? (
                <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                  <FileText className="w-10 h-10 text-slate-300" />No issues yet.
                </div>
              ) : (
                issues.map((i) => (
                  <div key={i.id} className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/30 transition-colors group">
                    <div onClick={() => selectIssue(i)} className="flex items-center gap-4 cursor-pointer flex-1">
                      <div className="h-11 w-11 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                        <FileText size={18} className="text-blue-900" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-900">{i.label || `Issue ${i.issue_number}`}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">{i.period || '—'}</span>
                          {i.is_current && <Badge className="text-[9px] font-bold border-none py-0 bg-amber-100 text-amber-700">Current</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button onClick={() => openIssueEdit(i)} variant="outline" size="icon" className="h-7 w-7 rounded border-slate-200 text-blue-600 hover:bg-blue-50"><Edit size={12}/></Button>
                      <Button onClick={() => deleteIssue(i.id)} variant="outline" size="icon" className="h-7 w-7 rounded border-slate-200 text-rose-500 hover:bg-rose-50"><Trash size={12}/></Button>
                      <ChevronRight size={16} className="text-slate-400 ml-2 cursor-pointer" onClick={() => selectIssue(i)} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ARTICLES LIST */}
      {view === 'articles' && selectedIssue && (
        <div className="space-y-4 mx-2">
          <div className="flex items-center justify-between">
            <Button onClick={goBack} variant="ghost" className="gap-2 text-xs font-bold text-slate-600"><ArrowLeft size={14} /> Back</Button>
            <Button onClick={openArticleCreate} className="bg-[#1e3a8a] hover:bg-blue-900 text-white gap-2 font-bold text-xs h-9 px-4 rounded-lg shadow-sm border-none">
              <Plus size={14} /> Add Article
            </Button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
              <FileText size={18} className="text-blue-900" />
              <span className="font-bold text-sm text-slate-800">
                Articles — {selectedVolume.label || `Vol ${selectedVolume.volume_number}`}, {selectedIssue.label || `Issue ${selectedIssue.issue_number}`}
              </span>
              <Badge className="ml-auto bg-blue-100 text-blue-700 text-[10px] font-bold border-none">{articles.length} article(s)</Badge>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-16 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-slate-400" /></div>
              ) : articles.length === 0 ? (
                <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                  <FileText className="w-10 h-10 text-slate-300" />No articles yet.
                </div>
              ) : (
                articles.map((a, idx) => (
                  <div key={a.id} className="px-6 py-4 hover:bg-blue-50/30 transition-colors group">
                    <div className="flex items-start gap-4">
                      <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0 mt-0.5">
                        <span className="text-sm font-black text-blue-900">{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[12px] font-bold text-slate-800 leading-snug uppercase tracking-wide">{a.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">{a.authors}</p>
                        <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
                          <span>ID: {a.article_id}</span>
                          <span>Pages: {a.pages || '—'}</span>
                          {a.doi && <span>DOI: {a.doi}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button onClick={() => openArticleEdit(a)} variant="outline" size="icon" className="h-7 w-7 rounded border-slate-200 text-blue-600 hover:bg-blue-50"><Edit size={12}/></Button>
                        <Button onClick={() => deleteArticle(a.id)} variant="outline" size="icon" className="h-7 w-7 rounded border-slate-200 text-rose-500 hover:bg-rose-50"><Trash size={12}/></Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VOLUME MODAL */}
      <Dialog open={isVolumeModalOpen} onOpenChange={setIsVolumeModalOpen}>
        <DialogContent className="max-w-lg bg-white border-slate-200 shadow-xl p-0 rounded-2xl">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/80">
            <DialogTitle className="text-lg font-bold text-slate-800">{editingItem ? 'Edit Volume' : 'Add Volume'}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Volume Number <span className="text-rose-500">*</span></label>
                <Input type="number" value={volumeForm.volumeNumber} onChange={e => setVolumeForm({...volumeForm, volumeNumber: e.target.value})} className="h-10 bg-slate-50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Status</label>
                <select value={volumeForm.status} onChange={e => setVolumeForm({...volumeForm, status: e.target.value})} className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm">
                  <option value="In Progress">In Progress</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Display Label</label>
              <Input value={volumeForm.label} onChange={e => setVolumeForm({...volumeForm, label: e.target.value})} placeholder="e.g. Volume 2 (Current)" className="h-10 bg-slate-50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Period</label>
              <Input value={volumeForm.period} onChange={e => setVolumeForm({...volumeForm, period: e.target.value})} placeholder="e.g. Jan - Dec 2026" className="h-10 bg-slate-50" />
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsVolumeModalOpen(false)} className="font-bold text-xs">Cancel</Button>
            <Button onClick={saveVolume} disabled={processing} className="bg-[#1e3a8a] text-white font-bold text-xs gap-2 h-10"><Save size={14}/> Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ISSUE MODAL */}
      <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
        <DialogContent className="max-w-lg bg-white border-slate-200 shadow-xl p-0 rounded-2xl">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/80">
            <DialogTitle className="text-lg font-bold text-slate-800">{editingItem ? 'Edit Issue' : 'Add Issue'}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Issue Number <span className="text-rose-500">*</span></label>
                <Input type="number" value={issueForm.issueNumber} onChange={e => setIssueForm({...issueForm, issueNumber: e.target.value})} className="h-10 bg-slate-50" />
              </div>
              <div className="space-y-1.5 flex items-end gap-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={issueForm.isCurrent} onChange={e => setIssueForm({...issueForm, isCurrent: e.target.checked})} className="rounded" />
                  Mark as Current Issue
                </label>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Display Label</label>
              <Input value={issueForm.label} onChange={e => setIssueForm({...issueForm, label: e.target.value})} placeholder="e.g. Issue 1" className="h-10 bg-slate-50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Period</label>
              <Input value={issueForm.period} onChange={e => setIssueForm({...issueForm, period: e.target.value})} placeholder="e.g. Jan - Mar 2026" className="h-10 bg-slate-50" />
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsIssueModalOpen(false)} className="font-bold text-xs">Cancel</Button>
            <Button onClick={saveIssue} disabled={processing} className="bg-[#1e3a8a] text-white font-bold text-xs gap-2 h-10"><Save size={14}/> Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ARTICLE MODAL */}
      <Dialog open={isArticleModalOpen} onOpenChange={setIsArticleModalOpen}>
        <DialogContent className="max-w-2xl bg-white border-slate-200 shadow-xl p-0 rounded-2xl">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/80">
            <DialogTitle className="text-lg font-bold text-slate-800">{editingItem ? 'Edit Article' : 'Add Article'}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Article ID <span className="text-rose-500">*</span></label>
                <Input value={articleForm.articleId} onChange={e => setArticleForm({...articleForm, articleId: e.target.value})} placeholder="e.g. sjcm-v1i1-001" className="h-10 bg-slate-50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Sort Order</label>
                <Input type="number" value={articleForm.sortOrder} onChange={e => setArticleForm({...articleForm, sortOrder: e.target.value})} className="h-10 bg-slate-50" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Article Title <span className="text-rose-500">*</span></label>
              <Textarea value={articleForm.title} onChange={e => setArticleForm({...articleForm, title: e.target.value})} placeholder="Full title in uppercase..." className="bg-slate-50 min-h-[70px]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Authors <span className="text-rose-500">*</span></label>
              <Input value={articleForm.authors} onChange={e => setArticleForm({...articleForm, authors: e.target.value})} placeholder="e.g. John Doe¹, Jane Smith²" className="h-10 bg-slate-50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Affiliation</label>
              <Textarea value={articleForm.affiliation} onChange={e => setArticleForm({...articleForm, affiliation: e.target.value})} placeholder="Use newlines to separate multiple affiliations..." className="bg-slate-50 min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Pages</label>
                <Input value={articleForm.pages} onChange={e => setArticleForm({...articleForm, pages: e.target.value})} placeholder="e.g. 1-10" className="h-10 bg-slate-50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">DOI</label>
                <Input value={articleForm.doi} onChange={e => setArticleForm({...articleForm, doi: e.target.value})} placeholder="e.g. 10.65219/sjcm.20260201001" className="h-10 bg-slate-50" />
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsArticleModalOpen(false)} className="font-bold text-xs">Cancel</Button>
            <Button onClick={saveArticle} disabled={processing} className="bg-[#1e3a8a] text-white font-bold text-xs gap-2 h-10"><Save size={14}/> Save Article</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
