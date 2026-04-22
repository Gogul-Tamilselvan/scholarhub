import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Loader2, Plus, Edit, Trash, BookOpen, Save, RefreshCw, 
  Archive, Sparkles, ChevronRight, ArrowLeft, FileText, 
  Calendar, Users, UploadCloud, Link as LinkIcon 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type View = 'journals' | 'volumes' | 'issues' | 'articles';

export function AdminSpecialArchives({ isMainAdmin = true, subAdminJournals = [] }: { isMainAdmin?: boolean, subAdminJournals?: string[] }) {
  const { toast } = useToast();
  const [view, setView] = useState<View>('journals');
  const [loading, setLoading] = useState(true);

  // Data
  const [journals, setJournals] = useState<any[]>([]);
  const [specialIssues, setSpecialIssues] = useState<any[]>([]);
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
  const [volumeForm, setVolumeForm] = useState({ volumeNumber: '', label: '', period: '', status: 'Published' });
  const [issueForm, setIssueForm] = useState({ issueNumber: '', label: '', period: '', isCurrent: false, title: '', theme: '', description: '', guest_editor: '', status: 'Published' });
  const [articleForm, setArticleForm] = useState({ articleId: '', title: '', authors: '', affiliation: '', pages: '', doi: '', pdf_url: '', abstract: '', keywords: '', sortOrder: '0' });

  useEffect(() => { fetchJournals(); }, []);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      let q = supabase.from('journals').select('*').order('created_at', { ascending: true });
      if (!isMainAdmin && subAdminJournals.length > 0) {
        q = q.in('title', subAdminJournals);
      }
      const { data, error } = await q;
      if (error) throw error;
      setJournals(data || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchVolumes = async (journalId: string) => {
    setLoading(true);
    try {
      // 1. Try fetching by journal_id (new structure)
      const { data, error } = await supabase.from('si_volumes').select('*').eq('journal_id', journalId).order('volume_number', { ascending: false });
      
      if (!error && data && data.length > 0) {
        setVolumes(data);
      } else {
        // 2. Fallback: Fetch by looking up through special_issues (old structure)
        const { data: siData } = await supabase.from('journal_special_issues').select('id').eq('journal_id', journalId);
        if (siData && siData.length > 0) {
          const siIds = siData.map(si => si.id);
          const { data: oldData, error: oldError } = await supabase.from('si_volumes').select('*').in('special_issue_id', siIds).order('volume_number', { ascending: false });
          if (!oldError) {
             setVolumes(oldData || []);
          } else {
             setVolumes([]);
          }
        } else {
          setVolumes([]);
        }
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async (volId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('si_issues').select('*').eq('si_volume_id', volId).order('issue_number', { ascending: true });
      if (error) throw error;
      setIssues(data || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async (issueId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('si_articles').select('*').eq('si_issue_id', issueId).order('sort_order', { ascending: true });
      if (error) throw error;
      setArticles(data || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const openJournal = (j: any) => { setSelectedJournal(j); setView('volumes'); fetchVolumes(j.id); };
  const openVolume = (vol: any) => { setSelectedVolume(vol); setView('issues'); fetchIssues(vol.id); };
  const openIssue = (iss: any) => { setSelectedIssue(iss); setView('articles'); fetchArticles(iss.id); };

  const goBack = () => {
    if (view === 'articles') { setView('issues'); fetchIssues(selectedVolume.id); }
    else if (view === 'issues') { setView('volumes'); fetchVolumes(selectedJournal.id); }
    else if (view === 'volumes') { setView('journals'); fetchJournals(); }
  };



  const saveVolume = async () => {
    if (!volumeForm.volumeNumber) return toast({ title: 'Volume number required', variant: 'destructive' });
    setProcessing(true);
    try {
      const payload = {
        journal_id: selectedJournal.id,
        volume_number: parseInt(volumeForm.volumeNumber),
        label: volumeForm.label,
        period: volumeForm.period,
        status: volumeForm.status
      };
      if (editingItem) {
        const { error } = await supabase.from('si_volumes').update(payload).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('si_volumes').insert([payload]);
        if (error) throw error;
      }
      setIsVolumeModalOpen(false);
      fetchVolumes(selectedJournal.id);
      toast({ title: 'Volume Saved' });
    } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    finally { setProcessing(false); }
  };

  const saveIssue = async () => {
    if (!issueForm.issueNumber) return toast({ title: 'Issue number required', variant: 'destructive' });
    setProcessing(true);
    try {
      const payload = {
        si_volume_id: selectedVolume.id,
        issue_number: parseInt(issueForm.issueNumber),
        label: issueForm.label,
        period: issueForm.period,
        is_current: issueForm.isCurrent,
        title: issueForm.title,
        theme: issueForm.theme,
        description: issueForm.description,
        guest_editor: issueForm.guest_editor,
        status: issueForm.status
      };
      if (editingItem) {
        const { error } = await supabase.from('si_issues').update(payload).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('si_issues').insert([payload]);
        if (error) throw error;
      }
      setIsIssueModalOpen(false);
      fetchIssues(selectedVolume.id);
      toast({ title: 'Issue Saved' });
    } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    finally { setProcessing(false); }
  };

  const saveArticle = async () => {
    if (!articleForm.title || !articleForm.authors) return toast({ title: 'Title & Authors required', variant: 'destructive' });
    setProcessing(true);
    try {
      const payload = {
        si_issue_id: selectedIssue.id,
        article_id: articleForm.articleId,
        title: articleForm.title,
        authors: articleForm.authors,
        affiliation: articleForm.affiliation,
        pages: articleForm.pages,
        doi: articleForm.doi,
        pdf_url: articleForm.pdf_url,
        abstract: articleForm.abstract,
        keywords: articleForm.keywords,
        sort_order: parseInt(articleForm.sortOrder) || 0
      };
      if (editingItem) {
        const { error } = await supabase.from('si_articles').update(payload).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('si_articles').insert([payload]);
        if (error) throw error;
      }
      setIsArticleModalOpen(false);
      fetchArticles(selectedIssue.id);
      toast({ title: 'Article Saved' });
    } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    finally { setProcessing(false); }
  };

  const deleteItem = async (table: string, id: string, refreshFn: () => void) => {
    if (!confirm('Are you sure you want to delete this? All nested content will be lost.')) return;
    try {
      await supabase.from(table).delete().eq('id', id);
      refreshFn();
      toast({ title: 'Deleted' });
    } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
  };

  if (loading && journals.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-16 relative">
      {/* Header with Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 py-2 bg-white/50 backdrop-blur-sm sticky top-0 z-20 px-2 rounded-xl">
        <div className="pl-2">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
             <Sparkles className="text-amber-500" size={16} />
             <span className="text-[10px] font-black uppercase tracking-widest">Special Archives</span>
          </div>
          <div className="flex items-center gap-3">
            {view !== 'journals' && (
              <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8 rounded-full bg-white border shadow-sm text-slate-600">
                <ArrowLeft size={16} />
              </Button>
            )}
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              {view === 'journals' && "Journal Selection"}
              {view === 'volumes' && selectedJournal?.title}
              {view === 'issues' && (selectedVolume?.label || `Volume ${selectedVolume?.volume_number}`)}
              {view === 'articles' && (selectedIssue?.label || `Issue ${selectedIssue?.issue_number}`)}
            </h2>
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1.5 ml-1">
             {view === 'journals' && "Select a journal to manage its special archives hierarchy."}
             {view === 'volumes' && "Manage volumes for this special archive."}
             {view === 'issues' && "Manage special issues and themes for this volume."}
             {view === 'articles' && "Manage research papers and articles."}
             {view === 'articles' && "Manage research papers and articles."}
          </p>
        </div>

        <div className="flex items-center gap-3 pr-2">

          {view === 'volumes' && (
            <Button onClick={() => { setEditingItem(null); setVolumeForm({ volumeNumber: String(volumes.length + 1), label: '', period: '', status: 'Published' }); setIsVolumeModalOpen(true); }} className="bg-[#1e3a8a] hover:bg-blue-900 text-white gap-2 font-bold text-xs h-9 px-5 rounded-lg shadow-sm border-none">
              <Plus size={14} /> Add Volume
            </Button>
          )}
          {view === 'issues' && (
            <Button onClick={() => { setEditingItem(null); setIssueForm({ issueNumber: String(issues.length + 1), label: '', period: '', isCurrent: false, title: '', theme: '', description: '', guest_editor: '', status: 'Published' }); setIsIssueModalOpen(true); }} className="bg-[#1e3a8a] hover:bg-blue-900 text-white gap-2 font-bold text-xs h-9 px-5 rounded-lg shadow-sm border-none">
              <Plus size={14} /> Add Special Issue
            </Button>
          )}
          {view === 'articles' && (
            <Button onClick={() => { setEditingItem(null); setArticleForm({ articleId: '', title: '', authors: '', affiliation: '', pages: '', doi: '', pdf_url: '', abstract: '', keywords: '', sortOrder: String(articles.length + 1) }); setIsArticleModalOpen(true); }} className="bg-[#1e3a8a] hover:bg-blue-900 text-white gap-2 font-bold text-xs h-9 px-5 rounded-lg shadow-sm border-none">
              <Plus size={14} /> Add Article
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => {
            if(view === 'journals') fetchJournals();
            else if(view === 'volumes') fetchVolumes(selectedJournal.id);
            else if(view === 'issues') fetchIssues(selectedVolume.id);
            else if(view === 'articles') fetchArticles(selectedIssue.id);
          }} className="h-9 w-9 rounded-lg border-slate-200 bg-white text-slate-400 hover:text-blue-600">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Breadcrumbs */}
      {view !== 'journals' && (
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg mx-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <span className="cursor-pointer hover:text-blue-600" onClick={() => setView('journals')}>Journals</span>
          <ChevronRight size={10} />
          <span className="cursor-pointer hover:text-blue-600 text-slate-600" onClick={() => { setView('volumes'); fetchVolumes(selectedJournal.id); }}>{selectedJournal?.title}</span>
          {selectedVolume && (
            <>
              <ChevronRight size={10} />
              <span className="cursor-pointer hover:text-blue-600 text-slate-600" onClick={() => { setView('issues'); fetchIssues(selectedVolume.id); }}>{selectedVolume?.label || `Vol ${selectedVolume?.volume_number}`}</span>
            </>
          )}
          {selectedIssue && (
            <>
              <ChevronRight size={10} />
              <span className="text-blue-600 font-black">{selectedIssue?.label || `Issue ${selectedIssue?.issue_number}`}</span>
            </>
          )}
        </div>
      )}

      {/* Main Content Grid/List */}
      <div className="px-2">
        {loading && (
          <div className="min-h-[200px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}

        {!loading && (
          <>
            {view === 'journals' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {journals.map((journal) => (
                  <Card key={journal.id} className="group hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden cursor-pointer bg-white" onClick={() => openJournal(journal)}>
                    <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-blue-50 p-2.5 rounded-xl text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <BookOpen size={20} />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold border-slate-200">{journal.issn || 'NO ISSN'}</Badge>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mb-2 line-clamp-2 min-h-[40px] leading-snug">{journal.title}</h3>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manage Special Archives</span>
                        <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all"><ChevronRight size={14} /></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}



            {view === 'volumes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {volumes.map((vol) => (
                  <Card key={vol.id} className="group hover:shadow-lg transition-all border-slate-200 overflow-hidden cursor-pointer bg-white relative" onClick={() => openVolume(vol)}>
                    <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                       <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-white shadow-sm text-blue-600 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); setEditingItem(vol); setVolumeForm({ volumeNumber: String(vol.volume_number), label: vol.label || '', period: vol.period || '', status: vol.status || 'Published' }); setIsVolumeModalOpen(true); }}><Edit size={12} /></Button>
                       <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-white shadow-sm text-rose-600 hover:bg-rose-50" onClick={(e) => { e.stopPropagation(); deleteItem('si_volumes', vol.id, () => fetchVolumes(selectedJournal.id)); }}><Trash size={12} /></Button>
                    </div>
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"><Archive size={22} /></div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-800">{vol.label || `Volume ${vol.volume_number}`}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{vol.period || 'No Period Set'}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {view === 'issues' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {issues.map((iss) => (
                  <Card key={iss.id} className="group hover:shadow-lg transition-all border-slate-200 overflow-hidden cursor-pointer bg-white relative" onClick={() => openIssue(iss)}>
                    <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                       <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-white shadow-sm text-blue-600 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); setEditingItem(iss); setIssueForm({ issueNumber: String(iss.issue_number), label: iss.label || '', period: iss.period || '', isCurrent: iss.is_current, title: iss.title || '', theme: iss.theme || '', description: iss.description || '', guest_editor: iss.guest_editor || '', status: iss.status || 'Published' }); setIsIssueModalOpen(true); }}><Edit size={12} /></Button>
                       <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-white shadow-sm text-rose-600 hover:bg-rose-50" onClick={(e) => { e.stopPropagation(); deleteItem('si_issues', iss.id, () => fetchIssues(selectedVolume.id)); }}><Trash size={12} /></Button>
                    </div>
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors"><FileText size={22} /></div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-800">{iss.label || `Issue ${iss.issue_number}`}</h4>
                        {iss.title && <p className="text-[11px] font-bold text-blue-600 mt-0.5 line-clamp-1">{iss.title}</p>}
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{iss.period || 'No Period Set'}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {view === 'articles' && (
              <div className="space-y-3">
                {articles.map((art) => (
                  <Card key={art.id} className="group hover:shadow-md transition-all border-slate-100 bg-white overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 shrink-0"><FileText size={18} /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">{art.article_id}</span>
                            <span className="text-[9px] font-bold text-slate-400">Order: {art.sort_order}</span>
                          </div>
                          <h4 className="text-[13px] font-bold text-slate-800 leading-tight mb-1">{art.title}</h4>
                          <p className="text-[11px] text-slate-500 font-medium truncate">{art.authors}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                           {art.pdf_url && <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => window.open(art.pdf_url, '_blank')}><LinkIcon size={14} /></Button>}
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => { setEditingItem(art); setArticleForm({ articleId: art.article_id, title: art.title, authors: art.authors, affiliation: art.affiliation || '', pages: art.pages || '', doi: art.doi || '', pdf_url: art.pdf_url || '', abstract: art.abstract || '', keywords: art.keywords || '', sortOrder: String(art.sort_order) }); setIsArticleModalOpen(true); }}><Edit size={14} /></Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600" onClick={() => deleteItem('si_articles', art.id, () => fetchArticles(selectedIssue.id))}><Trash size={14} /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}


      <Dialog open={isVolumeModalOpen} onOpenChange={setIsVolumeModalOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden bg-white rounded-2xl border-none shadow-2xl">
          <DialogHeader className="px-6 py-4 border-b bg-slate-50/50">
            <DialogTitle className="text-sm font-black text-slate-800 uppercase tracking-wider">{editingItem ? 'Edit Volume' : 'Add Volume'}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Number *</label><Input type="number" value={volumeForm.volumeNumber} onChange={e => setVolumeForm({...volumeForm, volumeNumber: e.target.value})} placeholder="e.g. 1" className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Label (Optional)</label><Input value={volumeForm.label} onChange={e => setVolumeForm({...volumeForm, label: e.target.value})} placeholder="e.g. Volume 1" className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</label><Input value={volumeForm.period} onChange={e => setVolumeForm({...volumeForm, period: e.target.value})} placeholder="e.g. 2026" className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
          </div>
          <div className="px-6 py-4 bg-slate-50/50 flex justify-end gap-3"><Button variant="ghost" onClick={() => setIsVolumeModalOpen(false)} className="text-xs font-bold">Cancel</Button><Button onClick={saveVolume} disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6">{processing ? <Loader2 className="animate-spin h-3 w-3" /> : 'Save Volume'}</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-2xl border-none shadow-2xl">
          <DialogHeader className="px-6 py-4 border-b bg-slate-50/50">
            <DialogTitle className="text-sm font-black text-slate-800 uppercase tracking-wider">{editingItem ? 'Edit Special Issue' : 'Add Special Issue'}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Number *</label><Input type="number" value={issueForm.issueNumber} onChange={e => setIssueForm({...issueForm, issueNumber: e.target.value})} placeholder="e.g. 1" className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period / Month</label><Input value={issueForm.period} onChange={e => setIssueForm({...issueForm, period: e.target.value})} placeholder="e.g. Jan 2026" className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
            </div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Special Issue Title *</label><Input value={issueForm.title} onChange={e => setIssueForm({...issueForm, title: e.target.value})} placeholder="e.g. Emerging Trends in AI" className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Short Theme / Tagline</label><Input value={issueForm.theme} onChange={e => setIssueForm({...issueForm, theme: e.target.value})} placeholder="e.g. ICRA 2026 Collection" className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Editor</label><Input value={issueForm.guest_editor} onChange={e => setIssueForm({...issueForm, guest_editor: e.target.value})} placeholder="Dr. John Doe" className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                <select value={issueForm.status} onChange={e => setIssueForm({...issueForm, status: e.target.value})} className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-md">
                   <option value="Published">Published</option><option value="In Progress">In Progress</option><option value="Closed">Closed</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label><Textarea value={issueForm.description} onChange={e => setIssueForm({...issueForm, description: e.target.value})} placeholder="Overview text..." className="text-xs bg-slate-50 border-slate-200 min-h-[100px]" /></div>
          </div>
          <div className="px-6 py-4 bg-slate-50/50 flex justify-end gap-3"><Button variant="ghost" onClick={() => setIsIssueModalOpen(false)} className="text-xs font-bold">Cancel</Button><Button onClick={saveIssue} disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6">{processing ? <Loader2 className="animate-spin h-3 w-3" /> : 'Save Issue'}</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={isArticleModalOpen} onOpenChange={setIsArticleModalOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white rounded-2xl border-none shadow-2xl">
          <DialogHeader className="px-6 py-4 border-b bg-slate-50/50">
            <DialogTitle className="text-sm font-black text-slate-800 uppercase tracking-wider">{editingItem ? 'Edit Article' : 'Add Article'}</DialogTitle>
          </DialogHeader>
          <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Article Title *</label><Input value={articleForm.title} onChange={e => setArticleForm({...articleForm, title: e.target.value})} placeholder="Full title of the research paper" className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
            <div className="space-y-1.5 md:col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authors *</label><Input value={articleForm.authors} onChange={e => setArticleForm({...articleForm, authors: e.target.value})} placeholder="Author 1, Author 2..." className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
            <div className="space-y-1.5 md:col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Affiliation</label><Textarea value={articleForm.affiliation} onChange={e => setArticleForm({...articleForm, affiliation: e.target.value})} placeholder="1. Dept of..., 2. Univ of..." className="text-xs bg-slate-50 border-slate-200 min-h-[80px]" /></div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Article ID</label><Input value={articleForm.articleId} onChange={e => setArticleForm({...articleForm, articleId: e.target.value})} placeholder="e.g. SIP-2026-001" className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DOI</label><Input value={articleForm.doi} onChange={e => setArticleForm({...articleForm, doi: e.target.value})} placeholder="e.g. 10.xxxx/xxxx" className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PDF URL (S3)</label><Input value={articleForm.pdf_url} onChange={e => setArticleForm({...articleForm, pdf_url: e.target.value})} placeholder="https://..." className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pages</label><Input value={articleForm.pages} onChange={e => setArticleForm({...articleForm, pages: e.target.value})} placeholder="e.g. 12-25" className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
            <div className="space-y-1.5 md:col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keywords (Comma separated)</label><Input value={articleForm.keywords} onChange={e => setArticleForm({...articleForm, keywords: e.target.value})} placeholder="Keyword 1, Keyword 2..." className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
            <div className="space-y-1.5 md:col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abstract</label><Textarea value={articleForm.abstract} onChange={e => setArticleForm({...articleForm, abstract: e.target.value})} placeholder="Short abstract summary..." className="text-xs bg-slate-50 border-slate-200 min-h-[120px]" /></div>
          </div>
          <div className="px-6 py-4 bg-slate-50/50 flex justify-end gap-3"><Button variant="ghost" onClick={() => setIsArticleModalOpen(false)} className="text-xs font-bold">Cancel</Button><Button onClick={saveArticle} disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6">{processing ? <Loader2 className="animate-spin h-3 w-3" /> : 'Save Article'}</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
