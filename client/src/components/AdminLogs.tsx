import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, Download, Search, History, Eye, CornerUpLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function AdminLogs() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const FETCH_LIMIT = 50; // Fetch 50 log records per burst from DB

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLogs = async (isLoadMore: boolean = false) => {
    if (loading) return;
    setLoading(true);
    
    const startObj = isLoadMore ? offset : 0;
    
    try {
      const { data, error, count } = await supabase
        .from('login_activity')
        .select('*', { count: 'exact' })
        .order('login_time', { ascending: false })
        .range(startObj, startObj + FETCH_LIMIT - 1);

      if (error) throw error;
      
      let newLogs = data || [];
      if (isLoadMore) {
          setLogs(prev => [...prev, ...newLogs]);
      } else {
          setLogs(newLogs);
      }
      
      setOffset(startObj + FETCH_LIMIT);
      if (count !== null && startObj + FETCH_LIMIT >= count) {
          setHasMore(false);
      } else if (newLogs.length < FETCH_LIMIT) {
          setHasMore(false);
      } else {
          setHasMore(true);
      }
      
    } catch (err) {
      console.error(err);
      toast({ title: 'Error fetching logs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Group fetched logs by User
  const groupedUsers: Record<string, any> = {};
  logs.forEach(log => {
      const uid = log.reviewer_id || 'Guest';
      if (!groupedUsers[uid]) {
          groupedUsers[uid] = {
              id: uid,
              first_name: log.first_name,
              last_name: log.last_name,
              email: log.email || '',
              name: `${log.first_name || ''} ${log.last_name || ''}`.trim() || '—',
              role: log.role || '—',
              lastVisit: log.login_time,
              actions: new Set(),
              history: []
          };
      }
      groupedUsers[uid].history.push(log);
      if (groupedUsers[uid].actions.size < 3) {
          groupedUsers[uid].actions.add(log.activity_type || 'System Action');
      }
  });

  const userSummaries = Object.values(groupedUsers).sort((a,b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());

  // Apply visual filters
  const filteredData = userSummaries.filter(u => {
      if (searchTerm) {
          const q = searchTerm.toLowerCase();
          if (!String(u.id + ' ' + u.name + ' ' + u.role + ' ' + u.email).toLowerCase().includes(q)) return false;
      }
      if (actionFilter) {
          const hasAction = u.history.some((h:any) => String(h.activity_type || '').toLowerCase() === actionFilter.toLowerCase());
          if (!hasAction) return false;
      }
      return true;
  });

  const getActionColor = (act: string) => {
      const a = act.toLowerCase();
      if (a.includes('login')) return '#16a34a';
      if (a.includes('update')) return '#0891b2';
      if (a.includes('assign')) return '#7c3aed';
      if (a.includes('revoke') || a.includes('reject')) return '#dc2626';
      if (a.includes('password')) return '#d97706';
      if (a.includes('create') || a.includes('submis')) return '#1e40af';
      return '#64748b';
  };

  const parseExcelDateTime = (dt: string) => {
      if (!dt) return '—';
      const d = new Date(dt);
      if (!isNaN(d.getTime())) return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      return dt;
  };

  const exportCSV = () => {
      if (!filteredData.length) {
          toast({ title: 'No data to export', variant: 'destructive' });
          return;
      }
      const headers = ['Last Visit', 'User ID', 'Name', 'Email', 'Role', 'Total Actions Logged'];
      const csvRows = [headers.join(',')];
      
      filteredData.forEach((row) => {
          const values = [
              `"${parseExcelDateTime(row.lastVisit)}"`,
              `"${row.id}"`,
              `"${row.name}"`,
              `"${row.email}"`,
              `"${row.role}"`,
              row.history.length
          ];
          csvRows.push(values.join(','));
      });
      
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `login_activity_report_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const viewHistory = (uid: string) => {
      const u = userSummaries.find(x => x.id === uid);
      if (u) {
          setSelectedUser(u);
          setIsModalOpen(true);
      }
  };

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 py-2 print:hidden">
        <div className="pl-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Login & Activity Log</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Complete audit trail of all admin and member actions in the system.</p>
        </div>
        <div className="flex items-center gap-2.5 pr-2 flex-wrap">
          <Button onClick={() => fetchLogs(false)} disabled={loading} variant="outline" className="bg-white gap-2 font-bold text-xs h-9 px-3.5 border-slate-200 rounded-lg shadow-sm">
            <RefreshCw size={14} className={loading && offset === 0 ? 'animate-spin' : ''} /> Refresh
          </Button>
          <Button onClick={exportCSV} className="bg-[#1e3a8a] hover:bg-blue-900 text-white gap-2 font-bold text-xs h-9 px-3.5 rounded-lg shadow-sm border-none">
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-[#f8fafc] overflow-hidden mx-2 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white px-4 py-3 border-b border-slate-100 gap-3">
           <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by user, email..."
                className="pl-10 h-9 w-full rounded-lg bg-white border-slate-200 text-xs focus-visible:ring-1 focus-visible:ring-indigo-500 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto">
               <select 
                  className="h-9 rounded-lg border-slate-200 text-xs text-slate-700 bg-white focus:ring-1 focus:ring-indigo-500 shadow-sm px-3 w-full md:w-[160px]"
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
               >
                   <option value="">All Actions</option>
                   <option value="login">Login</option>
                   <option value="update">Update</option>
                   <option value="review_submission">Review Submission</option>
                   <option value="message">Message</option>
               </select>
               <div className="text-[11px] font-bold text-slate-500 shrink-0">{filteredData.length} user(s)</div>
           </div>
        </div>
        
        <div className="grid grid-cols-12 gap-x-4 px-6 py-3.5 bg-slate-100/50 border-b border-slate-200 items-center pr-2">
          <div className="col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">LAST VISIT ↕</div>
          <div className="col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">USER ↕</div>
          <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">ROLE</div>
          <div className="col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">RECENT ACTIONS</div>
          <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right pr-2">ACTIONS</div>
        </div>
        
        <div className="divide-y divide-slate-100 bg-[#ffffff]">
          {loading && offset === 0 ? (
             <div className="p-16 text-center text-slate-400 font-medium flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
          ) : filteredData.length === 0 ? (
             <div className="p-16 text-center text-slate-400 font-medium text-sm flex flex-col items-center gap-2"><History className="text-slate-300 w-10 h-10 mb-2"/>No activity records found.</div>
          ) : (
            <>
             {filteredData.map((u, index) => {
               const actions = Array.from(u.actions) as string[];
               return (
                 <div key={u.id || index} className="grid grid-cols-12 gap-x-4 px-6 py-4 items-center transition-colors hover:bg-slate-50/50 bg-[#ffffff] border-b border-slate-50">
                   <div className="col-span-3 text-[11px] font-bold text-slate-600 truncate pr-2 tracking-tight">{parseExcelDateTime(u.lastVisit)}</div>
                   <div className="col-span-3">
                       <strong className="text-[12px] font-bold text-slate-800 leading-snug truncate block" title={u.email || u.id}>{u.email || u.id}</strong>
                   </div>
                   <div className="col-span-2 text-[11px] font-semibold text-slate-600 line-clamp-1 pr-4">{u.role || '—'}</div>
                   <div className="col-span-3 flex flex-wrap gap-1.5 pr-2">
                       {actions.map((act, i) => {
                           const c = getActionColor(act);
                           return <span key={i} className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${c}15`, color: c }}>{act}</span>;
                       })}
                   </div>
                   <div className="col-span-1 flex justify-end pr-1">
                       <Button onClick={() => viewHistory(u.id)} variant="outline" className="border-slate-200 text-slate-600 hover:text-white hover:bg-[#1e3a8a] hover:border-[#1e3a8a] font-bold text-[10px] h-7 px-3 rounded-md shadow-sm gap-1.5 focus:ring-0 transition-all">
                          <Eye size={12} /> View History
                       </Button>
                   </div>
                 </div>
               );
             })}
             
             {hasMore && (
                 <div className="p-4 bg-slate-50/50 flex justify-center">
                    <Button onClick={() => fetchLogs(true)} disabled={loading} variant="outline" className="border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 shadow-sm transition-all px-8 h-9 rounded-lg gap-2">
                       {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                       Load Next User Logs from Database
                    </Button>
                 </div>
             )}
            </>
          )}
        </div>
      </div>

       {/* VIEW HISTORY MODAL */}
       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl bg-white border-slate-200 shadow-xl overflow-hidden p-0 rounded-2xl">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/80">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <History size={20} className="text-[#1e3a8a]" /> Activity Detail
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="p-0 max-h-[65vh] overflow-y-auto">
              <div className="px-6 py-4 bg-slate-50 mb-0 border-b border-slate-100 flex justify-between items-center">
                  <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">User Info</div>
                      <div className="font-bold text-base text-slate-800">{selectedUser.name} <span className="text-slate-400 font-semibold text-sm">({selectedUser.id})</span></div>
                  </div>
                  <div className="text-right">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Role</div>
                      <div className="text-xs font-bold bg-white border border-slate-200 px-3 py-1 rounded inline-block shadow-sm">{selectedUser.role || '—'}</div>
                  </div>
              </div>
              
              <div className="w-full">
                  <div className="grid grid-cols-12 gap-x-2 px-6 py-2.5 bg-slate-100/40 border-b border-slate-100 items-center sticky top-0 z-10">
                      <div className="col-span-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Timestamp</div>
                      <div className="col-span-3 text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Action</div>
                      <div className="col-span-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Details (Email/Journal)</div>
                      <div className="col-span-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">IP Address</div>
                  </div>
                  <div className="divide-y divide-slate-50">
                      {(selectedUser.history || []).map((h:any, i:number) => {
                          const act = String(h.activity_type || 'system').toLowerCase();
                          const c = getActionColor(act);
                          const details = [h.email, h.journal].filter(Boolean).join(' | ');
                          return (
                              <div key={i} className="grid grid-cols-12 gap-x-2 px-6 py-3 items-center hover:bg-slate-50/50">
                                  <div className="col-span-3 text-[11px] font-bold text-slate-600 truncate pr-2 tracking-tight">{parseExcelDateTime(h.login_time)}</div>
                                  <div className="col-span-3">
                                      <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${c}15`, color: c }}>{act}</span>
                                  </div>
                                  <div className="col-span-3 text-[11px] font-medium text-slate-600 truncate pr-2">{details || '—'}</div>
                                  <div className="col-span-3 text-[11px] font-mono text-slate-500 truncate">{h.ip_address || '—'}</div>
                              </div>
                          )
                      })}
                  </div>
              </div>
            </div>
          )}

          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold text-xs bg-slate-200/50 hover:bg-slate-200 text-slate-700">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
