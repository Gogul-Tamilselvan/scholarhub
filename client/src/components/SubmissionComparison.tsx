import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Download, Search, CheckCircle, FileSearch, CheckCheck, AlertTriangle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
        supabase.from('copyright_submissions').select('*'),
        supabase.from('final_paper_submissions').select('*'),
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

    return matchSearch && matchStatus;
  });

  const handleApproveProduction = async () => {
    if (!selectedMs?.paper?.id) return;
    setApproving(true);
    try {
      const { error } = await supabase.from('final_paper_submissions')
        .update({ status: 'Approved for Production' })
        .eq('id', selectedMs.paper.id);
        
      if (error) throw error;
      
      toast({ title: 'Approved for production', variant: 'default' });
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to approve', variant: 'destructive' });
    } finally {
      setApproving(false);
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
        <div className="flex flex-col gap-1 items-start">
          <Badge className="bg-emerald-600 text-white border-none px-2 py-0.5 shadow-sm flex gap-1 items-center">
            <CheckCircle size={10} /> Production Ready
          </Badge>
          <a href={doc.file_url || doc.file_link || '#'} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline">View File</a>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1 items-start">
        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 px-2 py-0.5 shadow-sm whitespace-nowrap">Submitted</Badge>
        <a href={doc.file_url || doc.file_link || '#'} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline inline-flex items-center gap-0.5"><ExternalLink size={10} /> View File</a>
      </div>
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

        <div className="grid grid-cols-12 gap-x-4 px-6 py-3.5 bg-slate-50/80 border-b border-slate-100 items-center pr-2 mb-0">
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">MANUSCRIPT ID</div>
          <div className="col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">MANUSCRIPT DETAILS</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center">MS STATUS</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center">PAYMENT</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center">COPYRIGHT</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center">FINAL PAPER</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-end pr-2">ACTION</div>
        </div>
        
        <div className="divide-y divide-slate-100 bg-white">
          {loading ? (
             <div className="p-16 text-center text-slate-400 font-medium flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
          ) : filteredData.length === 0 ? (
             <div className="p-16 text-center text-slate-400 font-medium text-sm">No matching submissions found.</div>
          ) : (
             filteredData.map((item, index) => (
               <div key={item.displayId || index} className="grid grid-cols-12 gap-x-4 px-6 py-5 hover:bg-slate-50/50 items-center transition-colors">
                 <div className="col-span-2">
                    <p className="text-[11px] font-black text-slate-700 tracking-wider">{(item.displayId || '—').toUpperCase()}</p>
                 </div>
                 <div className="col-span-3 space-y-1.5 pr-2">
                    <p className="text-[12px] font-bold text-slate-800 line-clamp-2 leading-snug">{item.title}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.author}</p>
                 </div>
                 <div className="col-span-1 flex items-center justify-center">
                    <Badge variant="outline" className={`border-none tracking-wide text-[9px] font-bold px-2 py-0.5 capitalize ${item.msStatus.toLowerCase() === 'complement' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                       {item.msStatus}
                    </Badge>
                 </div>
                 <div className="col-span-2 flex items-center justify-center text-center">
                    {renderPaymentBadge(item)}
                 </div>
                 <div className="col-span-1 flex items-center justify-center text-center">
                    {renderStatusBadge('Copyright', item.copyright)}
                 </div>
                 <div className="col-span-1 flex items-center justify-center text-center">
                    {renderStatusBadge('Paper', item.paper)}
                 </div>
                 <div className="col-span-2 flex items-center justify-end flex-wrap pr-1">
                    <Button 
                      onClick={() => { setSelectedMs(item); setIsModalOpen(true); }}
                      className={`text-[10px] h-8 px-4 font-bold tracking-wide rounded-lg flex items-center gap-1.5 shadow-sm transition-all focus:ring-2 focus:ring-offset-1 focus:ring-blue-100 hover:shadow-md ${item.isProdApproved ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : item.isReady ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {item.isProdApproved ? <CheckCircle size={12} /> : <FileSearch size={12} />} 
                      Review
                    </Button>
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
                <div className="bg-amber-50 text-amber-800 p-5 rounded-xl mb-6 font-medium border border-amber-200/60 shadow-sm text-sm">
                  <div className="flex items-center gap-2 font-bold mb-3 text-amber-700">
                    <AlertTriangle size={18} className="text-amber-500" /> Cannot approve yet. Missing requirements:
                  </div>
                  <ul className="list-disc pl-8 space-y-1.5 text-amber-700/90 font-semibold marker:text-amber-400">
                    {!selectedMs.copyright && <li>Copyright Form is missing</li>}
                    {!selectedMs.paper && <li>Final Manuscript is missing</li>}
                    {selectedMs.msStatus.toLowerCase() === 'accepted' && (!selectedMs.payment || String(selectedMs.payment.status).toLowerCase() !== 'approved') && <li>Payment is pending or missing</li>}
                  </ul>
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
                          <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Amount Paid</span> <span className="font-bold text-slate-800">₹{selectedMs.payment.amount_paid || 'N/A'}</span></div>
                          <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Mode</span> <span className="font-semibold text-slate-700">{selectedMs.payment.payment_mode || selectedMs.payment.mode_of_payment || 'N/A'}</span></div>
                          <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Date</span> <span className="font-semibold text-slate-700">{selectedMs.payment.payment_date || selectedMs.payment.date_of_payment || 'N/A'}</span></div>
                          <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Status</span> {renderPaymentBadge(selectedMs)}</div>
                          {selectedMs.payment.payment_proof_link || selectedMs.payment.payment_proof_url ? (
                            <a href={selectedMs.payment.payment_proof_link || selectedMs.payment.payment_proof_url} target="_blank" rel="noreferrer" className="w-full mt-4 flex items-center justify-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 text-xs font-bold py-2.5 rounded-lg transition-colors border border-blue-100">
                              <ExternalLink size={14} /> View Proof
                            </a>
                          ) : null}
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
                        <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Author / Name</span> <span className="font-bold text-slate-800">{selectedMs.copyright.corresponding_author || selectedMs.copyright.author_name || 'N/A'}</span></div>
                        <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Email</span> <span className="font-semibold text-slate-700 truncate block">{selectedMs.copyright.email || 'N/A'}</span></div>
                        <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Submitted On</span> <span className="font-semibold text-slate-700">{selectedMs.copyright.submission_date || 'N/A'}</span></div>
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
                        <div><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-1">Submitted On</span> <span className="font-semibold text-slate-700">{selectedMs.paper.submission_date || 'N/A'}</span></div>
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
    </div>
  );
}
