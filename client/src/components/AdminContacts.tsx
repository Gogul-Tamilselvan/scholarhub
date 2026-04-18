import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Search, Eye, MailOpen, CornerUpLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function AdminContacts() {
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: contacts, error } = await supabase
        .from('contact_messages')
        .select('*');

      if (error) throw error;
      if (contacts) {
         // Sort by parseable submitted_at descending
         contacts.sort((a,b) => {
             const getT = (s:string) => {
                const n = Number(s);
                if(!isNaN(n) && n > 10000) return new Date(Math.round((n - 25569) * 86400 * 1000)).getTime();
                const d = new Date(s);
                return isNaN(d.getTime()) ? 0 : d.getTime();
             };
             return getT(b.submitted_at) - getT(a.submitted_at);
         });
         setData(contacts);
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error fetching inquiries', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const parseExcelDate = (serial: string | number) => {
    if (!serial) return '—';
    const num = Number(serial);
    if (!isNaN(num) && num > 10000) {
      const d = new Date(Math.round((num - 25569) * 86400 * 1000));
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    const d = new Date(serial);
    if (!isNaN(d.getTime())) return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return String(serial);
  };

  const parseExcelDateTime = (serial: string | number) => {
    if (!serial) return '—';
    const num = Number(serial);
    if (!isNaN(num) && num > 10000) {
      const d = new Date(Math.round((num - 25569) * 86400 * 1000));
      return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    const d = new Date(serial);
    if (!isNaN(d.getTime())) return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    return String(serial);
  };

  const filteredData = data.filter(item => {
    const q = searchTerm.toLowerCase();
    return String(item.first_name || '').toLowerCase().includes(q) || 
           String(item.last_name || '').toLowerCase().includes(q) || 
           String(item.email || '').toLowerCase().includes(q) ||
           String(item.phone || '').toLowerCase().includes(q) ||
           String(item.message || '').toLowerCase().includes(q);
  });

  const updateStatus = async (id: string, updates: any) => {
    try {
      const { error } = await supabase.from('contact_messages').update(updates).eq('id', id);
      if (error) throw error;
      toast({ title: `Record updated successfully` });
      
      // Update local state without full reload to make UI snappier
      setData(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      if (selectedItem && selectedItem.id === id) {
          setSelectedItem({ ...selectedItem, ...updates });
      }
    } catch(e) {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const getStatusType = (item: any) => {
      const isReplied = String(item.is_replied || '').toLowerCase() === 'yes' || String(item.is_replied || '').toLowerCase().includes('pub');
      const isRead = String(item.is_read_excel || '').toLowerCase() === 'yes' || item.is_read_system === true;
      
      if (isReplied) return 'Replied';
      if (isRead) return 'Read';
      return 'New';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Replied') return <Badge className="bg-emerald-100 text-emerald-700 border-none hover:bg-emerald-100 shadow-none list-none text-[10px] font-bold px-2 py-0.5 whitespace-nowrap uppercase">Replied</Badge>;
    if (status === 'Read') return <Badge className="bg-blue-100 text-blue-700 border-none hover:bg-blue-100 shadow-none list-none text-[10px] font-bold px-2 py-0.5 whitespace-nowrap uppercase">Read</Badge>;
    return <Badge className="bg-rose-100 text-rose-700 border-none hover:bg-rose-100 shadow-none list-none text-[10px] font-bold px-2 py-0.5 whitespace-nowrap uppercase">New</Badge>;
  };

  const openDetails = (item: any) => {
      setSelectedItem(item);
      setIsViewModalOpen(true);
      if (getStatusType(item) === 'New') {
          // Auto mark as read
          updateStatus(item.id, { is_read_system: true, is_read_excel: 'Yes' });
      }
  };

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 py-2 print:hidden">
        <div className="pl-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Contact Leads</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">{filteredData.length} inquiries</p>
        </div>
        <div className="flex items-center gap-2.5 pr-2 flex-wrap">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search leads..."
              className="pl-10 h-9 w-full rounded-lg bg-white border-slate-200 text-xs focus-visible:ring-1 focus-visible:ring-indigo-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={fetchData} disabled={loading} variant="outline" className="bg-white gap-2 font-bold text-xs h-9 px-3.5 border-slate-200 rounded-lg shadow-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-[#f8fafc] overflow-hidden mx-2 shadow-sm">
        <div className="grid grid-cols-12 gap-x-4 px-6 py-3.5 bg-slate-100/50 border-b border-slate-200 items-center pr-2">
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">DATE ↕</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">CONTACT NAME ↕</div>
          <div className="col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">EMAIL / PHONE ↕</div>
          <div className="col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">MESSAGE</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">STATUS ↕</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right pr-2">ACTIONS</div>
        </div>
        
        <div className="divide-y divide-slate-100 bg-[#ffffff]">
          {loading ? (
             <div className="p-16 text-center text-slate-400 font-medium flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
          ) : filteredData.length === 0 ? (
             <div className="p-16 text-center text-slate-400 font-medium text-sm flex flex-col items-center gap-2">No inquiries found.</div>
          ) : (
             (() => {
               const latestSubmitTime = Math.max(...data.map(d => {
                  const s = d.submitted_at;
                  if(!s) return 0;
                  const n = Number(s);
                  if(!isNaN(n) && n > 10000) return new Date(Math.round((n - 25569) * 86400 * 1000)).getTime();
                  const dt = new Date(s);
                  return isNaN(dt.getTime()) ? 0 : dt.getTime();
               }).filter(t => !isNaN(t)));
               const latestDateString = new Date(latestSubmitTime).toDateString();
               
               return filteredData.map((item, index) => {
                 const statusType = getStatusType(item);
                 const isUnread = statusType === 'New';
                 
                 const tMatch = (() => {
                    const s = item.submitted_at;
                    if(!s) return 0;
                    const n = Number(s);
                    if(!isNaN(n) && n > 10000) return new Date(Math.round((n - 25569) * 86400 * 1000)).getTime();
                    const dt = new Date(s);
                    return isNaN(dt.getTime()) ? 0 : dt.getTime();
                 })();
                 const isNewDate = tMatch > 0 && new Date(tMatch).toDateString() === latestDateString;
                 
                 return (
                   <div key={item.id || index} className={`grid grid-cols-12 gap-x-4 px-6 py-4 items-center transition-colors hover:bg-slate-50/50 ${isUnread ? 'bg-amber-50/40' : 'bg-[#ffffff]'} border-b border-slate-50`}>
                     <div className="col-span-2 pr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[12px] font-bold text-slate-600 whitespace-nowrap">{parseExcelDate(item.submitted_at)}</span>
                          {(isUnread && isNewDate) && <span className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">NEW</span>}
                        </div>
                   </div>
                   <div className="col-span-2 text-[13px] font-bold text-slate-800 leading-snug">
                      {item.first_name || ''} {item.last_name || ''}
                   </div>
                   <div className="col-span-3 text-[12px] font-semibold text-slate-500 leading-snug tracking-tight">
                      <span className="text-blue-600 block truncate">{item.email || '—'}</span>
                      <span className="text-slate-400 block truncate mt-0.5">{item.phone || '—'}</span>
                   </div>
                   <div className="col-span-3 text-[12px] text-slate-600 line-clamp-2 pr-4">
                      {item.message || '—'}
                   </div>
                   <div className="col-span-1">
                      {getStatusBadge(statusType)}
                   </div>
                   <div className="col-span-1 flex justify-end pr-1">
                      <Button onClick={() => openDetails(item)} className="bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-[10px] h-7 px-3 rounded-md shadow-sm border-none">
                         View
                      </Button>
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
              <MailOpen size={20} className="text-[#1e3a8a]" /> Message Details
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
              <div className="mb-6 border-b border-slate-100 pb-4">
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">FROM</div>
                 <div className="font-bold text-base text-slate-800">{selectedItem.first_name} {selectedItem.last_name}</div>
                 <div className="text-blue-600 font-semibold text-sm mt-0.5 flex flex-wrap gap-2">
                    {selectedItem.email} <span className="text-slate-300">|</span> {selectedItem.phone || 'No Phone'}
                 </div>
              </div>
              
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                 {selectedItem.message}
              </div>
              
              <div className="mt-4 text-[11px] font-semibold text-slate-400">
                 Received: {parseExcelDateTime(selectedItem.submitted_at)}
              </div>
            </div>
          )}

          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsViewModalOpen(false)} className="font-bold text-xs bg-slate-200/50 hover:bg-slate-200 text-slate-700">Close</Button>
            {selectedItem && getStatusType(selectedItem) !== 'Replied' && (
                <Button onClick={() => updateStatus(selectedItem.id, { is_replied: 'Yes', is_read_excel: 'Yes', is_read_system: true })} className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs gap-2 text-white">
                  <CornerUpLeft size={14} /> Mark as Replied
                </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
