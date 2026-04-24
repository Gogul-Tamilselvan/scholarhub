import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Loader2, Plus, Edit, Trash, BookOpen, Upload,
  Sparkles, ArrowLeft, FileText, Link as LinkIcon 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type View = 'journals' | 'issues' | 'articles';

export function AdminSpecialArchives({ isMainAdmin = true, subAdminJournals = [] }: { isMainAdmin?: boolean, subAdminJournals?: string[] }) {
  const { toast } = useToast();
  const [view, setView] = useState<View>('journals');
  const [loading, setLoading] = useState(true);

  // Data
  const [journals, setJournals] = useState<any[]>([]);
  const [specialIssues, setSpecialIssues] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);

  // Selected context
  const [selectedJournal, setSelectedJournal] = useState<any>(null);
  const [selectedIssueItem, setSelectedIssueItem] = useState<any>(null);

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [issueForm, setIssueForm] = useState({ 
    title: '', 
    theme: '', 
    guest_editor: '', 
    month: '', 
    year: ''
  });

  const [articleForm, setArticleForm] = useState({ 
    articleId: '', title: '', authors: '', affiliation: '', pages: '', doi: '', abstract: '', pdf_url: '', keywords: '', sortOrder: '0' 
  });

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

  const fetchIssues = async (journalId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_special_issues')
        .select('*')
        .eq('journal_id', journalId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setSpecialIssues(data || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async (specialIssueId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('si_articles')
        .select('*')
        .eq('special_issue_id', specialIssueId)
        .order('sort_order', { ascending: true });
        
      if (error) throw error;
      setArticles(data || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openJournal = (j: any) => { setSelectedJournal(j); setView('issues'); fetchIssues(j.id); };
  const goBack = () => { 
    if (view === 'articles') { setView('issues'); fetchIssues(selectedJournal.id); }
    else if (view === 'issues') { setView('journals'); fetchJournals(); } 
  };

  const saveIssue = async () => {
    if (!issueForm.title) return toast({ title: 'Title required', variant: 'destructive' });
    setProcessing(true);
    try {
      const periodString = `${issueForm.month} ${issueForm.year}`.trim();
      
      const payload = {
        journal_id: selectedJournal.id,
        title: issueForm.title,
        theme: issueForm.theme,
        guest_editor: issueForm.guest_editor,
        description: periodString,
        status: 'Published'
      };

      if (editingItem) {
        const { error } = await supabase.from('journal_special_issues').update(payload).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('journal_special_issues').insert([payload]);
        if (error) throw error;
      }
      setIsIssueModalOpen(false);
      fetchIssues(selectedJournal.id);
      toast({ title: 'Special Issue Saved' });
    } catch (err: any) { 
      toast({ title: 'Error', description: err.message, variant: 'destructive' }); 
    } finally { 
      setProcessing(false); 
    }
  };

  const handlePdfUpload = async (file: File) => {
    setUploadingPdf(true);
    try {
      const fileExt = file.name.split('.').pop() || 'pdf';
      const s3FileName = `special_articles/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data: presignData, error: presignError } = await supabase.functions.invoke('s3-presign', {
        body: { fileName: s3FileName, fileType: file.type || 'application/pdf' }
      });
      if (presignError || !presignData?.signedUrl) throw new Error('Failed to get upload URL');
      const { signedUrl, publicUrl } = presignData;
      const buf = await file.arrayBuffer();
      const res = await fetch(signedUrl, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/pdf' }, body: new Uint8Array(buf) });
      if (!res.ok) throw new Error('S3 upload failed');
      setArticleForm(prev => ({ ...prev, pdf_url: publicUrl }));
      toast({ title: 'PDF Uploaded', description: 'Article PDF uploaded to S3 successfully.' });
    } catch (err: any) {
      toast({ title: 'Upload Failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingPdf(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this special issue?')) return;
    try {
      await supabase.from('journal_special_issues').delete().eq('id', id);
      fetchIssues(selectedJournal.id);
      toast({ title: 'Deleted' });
    } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIssueForm({ title: '', theme: '', guest_editor: '', month: '', year: '' });
    setIsIssueModalOpen(true);
  };

  const openEditModal = (iss: any) => {
    setEditingItem(iss);
    const periodParts = (iss.description || '').split(' ');
    const month = periodParts[0] || '';
    const year = periodParts.slice(1).join(' ') || '';

    setIssueForm({ 
      title: iss.title || '', 
      theme: iss.theme || '', 
      guest_editor: iss.guest_editor || '', 
      month: month, 
      year: year
    });
    setIsIssueModalOpen(true);
  };

  const openArticlesView = (iss: any) => {
    setSelectedIssueItem(iss);
    setView('articles');
    fetchArticles(iss.id);
  };

  const openArticleCreate = () => {
    setEditingItem(null);
    const nextNum = String(articles.length + 1).padStart(3, '0');
    setArticleForm({ articleId: nextNum, title: '', authors: '', affiliation: '', pages: '', doi: '', abstract: '', pdf_url: '', keywords: '', sortOrder: String(articles.length + 1) });
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
      abstract: a.abstract || '',
      pdf_url: a.pdf_url || '',
      keywords: a.keywords || '',
      sortOrder: String(a.sort_order || 0)
    });
    setIsArticleModalOpen(true);
  };

  const saveArticle = async () => {
    if (!articleForm.title || !articleForm.authors) { toast({ title: 'Title and Authors required', variant: 'destructive' }); return; }
    setProcessing(true);
    try {
      const payload = {
        special_issue_id: selectedIssueItem.id,
        article_id: articleForm.articleId,
        title: articleForm.title,
        authors: articleForm.authors,
        affiliation: articleForm.affiliation,
        pages: articleForm.pages,
        doi: articleForm.doi,
        abstract: articleForm.abstract,
        pdf_url: articleForm.pdf_url,
        keywords: articleForm.keywords,
        sort_order: parseInt(articleForm.sortOrder) || 0,
      };
      if (editingItem) {
        const { error } = await supabase.from('si_articles').update(payload).eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: 'Article updated' });
      } else {
        const { error } = await supabase.from('si_articles').insert([payload]);
        if (error) throw error;
        toast({ title: 'Article added' });
      }
      setIsArticleModalOpen(false);
      fetchArticles(selectedIssueItem.id);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    try {
      await supabase.from('si_articles').delete().eq('id', id);
      toast({ title: 'Article deleted' });
      fetchArticles(selectedIssueItem.id);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
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
              {view === 'issues' && selectedJournal?.title}
              {view === 'articles' && `${selectedIssueItem?.title} - Articles`}
            </h2>
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1.5 ml-1">
             {view === 'journals' && "Select a journal to manage its special archives."}
             {view === 'issues' && "Manage full PDF special issues for this journal."}
             {view === 'articles' && "Upload and manage articles for this special issue."}
          </p>
        </div>

        <div className="flex items-center gap-3 pr-2">
          {view === 'issues' && (
            <Button onClick={openAddModal} className="bg-[#1e3a8a] hover:bg-blue-900 text-white gap-2 font-bold text-xs h-9 px-5 rounded-lg shadow-sm border-none">
              <Plus size={14} /> Add Special Issue
            </Button>
          )}
        </div>
      </div>

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
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mb-2 line-clamp-2 min-h-[40px] leading-snug">{journal.title}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {view === 'issues' && (
              <div className="space-y-3">
                {specialIssues.length === 0 && (
                  <div className="text-center p-12 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-500">No special issues found. Add one to get started.</p>
                  </div>
                )}
                {specialIssues.map((iss) => (
                  <Card key={iss.id} className="group hover:shadow-md transition-all border-slate-100 bg-white overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0"><FileText size={18} /></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[14px] font-bold text-slate-800 leading-tight mb-1">{iss.title}</h4>
                          {iss.theme && <p className="text-[12px] font-medium text-blue-600 mb-1">{iss.theme}</p>}
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            {iss.guest_editor && <span><strong className="text-slate-700">Guest Editor:</strong> {iss.guest_editor}</span>}
                            {iss.description && <span><strong className="text-slate-700">Published:</strong> {iss.description}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                           <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-50 bg-white" onClick={() => openArticlesView(iss)}>
                             <FileText size={14} /> Manage Articles
                           </Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => openEditModal(iss)}><Edit size={14} /></Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600" onClick={() => deleteItem(iss.id)}><Trash size={14} /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {view === 'articles' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={openArticleCreate} className="bg-[#1e3a8a] hover:bg-blue-900 text-white gap-2 font-bold text-xs h-9 px-4 rounded-lg shadow-sm border-none">
                    <Plus size={14} /> Add Article
                  </Button>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-blue-900" />
                      <span className="font-bold text-sm text-slate-800">Articles — {selectedIssueItem?.title}</span>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {articles.length === 0 ? (
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
                              {a.abstract && <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 italic">{a.abstract}</p>}
                              <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400 flex-wrap">
                                <span>ID: {a.article_id}</span>
                                <span>Pages: {a.pages || '—'}</span>
                                {a.doi && <span>DOI: {a.doi}</span>}
                                {a.pdf_url && (
                                  <a href={a.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 font-bold hover:underline">
                                    <LinkIcon size={10} /> View PDF
                                  </a>
                                )}
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
          </>
        )}
      </div>

      <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-2xl border-none shadow-2xl">
          <DialogHeader className="px-6 py-4 border-b bg-slate-50/50">
            <DialogTitle className="text-sm font-black text-slate-800 uppercase tracking-wider">{editingItem ? 'Edit Special Issue' : 'Add Special Issue'}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title *</label><Input value={issueForm.title} onChange={e => setIssueForm({...issueForm, title: e.target.value})} placeholder="e.g. Special Issue on Global Economics" className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sub Title</label><Input value={issueForm.theme} onChange={e => setIssueForm({...issueForm, theme: e.target.value})} placeholder="e.g. Emerging Trends and Policies" className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name (Guest Editor)</label><Input value={issueForm.guest_editor} onChange={e => setIssueForm({...issueForm, guest_editor: e.target.value})} placeholder="e.g. Dr. John Doe" className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Publication Month</label><Input value={issueForm.month} onChange={e => setIssueForm({...issueForm, month: e.target.value})} placeholder="e.g. January" className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Publication Year</label><Input value={issueForm.year} onChange={e => setIssueForm({...issueForm, year: e.target.value})} placeholder="e.g. 2026" className="h-10 text-xs bg-slate-50 border-slate-200" /></div>
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50/50 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsIssueModalOpen(false)} className="text-xs font-bold">Cancel</Button>
            <Button onClick={saveIssue} disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6">
              {processing ? <Loader2 className="animate-spin h-3 w-3" /> : 'Save Issue'}
            </Button>
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
            {!editingItem && (
               <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl mb-4 text-left">
                 <label className="text-[11px] font-bold text-blue-900 uppercase tracking-widest mb-2 block">Auto-fill from Manuscript</label>
                 <div className="flex items-center gap-2">
                   <Input 
                      placeholder="Enter Manuscript ID (e.g. MANSJCM...)" 
                      className="h-9 bg-white text-sm" 
                      id="fetch-manuscript-id"
                   />
                   <Button 
                      type="button" 
                      onClick={async () => {
                         const mId = (document.getElementById('fetch-manuscript-id') as HTMLInputElement)?.value;
                         if (!mId) return toast({ title: 'Enter manuscript ID', variant: 'destructive' });
                         setProcessing(true);
                         try {
                           const { data, error } = await supabase.from('manuscripts').select('*').eq('id', mId.trim()).single();
                           if (error || !data) throw new Error('Manuscript not found');
                           
                           const fetchedAuthors = data.author_names || data.author_name || '';
                           const fetchedTitle = data.title || data.manuscript_title || '';
                           const fetchedAffiliation = data.affiliation || '';
                           const fetchedDoi = data.doi || '';

                           setArticleForm(prev => ({
                              ...prev,
                              title: fetchedTitle,
                              authors: fetchedAuthors,
                              affiliation: fetchedAffiliation,
                              doi: fetchedDoi,
                           }));
                           toast({ title: 'Manuscript data fetched successfully' });
                         } catch (err: any) {
                           toast({ title: 'Error fetching', description: err.message, variant: 'destructive' });
                         } finally {
                           setProcessing(false);
                         }
                      }}
                      disabled={processing}
                      className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm whitespace-nowrap"
                   >
                      Fetch Data
                   </Button>
                 </div>
               </div>
            )}
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
              <textarea 
                className="w-full min-h-[60px] p-3 text-sm rounded-md border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full title in uppercase..." 
                value={articleForm.title} 
                onChange={e => setArticleForm({...articleForm, title: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Authors <span className="text-rose-500">*</span></label>
              <Input value={articleForm.authors} onChange={e => setArticleForm({...articleForm, authors: e.target.value})} placeholder="e.g. John Doe¹, Jane Smith²" className="h-10 bg-slate-50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Affiliation</label>
              <textarea 
                className="w-full min-h-[80px] p-3 text-sm rounded-md border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Use newlines to separate multiple affiliations..." 
                value={articleForm.affiliation} 
                onChange={e => setArticleForm({...articleForm, affiliation: e.target.value})}
              />
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Keywords (Comma separated)</label>
              <Input value={articleForm.keywords} onChange={e => setArticleForm({...articleForm, keywords: e.target.value})} placeholder="Keyword 1, Keyword 2..." className="h-10 bg-slate-50" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Abstract</label>
              <textarea 
                className="w-full min-h-[120px] p-3 text-sm rounded-md border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste the article abstract here..." 
                value={articleForm.abstract} 
                onChange={e => setArticleForm({...articleForm, abstract: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Article PDF URL</label>
              <p className="text-[10px] text-slate-400">Paste a direct URL link, or use the upload button to upload a PDF to S3.</p>
              <div className="flex items-center gap-3">
                <Input 
                  value={articleForm.pdf_url} 
                  onChange={e => setArticleForm({...articleForm, pdf_url: e.target.value})} 
                  placeholder="Paste article PDF URL here (e.g. https://...)" 
                  className="h-10 bg-white border-slate-300 flex-1 text-xs font-mono" 
                />
                <div className="relative shrink-0">
                  <input type="file" accept=".pdf,application/pdf" className="hidden" id="si-pdf-upload" onChange={(e) => { if(e.target.files?.[0]) handlePdfUpload(e.target.files[0]); }} />
                  <Button asChild variant="outline" className="h-10 gap-2 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-50">
                    <label htmlFor="si-pdf-upload">
                      {uploadingPdf ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />} Upload PDF
                    </label>
                  </Button>
                </div>
              </div>
              {articleForm.pdf_url && (
                <a href={articleForm.pdf_url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-1">
                  <LinkIcon size={11} /> Preview link
                </a>
              )}
            </div>

          </div>
          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsArticleModalOpen(false)} className="font-bold text-xs">Cancel</Button>
            <Button onClick={saveArticle} disabled={processing} className="bg-[#1e3a8a] text-white font-bold text-xs gap-2 h-10 px-6">
              {processing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              {editingItem ? 'Save Changes' : 'Save Article'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
