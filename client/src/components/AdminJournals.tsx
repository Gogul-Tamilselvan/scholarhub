import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit, Trash, BookOpen, Save, RefreshCw, Users, UserPlus, ChevronRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type View = 'list' | 'editorial';

export function AdminJournals() {
  const { toast } = useToast();
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Editorial Board state
  const [selectedJournal, setSelectedJournal] = useState<any>(null);
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState({
    role: 'board-member', name: '', designation: '', institution: '', location: '', email: '', sortOrder: '0'
  });

  const [form, setForm] = useState({
    title: '', slug: '', subject: '', startingYear: new Date().getFullYear().toString(),
    aim: '', scope: '', publicationTypes: '', researchFocus: '', targetAudience: '', subjectCovers: '', referenceStyle: 'APA',
    // Journal Particulars
    issn: 'XXXXX', frequency: 'Quarterly', language: 'English',
    publisherName: 'Scholar India Publishers', publisherAddress: '', publicationFormat: 'Online (Open Access)', email: ''
  });

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('journals').select('*').order('created_at', { ascending: false });
      if (error) {
          if (error.message.includes('relation "public.journals" does not exist')) {
              setJournals([]);
              return;
          }
          throw error;
      }
      setJournals(data || []);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Notice', description: 'Could not fetch journals' });
      setJournals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJournals(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: '', slug: '', subject: '', startingYear: new Date().getFullYear().toString(),
      aim: '', scope: '', publicationTypes: '', researchFocus: '', targetAudience: '', subjectCovers: '', referenceStyle: 'APA',
      issn: 'XXXXX', frequency: 'Quarterly', language: 'English',
      publisherName: 'Scholar India Publishers', publisherAddress: '', publicationFormat: 'Online (Open Access)', email: ''
    });
    setIsModalOpen(true);
  };

  const openEdit = (journal: any) => {
    setEditingId(journal.id);
    setForm({
      title: journal.title || '',
      slug: journal.slug || '',
      subject: journal.subject || '',
      startingYear: journal.starting_year || '',
      aim: journal.aim || '',
      scope: journal.scope || '',
      publicationTypes: journal.publication_types || '',
      researchFocus: journal.research_focus || '',
      targetAudience: journal.target_audience || '',
      subjectCovers: journal.subject_covers || '',
      referenceStyle: journal.reference_style || 'APA',
      issn: journal.issn || 'XXXXX',
      frequency: journal.frequency || 'Quarterly',
      language: journal.language || 'English',
      publisherName: journal.publisher_name || 'Scholar India Publishers',
      publisherAddress: journal.publisher_address || '',
      publicationFormat: journal.publication_format || 'Online (Open Access)',
      email: journal.email || ''
    });
    setIsModalOpen(true);
  };

  const saveJournal = async () => {
    if (!form.title || !form.slug) {
      toast({ title: 'Validation Error', description: 'Title and URL Slug are required.', variant: 'destructive' });
      return;
    }

    setProcessing(true);
    try {
      const payload: any = {
        title: form.title,
        slug: form.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        subject: form.subject,
        starting_year: form.startingYear,
        aim: form.aim,
        scope: form.scope,
        publication_types: form.publicationTypes,
        research_focus: form.researchFocus,
        target_audience: form.targetAudience,
        subject_covers: form.subjectCovers,
        reference_style: form.referenceStyle,
        issn: form.issn,
        frequency: form.frequency,
        language: form.language,
        publisher_name: form.publisherName,
        publisher_address: form.publisherAddress,
        publication_format: form.publicationFormat,
        email: form.email
      };

      if (editingId) {
        const { error } = await supabase.from('journals').update(payload).eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Success', description: 'Journal updated.' });
      } else {
        const { error } = await supabase.from('journals').insert([payload]);
        if (error) throw error;
        toast({ title: 'Success', description: 'New journal created.' });
        try {
            await supabase.from('login_activity').insert([{
                reviewer_id: 'SYSTEM', activity_type: 'update', role: 'Admin', journal: payload.title
            }]);
        } catch(e) {}
      }

      setIsModalOpen(false);
      fetchJournals();
    } catch (err: any) {
      toast({ title: 'Error saving journal', description: err.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const deleteJournal = async (id: string, title: string) => {
    if (!confirm(`Are you absolutely sure you want to delete ${title}?`)) return;
    try {
        const { error } = await supabase.from('journals').delete().eq('id', id);
        if (error) throw error;
        toast({ title: 'Deleted', description: 'Journal removed.' });
        fetchJournals();
    } catch (err: any) {
        toast({ title: 'Error deleting journal', description: err.message, variant: 'destructive' });
    }
  };

  // === Editorial Board ===
  const openEditorial = (j: any) => {
    setSelectedJournal(j);
    setView('editorial');
    fetchBoard(j.id);
  };

  const fetchBoard = async (journalId: string) => {
    setBoardLoading(true);
    try {
      const { data, error } = await supabase.from('editorial_board').select('*').eq('journal_id', journalId).order('sort_order', { ascending: true });
      if (error) throw error;
      setBoardMembers(data || []);
    } catch (err: any) {
      console.error(err);
      setBoardMembers([]);
    } finally {
      setBoardLoading(false);
    }
  };

  const openMemberCreate = () => {
    setEditingMemberId(null);
    setMemberForm({ role: 'board-member', name: '', designation: '', institution: '', location: '', email: '', sortOrder: String(boardMembers.length + 1) });
    setIsBoardModalOpen(true);
  };

  const openMemberEdit = (m: any) => {
    setEditingMemberId(m.id);
    setMemberForm({
      role: m.role || 'board-member', name: m.name || '', designation: m.designation || '',
      institution: m.institution || '', location: m.location || '', email: m.email || '', sortOrder: String(m.sort_order || 0)
    });
    setIsBoardModalOpen(true);
  };

  const saveMember = async () => {
    if (!memberForm.name) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    setProcessing(true);
    try {
      const payload = {
        journal_id: selectedJournal.id,
        role: memberForm.role,
        name: memberForm.name,
        designation: memberForm.designation,
        institution: memberForm.institution,
        location: memberForm.location,
        email: memberForm.email,
        sort_order: parseInt(memberForm.sortOrder) || 0,
      };
      if (editingMemberId) {
        const { error } = await supabase.from('editorial_board').update(payload).eq('id', editingMemberId);
        if (error) throw error;
        toast({ title: 'Member updated' });
      } else {
        const { error } = await supabase.from('editorial_board').insert([payload]);
        if (error) throw error;
        toast({ title: 'Member added' });
      }
      setIsBoardModalOpen(false);
      fetchBoard(selectedJournal.id);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const deleteMember = async (id: string) => {
    if (!confirm('Delete this board member?')) return;
    try {
      await supabase.from('editorial_board').delete().eq('id', id);
      toast({ title: 'Member removed' });
      fetchBoard(selectedJournal.id);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const roleLabels: Record<string, string> = {
    'editor-in-chief': 'Editor-in-Chief',
    'managing-editor': 'Managing Editor',
    'associate-editor': 'Associate Editor',
    'board-member': 'Board Member',
    'reviewer': 'Reviewer'
  };

  const roleColors: Record<string, string> = {
    'editor-in-chief': 'bg-amber-100 text-amber-700',
    'managing-editor': 'bg-blue-100 text-blue-700',
    'associate-editor': 'bg-purple-100 text-purple-700',
    'board-member': 'bg-emerald-100 text-emerald-700',
    'reviewer': 'bg-slate-100 text-slate-600'
  };

  // === EDITORIAL BOARD VIEW ===
  if (view === 'editorial' && selectedJournal) {
    return (
      <div className="space-y-6 text-left pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 py-2">
          <div className="pl-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Editorial Board</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5 truncate max-w-xl">{selectedJournal.title}</p>
          </div>
          <div className="flex items-center gap-2.5 pr-2">
            <Button onClick={() => { setView('list'); setSelectedJournal(null); }} variant="ghost" className="gap-2 text-xs font-bold text-slate-600"><ArrowLeft size={14} /> Back</Button>
            <Button onClick={openMemberCreate} className="bg-[#1e3a8a] hover:bg-blue-900 text-white gap-2 font-bold text-xs h-9 px-4 rounded-lg shadow-sm border-none">
              <UserPlus size={14} /> Add Member
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden mx-2 shadow-sm">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
            <Users size={18} className="text-blue-900" />
            <span className="font-bold text-sm text-slate-800">Board Members</span>
            <Badge className="ml-auto bg-blue-100 text-blue-700 text-[10px] font-bold border-none">{boardMembers.length}</Badge>
          </div>
          <div className="divide-y divide-slate-100">
            {boardLoading ? (
              <div className="p-16 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-slate-400" /></div>
            ) : boardMembers.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                <Users className="w-10 h-10 text-slate-300" /> No board members yet.
              </div>
            ) : (
              boardMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                      <span className="text-sm font-black text-blue-900">{m.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold text-slate-800">{m.name}</h4>
                      <p className="text-[11px] text-slate-500">{m.designation} • {m.institution}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={`text-[9px] font-bold border-none py-0 ${roleColors[m.role] || roleColors['board-member']}`}>
                          {roleLabels[m.role] || m.role}
                        </Badge>
                        {m.location && <span className="text-[10px] text-slate-400">{m.location}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button onClick={() => openMemberEdit(m)} variant="outline" size="icon" className="h-7 w-7 rounded border-slate-200 text-blue-600 hover:bg-blue-50"><Edit size={12}/></Button>
                    <Button onClick={() => deleteMember(m.id)} variant="outline" size="icon" className="h-7 w-7 rounded border-slate-200 text-rose-500 hover:bg-rose-50"><Trash size={12}/></Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MEMBER MODAL */}
        <Dialog open={isBoardModalOpen} onOpenChange={setIsBoardModalOpen}>
          <DialogContent className="max-w-lg bg-white border-slate-200 shadow-xl p-0 rounded-2xl">
            <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/80">
              <DialogTitle className="text-lg font-bold text-slate-800">{editingMemberId ? 'Edit Member' : 'Add Board Member'}</DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Role <span className="text-rose-500">*</span></label>
                  <select value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm">
                    <option value="editor-in-chief">Editor-in-Chief</option>
                    <option value="managing-editor">Managing Editor</option>
                    <option value="associate-editor">Associate Editor</option>
                    <option value="board-member">Board Member</option>
                    <option value="reviewer">Reviewer</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Sort Order</label>
                  <Input type="number" value={memberForm.sortOrder} onChange={e => setMemberForm({...memberForm, sortOrder: e.target.value})} className="h-10 bg-slate-50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Name <span className="text-rose-500">*</span></label>
                <Input value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} placeholder="Dr. John Doe" className="h-10 bg-slate-50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Designation</label>
                <Input value={memberForm.designation} onChange={e => setMemberForm({...memberForm, designation: e.target.value})} placeholder="Assistant Professor" className="h-10 bg-slate-50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Institution</label>
                <Input value={memberForm.institution} onChange={e => setMemberForm({...memberForm, institution: e.target.value})} placeholder="University Name" className="h-10 bg-slate-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Location</label>
                  <Input value={memberForm.location} onChange={e => setMemberForm({...memberForm, location: e.target.value})} placeholder="Chennai, India" className="h-10 bg-slate-50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email</label>
                  <Input value={memberForm.email} onChange={e => setMemberForm({...memberForm, email: e.target.value})} placeholder="email@university.edu" className="h-10 bg-slate-50" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsBoardModalOpen(false)} className="font-bold text-xs">Cancel</Button>
              <Button onClick={saveMember} disabled={processing} className="bg-[#1e3a8a] text-white font-bold text-xs gap-2 h-10"><Save size={14}/> Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // === JOURNAL LIST VIEW ===
  return (
    <div className="space-y-6 text-left pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 py-2 print:hidden">
        <div className="pl-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Dynamic Journals Manager</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Create and manage dynamic journal pages. Use the ✏️ button to edit all content including Journal Particulars.</p>
        </div>
        <div className="flex items-center gap-2.5 pr-2 flex-wrap">
          <Button onClick={fetchJournals} variant="outline" className="bg-white gap-2 font-bold text-xs h-9 px-3.5 border-slate-200 rounded-lg shadow-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
          <Button onClick={openCreate} className="bg-[#1e3a8a] hover:bg-blue-900 text-white gap-2 font-bold text-xs h-9 px-3.5 rounded-lg shadow-sm border-none">
            <Plus size={14} /> Create New Journal
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-[#f8fafc] overflow-hidden mx-2 shadow-sm">
        <div className="grid grid-cols-12 gap-x-4 px-6 py-3.5 bg-slate-100/50 border-b border-slate-200 items-center pr-2">
          <div className="col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight pl-1">TITLE</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">SLUG</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">SUBJECT</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">YEAR</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">ISSN</div>
          <div className="col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right pr-2">ACTIONS</div>
        </div>
        
        <div className="divide-y divide-slate-100 bg-[#ffffff]">
          {loading ? (
             <div className="p-16 text-center text-slate-400 font-medium flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
          ) : journals.length === 0 ? (
             <div className="p-16 text-center text-slate-400 font-medium text-sm flex flex-col items-center gap-2">
                <BookOpen className="text-slate-300 w-10 h-10 mb-2"/>
                No dynamic journals created yet.
             </div>
          ) : (
             journals.map((j) => (
                 <div key={j.id} className="grid grid-cols-12 gap-x-4 px-6 py-4 items-center transition-colors hover:bg-slate-50/50 bg-[#ffffff] border-b border-slate-50">
                   <div className="col-span-3 text-[12px] font-bold text-slate-800 leading-snug truncate pr-2">{j.title}</div>
                   <div className="col-span-2 text-[11px] font-mono text-blue-600 truncate pr-2">/journal/{j.slug}</div>
                   <div className="col-span-2 text-[11px] font-semibold text-slate-600 line-clamp-1 pr-4">{j.subject || '—'}</div>
                   <div className="col-span-1 text-[11px] font-bold text-slate-500">{j.starting_year || '—'}</div>
                   <div className="col-span-1 text-[11px] font-mono text-slate-500">{j.issn || '—'}</div>
                   <div className="col-span-3 flex justify-end gap-1.5 pr-1">
                       <Button onClick={() => openEditorial(j)} variant="outline" size="sm" className="h-7 rounded border-slate-200 text-emerald-600 hover:bg-emerald-50 text-[10px] font-bold gap-1 px-2">
                           <Users size={11}/> Board
                       </Button>
                       <Button onClick={() => openEdit(j)} variant="outline" size="icon" className="h-7 w-7 rounded border-slate-200 text-blue-600 hover:bg-blue-50">
                           <Edit size={12}/>
                       </Button>
                       <Button onClick={() => deleteJournal(j.id, j.title)} variant="outline" size="icon" className="h-7 w-7 rounded border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200">
                           <Trash size={12}/>
                       </Button>
                   </div>
                 </div>
             ))
          )}
        </div>
      </div>

       {/* CREATE / EDIT MODAL */}
       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl bg-white border-slate-200 shadow-xl overflow-hidden p-0 rounded-2xl">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/80">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <BookOpen size={20} className="text-[#1e3a8a]" /> {editingId ? 'Edit Journal' : 'Create New Journal'}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* SECTION: Journal Particulars */}
            <div className="mb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <div className="w-1.5 h-5 bg-[#1e3a8a] rounded-full"></div> Journal Particulars
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Journal Title <span className="text-rose-500">*</span></label><Input value={form.title} onChange={e=>setForm({...form, title: e.target.value})} placeholder="Full journal title..." className="h-10 text-sm bg-slate-50"/></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">URL Slug <span className="text-rose-500">*</span></label><Input value={form.slug} onChange={e=>setForm({...form, slug: e.target.value})} placeholder="journal-of-science" className="h-10 text-sm bg-slate-50"/></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Starting Year</label><Input value={form.startingYear} onChange={e=>setForm({...form, startingYear: e.target.value})} placeholder="2025" className="h-10 text-sm bg-slate-50"/></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Subject</label><Input value={form.subject} onChange={e=>setForm({...form, subject: e.target.value})} placeholder="Commerce" className="h-10 text-sm bg-slate-50"/></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">ISSN</label><Input value={form.issn} onChange={e=>setForm({...form, issn: e.target.value})} placeholder="XXXX-XXXX" className="h-10 text-sm bg-slate-50"/></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Frequency</label>
                  <select value={form.frequency} onChange={e=>setForm({...form, frequency: e.target.value})} className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm">
                    <option>Monthly</option><option>Bi-Monthly</option><option>Quarterly</option><option>Half-Yearly</option><option>Annual</option>
                  </select>
                </div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Language</label><Input value={form.language} onChange={e=>setForm({...form, language: e.target.value})} placeholder="English" className="h-10 text-sm bg-slate-50"/></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Publisher Name</label><Input value={form.publisherName} onChange={e=>setForm({...form, publisherName: e.target.value})} className="h-10 text-sm bg-slate-50"/></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Publication Format</label><Input value={form.publicationFormat} onChange={e=>setForm({...form, publicationFormat: e.target.value})} className="h-10 text-sm bg-slate-50"/></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Email</label><Input value={form.email} onChange={e=>setForm({...form, email: e.target.value})} placeholder="editor@journal.com" className="h-10 text-sm bg-slate-50"/></div>
              </div>
              <div className="grid grid-cols-1 gap-4 mt-4">
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Publisher Address</label><Input value={form.publisherAddress} onChange={e=>setForm({...form, publisherAddress: e.target.value})} placeholder="Full address..." className="h-10 text-sm bg-slate-50"/></div>
              </div>
            </div>

            {/* SECTION: Content */}
            <div className="mb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <div className="w-1.5 h-5 bg-emerald-600 rounded-full"></div> Journal Content
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Aim</label><Textarea value={form.aim} onChange={e=>setForm({...form, aim: e.target.value})} placeholder="State the aim..." className="text-sm bg-slate-50 min-h-[90px]"/></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Scope</label><Textarea value={form.scope} onChange={e=>setForm({...form, scope: e.target.value})} placeholder="Define the scope..." className="text-sm bg-slate-50 min-h-[90px]"/></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Publication Types</label><Textarea value={form.publicationTypes} onChange={e=>setForm({...form, publicationTypes: e.target.value})} placeholder="Original research, reviews..." className="text-sm bg-slate-50 min-h-[80px]"/></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Research Focus</label><Textarea value={form.researchFocus} onChange={e=>setForm({...form, researchFocus: e.target.value})} placeholder="Empirical & theoretical..." className="text-sm bg-slate-50 min-h-[80px]"/></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Target Audience</label><Input value={form.targetAudience} onChange={e=>setForm({...form, targetAudience: e.target.value})} className="h-10 text-sm bg-slate-50"/></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Reference Style</label><Input value={form.referenceStyle} onChange={e=>setForm({...form, referenceStyle: e.target.value})} className="h-10 text-sm bg-slate-50"/></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Subject Covers (comma sep)</label><Input value={form.subjectCovers} onChange={e=>setForm({...form, subjectCovers: e.target.value})} className="h-10 text-sm bg-slate-50"/></div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold text-xs bg-slate-200/50 hover:bg-slate-200 text-slate-700">Cancel</Button>
            <Button onClick={saveJournal} disabled={processing} className="font-bold text-xs bg-[#1e3a8a] hover:bg-blue-900 text-white gap-2 h-10"><Save size={14}/> Save Journal</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
