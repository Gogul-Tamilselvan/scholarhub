import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Printer, Download, Plus, Search, MoreVertical, Eye, Edit, Check, X, CreditCard, Image as ImageIcon, ExternalLink, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MAIL_SERVER_URL, MAIL_API_KEY } from '@/lib/config';

export function AdminPayments() {
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState<any>({});
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      if (payments) {
          const sorted = [...payments].sort((a,b) => {
             
              const getTs = (v: any) => {
                if(!v) return 0;
                const s = String(v).trim();
                const n = Number(s);
                // Excel numeric
                if(!isNaN(n) && n > 10000 && n < 100000) return Math.round((n - 25569) * 86400 * 1000);
                
                // Try standard JS parse
                let d = new Date(s);
                if (!isNaN(d.getTime())) return d.getTime();
                
                // Try DD/MM/YYYY parsing (e.g. "21/4/2026, 5:33:39 pm")
                if (s.includes('/')) {
                   const parts = s.split(', ');
                   const dateParts = parts[0].split('/');
                   if (dateParts.length === 3) {
                      // Construct ISO-like or standard recognizable MM/DD/YYYY
                      // Format: MM/DD/YYYY
                      const [day, month, year] = dateParts;
                      const timePart = parts[1] ? ` ${parts[1]}` : '';
                      const reformatted = `${month}/${day}/${year}${timePart}`;
                      const d2 = new Date(reformatted);
                      if (!isNaN(d2.getTime())) return d2.getTime();
                   }
                }
                return 0;
              };

              // Safely use fallback for missing date_of_payment
              const getVal = (item: any) => {
                 const v = item.date_of_payment;
                 if (v && String(v).trim() !== '' && String(v).trim() !== '—') return getTs(v);
                 return getTs(item.submitted_at);
              };

              return getVal(b) - getVal(a);
          });
          setData(sorted);
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error fetching payments', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const parseExcelDate = (serial: string | number) => {
    if (!serial) return '—';
    const s = String(serial).trim();
    const num = Number(s);
    if (!isNaN(num) && num > 10000) {
      // Excel serial date starting from Jan 1 1900
      const d = new Date(Math.round((num - 25569) * 86400 * 1000));
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    
    // Try DD/MM/YYYY text parsing
    if (s.includes('/')) {
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

  const exportCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ['Manuscript ID', 'Title', 'Author', 'Email', 'Amount', 'Payment Mode', 'Transaction No', 'Date', 'Status'];
    const csvData = filteredData.map(item => [
      item.manuscript_id || '',
      `"${(item.manuscript_title || '').replace(/"/g, '""')}"`,
      `"${(item.author_name || '').replace(/"/g, '""')}"`,
      item.email || '',
      item.amount || '',
      item.payment_method || item.payment_mode || '',
      item.transaction_number || '',
      parseExcelDate(item.date_of_payment || item.submitted_at),
      item.status || 'Pending'
    ].join(','));
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'scholar_india_payments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = data.filter(item => {
    const q = searchTerm.toLowerCase();
    const matchSearch = String(item.manuscript_id || '').toLowerCase().includes(q) || 
                        String(item.manuscript_title || '').toLowerCase().includes(q) || 
                        String(item.author_name || '').toLowerCase().includes(q) ||
                        String(item.transaction_number || '').toLowerCase().includes(q);

    let matchStatus = true;
    const itemStatus = String(item.status || 'Pending').toLowerCase().trim();
    if (statusFilter !== 'All Statuses') {
       const sf = statusFilter.toLowerCase();
       if (sf === 'approved' && itemStatus !== 'approved' && itemStatus !== 'success') matchStatus = false;
       else if (sf !== 'approved' && itemStatus.replace(' ', '') !== sf.replace(' ', '')) matchStatus = false;
    }

    return matchSearch && matchStatus;
  });

  const totalAmount = filteredData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  // ── Mail Server Trigger Helper ──────────────────────────────────────────────

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

  const updateStatus = async (id: string, newStatus: string) => {
    if (!confirm(`Set payment status to "${newStatus}"?`)) return;
    try {
      const { data: pay } = await supabase.from('payments').select('*').eq('id', id).single();
      const { error } = await supabase.from('payments').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      
      toast({ title: `Payment ${newStatus} successfully` });
      
      // Trigger Email Notification
      if (newStatus === 'Approved') {
        triggerEmail('/send/payment-invoice', {
          name: pay.author_name || 'Author',
          email: pay.email,
          manuscriptId: pay.manuscript_id,
          title: pay.manuscript_title,
          amount: pay.amount || (pay.manuscript_id?.includes('BSIP') ? '15000' : '1500'),
          paymentMode: pay.payment_method || pay.payment_mode || 'Bank/Online',
          transactionRef: pay.transaction_number || 'VERIFIED',
          invoiceNo: pay.invoice_no || `INV-${pay.manuscript_id || Date.now()}`,
          pubType: pay.publication_type || (pay.manuscript_id?.includes('BSIP') ? 'book' : 'journal')
        });
      } else if (newStatus === 'Rejected' || newStatus === 'Failed') {
        triggerEmail('/send/payment-status-update', {
          name: pay.author_name || 'Author',
          email: pay.email,
          mode: 'failed',
          details: {
            mID: pay.manuscript_id,
            mTitle: pay.manuscript_title,
            tID: pay.transaction_number
          }
        });
      }

      fetchData();
    } catch(e) {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const manuallySendInvoice = (pay: any) => {
    triggerEmail('/send/payment-invoice', {
      name: pay.author_name || 'Author',
      email: pay.email,
      manuscriptId: pay.manuscript_id,
      title: pay.manuscript_title,
      amount: pay.amount || (pay.manuscript_id?.includes('BSIP') ? '15000' : '1500'),
      paymentMode: pay.payment_method || pay.payment_mode || 'Bank/Online',
      transactionRef: pay.transaction_number || 'VERIFIED',
      invoiceNo: pay.invoice_no || `INV-${pay.manuscript_id || Date.now()}`,
      pubType: pay.publication_type || (pay.manuscript_id?.includes('BSIP') ? 'book' : 'journal')
    });
    toast({ title: 'Invoice sent successfully' });
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const { id, ...updates } = editForm;
      const { error } = await supabase.from('payments').update(updates).eq('id', id);
      if (error) throw error;
      toast({ title: 'Payment record updated successfully' });
      setIsEditModalOpen(false);
      fetchData();
    } catch (e) {
      toast({ title: 'Failed to update payment', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('payments').insert([{
        manuscript_id: editForm.manuscript_id,
        author_name: editForm.author_name,
        email: editForm.email,
        manuscript_title: editForm.manuscript_title,
        publication_type: editForm.publication_type,
        amount: editForm.amount,
        payment_method: editForm.payment_method,
        date_of_payment: editForm.date_of_payment,
        transaction_number: editForm.transaction_number,
        invoice_no: editForm.invoice_no,
        status: editForm.status || 'Pending',
        submitted_at: new Date().toISOString()
      }]);
      if (error) throw error;
      toast({ title: 'Payment added successfully' });
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      toast({ title: 'Failed to add payment', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (item: any) => {
    setEditForm({ ...item });
    setIsEditModalOpen(true);
  };

  const getStatusBadge = (st: string) => {
    const s = String(st || 'Pending').toLowerCase().trim();
    if (s === 'approved' || s === 'success') return <Badge className="bg-emerald-100 text-emerald-700 border-none hover:bg-emerald-100 shadow-none list-none text-[10px] font-bold px-2 py-0.5 whitespace-nowrap capitalize">Success</Badge>;
    if (s === 'rejected' || s === 'failed') return <Badge className="bg-rose-100 text-rose-700 border-none hover:bg-rose-100 shadow-none list-none text-[10px] font-bold px-2 py-0.5 whitespace-nowrap capitalize">{st}</Badge>;
    if (s.includes('process') || s.includes('review')) return <Badge className="bg-blue-100 text-blue-700 border-none hover:bg-blue-100 shadow-none list-none text-[10px] font-bold px-2 py-0.5 whitespace-nowrap capitalize">{st}</Badge>;
    return <Badge className="bg-amber-100 text-amber-700 border-none hover:bg-amber-100 shadow-none list-none text-[10px] font-bold px-2 py-0.5 whitespace-nowrap capitalize">{st}</Badge>;
  };

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 py-2 print:hidden">
        <div className="pl-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Payments</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Track and manage all payment transactions from the Payment sheet.</p>
        </div>
        <div className="flex items-center gap-2.5 pr-2 flex-wrap">
          <Button onClick={fetchData} disabled={loading} variant="outline" className="bg-white gap-2 font-bold text-xs h-9 px-3.5 border-slate-200 rounded-lg shadow-sm w-full md:w-auto">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
          <Button onClick={() => window.print()} variant="outline" className="bg-white gap-2 font-bold text-xs h-9 px-3.5 border-slate-200 rounded-lg shadow-sm w-full md:w-auto">
            <Printer size={14} /> Print
          </Button>
          <Button onClick={() => { setEditForm({}); setIsAddModalOpen(true); }} className="bg-[#1e3a8a] hover:bg-blue-900 text-white gap-2 font-bold text-xs h-9 px-3.5 rounded-lg shadow-sm border-none w-full md:w-auto">
            <Plus size={14} /> Add Payment
          </Button>
          <Button onClick={exportCSV} variant="outline" className="bg-white gap-2 font-bold text-xs h-9 px-3.5 border-slate-200 rounded-lg shadow-sm text-slate-600 hover:text-slate-800 w-full md:w-auto">
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-emerald-50/10 overflow-hidden mx-2 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 border-b border-slate-100 bg-white relative z-10 w-full">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search payments..."
              className="pl-10 h-10 w-full rounded-xl bg-slate-50/50 border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-indigo-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-end gap-3 w-full md:w-auto">
             <select
               value={statusFilter}
               onChange={e => setStatusFilter(e.target.value)}
               className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 focus:outline-none focus:border-indigo-500 shadow-sm"
             >
               <option value="All Statuses">All Statuses</option>
               <option value="Approved">Approved</option>
               <option value="Under Review">Under Review</option>
               <option value="Pending">Pending</option>
               <option value="Rejected">Rejected</option>
               <option value="Under Process">Under Process</option>
             </select>
             <div className="text-[11px] font-bold text-slate-400 whitespace-nowrap whitespace-nowrap pl-2 hidden sm:block">{filteredData.length} payment(s)</div>
             <div className="h-8 px-4 flex items-center bg-emerald-50 border border-emerald-500 text-emerald-600 font-black rounded-full text-xs shadow-sm whitespace-nowrap">
                Total: ₹{totalAmount.toLocaleString('en-IN')}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-x-4 px-6 py-3.5 bg-amber-50/30 border-b border-slate-100 items-center pr-2">
          <div className="col-span-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">PAYMENT / MANUSCRIPT DETAILS ↕</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">AMOUNT ↕</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">MODE ↕</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">TRANSACTION NO. ↕</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">DATE ↕</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">STATUS ↕</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right pr-2">ACTIONS</div>
        </div>
        
        <div className="divide-y divide-amber-100/50 bg-[#fffdfa]">
          {loading ? (
             <div className="p-16 text-center text-slate-400 font-medium flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
          ) : filteredData.length === 0 ? (
             <div className="p-16 text-center text-slate-400 font-medium text-sm flex flex-col items-center gap-2"><CreditCard size={32} className="text-slate-300"/>No payments found.</div>
          ) : (
             (() => {
               const latestSubmitTime = Math.max(...data.map(d => new Date(d.submitted_at || d.date_of_payment || 0).getTime()).filter(t => !isNaN(t)));
               const latestDateString = new Date(latestSubmitTime).toDateString();
               
               return filteredData.map((item, index) => {
                 const isNew = new Date(item.submitted_at || item.date_of_payment || 0).toDateString() === latestDateString;
                 
                 return (
                   <div key={item.id || index} className={`grid grid-cols-12 gap-x-4 px-6 py-4 items-center transition-colors hover:bg-slate-50/50 ${isNew ? 'bg-amber-50/60' : 'bg-[#fffdfa]'} border-b border-amber-50/50`}>
                     <div className="col-span-4 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-black text-slate-400 tracking-wider">{(item.manuscript_id || '—').toUpperCase()}</span>
                        {isNew && <span className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">NEW</span>}
                      </div>
                      <p className="text-[13px] font-bold text-slate-800 line-clamp-1 leading-snug">{item.manuscript_title || '—'}</p>
                      <div className="text-[12px] font-semibold text-slate-500 mt-1 leading-snug tracking-tight">
                         <span className="text-slate-600 block">{item.author_name || '—'}</span>
                         <span className="text-blue-600 flex items-center gap-1 w-full truncate"><Mail size={12} className="shrink-0"/> {item.email || '—'}</span>
                      </div>
                   </div>
                   <div className="col-span-1 text-emerald-600 font-black text-[13px]">
                      ₹{item.amount || '—'}
                   </div>
                   <div className="col-span-1 text-[12px] font-bold text-slate-600 uppercase tracking-wide">
                      {item.payment_method || item.payment_mode || '—'}
                   </div>
                   <div className="col-span-2 text-[12px] font-bold font-mono text-slate-600 truncate pr-2">
                      {item.transaction_number || '—'}
                   </div>
                   <div className="col-span-1 text-[12px] font-bold text-slate-600 whitespace-nowrap">
                      {parseExcelDate(item.date_of_payment && String(item.date_of_payment).trim() !== '' && String(item.date_of_payment).trim() !== '—' ? item.date_of_payment : item.submitted_at)}
                   </div>
                   <div className="col-span-2">
                      {getStatusBadge(item.status)}
                   </div>
                   <div className="col-span-1 flex justify-end pr-1">
                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 border border-slate-200 shrink-0 bg-white">
                               <MoreVertical size={14} />
                            </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-48 bg-white border-slate-200 shadow-xl rounded-xl p-1.5 font-bold text-slate-600">
                            <DropdownMenuItem onClick={() => { setSelectedItem(item); setIsViewModalOpen(true); }} className="focus:bg-slate-50 cursor-pointer text-xs rounded-lg py-2">
                               <Eye className="mr-2 h-4 w-4 text-slate-400" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(item)} className="focus:bg-slate-50 cursor-pointer text-xs rounded-lg py-2">
                               <Edit className="mr-2 h-4 w-4 text-slate-400" /> Edit Record
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => manuallySendInvoice(item)} className="focus:bg-blue-50 cursor-pointer text-xs rounded-lg py-2 focus:text-blue-700">
                                <Mail className="mr-2 h-4 w-4 text-blue-600" /> Send Invoice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100 my-1" />
                            <DropdownMenuItem onClick={() => updateStatus(item.id, 'Approved')} className="focus:bg-emerald-50 cursor-pointer text-xs rounded-lg py-2 focus:text-emerald-700">
                               <Check className="mr-2 h-4 w-4 text-emerald-600" /> Quick Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(item.id, 'Rejected')} className="focus:bg-rose-50 cursor-pointer text-xs rounded-lg py-2 focus:text-rose-700">
                               <X className="mr-2 h-4 w-4 text-rose-600" /> Quick Reject
                            </DropdownMenuItem>
                         </DropdownMenuContent>
                      </DropdownMenu>
                   </div>
                 </div>
               );
             })
          })()
          )}
        </div>
      </div>

      {/* VIEW MODAL */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl bg-white border-slate-200 shadow-xl overflow-hidden p-0 rounded-2xl">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/80">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <Eye size={20} className="text-blue-600" /> Payment Details
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                {Object.entries(selectedItem).filter(([k]) => k !== 'id' && !k.startsWith('payment_proof') && !k.includes('invoice')).map(([k, v]) => (
                  <div key={k} className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest break-words block">{(k || '').replace(/_/g, ' ')}</label>
                    <div className="text-sm font-bold text-slate-800 break-all">{k === 'date_of_payment' ? parseExcelDate(v as any) : String(v || '—')}</div>
                  </div>
                ))}
                
                {/* Proofs & Invoices */}
                {(selectedItem.payment_proof_url || selectedItem.invoice_no) && (
                   <div className="col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100 mt-2 grid grid-cols-2 gap-4">
                     {selectedItem.payment_proof_url && (
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">PAYMENT PROOF</label>
                          <a href={selectedItem.payment_proof_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 text-xs font-bold hover:underline">
                            <ImageIcon size={14} /> Click to View Document <ExternalLink size={12} />
                          </a>
                        </div>
                     )}
                     {selectedItem.invoice_no && (
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">INVOICE NO / LINK</label>
                          <div className="text-sm font-bold text-slate-800 break-all">{selectedItem.invoice_no}</div>
                        </div>
                     )}
                   </div>
                )}
              </div>
            </div>
          )}

          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsViewModalOpen(false)} className="font-bold text-xs">Close</Button>
            <Button onClick={() => { setIsViewModalOpen(false); openEdit(selectedItem); }} className="bg-blue-600 hover:bg-blue-700 font-bold text-xs gap-2">
              <Edit size={14} /> Edit Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-white border-slate-200 shadow-xl overflow-hidden p-0 rounded-2xl">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/80">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <Edit size={20} className="text-blue-600" /> Edit Payment Record
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Manuscript ID</label><Input value={editForm.manuscript_id || ''} onChange={e => setEditForm({...editForm, manuscript_id: e.target.value})} className="font-semibold text-sm rounded-lg" readOnly/></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">First Author Name</label><Input value={editForm.author_name || ''} onChange={e => setEditForm({...editForm, author_name: e.target.value})} className="font-semibold text-sm rounded-lg" /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Email</label><Input type="email" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} className="font-semibold text-sm rounded-lg" /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Transaction Number</label><Input value={editForm.transaction_number || ''} onChange={e => setEditForm({...editForm, transaction_number: e.target.value})} className="font-semibold text-sm rounded-lg" /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Amount Paid (₹)</label><Input type="number" value={editForm.amount || ''} onChange={e => setEditForm({...editForm, amount: e.target.value})} className="font-semibold text-sm rounded-lg" /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Payment Mode</label><Input value={editForm.payment_method || editForm.payment_mode || ''} onChange={e => setEditForm({...editForm, payment_method: e.target.value})} className="font-semibold text-sm rounded-lg" /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Payment Date</label><Input type="text" value={editForm.date_of_payment || ''} onChange={e => setEditForm({...editForm, date_of_payment: e.target.value})} className="font-semibold text-sm rounded-lg" /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Invoice No</label><Input value={editForm.invoice_no || ''} onChange={e => setEditForm({...editForm, invoice_no: e.target.value})} className="font-semibold text-sm rounded-lg" /></div>
                <div className="space-y-1.5 col-span-2">
                   <label className="text-xs font-bold text-slate-600">Status</label>
                   <select value={editForm.status || ''} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-input bg-transparent text-sm font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                     <option value="Pending">Pending</option>
                     <option value="Under Process">Under Process</option>
                     <option value="Under Review">Under Review</option>
                     <option value="Approved">Approved</option>
                     <option value="success">Success</option>
                     <option value="Rejected">Rejected</option>
                   </select>
                </div>
             </div>
          </div>

          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="font-bold text-xs">Cancel</Button>
            <Button onClick={handleEditSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 font-bold text-xs gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null} Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ADD MODAL */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl bg-white border-slate-200 shadow-xl overflow-hidden p-0 rounded-2xl">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/80">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <Plus size={20} className="text-blue-600" /> Add New Payment Detail
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddSave}>
             <div className="px-6 py-6 max-h-[70vh] overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Manuscript ID *</label><Input required value={editForm.manuscript_id || ''} onChange={e => setEditForm({...editForm, manuscript_id: e.target.value})} placeholder="e.g. SIP20261234" className="font-semibold text-sm rounded-lg" /></div>
                   <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">First Author Name</label><Input value={editForm.author_name || ''} onChange={e => setEditForm({...editForm, author_name: e.target.value})} placeholder="Full Name" className="font-semibold text-sm rounded-lg" /></div>
                   <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Email</label><Input type="email" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="email@example.com" className="font-semibold text-sm rounded-lg" /></div>
                   <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Manuscript Title</label><Input value={editForm.manuscript_title || ''} onChange={e => setEditForm({...editForm, manuscript_title: e.target.value})} placeholder="Paper Title" className="font-semibold text-sm rounded-lg" /></div>
                   <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Amount Paid (₹)</label><Input type="number" value={editForm.amount || ''} onChange={e => setEditForm({...editForm, amount: e.target.value})} className="font-semibold text-sm rounded-lg" /></div>
                   <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Mode of Payment</label><Input value={editForm.payment_method || ''} onChange={e => setEditForm({...editForm, payment_method: e.target.value})} placeholder="UPI / Bank Transfer" className="font-semibold text-sm rounded-lg" /></div>
                   <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Date of Payment</label><Input type="text" value={editForm.date_of_payment || ''} onChange={e => setEditForm({...editForm, date_of_payment: e.target.value})} placeholder="YYYY-MM-DD" className="font-semibold text-sm rounded-lg" /></div>
                   <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Transaction Number</label><Input value={editForm.transaction_number || ''} onChange={e => setEditForm({...editForm, transaction_number: e.target.value})} placeholder="UTR Number" className="font-semibold text-sm rounded-lg" /></div>
                   <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Publication Type</label><Input value={editForm.publication_type || ''} onChange={e => setEditForm({...editForm, publication_type: e.target.value})} placeholder="journal / book" className="font-semibold text-sm rounded-lg" /></div>
                   <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Invoice No</label><Input value={editForm.invoice_no || ''} onChange={e => setEditForm({...editForm, invoice_no: e.target.value})} placeholder="Invoice Number" className="font-semibold text-sm rounded-lg" /></div>
                   <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-bold text-slate-600">Status</label>
                      <select value={editForm.status || 'Pending'} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-input bg-transparent text-sm font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                   </div>
                </div>
             </div>

             <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
               <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="font-bold text-xs">Cancel</Button>
               <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 font-bold text-xs gap-2">
                 {saving ? <Loader2 size={14} className="animate-spin" /> : null} Save Payment
               </Button>
             </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
