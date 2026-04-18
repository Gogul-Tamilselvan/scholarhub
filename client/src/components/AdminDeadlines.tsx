import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Download, Search, CalendarCheck, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdminDeadlines() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [manuscriptsMap, setManuscriptsMap] = useState<Record<string, any>>({});
  const [reviewersMap, setReviewersMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assignRes, manRes, revRes] = await Promise.all([
        supabase.from('assignments').select('*'),
        supabase.from('manuscripts').select('id, title'),
        supabase.from('reviewers').select('id, first_name, last_name')
      ]);

      if (assignRes.error) throw assignRes.error;
      
      const mMap: Record<string, any> = {};
      (manRes.data || []).forEach(m => mMap[m.id] = m);
      
      const rMap: Record<string, any> = {};
      (revRes.data || []).forEach(r => rMap[r.id] = r);

      const validAssignments = (assignRes.data || [])
          .filter(a => a.due_date && String(a.status || '').toLowerCase() !== 'revoked')
          .sort((a, b) => {
             const getT = (s:string|number) => {
                const n = Number(s);
                if(!isNaN(n) && n > 10000) return new Date(Math.round((n - 25569) * 86400 * 1000)).getTime();
                const d = new Date(s);
                return isNaN(d.getTime()) ? 0 : d.getTime();
             };
             return getT(a.due_date) - getT(b.due_date);
          });

      setManuscriptsMap(mMap);
      setReviewersMap(rMap);
      setAssignments(validAssignments);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error fetching deadlines', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getT = (s:string|number) => {
      const n = Number(s);
      if(!isNaN(n) && n > 10000) return new Date(Math.round((n - 25569) * 86400 * 1000)).getTime();
      const d = new Date(s);
      return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  const getStatusBadge = (st: string) => {
    const s = String(st || 'Pending').toLowerCase().trim();
    if (s === 'approved' || s === 'accepted' || s === 'completed') return <Badge className="bg-emerald-100 text-emerald-700 border-none hover:bg-emerald-100 shadow-none list-none text-[10px] font-bold px-2 py-0.5 whitespace-nowrap capitalize">{st}</Badge>;
    if (s === 'rejected' || s === 'failed') return <Badge className="bg-rose-100 text-rose-700 border-none hover:bg-rose-100 shadow-none list-none text-[10px] font-bold px-2 py-0.5 whitespace-nowrap capitalize">{st}</Badge>;
    if (s.includes('process') || s.includes('review')) return <Badge className="bg-blue-100 text-blue-700 border-none hover:bg-blue-100 shadow-none list-none text-[10px] font-bold px-2 py-0.5 whitespace-nowrap capitalize">{st}</Badge>;
    return <Badge className="bg-slate-100 text-slate-700 border-none hover:bg-slate-100 shadow-none list-none text-[10px] font-bold px-2 py-0.5 whitespace-nowrap capitalize">{st || '—'}</Badge>;
  };

  const now = new Date();
  const endWeek = new Date(now); endWeek.setDate(endWeek.getDate() + 7);
  const endMonth = new Date(now); endMonth.setDate(endMonth.getDate() + 30);

  const filteredData = assignments.filter(item => {
    const dueTime = getT(item.due_date);
    if(dueTime === 0) return false;
    const due = new Date(dueTime);
    
    if (filterType === 'overdue' && due >= now) return false;
    if (filterType === 'week' && (due < now || due > endWeek)) return false;
    if (filterType === 'month' && (due < now || due > endMonth)) return false;
    if (filterType === 'upcoming' && due <= endMonth) return false;

    if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const rId = item.reviewer_id || '';
        const mId = item.manuscript_id || '';
        const mTitle = manuscriptsMap[mId]?.title || '';
        const rName = `${reviewersMap[rId]?.first_name || ''} ${reviewersMap[rId]?.last_name || ''}`;
        return String(rId + ' ' + mId + ' ' + mTitle + ' ' + rName).toLowerCase().includes(q);
    }
    
    return true;
  });

  const exportCSV = () => {
      if (!filteredData.length) {
          toast({ title: 'No data to export', variant: 'destructive' });
          return;
      }
      
      const headers = ['Manuscript Title', 'Manuscript ID', 'Reviewer Info', 'Due Date', 'Status', 'Days Left/Overdue'];
      const csvRows = [headers.join(',')];
      
      filteredData.forEach((row) => {
          const mId = row.manuscript_id || '';
          const rId = row.reviewer_id || '';
          const title = manuscriptsMap[mId]?.title || '';
          const rName = `${reviewersMap[rId]?.first_name || ''} ${reviewersMap[rId]?.last_name || ''}`;
          
          const due = new Date(getT(row.due_date));
          const isOverdue = due < now;
          const diff = Math.ceil((due.getTime() - now.getTime()) / 86400000);
          const dayStr = isOverdue ? `${Math.abs(diff)} days overdue` : diff === 0 ? 'Today!' : `${diff} days left`;
                
          const values = [
              `"${title.replace(/"/g, '""')}"`,
              `"${mId}"`,
              `"${rName.trim()}"`,
              `"${due.toLocaleDateString()}"`,
              `"${row.status || 'Pending'}"`,
              `"${dayStr}"`
          ];
          csvRows.push(values.join(','));
      });
      
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `deadlines_report_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 py-2 print:hidden">
        <div className="pl-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Deadline Calendar</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">All reviewer assignment deadlines sorted by date.</p>
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

      <div className="border-b border-slate-200 px-2 flex gap-4 overflow-x-auto print:hidden">
        <button onClick={() => setFilterType('all')} className={`pb-2.5 px-1 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${filterType === 'all' ? 'border-[#1e3a8a] text-[#1e3a8a]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>All</button>
        <button onClick={() => setFilterType('overdue')} className={`pb-2.5 px-1 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${filterType === 'overdue' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>⚠️ Overdue</button>
        <button onClick={() => setFilterType('week')} className={`pb-2.5 px-1 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${filterType === 'week' ? 'border-[#1e3a8a] text-[#1e3a8a]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>This Week</button>
        <button onClick={() => setFilterType('month')} className={`pb-2.5 px-1 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${filterType === 'month' ? 'border-[#1e3a8a] text-[#1e3a8a]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>This Month</button>
        <button onClick={() => setFilterType('upcoming')} className={`pb-2.5 px-1 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${filterType === 'upcoming' ? 'border-[#1e3a8a] text-[#1e3a8a]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Upcoming</button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-[#f8fafc] overflow-hidden mx-2 shadow-sm">
        <div className="flex justify-between items-center bg-white px-4 py-3 border-b border-slate-100">
           <div className="relative w-full md:w-[400px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search reviewer or manuscript..."
                className="pl-10 h-9 w-full rounded-lg bg-white border-slate-200 text-xs focus-visible:ring-1 focus-visible:ring-indigo-500 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="text-[11px] font-bold text-slate-500">{filteredData.length} deadline(s)</div>
        </div>
        
        <div className="divide-y divide-slate-100 bg-[#ffffff]">
          {loading ? (
             <div className="p-16 text-center text-slate-400 font-medium flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
          ) : filteredData.length === 0 ? (
             <div className="p-16 text-center text-slate-400 font-medium text-sm flex flex-col items-center gap-2"><CalendarCheck className="text-slate-300 w-10 h-10 mb-2"/><p className="text-slate-600 font-bold m-0 p-0 text-base">No deadlines in this filter</p><span className="text-xs text-slate-500 font-normal">All reviewers are on schedule!</span></div>
          ) : (
             filteredData.map((item, index) => {
               const rId = item.reviewer_id || '';
               const mId = item.manuscript_id || '';
               const title = manuscriptsMap[mId]?.title || 'Untitled';
               const rName = `${reviewersMap[rId]?.first_name || ''} ${reviewersMap[rId]?.last_name || ''}`.trim() || '—';

               const due = new Date(getT(item.due_date));
               const isOverdue = due < now;
               const diff = Math.ceil((due.getTime() - now.getTime()) / 86400000);
               const dayStr = isOverdue ? `${Math.abs(diff)} days overdue` : diff === 0 ? 'Today!' : `${diff} days left`;
               const day = due.toLocaleDateString('en-GB', { day: '2-digit' });
               const mon = due.toLocaleDateString('en-GB', { month: 'short' });
               
               let dateClass = "bg-slate-50 text-slate-600 border border-slate-200";
               if (isOverdue) dateClass = "bg-rose-50 border border-rose-200 text-rose-700";
               else if (diff <= 3) dateClass = "bg-amber-50 border border-amber-200 text-amber-600";
               
               return (
                 <div key={item.id || index} className={`flex items-center gap-5 px-6 py-4 transition-colors hover:bg-slate-50/50 bg-[#ffffff] border-b border-slate-50`}>
                   <div className={`w-[52px] h-[52px] shrink-0 rounded-xl flex flex-col items-center justify-center font-bold ${dateClass}`}>
                      <div className="text-[17px] leading-tight font-black">{day}</div>
                      <div className="text-[10px] uppercase tracking-wider font-semibold">{mon}</div>
                   </div>
                   
                   <div className="flex-1 min-w-0 pr-4">
                      <h4 className="text-[14px] font-bold text-slate-800 line-clamp-1 mb-1" title={title}>{title}</h4>
                      <p className="text-[12px] font-semibold text-slate-500 flex items-center gap-2 m-0 p-0 truncate">
                         <span className="flex items-center gap-1.5 text-blue-600 truncate max-w-[200px]"><User size={12} className="shrink-0"/> {rName}</span>
                         <span className="text-slate-300">|</span>
                         <span className="text-slate-600 font-mono tracking-tight">{mId}</span>
                      </p>
                   </div>
                   
                   <div className="shrink-0 text-right flex flex-col items-end gap-1.5 min-w-[120px]">
                      {getStatusBadge(item.status)}
                      <div className={`text-[11px] font-black tracking-wide ${isOverdue ? 'text-rose-600' : diff <= 3 ? 'text-amber-600' : 'text-slate-400'}`}>
                         {dayStr}
                      </div>
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
