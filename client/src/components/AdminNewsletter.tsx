import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Download, Newspaper, Check, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdminNewsletter() {
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: subscribers, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      if (subscribers) {
         setData(subscribers);
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error fetching subscribers', variant: 'destructive' });
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

  const filteredData = data.filter(item => {
    const q = searchTerm.toLowerCase();
    return String(item.email || '').toLowerCase().includes(q);
  });

  const exportCSV = () => {
      if (!filteredData.length) {
          toast({ title: 'No data to export', variant: 'destructive' });
          return;
      }
      
      const headers = ['#', 'Email', 'Subscribed On'];
      const csvRows = [headers.join(',')];
      
      filteredData.forEach((row, idx) => {
          const values = [
              idx + 1,
              `"${row.email || ''}"`,
              `"${parseExcelDate(row.subscribed_at) || ''}"`
          ];
          csvRows.push(values.join(','));
      });
      
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `newsletter_subscribers_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // We don't have is_read in schema so we'll store local state to mark visually read until reload
  const [localRead, setLocalRead] = useState<Record<string, boolean>>({});

  const markRead = (id: string, email: string) => {
      setLocalRead(prev => ({...prev, [id]: true}));
      toast({ title: `Marked ${email} as read`, description: 'This state is stored locally for this session.' });
  };

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 py-2 print:hidden">
        <div className="pl-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Newsletter Subscribers</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">View and export all newsletter subscribers</p>
        </div>
        <div className="flex items-center gap-2.5 pr-2 flex-wrap">
          <Button onClick={fetchData} disabled={loading} variant="outline" className="bg-white gap-2 font-bold text-xs h-9 px-3.5 border-slate-200 rounded-lg shadow-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
          <Button onClick={exportCSV} className="bg-[#1e3a8a] hover:bg-blue-900 text-white gap-2 font-bold text-xs h-9 px-3.5 rounded-lg shadow-sm border-none">
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-[#f8fafc] overflow-hidden mx-2 shadow-sm">
        <div className="flex justify-between items-center bg-white px-4 py-3 border-b border-slate-100">
           <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by email..."
                className="pl-10 h-9 w-full rounded-lg bg-white border-slate-200 text-xs focus-visible:ring-1 focus-visible:ring-indigo-500 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="text-[11px] font-bold text-slate-500">{filteredData.length} subscriber(s)</div>
        </div>
        <div className="grid grid-cols-12 gap-x-4 px-6 py-3.5 bg-slate-100/50 border-b border-slate-200 items-center pr-2">
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">#</div>
          <div className="col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">EMAIL ↕</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">NAME ↕</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">SUBSCRIBED ON ↕</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">JOURNAL INTEREST</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">STATUS ↕</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right pr-2">ACTIONS</div>
        </div>
        
        <div className="divide-y divide-slate-100 bg-[#ffffff]">
          {loading ? (
             <div className="p-16 text-center text-slate-400 font-medium flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
          ) : filteredData.length === 0 ? (
             <div className="p-16 text-center text-slate-400 font-medium text-sm flex flex-col items-center gap-2"><Newspaper className="text-slate-300 w-10 h-10 mb-2"/>No subscribers yet<span className="text-xs font-normal">Newsletter subscribers will appear here</span></div>
          ) : (
             filteredData.map((item, index) => {
               const isRead = localRead[item.id] || false;
               
               return (
                 <div key={item.id || index} className={`grid grid-cols-12 gap-x-4 px-6 py-4 items-center transition-colors hover:bg-slate-50/50 ${!isRead ? 'bg-amber-50/40' : 'bg-[#ffffff]'} border-b border-slate-50`}>
                   <div className="col-span-1 text-[12px] font-semibold text-slate-500">{index + 1}</div>
                   <div className="col-span-3 text-[13px] font-bold text-slate-800 leading-snug truncate pr-2">
                       {item.email || '—'}
                   </div>
                   <div className="col-span-2 text-[12px] text-slate-600 line-clamp-1 pr-2">—</div>
                   <div className="col-span-2 text-[12px] font-semibold text-slate-600 whitespace-nowrap">
                       {parseExcelDate(item.subscribed_at)}
                   </div>
                   <div className="col-span-2 text-[12px] text-slate-600">—</div>
                   <div className="col-span-1">
                      {!isRead ? <Badge className="bg-rose-100 text-rose-700 border-none hover:bg-rose-100 shadow-none list-none text-[10px] font-bold px-2 py-0.5 whitespace-nowrap uppercase">New</Badge> : <Badge className="bg-slate-100 text-slate-700 border-none hover:bg-slate-100 shadow-none list-none text-[10px] font-bold px-2 py-0.5 whitespace-nowrap uppercase">Read</Badge>}
                   </div>
                   <div className="col-span-1 flex justify-end pr-1">
                      {!isRead ? (
                          <Button onClick={() => markRead(item.id, item.email)} variant="outline" className="border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 font-bold text-[10px] h-7 px-3 rounded-md shadow-sm bg-white gap-1.5 focus:ring-0">
                             <Check size={12} /> Read
                          </Button>
                      ) : (
                          <span className="text-slate-300 text-xs font-black">—</span>
                      )}
                   </div>
                 </div>
               );
             })
          )}
        </div>
      </div>
    </div>
  );
}
