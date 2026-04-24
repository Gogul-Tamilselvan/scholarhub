import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Search, MoreVertical, Eye, Check, X, ExternalLink, Download } from 'lucide-react';
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

export function AdminThirdPartyPayments() {
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: payments, error } = await supabase
        .from('third_party_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (payments) {
          setData(payments);
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error fetching third-party payments', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Contact', 'Designation', 'Work Description', 'Mode', 'Transaction ID', 'Date', 'Status'];
    const csvData = filteredData.map(item => [
      item.id,
      `"${(item.name || '').replace(/"/g, '""')}"`,
      item.email || '',
      item.contact_number || '',
      `"${(item.designation || '').replace(/"/g, '""')}"`,
      `"${(item.work_description || '').replace(/"/g, '""')}"`,
      item.payment_mode || '',
      item.transaction_id || '',
      item.payment_date || new Date(item.created_at).toLocaleDateString(),
      item.status || 'Pending'
    ].join(','));
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'third_party_payments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = data.filter(item => {
    const q = searchTerm.toLowerCase();
    const matchSearch = String(item.name || '').toLowerCase().includes(q) || 
                        String(item.email || '').toLowerCase().includes(q) || 
                        String(item.transaction_id || '').toLowerCase().includes(q) ||
                        String(item.work_description || '').toLowerCase().includes(q);

    let matchStatus = true;
    const itemStatus = String(item.status || 'Pending').toLowerCase().trim();
    if (statusFilter !== 'All Statuses') {
       const sf = statusFilter.toLowerCase();
       if (sf !== itemStatus) matchStatus = false;
    }

    return matchSearch && matchStatus;
  });


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
    
    let reason = '';
    if (newStatus === 'Rejected') {
      const r = prompt("Please enter the reason for rejection (this will be sent in the email):");
      if (r === null) return; // User cancelled
      reason = r;
    }
    
    try {
      const { data: currentPayment, error: fetchErr } = await supabase.from('third_party_payments').select('*').eq('id', id).single();
      if (fetchErr) throw fetchErr;

      const { error } = await supabase.from('third_party_payments').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      
      toast({ title: `Payment ${newStatus} successfully` });
      
      // Trigger Email Notification
      await triggerEmail('/send/third-party-status', {
        name: currentPayment.name || 'User',
        email: currentPayment.email,
        workDescription: currentPayment.work_description || 'Services',
        transactionId: currentPayment.transaction_id || 'N/A',
        status: newStatus,
        reason: reason
      });

      fetchData();
    } catch(e) {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const getStatusBadge = (st: string) => {
    const s = String(st || 'Pending').toLowerCase().trim();
    if (s === 'approved' || s === 'success') return <Badge className="bg-emerald-100 text-emerald-700 border-none hover:bg-emerald-100 shadow-none text-[10px] font-bold px-2 py-0.5 whitespace-nowrap capitalize">Approved</Badge>;
    if (s === 'rejected' || s === 'failed') return <Badge className="bg-rose-100 text-rose-700 border-none hover:bg-rose-100 shadow-none text-[10px] font-bold px-2 py-0.5 whitespace-nowrap capitalize">{st}</Badge>;
    return <Badge className="bg-amber-100 text-amber-700 border-none hover:bg-amber-100 shadow-none text-[10px] font-bold px-2 py-0.5 whitespace-nowrap capitalize">{st}</Badge>;
  };

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 py-2 print:hidden">
        <div className="pl-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Third Party Payments</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Manage external payments submitted for miscellaneous works and services.</p>
        </div>
        <div className="flex items-center gap-2.5 pr-2 flex-wrap">
          <Button onClick={fetchData} disabled={loading} variant="outline" className="bg-white gap-2 font-bold text-xs h-9 px-3.5 border-slate-200 rounded-lg shadow-sm w-full md:w-auto">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
          <Button onClick={exportCSV} variant="outline" className="bg-white gap-2 font-bold text-xs h-9 px-3.5 border-slate-200 rounded-lg shadow-sm text-slate-600 hover:text-slate-800 w-full md:w-auto">
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-amber-50/10 overflow-hidden mx-2 shadow-sm">
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
               <option value="Pending">Pending</option>
               <option value="Rejected">Rejected</option>
             </select>
             <div className="text-[11px] font-bold text-slate-400 whitespace-nowrap pl-2 hidden sm:block">{filteredData.length} payment(s)</div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-x-4 px-6 py-3.5 bg-blue-50/30 border-b border-slate-100 items-center pr-2">
          <div className="col-span-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">SENDER / WORK ↕</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">CONTACT ↕</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">MODE ↕</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">TRANSACTION ↕</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">DATE ↕</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">STATUS ↕</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right pr-2">ACTIONS</div>
        </div>
        
        <div className="divide-y divide-blue-50/50 bg-[#fffdfa]">
          {loading ? (
             <div className="p-16 text-center text-slate-400 font-medium flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
          ) : filteredData.length === 0 ? (
             <div className="p-16 text-center text-slate-400 font-medium text-sm flex flex-col items-center gap-2">No third-party payments found.</div>
          ) : (
             filteredData.map((item, index) => (
               <div key={item.id || index} className={`grid grid-cols-12 gap-x-4 px-6 py-4 items-center transition-colors hover:bg-slate-50/50 bg-[#fffdfa] border-b border-slate-50`}>
                 <div className="col-span-4 pr-3">
                  <p className="text-[13px] font-bold text-slate-800 line-clamp-1 leading-snug">{item.name || '—'}</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1">{item.work_description || '—'}</p>
               </div>
               <div className="col-span-2 text-[11px] font-semibold text-slate-600 pr-2">
                  <div className="truncate">{item.email}</div>
                  <div className="truncate">{item.contact_number}</div>
               </div>
               <div className="col-span-1 text-[12px] font-bold text-slate-600 uppercase tracking-wide">
                  {item.payment_mode || '—'}
               </div>
               <div className="col-span-2 text-[12px] font-bold font-mono text-slate-600 truncate pr-2">
                  {item.transaction_id || '—'}
               </div>
               <div className="col-span-1 text-[12px] font-bold text-slate-600 whitespace-nowrap">
                  {item.payment_date ? new Date(item.payment_date).toLocaleDateString('en-GB') : new Date(item.created_at).toLocaleDateString('en-GB')}
               </div>
               <div className="col-span-1">
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
                        <DropdownMenuSeparator className="bg-slate-100 my-1" />
                        <DropdownMenuItem onClick={() => updateStatus(item.id, 'Approved')} className="focus:bg-emerald-50 cursor-pointer text-xs rounded-lg py-2 focus:text-emerald-700">
                           <Check className="mr-2 h-4 w-4 text-emerald-600" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(item.id, 'Rejected')} className="focus:bg-rose-50 cursor-pointer text-xs rounded-lg py-2 focus:text-rose-700">
                           <X className="mr-2 h-4 w-4 text-rose-600" /> Reject
                        </DropdownMenuItem>
                     </DropdownMenuContent>
                  </DropdownMenu>
               </div>
             </div>
             ))
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
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest break-words block">NAME</label>
                  <div className="text-sm font-bold text-slate-800">{selectedItem.name}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest break-words block">EMAIL</label>
                  <div className="text-sm font-bold text-slate-800">{selectedItem.email}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest break-words block">CONTACT NUMBER</label>
                  <div className="text-sm font-bold text-slate-800">{selectedItem.contact_number}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest break-words block">DESIGNATION</label>
                  <div className="text-sm font-bold text-slate-800">{selectedItem.designation || '—'}</div>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest break-words block">WORK / PURPOSE DESCRIPTION</label>
                  <div className="text-sm font-bold text-slate-800 whitespace-pre-wrap">{selectedItem.work_description}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest break-words block">TRANSACTION ID</label>
                  <div className="text-sm font-bold font-mono text-slate-800">{selectedItem.transaction_id}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest break-words block">PAYMENT MODE</label>
                  <div className="text-sm font-bold text-slate-800">{selectedItem.payment_mode}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest break-words block">PAYMENT DATE</label>
                  <div className="text-sm font-bold text-slate-800">{selectedItem.payment_date ? new Date(selectedItem.payment_date).toLocaleDateString() : new Date(selectedItem.created_at).toLocaleDateString()}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest break-words block">STATUS</label>
                  <div className="text-sm font-bold text-slate-800">{getStatusBadge(selectedItem.status)}</div>
                </div>

                {/* Proofs */}
                {selectedItem.payment_proof_url && (
                   <div className="col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100 mt-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">PAYMENT PROOF</label>
                      <a href={selectedItem.payment_proof_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-blue-600 text-xs font-bold hover:underline bg-white p-3 rounded-lg border border-blue-200">
                        <ExternalLink size={14} /> View Uploaded Receipt/Screenshot
                      </a>
                   </div>
                )}
              </div>
            </div>
          )}

          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsViewModalOpen(false)} className="font-bold text-xs">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
