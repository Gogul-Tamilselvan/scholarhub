import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Download, Search, CheckCircle, FileSearch, CheckCheck, AlertTriangle, ExternalLink, UserPlus, Shield, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

export function SubmissionComparison() {
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [selectedMs, setSelectedMs] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approving, setApproving] = useState(false);

  // Sub-admin assignment state
  const [subAdmins, setSubAdmins] = useState<any[]>([]);
  const [publicationTasks, setPublicationTasks] = useState<any[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningMs, setAssigningMs] = useState<any>(null);
  const [assignForm, setAssignForm] = useState({ email: '', notes: '' });
  const [assigning, setAssigning] = useState(false);

  const fetchSubAdmins = async () => {
    const { data } = await supabase.from('sub_admins').select('id, name, email').eq('is_active', true);
    setSubAdmins(data || []);
  };

  const fetchTasks = async () => {
    const { data } = await supabase.from('publication_tasks').select('*');
    setPublicationTasks(data || []);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        { data: manuscripts },
        { data: copyrights },
        { data: papers },
        { data: payments }
      ] = await Promise.all([
        supabase.from('manuscripts').select('*'),
        supabase.from('copyright_forms').select('*'),
        supabase.from('final_papers').select('*'),
        supabase.from('payments').select('*')
      ]);

      if (manuscripts) {
        // Filter manuscripts to only those that are 'Accepted' or 'Complement'
        const applicableMs = manuscripts.filter(ms => {
          const status = String(ms.status || '').toLowerCase().trim();
          return status === 'accepted' || status === 'complement';
        });

        const mergedData = applicableMs.map(ms => {
          const msId = ms.manuscript_id || ms.id;
          const status = ms.status || 'Accepted';

          const copyright = copyrights?.find(c => c.manuscript_id === msId);
          const paper = papers?.find(p => p.manuscript_id === msId);

          const msPayments = payments?.filter(p => p.manuscript_id === msId) || [];
          const approvedPayment = msPayments.find(p => String(p.status).toLowerCase() === 'approved');
          const payment = approvedPayment || (msPayments.length > 0 ? msPayments[msPayments.length - 1] : null);

          let isReady = false;
          let missingDocs = !copyright || !paper;
          let missingPayment = status.toLowerCase() === 'accepted' && (!payment || String(payment.status).toLowerCase() !== 'approved');

          if (!missingDocs && !missingPayment) isReady = true;

          // For legacy compatibility where status was directly in 'final_paper_submissions' maybe?
          // If not, we can fall back to using another status field or add functionality.
          const isProdApproved = paper && String(paper.status || '').toLowerCase().includes('approved for production');

          return {
            ...ms,
            realId: ms.id,
            displayId: msId,
            title: ms.manuscript_title || ms.title || 'Untitled',
            author: ms.author_name || 'Unknown',
            msStatus: status,
            copyright: copyright,
            paper: paper,
            payment: payment,
            isReady,
            isProdApproved
          };
        });

        setData(mergedData);
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error fetching submission data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSubAdmins();
    fetchTasks();
  }, []);

  const exportCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ['Manuscript ID', 'Title', 'Author', 'MS Status', 'Payment', 'Copyright Form', 'Final Paper'];
    const csvData = filteredData.map(item => {
      const paymentStatus = item.msStatus.toLowerCase() === 'complement' ? 'Exempted' : (item.payment?.status || 'Pending');
      const copyStatus = item.copyright ? 'Submitted' : 'Missing';
      const paperStatus = item.isProdApproved ? 'Production Ready' : (item.paper ? 'Submitted' : 'Missing');
      return [
        item.displayId,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.author.replace(/"/g, '""')}"`,
        item.msStatus,
        paymentStatus,
        copyStatus,
        paperStatus
      ].join(',');
    });
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'submission_comparison.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = data.filter(item => {
    const q = searchTerm.toLowerCase();
    const matchSearch = String(item.displayId).toLowerCase().includes(q) || 
                        String(item.title).toLowerCase().includes(q) || 
                        String(item.author).toLowerCase().includes(q);

    let matchStatus = true;
    if (statusFilter === 'completed') matchStatus = item.isReady && !item.isProdApproved;
    else if (statusFilter === 'approved') matchStatus = item.isProdApproved;
    else if (statusFilter === 'pending_payment') {
      matchStatus = item.msStatus.toLowerCase() === 'accepted' && (!item.payment || String(item.payment.status).toLowerCase() !== 'approved');
    }
    else if (statusFilter === 'pending_docs') {
      matchStatus = !item.copyright || !item.paper;
    }

    // Hide if the publication task is already Approved (meaning the paper is published)
    const task = publicationTasks.find(t => t.manuscript_id === item.displayId);
    if (task && task.status === 'Approved') return false;

    return matchSearch && matchStatus;
  });

  const parseSafeDate = (serial: string | number | null | undefined) => {
    if (!serial) return 'N/A';
    const s = String(serial).trim();
    if(s.includes('/')) {
       const parts = s.split(', ');
       const dateParts = parts[0].split('/');
       if (dateParts.length === 3) {
          const [day, month, year] = dateParts;
          const reformatted = `${month}/${day}/${year}`;
          const d2 = new Date(reformatted);
          if (!isNaN(d2.getTime())) return d2.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
       }
    }
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return s;
  };

  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus === 'Approved' ? 'approve' : 'reject'} this payment?`)) return;
    try {
      const { error } = await supabase.from('payments').update({ status: newStatus }).eq('id', paymentId);
      if (error) throw error;
      toast({ title: `Payment ${newStatus} successfully` });
      
      // Update local state without full refetch
      setData(prev => prev.map(item => {
        if (item.payment && item.payment.id === paymentId) {
          // Check if approval makes the whole MS ready
          let isReady = false;
          if (newStatus === 'Approved' && item.copyright && item.paper) isReady = true;
          return { ...item, isReady, payment: { ...item.payment, status: newStatus } };
        }
        return item;
      }));
      if (selectedMs && selectedMs.payment && selectedMs.payment.id === paymentId) {
         setSelectedMs((prev: any) => {
           let isReady = false;
           if (newStatus === 'Approved' && prev.copyright && prev.paper) isReady = true;
           return {...prev, isReady, payment: {...prev.payment, status: newStatus}};
         });
      }
    } catch(e) {
      toast({ title: 'Failed to update payment status', variant: 'destructive' });
    }
  };

  const selectedMsIndex = selectedMs ? filteredData.findIndex(item => item.displayId === selectedMs.displayId) : -1;

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

  const handleApproveProduction = async () => {
    if (!selectedMs?.paper?.id) return;
    setApproving(true);
    try {
      const { error } = await supabase.from('final_papers')
        .update({ status: 'Approved for Production' })
        .eq('id', selectedMs.paper.id);
        
      if (error) throw error;
      
      toast({ title: 'Approved for production', variant: 'default' });

      // Trigger Production Confirmation Email
      triggerEmail('/send/production-status-update', {
        name: selectedMs.author || 'Author',
        email: selectedMs.email,
        mode: 'production',
        details: {
          mID: selectedMs.displayId,
          mTitle: selectedMs.title,
          formatStatus: 'yes',
          copyrightStatus: 'yes',
          paymentStatus: selectedMs.msStatus.toLowerCase() === 'complement' ? 'complement' : 'yes'
        }
      });

      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to approve', variant: 'destructive' });
    } finally {
      setApproving(false);
    }
  };

  const [sendingActionReq, setSendingActionReq] = useState(false);
  const handleSendActionRequired = async () => {
    if (!selectedMs) return;
    setSendingActionReq(true);
    
    const missingPayment = selectedMs.msStatus.toLowerCase() === 'accepted' && (!selectedMs.payment || String(selectedMs.payment.status).toLowerCase() !== 'approved');

    try {
      const success = await triggerEmail('/send/production-status-update', {
        name: selectedMs.author || 'Author',
        email: selectedMs.email,
        mode: 'missing',
        details: {
          mID: selectedMs.displayId,
          mTitle: selectedMs.title,
          formatStatus: selectedMs.paper ? 'yes' : 'no',
          copyrightStatus: selectedMs.copyright ? 'yes' : 'no',
          paymentStatus: missingPayment ? 'no' : 'yes'
        }
      });
      if (success) {
        toast({ title: 'Notification Sent', description: 'Action required email dispatched successfully.' });
      }
    } catch(e) {
      toast({ title: 'Failed to send notification', variant: 'destructive' });
    } finally {
      setSendingActionReq(false);
    }
  };

  const renderPaymentBadge = (item: any) => {
    if (item.msStatus.toLowerCase() === 'complement') {
      return <Badge className="bg-purple-100 text-purple-700 border-none px-2 py-0.5 whitespace-nowrap">Exempted</Badge>;
    }
    if (!item.payment) return <Badge className="bg-amber-50 text-amber-600 border-amber-200 px-2 py-0.5 whitespace-nowrap shadow-sm">Pending</Badge>;
    
    const s = String(item.payment.status).toLowerCase();
    if (s === 'approved') return <Badge className="bg-emerald-100 text-emerald-700 border-none px-2 py-0.5 whitespace-nowrap">Paid</Badge>;
    if (s === 'rejected') return <Badge className="bg-rose-100 text-rose-700 border-none px-2 py-0.5 whitespace-nowrap">Rejected</Badge>;
    return <Badge className="bg-amber-100 text-amber-700 border-none px-2 py-0.5 whitespace-nowrap">Under Review</Badge>;
  };

  const renderStatusBadge = (docName: string, doc: any) => {
    if (!doc) return <Badge className="bg-slate-100 text-slate-500 border-none px-2 py-0.5 shadow-sm">Missing</Badge>;
    
    const isProd = String(doc.status || '').toLowerCase().includes('approved for production');
    if (docName === 'Paper' && isProd) {
      return (
        <Badge className="bg-emerald-600 text-white border-none px-2 py-0.5 shadow-sm flex gap-1 items-center">
          <CheckCircle size={10} /> Production Ready
        </Badge>
      );
    }

    return (
      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 px-2 py-0.5 shadow-sm whitespace-nowrap">Submitted</Badge>
    );
  };

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 py-2 print:hidden">
        <div className="pl-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Submission Comparison</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Verify Copyright Forms and Final Manuscripts side-by-side.</p>
        </div>
        <div className="flex items-center gap-3 pr-2">
          <Button onClick={fetchData} disabled={loading} variant="outline" className="bg-white gap-2 font-bold text-xs h-9 px-4 border-slate-200 rounded-lg shadow-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
          <Button onClick={exportCSV} className="bg-[#1e3a8a] hover:bg-blue-900 text-white gap-2 font-bold text-xs h-9 px-4 rounded-lg shadow-sm border-none">
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Sub-admin submitted PDFs pending approval */}
      {publicationTasks.filter(t => t.status === 'Submitted').length > 0 && (
        <div className="rounded-xl border border-purple-200 bg-purple-50/40 shadow-sm overflow-hidden mx-2">
          <div className="px-5 py-3 border-b border-purple-100 bg-purple-50 flex items-center gap-2">
            <Shield size={15} className="text-purple-600" />
            <span className="text-[12px] font-black text-purple-700 uppercase tracking-wide">
              Sub-Admin Submissions Awaiting Approval ({publicationTasks.filter(t => t.status === 'Submitted').length})
            </span>
          </div>
          <div className="divide-y divide-purple-100">
            {publicationTasks.filter(t => t.status === 'Submitted').map(task => (
              <div key={task.id} className="grid grid-cols-12 gap-x-4 px-5 py-4 items-center">
                <div className="col-span-4">
                  <p className="text-[11px] font-black text-slate-700 tracking-wider">{task.manuscript_id}</p>
                  <p className="text-[12px] font-bold text-slate-800 line-clamp-1">{task.manuscript_title || '—'}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">By: <span className="font-bold">{task.assigned_to_name || task.assigned_to_email}</span></p>
                </div>
                <div className="col-span-4">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Submitted PDF</p>
                  {task.published_pdf_url ? (
                    <a href={task.published_pdf_url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
                      <ExternalLink size={12} /> {task.published_pdf_name || 'View PDF'}
                    </a>
                  ) : <span className="text-xs text-slate-400">No URL recorded</span>}
                  <p className="text-[10px] text-slate-400 mt-1">
                    Submitted: {task.submitted_at ? new Date(task.submitted_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                  </p>
                </div>
                <div className="col-span-4 flex items-center justify-end gap-2">
                  <Button size="sm"
                    onClick={async () => {
                      await supabase.from('publication_tasks').update({ status: 'Approved', approved_at: new Date().toISOString() }).eq('id', task.id);
                      await supabase.from('manuscripts').update({ status: 'Published' }).eq('id', task.manuscript_id || task.id);
                      toast({ title: 'Approved', description: `${task.manuscript_id} publication PDF approved and published.` });
                      fetchTasks();
                      fetchData();
                    }}
                    className="h-8 px-4 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1">
                    <CheckCircle size={11} /> Approve
                  </Button>
                  <Button size="sm" variant="outline"
                    onClick={async () => {
                      await supabase.from('publication_tasks').update({ status: 'Assigned' }).eq('id', task.id);
                      toast({ title: 'Sent back', description: 'Task reassigned for revision.', variant: 'default' });
                      fetchTasks();
                    }}
                    className="h-8 px-4 text-[10px] font-bold border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg gap-1">
                    ↩ Send Back
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm mx-2">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 border-b border-slate-100 bg-white relative z-10">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search MSID, Title, Author..."
              className="pl-10 h-10 w-full rounded-xl bg-slate-50/50 border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-indigo-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <select
               value={statusFilter}
               onChange={e => setStatusFilter(e.target.value)}
               className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
             >
               <option value="All">All Applicable</option>
               <option value="completed">Ready for Approval</option>
               <option value="pending_payment">Pending Payment</option>
               <option value="pending_docs">Pending Documents</option>
               <option value="approved">Approved for Prod.</option>
             </select>
             <div className="text-xs font-bold text-slate-400 whitespace-nowrap pl-2 border-l border-slate-200 mb-0">{filteredData.length} Manuscript(s)</div>
          </div>
        </div>

        <div className="grid grid-cols-[1.5fr_3fr_1fr_1fr_1fr_1.5fr_2.5fr] gap-x-4 px-6 py-3.5 bg-slate-50/80 border-b border-slate-100 items-center pr-2 mb-0">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">MANUSCRIPT ID</div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">MANUSCRIPT DETAILS</div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center">MS STATUS</div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center">PAYMENT</div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center">COPYRIGHT</div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center">FINAL PAPER</div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-end pr-2">ACTION</div>
        </div>
        
        <div className="divide-y divide-slate-100 bg-white">
          {loading ? (
             <div className="p-16 text-center text-slate-400 font-medium flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
          ) : filteredData.length === 0 ? (
             <div className="p-16 text-center text-slate-400 font-medium text-sm">No matching submissions found.</div>
          ) : (
             filteredData.map((item, index) => (
               <div key={item.displayId || index} className="grid grid-cols-[1.5fr_3fr_1fr_1fr_1fr_1.5fr_2.5fr] gap-x-4 px-6 py-5 hover:bg-slate-50/50 items-center transition-colors border-b border-slate-50 last:border-0">
                 <div>
                    <p className="text-[11px] font-black text-slate-700 tracking-wider">{(item.displayId || '—').toUpperCase()}</p>
                 </div>
                 <div className="space-y-1.5 pr-2">
                    <p className="text-[12px] font-bold text-slate-800 line-clamp-2 leading-snug">{item.title}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.author}</p>
                 </div>
                 <div className="flex items-center justify-center">
                    <Badge variant="outline" className={`border-none tracking-wide text-[9px] font-bold px-2 py-0.5 capitalize ${item.msStatus.toLowerCase() === 'complement' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                       {item.msStatus}
                    </Badge>
                 </div>
                 <div className="flex items-center justify-center text-center">
                    {renderPaymentBadge(item)}
                 </div>
                 <div className="flex items-center justify-center text-center">
                    {renderStatusBadge('Copyright', item.copyright)}
                 </div>
                 <div className="flex items-center justify-center text-center">
                    {renderStatusBadge('Paper', item.paper)}
                 </div>
                 <div className="flex flex-col items-end gap-2 pr-1">
                     <div className="flex items-center justify-end gap-2 w-full flex-wrap">
                       {(() => {
                         const task = publicationTasks.find(t => t.manuscript_id === item.displayId);
                         const colors: Record<string,string> = {
                           'Assigned': 'bg-blue-50 text-blue-600 border-blue-200',
                           'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
                           'Submitted': 'bg-purple-50 text-purple-700 border-purple-200',
                           'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200'
                         };
                         return (
                           <>
                             {task ? (
                               <Badge className={`text-[9px] font-bold px-3 py-1 border ${colors[task.status] || 'bg-slate-50 text-slate-500'}`}>{task.status}</Badge>
                             ) : (
                               <>
                                 <Button
                                   size="sm"
                                   variant="outline"
                                   onClick={() => { setAssigningMs(item); setAssignForm({ email: subAdmins[0]?.email || '', notes: '' }); setIsAssignModalOpen(true); }}
                                   className="text-[10px] h-8 px-3 font-bold rounded-lg border-dashed border-slate-300 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 gap-1"
                                   title="Assign to Sub-Admin"
                                 >
                                   <UserPlus size={11} /> Assign
                                 </Button>
                                 <Button
                                   onClick={() => { setSelectedMs(item); setIsModalOpen(true); }}
                                   className={`text-[10px] h-8 px-3 font-bold tracking-wide rounded-lg flex items-center gap-1.5 shadow-sm transition-all ${item.isProdApproved ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : item.isReady ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                 >
                                   {item.isProdApproved ? <CheckCircle size={12} /> : <FileSearch size={12} />}
                                   Review
                                 </Button>
                               </>
                             )}
                           </>
                         );
                       })()}
                     </div>
                 </div>
               </div>
             ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl bg-white border-slate-200 shadow-xl overflow-hidden p-0 rounded-2xl h-[90vh] md:h-auto flex flex-col md:block">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10 shrink-0">
            <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-slate-800 tracking-tight">
              <CheckCheck size={20} className="text-blue-600" />
              Review &amp; Approve for Production
            </DialogTitle>
          </DialogHeader>

          {selectedMs && (
            <div className="px-6 py-6 overflow-y-auto grow custom-scrollbar bg-white" style={{ maxHeight: '70vh' }}>
              
              {selectedMs.isProdApproved ? (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 font-bold flex items-center justify-center gap-2 border border-emerald-100 shadow-sm text-sm">
                  <CheckCircle size={18} className="text-emerald-500" /> This manuscript has already been approved for production.
                </div>
              ) : selectedMs.isReady ? (
                <div className="bg-blue-50 text-blue-700 p-4 rounded-xl mb-6 font-bold flex items-center justify-center gap-2 border border-blue-100 shadow-sm text-sm">
                  <CheckCircle size={18} className="text-blue-500" /> All requirements met. Ready for production approval.
                </div>
              ) : (
                <div className="bg-amber-50 text-amber-800 p-5 rounded-xl mb-6 font-medium border border-amber-200/60 shadow-sm text-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 font-bold mb-3 text-amber-700">
                      <AlertTriangle size={18} className="text-amber-500" /> Cannot approve yet. Missing requirements:
                    </div>
                    <ul className="list-disc pl-8 space-y-1.5 text-amber-700/90 font-semibold marker:text-amber-400">
                      {!selectedMs.copyright && <li>Copyright Form is missing</li>}
                      {!selectedMs.paper && <li>Final Manuscript is missing</li>}
                      {selectedMs.msStatus.toLowerCase() === 'accepted' && (!selectedMs.payment || String(selectedMs.payment.status).toLowerCase() !== 'approved') && <li>Payment is pending or missing</li>}
                    </ul>
                  </div>
                  <Button 
                    onClick={handleSendActionRequired} 
                    disabled={sendingActionReq}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 px-5 shadow-sm shrink-0 gap-2"
                  >
                    {sendingActionReq ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                    Send Action Required Email
                  </Button>
                </div>
              )}

              <div className={`grid grid-cols-1 ${selectedMs.msStatus.toLowerCase() === 'accepted' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
                
                {selectedMs.msStatus.toLowerCase() === 'accepted' && (
                  <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden group hover:border-slate-300 transition-colors">
                    <div className="font-bold text-xs bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center gap-2 text-slate-700 tracking-wide">
                      <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center"><CheckCheck size={12} /></div>
                      PAYMENT STATUS
                    </div>
                    <div className="p-5 text-sm space-y-4">
                      {selectedMs.payment ? (
                        <>
                          <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Amount Paid</span> <span className="font-bold text-slate-800">₹{selectedMs.payment.amount_paid || selectedMs.payment.amount || 'N/A'}</span></div>
                          <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Mode</span> <span className="font-semibold text-slate-700">{selectedMs.payment.payment_mode || selectedMs.payment.payment_method || selectedMs.payment.mode_of_payment || 'N/A'}</span></div>
                          <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Date</span> <span className="font-semibold text-slate-700">{parseSafeDate(selectedMs.payment.payment_date || selectedMs.payment.date_of_payment || selectedMs.payment.submitted_at)}</span></div>
                          <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Status</span> {renderPaymentBadge(selectedMs)}</div>
                          {selectedMs.payment.payment_proof_link || selectedMs.payment.payment_proof_url ? (
                            <a href={selectedMs.payment.payment_proof_link || selectedMs.payment.payment_proof_url} target="_blank" rel="noreferrer" className="w-full mt-4 flex items-center justify-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 text-xs font-bold py-2.5 rounded-lg transition-colors border border-blue-100">
                              <ExternalLink size={14} /> View Proof
                            </a>
                          ) : null}
                          
                          {(selectedMs.payment.status === 'Pending' || selectedMs.payment.status === 'Under Review' || selectedMs.payment.status === 'Under Process') && (
                            <div className="flex gap-2 w-full mt-2 border-t border-slate-100 pt-3">
                              <Button 
                                size="sm" 
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] h-8"
                                onClick={() => updatePaymentStatus(selectedMs.payment.id, 'Approved')}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] h-8"
                                onClick={() => updatePaymentStatus(selectedMs.payment.id, 'Rejected')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-6 text-rose-500 font-bold border-2 border-dashed border-rose-100 rounded-xl bg-rose-50/30">Not Submitted</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden group hover:border-slate-300 transition-colors">
                  <div className="font-bold text-xs bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center gap-2 text-slate-700 tracking-wide">
                    <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center"><FileSearch size={12} /></div>
                    COPYRIGHT FORM
                  </div>
                  <div className="p-5 text-sm space-y-4">
                    {selectedMs.copyright ? (
                      <>
                        <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Author / Name</span> <span className="font-bold text-slate-800">{selectedMs.copyright.corresponding_author || selectedMs.copyright.author_names || selectedMs.copyright.author_name || 'N/A'}</span></div>
                        <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Email</span> <span className="font-semibold text-slate-700 truncate block">{selectedMs.copyright.email || 'N/A'}</span></div>
                        <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Submitted On</span> <span className="font-semibold text-slate-700">{parseSafeDate(selectedMs.copyright.submission_date || selectedMs.copyright.submitted_at)}</span></div>
                        <a href={selectedMs.copyright.file_url || selectedMs.copyright.file_link} target="_blank" rel="noreferrer" className="w-full mt-4 flex items-center justify-center gap-2 text-purple-600 bg-purple-50 hover:bg-purple-100 text-xs font-bold py-2.5 rounded-lg transition-colors border border-purple-100">
                          <Download size={14} /> View Form
                        </a>
                      </>
                    ) : (
                      <div className="text-center py-6 text-rose-500 font-bold border-2 border-dashed border-rose-100 rounded-xl bg-rose-50/30">Not Submitted</div>
                    )}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden group hover:border-slate-300 transition-colors">
                  <div className="font-bold text-xs bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center gap-2 text-slate-700 tracking-wide">
                    <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCheck size={12} /></div>
                    FINAL MANUSCRIPT
                  </div>
                  <div className="p-5 text-sm space-y-4">
                    {selectedMs.paper ? (
                      <>
                        <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Author / Name</span> <span className="font-bold text-slate-800">{selectedMs.paper.corresponding_author || selectedMs.paper.author_name || 'N/A'}</span></div>
                        <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Contact</span> <span className="font-semibold text-slate-700 truncate block">{selectedMs.paper.email || 'N/A'}</span></div>
                        <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Submitted On</span> <span className="font-semibold text-slate-700">{parseSafeDate(selectedMs.paper.submission_date || selectedMs.paper.submitted_at)}</span></div>
                        <a href={selectedMs.paper.file_url || selectedMs.paper.file_link} target="_blank" rel="noreferrer" className="w-full mt-4 flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold py-2.5 rounded-lg transition-colors border border-emerald-100">
                          <Download size={14} /> View Paper
                        </a>
                      </>
                    ) : (
                      <div className="text-center py-6 text-rose-500 font-bold border-2 border-dashed border-rose-100 rounded-xl bg-rose-50/30">Not Submitted</div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 shrink-0">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold text-xs hover:bg-slate-200">
              Cancel
            </Button>
            {selectedMs?.isReady && !selectedMs?.isProdApproved && (
              <Button 
                onClick={handleApproveProduction} 
                disabled={approving} 
                className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs gap-2 px-6 h-10 shadow-md"
              >
                {approving ? <Loader2 size={16} className="animate-spin" /> : <CheckCheck size={16} />}
                Approve for Production
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign to Sub-Admin Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl shadow-xl p-0 overflow-hidden">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50">
            <DialogTitle className="flex items-center gap-2 text-slate-800 font-bold text-base">
              <UserPlus size={18} className="text-blue-600" /> Assign to Sub-Admin
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              {assigningMs && <>Manuscript: <span className="font-bold text-slate-700">{assigningMs.displayId}</span> — {(assigningMs.title || '').substring(0, 60)}</>}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4">
            {subAdmins.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No active sub-admins found. Create one in the <strong>Sub Admins</strong> section first.
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Assign To *</label>
                  <select
                    value={assignForm.email}
                    onChange={e => setAssignForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Sub-Admin --</option>
                    {subAdmins.map(sa => (
                      <option key={sa.id} value={sa.email}>{sa.name} ({sa.email})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Instructions / Notes</label>
                  <textarea
                    value={assignForm.notes}
                    onChange={e => setAssignForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="e.g. Format according to journal template, add DOI header..."
                    rows={4}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}
                    className="text-xs font-bold h-9 px-5 rounded-lg">Cancel</Button>
                  <Button
                    disabled={assigning || !assignForm.email}
                    onClick={async () => {
                      if (!assigningMs || !assignForm.email) return;
                      setAssigning(true);
                      try {
                        const sa = subAdmins.find(s => s.email === assignForm.email);
                        // Upsert — one task per manuscript
                        const existing = publicationTasks.find(t => t.manuscript_id === assigningMs.displayId);
                        if (existing) {
                          const { error } = await supabase.from('publication_tasks')
                            .update({ assigned_to_email: assignForm.email, assigned_to_name: sa?.name || '', notes: assignForm.notes, status: 'Assigned' })
                            .eq('id', existing.id);
                          if (error) throw error;
                        } else {
                          const { error } = await supabase.from('publication_tasks').insert({
                            manuscript_id: assigningMs.displayId,
                            manuscript_title: assigningMs.title,
                            assigned_to_email: assignForm.email,
                            assigned_to_name: sa?.name || '',
                            notes: assignForm.notes,
                            status: 'Assigned'
                          });
                          if (error) throw error;
                        }
                        toast({ title: 'Assigned!', description: `Task assigned to ${sa?.name || assignForm.email}` });
                        setIsAssignModalOpen(false);
                        fetchTasks();
                      } catch (err: any) {
                        toast({ title: 'Error', description: err.message, variant: 'destructive' });
                      } finally {
                        setAssigning(false);
                      }
                    }}
                    className="text-xs font-bold h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-2"
                  >
                    {assigning ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                    Assign Task
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
