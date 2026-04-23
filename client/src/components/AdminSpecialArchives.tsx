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

type View = 'journals' | 'issues';

export function AdminSpecialArchives({ isMainAdmin = true, subAdminJournals = [] }: { isMainAdmin?: boolean, subAdminJournals?: string[] }) {
  const { toast } = useToast();
  const [view, setView] = useState<View>('journals');
  const [loading, setLoading] = useState(true);

  // Data
  const [journals, setJournals] = useState<any[]>([]);
  const [specialIssues, setSpecialIssues] = useState<any[]>([]);

  // Selected context
  const [selectedJournal, setSelectedJournal] = useState<any>(null);

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form (using journal_special_issues table)
  // title -> Title
  // theme -> Sub Title
  // guest_editor -> Name
  // description -> Publication Month & Year
  // cover_image_url -> File Upload (PDF URL)
  const [issueForm, setIssueForm] = useState({ 
    title: '', 
    theme: '', 
    guest_editor: '', 
    month: '', 
    year: '', 
    file_url: '' 
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

  const openJournal = (j: any) => { setSelectedJournal(j); setView('issues'); fetchIssues(j.id); };
  const goBack = () => { if (view === 'issues') { setView('journals'); fetchJournals(); } };

  const saveIssue = async () => {
    if (!issueForm.title) return toast({ title: 'Title required', variant: 'destructive' });
    setProcessing(true);
    try {
      // We store Month and Year as a JSON string in description to keep it structured, 
      // or simply as a string "Month Year". Let's do a simple string: "Month Year"
      const periodString = `${issueForm.month} ${issueForm.year}`.trim();
      
      const payload = {
        journal_id: selectedJournal.id,
        title: issueForm.title,
        theme: issueForm.theme,
        guest_editor: issueForm.guest_editor,
        description: periodString, // Storing Month & Year here
        cover_image_url: issueForm.file_url, // Storing PDF URL here
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop() || 'pdf';
      const fileName = `special_issues/si_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: presignData, error: presignError } = await supabase.functions.invoke('s3-presign', {
        body: {
          fileName: fileName,
          fileType: file.type || 'application/pdf',
        }
      });

      if (presignError) throw new Error("Failed to get upload signature");

      const { signedUrl, publicUrl } = presignData;

      const arrayBuffer = await file.arrayBuffer();
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || 'application/pdf' },
        body: new Uint8Array(arrayBuffer),
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload file to S3");

      setIssueForm({ ...issueForm, file_url: publicUrl });
      toast({ title: "File uploaded successfully" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
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
    setIssueForm({ title: '', theme: '', guest_editor: '', month: '', year: '', file_url: '' });
    setIsIssueModalOpen(true);
  };

  const openEditModal = (iss: any) => {
    setEditingItem(iss);
    // Extract month and year from description "Month Year"
    const periodParts = (iss.description || '').split(' ');
    const month = periodParts[0] || '';
    const year = periodParts.slice(1).join(' ') || '';

    setIssueForm({ 
      title: iss.title || '', 
      theme: iss.theme || '', 
      guest_editor: iss.guest_editor || '', 
      month: month, 
      year: year, 
      file_url: iss.cover_image_url || '' 
    });
    setIsIssueModalOpen(true);
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
            </h2>
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1.5 ml-1">
             {view === 'journals' && "Select a journal to manage its special archives."}
             {view === 'issues' && "Manage full PDF special issues for this journal."}
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
                           {iss.cover_image_url && <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={() => window.open(iss.cover_image_url, '_blank')} title="View PDF"><LinkIcon size={14} /></Button>}
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => openEditModal(iss)}><Edit size={14} /></Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600" onClick={() => deleteItem(iss.id)}><Trash size={14} /></Button>
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

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                File Upload (S3 PDF Link) 
                <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">PDF</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Input 
                    type="file" 
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="h-10 text-xs bg-slate-50 border-slate-200 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  />
                  {uploading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
              {issueForm.file_url && (
                <div className="flex items-center gap-2 text-[10px] font-semibold text-emerald-600 mt-2 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                  <LinkIcon size={12} />
                  <a href={issueForm.file_url} target="_blank" rel="noreferrer" className="hover:underline truncate max-w-[300px]">
                    {issueForm.file_url}
                  </a>
                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-rose-100 text-rose-500 ml-auto" onClick={() => setIssueForm({...issueForm, file_url: ''})}>
                    <Trash size={10} />
                  </Button>
                </div>
              )}
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
    </div>
  );
}
