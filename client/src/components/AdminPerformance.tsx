import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, Download, Search, Users, ChartBar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdminPerformance() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [perfData, setPerfData] = useState<any[]>([]);

  const [revLimit, setRevLimit] = useState(10);
  const [editLimit, setEditLimit] = useState(10);
  const [tableLimit, setTableLimit] = useState(25);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revRes, assignRes] = await Promise.all([
        supabase.from('reviewers').select('*'),
        supabase.from('assignments').select('reviewer_id, status')
      ]);

      if (revRes.error) throw revRes.error;
      
      const reviewers = revRes.data || [];
      const assignments = assignRes.data || [];

      // Group assignments by reviewer
      const statsMap: Record<string, { total: number, completed: number, pending: number, revoked: number }> = {};
      
      assignments.forEach(a => {
         const rId = a.reviewer_id;
         if (!rId) return;
         if (!statsMap[rId]) statsMap[rId] = { total: 0, completed: 0, pending: 0, revoked: 0 };
         
         const st = String(a.status || '').toLowerCase().trim();
         statsMap[rId].total += 1;
         
         if (st === 'approved' || st === 'accepted' || st === 'completed' || st === 'published') {
             statsMap[rId].completed += 1;
         } else if (st === 'revoked' || st === 'rejected' || st === 'failed') {
             statsMap[rId].revoked += 1;
         } else {
             statsMap[rId].pending += 1;
         }
      });

      const processed = reviewers.filter(r => r.first_name || r.last_name).map(r => {
         const s = statsMap[r.id] || { total: 0, completed: 0, pending: 0, revoked: 0 };
         const rate = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
         return {
            id: r.id,
            reviewerId: `REV${r.id.substring(0,5).toUpperCase()}`, // visual padding
            name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
            role: r.role || 'Reviewer',
            journal: r.journal || r.area_of_interest || '—',
            total: s.total,
            completed: s.completed,
            pending: s.pending,
            revoked: s.revoked,
            completionRate: rate
         };
      });

      setPerfData(processed);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error fetching performance data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = perfData.filter(item => {
    if(!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return String(item.name + ' ' + item.reviewerId).toLowerCase().includes(q);
  });

  // Derived lists
  const sortedByRate = [...perfData].sort((a,b) => b.completionRate - a.completionRate || b.total - a.total);
  const topPerformers = sortedByRate.slice(0, 3);

  const isEditor = (role: string) => String(role || '').toLowerCase().includes('editor') || String(role || '').toLowerCase().includes('board');
  const reviewerList = perfData.filter(r => !isEditor(r.role)).sort((a,b) => b.completionRate - a.completionRate || b.total - a.total);
  const editorList = perfData.filter(r => isEditor(r.role)).sort((a,b) => b.completionRate - a.completionRate || b.total - a.total);

  const exportCSV = () => {
      if (!filteredData.length) {
          toast({ title: 'No data to export', variant: 'destructive' });
          return;
      }
      
      const headers = ['ID', 'Name', 'Role', 'Journal', 'Total', 'Completed', 'Pending', 'Revoked', 'Completion Rate'];
      const csvRows = [headers.join(',')];
      
      filteredData.forEach((row) => {
          const values = [
              `"${row.reviewerId}"`,
              `"${row.name}"`,
              `"${row.role}"`,
              `"${row.journal.replace(/"/g, '""')}"`,
              row.total,
              row.completed,
              row.pending,
              row.revoked,
              `"${row.completionRate}%"`
          ];
          csvRows.push(values.join(','));
      });
      
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `performance_report_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const medals = ['🥇', '🥈', '🥉'];
  
  const getRating = (rate: number) => {
      if(rate >= 80) return '🥇 Excellent';
      if(rate >= 60) return '🥈 Good';
      if(rate >= 40) return '🥉 Average';
      return '⚠️ Needs Improvement';
  };

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 py-2 print:hidden">
        <div className="pl-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Performance Dashboard</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Editor and Reviewer performance based on assignment completion.</p>
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

      {/* Top Performers Cards */}
      {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mx-2">
              {[1,2,3].map(i => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-5 shadow-sm animate-pulse">
                     <div className="w-14 h-14 bg-slate-100 rounded-2xl"></div>
                     <div className="flex-1 space-y-2">
                        <div className="h-6 bg-slate-100 rounded w-1/2"></div>
                        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                     </div>
                  </div>
              ))}
           </div>
      ) : (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mx-2">
              {topPerformers.map((r, index) => {
                 const isFirst = index === 0;
                 return (
                     <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${isFirst ? 'bg-amber-100' : index === 1 ? 'bg-blue-50' : 'bg-slate-100'}`}>
                           {medals[index] || '⭐️'}
                        </div>
                        <div>
                           <div className="text-3xl font-black text-slate-800 tracking-tighter">{r.completionRate}%</div>
                           <p className="text-xs font-semibold text-slate-500 mt-0.5"><span className="text-slate-700">{r.name}</span> — {r.role}</p>
                        </div>
                     </div>
                 );
              })}
           </div>
      )}

      {/* Performance Bars Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-2 mb-8">
         {/* Reviewer Bars */}
         <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col max-h-[600px]">
             <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2"><ChartBar className="text-[#1e3a8a]" size={18}/> Reviewer Performance</h3>
             </div>
             <div className="p-5 flex-1 overflow-y-auto overflow-x-hidden relative">
                 {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400 w-6 h-6"/></div>
                 ) : reviewerList.length === 0 ? (
                    <div className="text-center p-8 text-slate-400 text-sm font-medium">No reviewers found</div>
                 ) : (
                    <div className="space-y-4">
                        {reviewerList.slice(0, revLimit).map(r => (
                           <div key={r.id} className="w-full">
                               <div className="flex justify-between items-end mb-1.5">
                                   <span className="text-[11px] font-bold text-slate-700 truncate pr-4">{r.name}</span>
                                   <span className="text-[11px] font-black text-slate-600 shrink-0">{r.completionRate}% <span className="text-slate-400 font-semibold ml-0.5">({r.completed}/{r.total})</span></span>
                               </div>
                               <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                   <div 
                                      className={`h-full rounded-full transition-all duration-1000 ${r.completionRate >= 75 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : r.completionRate >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'}`} 
                                      style={{ width: `${r.completionRate}%` }}
                                   />
                               </div>
                           </div>
                        ))}
                        {revLimit < reviewerList.length && (
                            <div className="pt-4 pb-2 flex justify-center">
                                <Button onClick={() => setRevLimit(prev => prev + 10)} variant="outline" className="w-full border-slate-200 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 shadow-sm transition-all h-8">Load More (+10)</Button>
                            </div>
                        )}
                    </div>
                 )}
             </div>
         </div>

         {/* Editor Bars */}
         <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col max-h-[600px]">
             <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="text-purple-600" size={18}/> Editorial Board Performance</h3>
             </div>
             <div className="p-5 flex-1 overflow-y-auto overflow-x-hidden relative">
                 {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400 w-6 h-6"/></div>
                 ) : editorList.length === 0 ? (
                    <div className="text-center p-8 text-slate-400 text-sm font-medium">No editors found</div>
                 ) : (
                    <div className="space-y-4">
                        {editorList.slice(0, editLimit).map(r => (
                           <div key={r.id} className="w-full">
                               <div className="flex justify-between items-end mb-1.5">
                                   <span className="text-[11px] font-bold text-slate-700 truncate pr-4">{r.name}</span>
                                   <span className="text-[11px] font-black text-slate-600 shrink-0">{r.completionRate}% <span className="text-slate-400 font-semibold ml-0.5">({r.completed}/{r.total})</span></span>
                               </div>
                               <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                   <div 
                                      className={`h-full rounded-full transition-all duration-1000 ${r.completionRate >= 75 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : r.completionRate >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'}`} 
                                      style={{ width: `${r.completionRate}%` }}
                                   />
                               </div>
                           </div>
                        ))}
                        {editLimit < editorList.length && (
                            <div className="pt-4 pb-2 flex justify-center">
                                <Button onClick={() => setEditLimit(prev => prev + 10)} variant="outline" className="w-full border-slate-200 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 shadow-sm transition-all h-8">Load More (+10)</Button>
                            </div>
                        )}
                    </div>
                 )}
             </div>
         </div>
      </div>

      {/* Detailed Table */}
      <div className="rounded-xl border border-slate-200 bg-[#f8fafc] overflow-hidden mx-2 shadow-sm">
        <div className="flex justify-between items-center bg-white px-4 py-3 border-b border-slate-100">
           <div className="font-bold text-slate-800 text-sm hidden md:block pl-2">Detailed Performance Table</div>
           <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by name..."
                className="pl-10 h-9 w-full rounded-lg bg-white border-slate-200 text-xs focus-visible:ring-1 focus-visible:ring-indigo-500 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
        <div className="grid grid-cols-12 gap-x-4 px-6 py-3.5 bg-slate-100/50 border-b border-slate-200 items-center pr-2">
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">ID</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">NAME ↕</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">ROLE ↕</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">JOURNAL</div>
          <div className="col-span-3 text-[10px] font-black text-slate-500 pl-2">
              <div className="flex items-center justify-between opacity-80 mb-0.5">
                  <span className="uppercase tracking-widest">Stats</span>
                  <span className="text-[8px] uppercase tracking-wider text-slate-400 shrink-0">Tot / Com / Pen / Rev</span>
              </div>
          </div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">RATING ↕</div>
        </div>
        
        <div className="divide-y divide-slate-100 bg-[#ffffff]">
          {loading ? (
             <div className="p-16 text-center text-slate-400 font-medium flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
          ) : filteredData.length === 0 ? (
             <div className="p-16 text-center text-slate-400 font-medium text-sm flex flex-col items-center gap-2"><Users className="text-slate-300 w-10 h-10 mb-2"/>No performance data found.</div>
          ) : (
            <>
             {filteredData.slice(0, tableLimit).map((r, index) => {
               const rate = r.completionRate;
               return (
                 <div key={r.id || index} className="grid grid-cols-12 gap-x-4 px-6 py-4 items-center transition-colors hover:bg-slate-50/50 bg-[#ffffff] border-b border-slate-50">
                   <div className="col-span-1 text-[11px] font-black text-slate-400 truncate pr-2">{r.reviewerId || '—'}</div>
                   <div className="col-span-2 text-[12px] font-bold text-slate-800 leading-snug">
                       {r.name || '—'}
                   </div>
                   <div className="col-span-2 text-[11px] font-semibold text-slate-600 line-clamp-2 pr-4">{r.role || '—'}</div>
                   <div className="col-span-2 text-[11px] font-semibold text-slate-500 line-clamp-2 pr-4">
                       {r.journal || '—'}
                   </div>
                   <div className="col-span-3 pr-4 pl-2">
                      <div className="flex items-center gap-3 mb-1.5 px-0.5">
                         <span className="font-bold text-[12px] text-slate-800" title="Total">{r.total}</span>
                         <span className="text-slate-300">|</span>
                         <span className="font-bold text-[12px] text-emerald-500" title="Completed">{r.completed}</span>
                         <span className="text-slate-300">|</span>
                         <span className="font-bold text-[12px] text-amber-500" title="Pending">{r.pending}</span>
                         <span className="text-slate-300">|</span>
                         <span className="font-bold text-[12px] text-rose-500" title="Revoked">{r.revoked}</span>
                      </div>
                      <div className="flex items-center gap-2 w-full mt-1">
                          <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden shrink-0">
                              <div className={`h-full ${rate >= 60 ? 'bg-emerald-500' : rate >= 40 ? 'bg-amber-400' : 'bg-rose-500'}`} style={{ width: `${rate}%` }}></div>
                          </div>
                          <span className="text-[10px] font-black text-slate-600 shrink-0 min-w-[28px] text-right">{rate}%</span>
                      </div>
                   </div>
                   <div className="col-span-2 pl-2">
                       <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">{getRating(rate)}</span>
                   </div>
                 </div>
               );
             })}
             {tableLimit < filteredData.length && (
                <div className="p-4 bg-slate-50/50 flex justify-center">
                   <Button onClick={() => setTableLimit(prev => prev + 25)} variant="outline" className="border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 shadow-sm transition-all px-8 h-9 rounded-lg">
                      Load More (+25)
                   </Button>
                </div>
             )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
