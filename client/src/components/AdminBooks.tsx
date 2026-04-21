import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit, Trash, Book, Save, RefreshCw, Search, FileText, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function AdminBooks() {
  const { toast } = useToast();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    type: 'Book',
    contributors: '',
    contributor_label: 'Authors',
    isbn: '',
    year: new Date().getFullYear().toString(),
    pages: '',
    pdf_url: '',
    cover_image_url: '',
    subjects: '',
    description: ''
  });

  const [subTab, setSubTab] = useState<'published' | 'proposals'>('published');
  const [proposals, setProposals] = useState<any[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [updatingProposal, setUpdatingProposal] = useState(false);

  // ── Mail Server Trigger Helper ──────────────────────────────────────────────
  const MAIL_SERVER_URL = "https://scholar-hub-server-seven.vercel.app";
  const MAIL_API_KEY = "scholar_india_mail_secret_2026";

  const triggerEmail = async (endpoint: string, payload: any) => {
    try {
      const res = await fetch(`${MAIL_SERVER_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MAIL_API_KEY
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Mail failed');
      return true;
    } catch (e: any) {
      console.error(`❌ Mail trigger error [${endpoint}]:`, e.message);
      return false;
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('published_books')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) {
          data.sort((a,b) => {
            
  const getTs = (v) => {
    if(!v) return 0;
    const n = Number(String(v));
    if(!isNaN(n) && n > 10000 && n < 100000) return Math.round((n - 25569) * 86400 * 1000);
    const d = new Date(v);
    return !isNaN(d.getTime()) ? d.getTime() : 0;
  };

            return getTs(b.created_at || b.year) - getTs(a.created_at || a.year);
          });
          setBooks(data);
      } else { setBooks([]); }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to fetch published books.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    setLoadingProposals(true);
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      if (data) {
          data.sort((a,b) => {
            
  const getTs = (v) => {
    if(!v) return 0;
    const n = Number(String(v));
    if(!isNaN(n) && n > 10000 && n < 100000) return Math.round((n - 25569) * 86400 * 1000);
    const d = new Date(v);
    return !isNaN(d.getTime()) ? d.getTime() : 0;
  };

            return getTs(b.submitted_at) - getTs(a.submitted_at);
          });
          setProposals(data);
      } else { setProposals([]); }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to fetch proposals.', variant: 'destructive' });
    } finally {
      setLoadingProposals(false);
    }
  };

  const updateProposalStatus = async (id: string, newStatus: string) => {
    setUpdatingProposal(true);
    try {
      const prop = proposals.find(p => p.id === id);
      const { error } = await supabase.from('books').update({ status: newStatus }).eq('id', id);
      if (error) throw error;

      toast({ title: 'Status updated', description: `Proposal ${id} marked as ${newStatus}` });
      
      // Trigger Email Notification
      triggerEmail('/send/book-status-update', {
        name: prop.author_name || 'Author',
        email: prop.email,
        status: newStatus.toLowerCase().includes('accepted') ? 'accepted' : 
                newStatus.toLowerCase().includes('rejected') ? 'rejected' : 'under_review',
        details: {
          bookID: id,
          bookTitle: prop.book_title
        }
      });

      fetchProposals();
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' });
    } finally {
      setUpdatingProposal(false);
    }
  };

  useEffect(() => {
    if (subTab === 'published') fetchBooks();
    else fetchProposals();
  }, [subTab]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: '',
      type: 'Book',
      contributors: '',
      contributor_label: 'Authors',
      isbn: '',
      year: new Date().getFullYear().toString(),
      pages: '',
      pdf_url: '',
      cover_image_url: '',
      subjects: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const openEdit = (book: any) => {
    setEditingId(book.id);
    setForm({
      title: book.title || '',
      type: book.type || 'Book',
      contributors: book.contributors || '',
      contributor_label: book.contributor_label || 'Authors',
      isbn: book.isbn || '',
      year: book.year || '',
      pages: book.pages || '',
      pdf_url: book.pdf_url || '',
      cover_image_url: book.cover_image_url || '',
      subjects: book.subjects || '',
      description: book.description || ''
    });
    setIsModalOpen(true);
  };

  const deleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
      const { error } = await supabase
        .from('published_books')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({ title: 'Success', description: 'Book deleted successfully' });
      fetchBooks();
    } catch (err: any) {
      toast({ 
        title: 'Delete Failed', 
        description: err.message, 
        variant: 'destructive' 
      });
    }
  };

  const saveBook = async () => {
    if (!form.title || !form.contributors) {
      toast({ 
        title: 'Required Fields', 
        description: 'Please fill in Title and Contributors.', 
        variant: 'destructive' 
      });
      return;
    }

    setProcessing(true);
    try {
      const payload = { ...form };
      
      if (editingId) {
        const { error } = await supabase
          .from('published_books')
          .update(payload)
          .eq('id', editingId);
        
        if (error) throw error;
        toast({ title: 'Success', description: 'Book updated successfully' });
      } else {
        const { error } = await supabase
          .from('published_books')
          .insert([payload]);
        
        if (error) throw error;
        toast({ title: 'Success', description: 'Book added successfully' });
      }

      setIsModalOpen(false);
      fetchBooks();
    } catch (err: any) {
      toast({ 
        title: 'Save Failed', 
        description: err.message, 
        variant: 'destructive' 
      });
    } finally {
      setProcessing(false);
    }
  };

  const filteredBooks = books.filter(b => 
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.contributors?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.isbn?.includes(searchQuery)
  );

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const handleFileUpload = async (file: File, type: 'cover' | 'pdf') => {
    const isCover = type === 'cover';
    if (isCover) setUploadingCover(true);
    else setUploadingPdf(true);

    try {
      const fileExt = file.name.split('.').pop() || (isCover ? 'jpg' : 'pdf');
      const uniqueName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const s3FileName = `books/${type}/${uniqueName}`;

      // 1. Get pre-signed URL from Supabase Edge Function (same as reviewer/manuscript forms)
      const { data: presignData, error: presignError } = await supabase.functions.invoke('s3-presign', {
        body: {
          fileName: s3FileName,
          fileType: file.type || (isCover ? 'image/jpeg' : 'application/pdf'),
        }
      });

      if (presignError || !presignData?.signedUrl) {
        throw new Error('Failed to get secure upload URL. Please try again.');
      }

      const { signedUrl, publicUrl: s3Url } = presignData;

      // 2. Upload file directly to S3 using the signed URL
      const arrayBuffer = await file.arrayBuffer();
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || (isCover ? 'image/jpeg' : 'application/pdf'),
        },
        body: new Uint8Array(arrayBuffer),
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload to S3 failed: ${uploadResponse.statusText}`);
      }

      // 3. Save the public S3 URL to form state
      if (isCover) {
        setForm(prev => ({ ...prev, cover_image_url: s3Url }));
      } else {
        setForm(prev => ({ ...prev, pdf_url: s3Url }));
      }

      toast({ title: 'Upload Successful', description: `${isCover ? 'Cover image' : 'PDF'} uploaded to S3 successfully.` });
    } catch (err: any) {
      toast({ title: 'Upload Failed', description: err.message, variant: 'destructive' });
    } finally {
      if (isCover) setUploadingCover(false);
      else setUploadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 py-2 print:hidden">
        <div className="pl-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Book Management</h2>
          <div className="flex items-center gap-6 mt-6 border-b border-slate-200 w-full">
            <button 
              onClick={() => setSubTab('published')}
              className={`pb-2.5 text-[13px] font-bold transition-all border-b-2 ${subTab === 'published' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >Published Books</button>
            <button 
              onClick={() => setSubTab('proposals')}
              className={`pb-2.5 text-[13px] font-bold transition-all border-b-2 ${subTab === 'proposals' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >Book Proposals</button>
          </div>
        </div>
        <div className="flex items-center gap-2.5 pr-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder={subTab === 'published' ? "Search books..." : "Search proposals..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 pl-9 text-xs bg-white border-slate-200 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-blue-500" 
            />
          </div>
          <Button onClick={subTab === 'published' ? fetchBooks : fetchProposals} variant="outline" className="bg-white gap-2 font-bold text-xs h-9 px-3.5 border-slate-200 rounded-lg shadow-sm">
            <RefreshCw size={14} className={(subTab === 'published' ? loading : loadingProposals) ? 'animate-spin' : ''} /> Refresh
          </Button>
          {subTab === 'published' && (
            <Button onClick={openCreate} className="bg-[#1e3a8a] hover:bg-blue-900 text-white gap-2 font-bold text-xs h-9 px-3.5 rounded-lg shadow-sm border-none">
              <Plus size={14} /> Add New Book
            </Button>
          )}
        </div>
      </div>

      {subTab === 'published' ? (
      <div className="rounded-xl border border-slate-200 bg-[#f8fafc] overflow-hidden mx-2 shadow-sm">

        <div className="grid grid-cols-12 gap-x-4 px-6 py-3.5 bg-slate-100/50 border-b border-slate-200 items-center">
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Cover</div>
          <div className="col-span-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Book Title & Info</div>
          <div className="col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Contributors</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">ISBN & Year</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right pr-2">Actions</div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-16 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-900" /></div>
          ) : filteredBooks.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-3">
              <Book size={48} className="text-slate-200" />
              <p className="text-slate-400 text-sm font-medium">No books found matching your criteria.</p>
            </div>
          ) : (
            filteredBooks.map((book) => (
              <div key={book.id} className="grid grid-cols-12 gap-x-4 px-6 py-5 items-center hover:bg-slate-50/50 transition-colors">
                <div className="col-span-1 flex justify-start pl-1">
                  <div className="h-14 w-10 bg-slate-100 rounded border border-slate-200 overflow-hidden flex items-center justify-center">
                    {book.cover_image_url ? (
                      <img src={book.cover_image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon size={16} className="text-slate-300" />
                    )}
                  </div>
                </div>
                
                <div className="col-span-4 min-w-0">
                  <h3 className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-1">{book.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-blue-50 text-blue-700 text-[9px] font-bold h-4 px-1.5 border-none">{book.type}</Badge>
                    <span className="text-[10px] text-slate-400 truncate">{book.subjects}</span>
                  </div>
                </div>

                <div className="col-span-3 min-w-0">
                  <span className="text-[11px] font-bold text-slate-600 block">{book.contributor_label}</span>
                  <p className="text-[11px] text-slate-500 truncate">{book.contributors}</p>
                </div>

                <div className="col-span-2 min-w-0">
                  <code className="text-[11px] font-mono text-slate-600 block">{book.isbn || 'N/A'}</code>
                  <span className="text-[11px] font-semibold text-slate-500">{book.year} {book.pages ? `• ${book.pages} pages` : ''}</span>
                </div>

                <div className="col-span-2 flex justify-end gap-1.5 pr-1">
                  <Button onClick={() => openEdit(book)} variant="outline" size="icon" className="h-7 w-7 rounded border-slate-200 text-blue-600 hover:bg-blue-50">
                    <Edit size={12} />
                  </Button>
                  <Button onClick={() => deleteBook(book.id)} variant="outline" size="icon" className="h-7 w-7 rounded border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200">
                    <Trash size={12} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      ) : (
        /* PROPOSALS TABLE */
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden mx-2 shadow-sm">
          <div className="grid grid-cols-12 gap-x-4 px-6 py-3.5 bg-slate-50 border-b border-slate-200 items-center">
            <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">REF ID</div>
            <div className="col-span-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">PROPOSAL TITLE & AUTHOR</div>
            <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">SUBMITTED</div>
            <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">STATUS</div>
            <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right pr-4">ACTIONS</div>
          </div>

          <div className="divide-y divide-slate-100 italic font-medium">
            {loadingProposals ? (
               <div className="p-16 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-900" /></div>
            ) : proposals.length === 0 ? (
               <div className="p-20 text-center flex flex-col items-center gap-3">
                  <FileText size={48} className="text-slate-200" />
                  <p className="text-slate-400 text-sm">No proposals found.</p>
               </div>
            ) : (
              proposals.map((prop) => (
                <div key={prop.id} className="grid grid-cols-12 gap-x-4 px-6 py-5 items-center hover:bg-slate-50 transition-colors bg-[#FFFFF9]/40 not-italic font-sans">
                   <div className="col-span-2">
                      <code className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{prop.id}</code>
                   </div>
                   <div className="col-span-4 min-w-0">
                      <h3 className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-1">{prop.book_title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">{prop.author_name}</span>
                        <span className="text-slate-300"> | </span>
                        <span className="text-[10px] text-slate-400 truncate">{prop.email}</span>
                      </div>
                   </div>
                   <div className="col-span-2 text-[11px] font-semibold text-slate-500">
                      {new Date(prop.submitted_at || Date.now()).toLocaleDateString('en-GB')}
                   </div>
                   <div className="col-span-2 flex items-center justify-center">
                      <Badge variant="outline" className={`border-none tracking-wide text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase ${prop.status?.toLowerCase().includes('accepted') ? 'bg-emerald-50 text-emerald-600' : prop.status?.toLowerCase().includes('rejected') ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                         {prop.status || 'Submitted'}
                      </Badge>
                   </div>
                   <div className="col-span-2 flex justify-end pr-4">
                      <Button onClick={() => { setSelectedProposal(prop); setIsProposalModalOpen(true); }} className="h-8 text-[10px] font-bold bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 shadow-sm" variant="outline">
                         Review Proposal
                      </Button>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl bg-white border-slate-200 shadow-xl overflow-hidden p-0 rounded-2xl">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/80">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <Book size={20} className="text-[#1e3a8a]" /> {editingId ? 'Edit Published Book' : 'Add New Published Book'}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 scrollbar-hide">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Book Title <span className="text-rose-500">*</span></label>
                <Input 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  placeholder="Future Trends and Innovations in FinTech" 
                  className="h-10 text-sm bg-slate-50 rounded-lg shadow-sm focus-visible:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Contributors <span className="text-rose-500">*</span></label>
                <Input 
                  value={form.contributors} 
                  onChange={e => setForm({...form, contributors: e.target.value})} 
                  placeholder="Dr. J. Samuel · Dr. Hesil Jerda George" 
                  className="h-10 text-sm bg-slate-50 rounded-lg shadow-sm focus-visible:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Contributor Label</label>
                <select 
                  value={form.contributor_label} 
                  onChange={e => setForm({...form, contributor_label: e.target.value})}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm font-medium text-slate-600"
                >
                  <option value="Authors">Authors</option>
                  <option value="Editors">Editors</option>
                  <option value="Author">Author</option>
                  <option value="Contributors">Contributors</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Publication Type</label>
                <Input 
                  value={form.type} 
                  onChange={e => setForm({...form, type: e.target.value})} 
                  placeholder="Book / Edited volume" 
                  className="h-10 text-sm bg-slate-50 rounded-lg shadow-sm focus-visible:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">ISBN</label>
                <Input 
                  value={form.isbn} 
                  onChange={e => setForm({...form, isbn: e.target.value})} 
                  placeholder="978-81-XXXXX-X-X" 
                  className="h-10 text-sm bg-slate-50 rounded-lg shadow-sm focus-visible:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Year</label>
                <Input 
                  value={form.year} 
                  onChange={e => setForm({...form, year: e.target.value})} 
                  placeholder="2026" 
                  className="h-10 text-sm bg-slate-50 rounded-lg shadow-sm focus-visible:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Pages</label>
                <Input 
                  value={form.pages} 
                  onChange={e => setForm({...form, pages: e.target.value})} 
                  placeholder="94" 
                  className="h-10 text-sm bg-slate-50 rounded-lg shadow-sm focus-visible:ring-blue-600"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Subjects (Comma separated)</label>
                <Input 
                  value={form.subjects} 
                  onChange={e => setForm({...form, subjects: e.target.value})} 
                  placeholder="FinTech, AI & Finance, Blockchain" 
                  className="h-10 text-sm bg-slate-50 rounded-lg shadow-sm focus-visible:ring-blue-600"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Cover Image URL</label>
                <div className="flex gap-2">
                  <Input 
                    value={form.cover_image_url} 
                    onChange={e => setForm({...form, cover_image_url: e.target.value})} 
                    placeholder="/book-covers/example.png" 
                    className="h-10 text-sm bg-slate-50 rounded-lg shadow-sm focus-visible:ring-blue-600"
                  />
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      id="cover-upload" 
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cover')}
                    />
                    <Button 
                      asChild 
                      variant="outline" 
                      disabled={uploadingCover} 
                      className="h-10 gap-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg shadow-sm font-bold text-xs"
                    >
                      <label htmlFor="cover-upload" className="cursor-pointer">
                        {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin"/> : <ImageIcon size={14}/>} Upload
                      </label>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">PDF URL</label>
                <div className="flex gap-2">
                  <Input 
                    value={form.pdf_url} 
                    onChange={e => setForm({...form, pdf_url: e.target.value})} 
                    placeholder="/downloads/example.pdf" 
                    className="h-10 text-sm bg-slate-50 rounded-lg shadow-sm focus-visible:ring-blue-600"
                  />
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      className="hidden" 
                      id="pdf-upload" 
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'pdf')}
                    />
                    <Button 
                      asChild 
                      variant="outline" 
                      disabled={uploadingPdf} 
                      className="h-10 gap-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg shadow-sm font-bold text-xs"
                    >
                      <label htmlFor="pdf-upload" className="cursor-pointer">
                        {uploadingPdf ? <Loader2 className="h-4 w-4 animate-spin"/> : <FileText size={14}/>} Upload
                      </label>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <Textarea 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                  placeholder="A comprehensive academic text on..." 
                  className="text-sm bg-slate-50 min-h-[100px] rounded-xl shadow-sm focus-visible:ring-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold text-xs bg-slate-200/50 hover:bg-slate-200 text-slate-700 border-none rounded-lg h-10 px-6">Cancel</Button>
            <Button onClick={saveBook} disabled={processing} className="font-bold text-xs bg-[#1e3a8a] text-white gap-2 h-10 px-6 shadow-lg border-none rounded-lg transition-all active:scale-95">
              {processing ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={14}/>} Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PROPOSAL REVIEW DIALOG */}
      <Dialog open={isProposalModalOpen} onOpenChange={setIsProposalModalOpen}>
        <DialogContent className="max-w-3xl bg-white border-slate-100 shadow-2xl rounded-2xl p-0 overflow-hidden">
           <DialogHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
              <DialogTitle className="flex items-center gap-3 text-lg font-black text-slate-800 tracking-tight">
                 <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg"><BookIcon size={20} /></div>
                 Review Book Proposal
              </DialogTitle>
           </DialogHeader>

           {selectedProposal && (
             <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide text-left">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">REF NUMBER</p>
                      <p className="text-sm font-bold text-slate-800">{selectedProposal.id}</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">PUBLICATION TYPE</p>
                      <p className="text-sm font-bold text-slate-800">{selectedProposal.publication_type || 'Book'}</p>
                   </div>
                </div>

                <div className="space-y-1.5">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PROPOSAL TITLE</p>
                   <h3 className="text-lg font-bold text-slate-800 leading-tight">{selectedProposal.book_title}</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AUTHOR NAME</p>
                      <p className="text-sm font-bold text-slate-700">{selectedProposal.author_name}</p>
                   </div>
                   <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AFFILIATION</p>
                      <p className="text-sm font-bold text-slate-700">{selectedProposal.affiliation}</p>
                   </div>
                   <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EMAIL ADDRESS</p>
                      <p className="text-sm font-bold text-blue-600">{selectedProposal.email}</p>
                   </div>
                   <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MOBILE</p>
                      <p className="text-sm font-bold text-slate-700">{selectedProposal.mobile}</p>
                   </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SUBMITTED DOCUMENTS</p>
                   <div className="grid grid-cols-3 gap-4">
                      {selectedProposal.abstract_file_url && (
                        <a href={selectedProposal.abstract_file_url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-500 hover:text-blue-600 transition-all gap-2 group">
                           <FileText size={24} className="text-slate-300 group-hover:text-blue-500" />
                           <span className="text-[10px] font-bold uppercase">Abstract</span>
                        </a>
                      )}
                      {selectedProposal.full_book_file_url && (
                        <a href={selectedProposal.full_book_file_url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-500 hover:text-blue-600 transition-all gap-2 group">
                           <BookIcon size={24} className="text-slate-300 group-hover:text-blue-500" />
                           <span className="text-[10px] font-bold uppercase">Full Draft</span>
                        </a>
                      )}
                      {selectedProposal.cv_file_url && (
                        <a href={selectedProposal.cv_file_url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-500 hover:text-blue-600 transition-all gap-2 group">
                           <Users size={24} className="text-slate-300 group-hover:text-blue-500" />
                           <span className="text-[10px] font-bold uppercase">Author CV</span>
                        </a>
                      )}
                   </div>
                </div>
             </div>
           )}

           <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex items-center justify-end gap-3 sticky bottom-0">
              <Button variant="ghost" onClick={() => setIsProposalModalOpen(false)} className="text-xs font-bold text-slate-500">Cancel</Button>
              <Button 
                onClick={() => updateProposalStatus(selectedProposal.id, 'Under Review')} 
                disabled={updatingProposal}
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none font-bold text-xs h-10 px-6 rounded-xl"
              >
                Mark Under Review
              </Button>
              <Button 
                onClick={() => updateProposalStatus(selectedProposal.id, 'Accepted')} 
                disabled={updatingProposal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-8 rounded-xl shadow-lg"
              >
                Accept Proposal
              </Button>
              <Button 
                onClick={() => updateProposalStatus(selectedProposal.id, 'Rejected')} 
                disabled={updatingProposal}
                className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-none font-bold text-xs h-10 px-6 rounded-xl"
              >
                Reject
              </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const BookIcon = ({ size, className }: { size: number, className?: string }) => <Book size={size} className={className} />;

