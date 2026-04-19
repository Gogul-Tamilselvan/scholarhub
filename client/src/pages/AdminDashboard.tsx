import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, FileText, Users, CheckSquare, 
  UserPlus, Mail, BookOpen, CreditCard, 
  LogOut, Bell, RefreshCw,
  Clock, CheckCircle2,
  ChevronRight, ChevronDown, Laptop, MessageSquare, Plus,
  Search, Trash2, Loader2, ExternalLink, Filter,
  MoreVertical, Download, AlertCircle, Calendar,
  FileCheck, Newspaper, Megaphone, BarChart, History,
  ListChecks, List, Book, Printer, FileDown, Phone,
  ChevronsUpDown, Building, Eye, FileSearch,
  Medal, Ban, GraduationCap, FileWarning, Wallet, Zap,
  Edit, Check, X, Pause, PlusCircle, Globe, Archive, BookMarked
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import SEO from '@/components/SEO';
import { ReviewApprovals } from '@/components/ReviewApprovals';
import { SubmissionComparison } from '@/components/SubmissionComparison';
import { AdminPayments } from '@/components/AdminPayments';
import { AdminBooks } from '@/components/AdminBooks';
import { AdminContacts } from '@/components/AdminContacts';
import { AdminNewsletter } from '@/components/AdminNewsletter';
import { AdminDeadlines } from '@/components/AdminDeadlines';
import { AdminPerformance } from '@/components/AdminPerformance';
import { AdminLogs } from '@/components/AdminLogs';
import { AdminUsers } from '@/components/AdminUsers';
import { AdminJournals } from '@/components/AdminJournals';
import { AdminArchives } from '@/components/AdminArchives';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedManuscript, setSelectedManuscript] = useState<any>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReviewerDetailsModalOpen, setIsReviewerDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', title: '', journal: '', author: '', email: '', doi: '', plagiarism: '' });
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJournal, setFilterJournal] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showPublished, setShowPublished] = useState(true);
  const [showRejected, setShowRejected] = useState(true);

  const exportManuscriptsCSV = () => {
    if (allManuscripts.length === 0) return;
    const headers = ['ID', 'Title', 'Author', 'Email', 'Phone', 'Date', 'Journal', 'Status'];
    const csvData = allManuscripts.map(m => [
      m.id,
      `"${(m.title || '').replace(/"/g, '""')}"`,
      `"${(m.author || '').replace(/"/g, '""')}"`,
      m.email,
      m.phone,
      m.date,
      `"${(m.journal || '').replace(/"/g, '""')}"`,
      m.status
    ].join(','));
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'scholar_india_manuscripts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportReviewersCSV = () => {
    if (allReviewers.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Journal', 'Institution', 'Applied', 'Status'];
    const csvData = allReviewers.map(r => [
      r.id,
      `"${(r.first_name + ' ' + (r.last_name || '')).replace(/"/g, '""')}"`,
      r.email,
      r.mobile || r.phone || '',
      r.role,
      `"${(r.journal || '').replace(/"/g, '""')}"`,
      `"${(r.institution || '').replace(/"/g, '""')}"`,
      r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('en-GB') : '',
      r.status
    ].join(','));
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'scholar_india_reviewers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // DASHBOARD DATA STATE
  const [dashboardData, setDashboardData] = useState({
    stats: {
      manuscripts: 0,
      underReview: 0,
      reviewers: 0,
      assignments: 0,
      payments: 0,
      unread: 0,
      books: 0,
      leads: 0,
      sjcm: 0,
      sjhss: 0,
      accepted: 0,
      rejected: 0
    },
    recentManuscripts: [] as any[],
    pendingAssignments: [] as any[],
    pendingReviewerApprovals: [] as any[]
  });

  const CACHE_TTL = 5 * 60 * 1000;
  const [allManuscripts, setAllManuscripts] = useState<any[]>([]);
  const [manuscriptsLimit, setManuscriptsLimit] = useState(10);
  const [loadingManuscripts, setLoadingManuscripts] = useState(false);

  const [allReviewers, setAllReviewers] = useState<any[]>([]);
  const [reviewersLimit, setReviewersLimit] = useState(10);
  const [loadingReviewers, setLoadingReviewers] = useState(false);
  const [reviewerSearchTerm, setReviewerSearchTerm] = useState('');
  const [filterReviewerRole, setFilterReviewerRole] = useState('All Roles');
  const [filterReviewerStatus, setFilterReviewerStatus] = useState('All Statuses');
  const [filterReviewerJournal, setFilterReviewerJournal] = useState('All Journals');
  const [reviewerSubTab, setReviewerSubTab] = useState('All Applications');

  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [reviewsLimit, setReviewsLimit] = useState(10);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsSearchTerm, setReviewsSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Assign Work State
  const [assignSearchTerm, setAssignSearchTerm] = useState('');
  const [selectedManuscriptForAssign, setSelectedManuscriptForAssign] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningReviewer, setAssigningReviewer] = useState(false);
  const [matchingReviewers, setMatchingReviewers] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [assignForm, setAssignForm] = useState({ reviewerId: '', dueDate: '' });

  // All Assignments State
  const [assignmentsSearchTerm, setAssignmentsSearchTerm] = useState('');
  const [assignmentsFilterStatus, setAssignmentsFilterStatus] = useState('All Statuses');
  const [showRevoked, setShowRevoked] = useState(false);

  const fetchManuscripts = async (forceRefetch = false) => {
    if (!forceRefetch) {
       const cached = sessionStorage.getItem('adminManuscriptsCache');
       if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
              setAllManuscripts(data);
              return;
            }
          } catch(e) {}
       }
    }

    setLoadingManuscripts(true);
    try {
      const { data, error } = await supabase.from('manuscripts').select('*').order('submitted_at', { ascending: false }).limit(manuscriptsLimit);
      if (!error && data) {
         const formatted = data.map(m => ({
            id: m.id || "UNKNOWN",   // manuscripts.id IS the custom MANSJCM... ID
            title: m.manuscript_title || m.title || "Untitled",
            author: m.author_name || "Unknown",
            email: m.email || "No Email",
            phone: m.mobile || "-",
            journal: m.journal || "Not Specified",
            status: m.status || "Submitted",
            date: m.submitted_at ? new Date(m.submitted_at).toLocaleDateString('en-GB') : "-",
            isNew: false,
            raw: m
         }));
         setAllManuscripts(formatted);
         sessionStorage.setItem('adminManuscriptsCache', JSON.stringify({ data: formatted, timestamp: Date.now() }));
      }
     } catch(err) { console.error(err); }
    finally { setLoadingManuscripts(false); }
  };

  const fetchReviewers = async (forceRefetch = false) => {
    if (!forceRefetch) {
       const cached = sessionStorage.getItem('adminReviewersCache');
       if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
              setAllReviewers(data);
              return;
            }
          } catch(e) {}
       }
    }

    setLoadingReviewers(true);
    try {
      const { data, error } = await supabase.from('reviewers').select('*').order('submitted_at', { ascending: false }).limit(reviewersLimit);
      if (!error && data) {
         setAllReviewers(data);
         sessionStorage.setItem('adminReviewersCache', JSON.stringify({ data, timestamp: Date.now() }));
      }
    } catch(err) { console.error(err); }
    finally { setLoadingReviewers(false); }
  };

  const fetchReviews = async (forceRefetch = false) => {
    if (!forceRefetch) {
       const cached = sessionStorage.getItem('adminReviewsCache');
       if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
              setAllReviews(data);
              return;
            }
          } catch(e) {}
       }
    }

    setLoadingReviews(true);
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('id, assigned_at, manuscript_id, manuscript_title, reviewer_id, reviewer_full_name, reviewer_email, recommendation, overall_marks, submission_date, status, importance, title_feedback, abstract_feedback, scientific_correctness, references_feedback, language_quality, general_comments, ethical_issues, ethical_details, competing_interests, plagiarism_suspected, notes')
        .order('assigned_at', { ascending: false })
        .limit(reviewsLimit);
        
      if (error) {
        console.error('fetchReviews error:', error);
      }
      if (!error && data) {
         setAllReviews(data);
         sessionStorage.setItem('adminReviewsCache', JSON.stringify({ data, timestamp: Date.now() }));
      }
    } catch(err) { console.error(err); }
    finally { setLoadingReviews(false); }
  };

  const handleEditSubmit = async () => {
    setSubmittingEdit(true);
    try {
        const { error } = await supabase.from('manuscripts').update({
            manuscript_title: editForm.title,
            journal: editForm.journal,
            author_name: editForm.author,
            email: editForm.email,
            doi: editForm.doi,
            plagiarism_report: editForm.plagiarism
        }).eq('id', editForm.id);

        if (error) throw error;

        toast({ title: "Manuscript updated successfully.", variant: 'default' });
        setIsEditModalOpen(false);
        fetchManuscripts(true);
        if (selectedManuscript && selectedManuscript.id === editForm.id) {
           setSelectedManuscript({ ...selectedManuscript, title: editForm.title, journal: editForm.journal, author: editForm.author, email: editForm.email, raw: { ...selectedManuscript.raw, doi: editForm.doi } });
        }
    } catch(err) {
        console.error(err);
        toast({ title: "Failed to update manuscript", variant: "destructive" });
    } finally {
        setSubmittingEdit(false);
    }
  };

  const updateManuscriptStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('manuscripts').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      
      toast({ title: `Manuscript marked as ${newStatus}`, variant: 'default' });
      setAllManuscripts(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
      // Refresh the Dashboard counters if needed, but not necessarily mandatory for the list view update
      fetchDashboardData(true);
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const fetchDashboardData = async (forceRefetch = false) => {
    if (!forceRefetch) {
       const cached = sessionStorage.getItem('adminDashboardCache');
       if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
               setDashboardData(data);
               return;
            }
          } catch(e) {}
       }
    }

    setLoading(true);
    try {
      // Fetch stats and preview data in parallel
      const [
        { count: manuscriptsCount },
        { count: underReviewCount },
        { count: reviewersCount },
        { count: assignmentsCount },
        { count: paymentsCount },
        { count: sjcmCount },
        { count: sjhssCount },
        { count: acceptedCount },
        { count: rejectedCount },
        { count: booksCount },
        { data: reviewers },
        { data: manuscripts },
        { data: assignments }
      ] = await Promise.all([
        supabase.from('manuscripts').select('*', { count: 'exact', head: true }),
        supabase.from('manuscripts').select('*', { count: 'exact', head: true }).in('status', ['Under Process', 'Under Review']),
        supabase.from('reviewers').select('*', { count: 'exact', head: true }),
        supabase.from('assignments').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('*', { count: 'exact', head: true }),
        supabase.from('manuscripts').select('*', { count: 'exact', head: true }).ilike('journal', '%Commerce%'),
        supabase.from('manuscripts').select('*', { count: 'exact', head: true }).ilike('journal', '%Humanities%'),
        supabase.from('manuscripts').select('*', { count: 'exact', head: true }).ilike('status', 'Accepted'),
        supabase.from('manuscripts').select('*', { count: 'exact', head: true }).ilike('status', 'Rejected'),
        // Books count from books table
        supabase.from('books').select('*', { count: 'exact', head: true }),
        // Reviewers: only pending status (case-insensitive), latest 5
        supabase.from('reviewers').select('id, first_name, last_name, email, role, status, submitted_at').or('status.eq.Pending,status.eq.pending,status.eq.PENDING').order('id', { ascending: false }).limit(5),
        // Manuscripts latest 5
        supabase.from('manuscripts').select('id, manuscript_title, author_name, status').order('submitted_at', { ascending: false }).limit(5),
        // Assignments: direct columns, pending only
        supabase.from('assignments').select('id, status, due_date, manuscript_title, reviewer_full_name, reviewer_email').or('status.eq.Pending,status.eq.pending').order('assigned_at', { ascending: false }).limit(5)
      ]);

      const parseDateString = (dateVal: string | number | null | undefined): string => {
        if (!dateVal) return '—';
        const strVal = String(dateVal);
        const parsedNum = Number(strVal);
        if (!isNaN(parsedNum) && parsedNum > 10000) {
          // Handle Excel serial date format (eg: 45993)
          const date = new Date(Math.round((parsedNum - 25569) * 86400 * 1000));
          return date.toLocaleDateString('en-GB');
        }
        // Handle standard ISO date string fallback
        const parsedDate = new Date(strVal);
        return !isNaN(parsedDate.getTime()) ? parsedDate.toLocaleDateString('en-GB') : strVal;
      };

      const newData = {
        stats: {
          manuscripts: manuscriptsCount || 0,
          underReview: underReviewCount || 0,
          reviewers: reviewersCount || 0,
          assignments: assignmentsCount || 0,
          payments: paymentsCount || 0,
          unread: 0, // Not in schema, keeping 0
          books: booksCount || 0,
          leads: 0,
          sjcm: sjcmCount || 0,
          sjhss: sjhssCount || 0,
          accepted: acceptedCount || 0,
          rejected: rejectedCount || 0
        },
        recentManuscripts: manuscripts?.map(m => ({
          title: m.manuscript_title || 'Untitled',
          author: m.author_name || 'Unknown',
          status: m.status || 'Submitted',
          color: m.status === 'Accepted' || m.status?.toLowerCase() === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : m.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-blue-50 text-blue-600 border-blue-200'
        })) || [],
        pendingAssignments: assignments?.map(a => ({
          manuscript: a.manuscript_title || 'Unknown',
          reviewer: a.reviewer_full_name || a.reviewer_email || 'Unknown',
          due: parseDateString(a.due_date)
        })) || [],
        pendingReviewerApprovals: reviewers?.map(r => {
          const dateStr = parseDateString(r.submitted_at);
          return {
            name: `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Unknown',
            email: r.email || '',
            role: r.role || 'Reviewer',
            applied: dateStr !== '—' ? dateStr : (r.id ? `#${r.id}` : '—')
          };
        }) || []
      };

      setDashboardData(newData);
      sessionStorage.setItem('adminDashboardCache', JSON.stringify({ data: newData, timestamp: Date.now() }));
    } catch (err) {
      console.error(err);
      toast({ title: 'Error fetching data from Supabase', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) {
      setLocation('/admin/login');
      return;
    }
    const sessionData = JSON.parse(session);
    setAdminEmail(sessionData.email);
    
    // Clear any stale cache from before the RLS fix, then fetch fresh
    sessionStorage.removeItem('adminDashboardCache');
    sessionStorage.removeItem('adminManuscriptsCache');
    sessionStorage.removeItem('adminReviewersCache');
    sessionStorage.removeItem('adminReviewsCache');
    fetchDashboardData(true);
  }, []);

  // Fetch manuscripts whenever the limit changes (server-side limits)
  useEffect(() => {
    if (localStorage.getItem('adminSession')) {
       fetchManuscripts(true);
    }
  }, [manuscriptsLimit]);

  // Fetch reviewers whenever the limit changes
  useEffect(() => {
    if (localStorage.getItem('adminSession')) {
       fetchReviewers(true);
    }
  }, [reviewersLimit]);

  // Fetch reviews when tab is active or limit changes
  useEffect(() => {
    if (localStorage.getItem('adminSession') && (activeTab === 'reviews' || activeTab === 'assignments')) {
       fetchReviews(true);
    }
  }, [reviewsLimit, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    setLocation('/admin/login');
  };

  // RESTORED DYNAMIC DATA FOR MANUSCRIPTS

  const NavItem = ({ icon: Icon, label, id }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
      }`}
    >
      <Icon size={16} />
      <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
      {activeTab === id && <ChevronRight size={12} className="ml-auto flex-shrink-0" />}
    </button>
  );

  const StatCard = ({ label, value, icon: Icon, gradient }: any) => (
    <Card className={`border-none shadow ${gradient} overflow-hidden p-4 group relative cursor-pointer`}>
      <div className="relative z-10 flex items-start justify-between">
         <div>
            <h3 className="text-3xl font-black text-white tracking-tighter leading-none mb-1">{loading ? <Loader2 className="animate-spin h-7 w-7" /> : value}</h3>
            <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">{label}</p>
         </div>
         <div className={`p-2 rounded-xl bg-white/20 text-white`}>
            <Icon size={20} />
         </div>
      </div>
    </Card>
  );

  const updateReviewerStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('reviewers').update({ status: newStatus }).eq('id', id);
      if (!error) {
         toast({ title: `Status changed to ${newStatus}` });
         fetchReviewers(true);
      } else { throw error; }
    } catch(e) { toast({ title: "Failed to update status", variant: "destructive" }); }
  };

  const renderReviewers = () => {
     const subTabs = ['All Applications', 'Reviewers', 'Editorial Board', 'Pending Only', 'Active Records'];
     
     const filteredReviewers = allReviewers.filter(r => {
        if (reviewerSubTab === 'Reviewers' && r.role !== 'Reviewer') return false;
        if (reviewerSubTab === 'Editorial Board' && r.role !== 'Editorial Board Member') return false;
        if (reviewerSubTab === 'Pending Only' && r.status?.toLowerCase() !== 'submitted' && r.status?.toLowerCase() !== 'pending') return false;
        if (reviewerSubTab === 'Active Records' && r.status?.toLowerCase() !== 'active' && r.status?.toLowerCase() !== 'accepted') return false;

        if (filterReviewerRole !== 'All Roles' && r.role !== filterReviewerRole) return false;
        if (filterReviewerJournal !== 'All Journals' && filterReviewerJournal !== 'All' && r.journal !== filterReviewerJournal) return false;
        if (filterReviewerStatus !== 'All Statuses' && filterReviewerStatus !== 'All' && r.status !== filterReviewerStatus) return false;

        if (reviewerSearchTerm) {
          const s = reviewerSearchTerm.toLowerCase();
          const n = (r.first_name + ' ' + (r.last_name || '')).toLowerCase();
          const e = (r.email || '').toLowerCase();
          const j = (r.journal || '').toLowerCase();
          const id = (r.id || '').toLowerCase();
          if (!n.includes(s) && !e.includes(s) && !j.includes(s) && !id.includes(s)) return false;
        }
        return true;
     });

     return (
        <div className="space-y-6 text-left pb-16">
           <div className="flex flex-col md:flex-row justify-between gap-4 py-2 print:hidden">
              <div className="pl-2 w-full">
                 <h2 className="text-xl font-bold font-sans text-slate-800 tracking-tight">Review applications and update status.</h2>
                 <div className="flex items-center gap-6 mt-6 border-b border-slate-200 overflow-x-auto custom-scrollbar flex-nowrap w-full">
                    {subTabs.map(tab => (
                       <button 
                          key={tab} 
                          onClick={() => setReviewerSubTab(tab)}
                          className={`pb-2.5 text-[13px] whitespace-nowrap font-bold transition-all border-b-2 ${reviewerSubTab === tab ? 'border-current text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                       >{tab}</button>
                    ))}
                 </div>
              </div>
              <div className="flex items-center gap-3 pr-2 mt-4 md:mt-0 flex-shrink-0">
                 <Button onClick={() => fetchReviewers(true)} disabled={loadingReviewers} variant="outline" size="sm" className="bg-white gap-2 font-bold text-[11px] h-9 px-4 border-slate-200 rounded-md shadow-sm"><RefreshCw size={14} className={loadingReviewers ? "animate-spin" : ""} /> Refresh</Button>
                 <Button onClick={exportReviewersCSV} className="bg-indigo-700 hover:bg-indigo-800 gap-2 font-bold text-[11px] h-9 px-5 text-white shadow-md rounded-md"><FileDown size={14} /> Export CSV</Button>
              </div>
           </div>

           <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {/* FILTER ROW */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2 border-b border-slate-100 px-6 bg-white print:hidden">
                 <div className="relative w-full max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input 
                       value={reviewerSearchTerm}
                       onChange={(e) => setReviewerSearchTerm(e.target.value)}
                       placeholder="Search by name, email, journal..." 
                       className="pl-9 h-9 text-xs border-slate-200 focus-visible:ring-blue-500 rounded-md shadow-sm w-full bg-slate-50/50"
                    />
                 </div>
                 <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <Select value={filterReviewerRole} onValueChange={setFilterReviewerRole}>
                       <SelectTrigger className="w-[140px] h-9 text-xs font-semibold border-slate-200 shadow-sm rounded-md"><SelectValue placeholder="All Roles" /></SelectTrigger>
                       <SelectContent><SelectItem value="All Roles">All Roles</SelectItem><SelectItem value="Editorial Board Member">Editorial Board</SelectItem><SelectItem value="Reviewer">Reviewer</SelectItem></SelectContent>
                    </Select>
                    <Select value={filterReviewerStatus} onValueChange={setFilterReviewerStatus}>
                       <SelectTrigger className="w-[140px] h-9 text-xs font-semibold border-slate-200 shadow-sm rounded-md"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                       <SelectContent><SelectItem value="All Statuses">All Statuses</SelectItem><SelectItem value="Submitted">Submitted</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Rejected">Rejected</SelectItem></SelectContent>
                    </Select>
                    <Select value={filterReviewerJournal} onValueChange={setFilterReviewerJournal}>
                       <SelectTrigger className="w-[200px] h-9 text-xs font-semibold border-slate-200 shadow-sm rounded-md"><SelectValue placeholder="All Journals" /></SelectTrigger>
                       <SelectContent><SelectItem value="All Journals">All Journals</SelectItem><SelectItem value="Scholar Journal of Commerce and Management">SJCM</SelectItem><SelectItem value="Scholar Journal of Humanities and Social Sciences">SJHSS</SelectItem></SelectContent>
                    </Select>
                    <Button onClick={() => window.print()} variant="outline" size="sm" className="bg-white gap-2 font-bold text-[11px] h-9 px-4 border-slate-200 rounded-md shadow-sm"><Printer size={14} /> Print</Button>
                    <div className="text-[11px] font-bold text-slate-400 whitespace-nowrap pl-2">{filteredReviewers.length} record(s)</div>
                 </div>
              </div>

              {/* TABLE HEADER */}
              <div className="grid grid-cols-12 gap-x-4 px-6 py-3.5 bg-slate-50/80 border-b border-slate-100 items-center">
                 <div className="col-span-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">REVIEWER DETAILS <ChevronsUpDown size={12} className="opacity-50" /></div>
                 <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">ROLE <ChevronsUpDown size={12} className="opacity-50" /></div>
                 <div className="col-span-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">JOURNAL <ChevronsUpDown size={12} className="opacity-50" /></div>
                 <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">INSTITUTION <ChevronsUpDown size={12} className="opacity-50" /></div>
                 <div className="col-span-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">APPLIED <ChevronsUpDown size={12} className="opacity-50" /></div>
                 <div className="col-span-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right flex justify-end gap-3">STATUS <span className="opacity-0">___</span> ACTIONS</div>
              </div>

              {/* TABLE BODY */}
              <div className="divide-y divide-slate-100 bg-[#FFFFF9]">
                 {loadingReviewers && allReviewers.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-medium flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
                 ) : filteredReviewers.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-medium text-sm">No reviewers found matching filters.</div>
                 ) : (
                    filteredReviewers.map((r, i) => (
                       <div key={i} className="grid grid-cols-12 gap-x-4 px-6 py-4 hover:bg-slate-50 items-center">
                          <div className="col-span-3 space-y-1.5">
                             <div className="text-[9px] font-black text-slate-500 tracking-wider uppercase">{r.id || 'N/A'}</div>
                             <h4 className="text-[13px] font-bold text-slate-800 leading-snug">{r.first_name} {r.last_name || ''}</h4>
                             <div className="flex flex-col gap-y-0.5 mt-1 text-[10px]">
                                <span className="flex items-center gap-2 text-blue-600 font-bold"><Mail size={12} className="text-slate-600" /> {r.email}</span>
                                <span className="flex items-center gap-2 text-emerald-600 font-bold"><Phone size={12} className="text-slate-600" /> {r.mobile || r.phone || '-'}</span>
                             </div>
                          </div>
                          <div className="col-span-2">
                             <Badge variant="outline" className={`border text-[9px] font-black tracking-wide rounded border-none shadow-sm ${r.role === 'Editorial Board Member' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                {r.role || 'Reviewer'}
                             </Badge>
                          </div>
                          <div className="col-span-3 text-[10px] font-medium text-slate-600 leading-tight pr-4">
                             {r.journal || '-'}
                          </div>
                          <div className="col-span-2 text-[10px] font-medium text-slate-600 leading-tight pr-2">
                             {r.institution || '-'}
                          </div>
                          <div className="col-span-1 text-[10px] font-medium text-slate-600">
                             {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('en-GB') : '-'}
                          </div>
                          <div className="col-span-1 flex items-center justify-end gap-3 print:justify-start">
                             <Badge variant="outline" className={`border text-[9px] font-black tracking-wide rounded px-2.5 py-0.5 shadow-sm border-none ${r.status?.toLowerCase() === 'active' || r.status?.toLowerCase() === 'accepted' ? 'bg-emerald-100 text-emerald-600' : r.status?.toLowerCase() === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                                {r.status || 'Active'}
                             </Badge>
                             <div className="print:hidden">
                                <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 bg-white border border-slate-100 rounded-full transition-colors"><MoreVertical size={14} /></Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end" className="w-40 bg-white border-slate-100 shadow-xl rounded-xl p-1.5 font-medium text-slate-600">
                                      <DropdownMenuItem onClick={() => { setSelectedReviewer(r); setIsReviewerDetailsModalOpen(true); }} className="focus:bg-slate-50 cursor-pointer text-xs rounded-lg py-2">
                                         <Eye className="mr-2 h-4 w-4 text-blue-700" /> View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => updateReviewerStatus(r.id, 'Active')} className="focus:bg-emerald-50 cursor-pointer text-xs rounded-lg py-2 focus:text-emerald-700">
                                         <Check className="mr-2 h-4 w-4 text-emerald-600" /> Mark Active
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => updateReviewerStatus(r.id, 'Rejected')} className="focus:bg-rose-50 cursor-pointer text-xs rounded-lg py-2 focus:text-rose-700">
                                         <X className="mr-2 h-4 w-4 text-rose-600" /> Reject
                                      </DropdownMenuItem>
                                   </DropdownMenuContent>
                                </DropdownMenu>
                             </div>
                          </div>
                       </div>
                    ))
                 )}
              </div>
              {allReviewers.length >= reviewersLimit && (
                 <div className="p-4 bg-white border-t border-slate-100 flex justify-center print:hidden">
                    <Button onClick={() => setReviewersLimit(prev => prev + 10)} disabled={loadingReviewers} variant="outline" className="text-xs font-bold text-slate-600 border-slate-200 bg-white hover:bg-slate-50 rounded-lg h-9 px-6 shadow-sm">
                       Load More Reviewers
                    </Button>
                 </div>
              )}
           </div>
        </div>
     );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <header className="flex items-center justify-between mb-4 bg-white p-5 rounded-xl shadow-sm border border-slate-100">
         <div className="text-left">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Overview Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
               <p className="text-xs text-slate-500 font-medium">Welcome back, {adminEmail || 'Administrator'}</p>
               <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Live</span>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <Button onClick={() => fetchDashboardData(true)} disabled={loading} variant="outline" className="gap-2 text-[11px] font-bold h-9 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg">
               <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
            </Button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
               <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 leading-none">Global Editor</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest">Administrator</p>
               </div>
               <div className="w-9 h-9 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-white shadow">GE</div>
            </div>
         </div>
      </header>

      {/* STATS ROW WITH VIBRANT GRADIENTS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Manuscripts" value={dashboardData.stats.manuscripts} icon={FileText} gradient="bg-gradient-to-br from-blue-500 to-blue-700" />
        <StatCard label="Under Review" value={dashboardData.stats.underReview} icon={Clock} gradient="bg-gradient-to-br from-amber-400 to-orange-500" />
        <StatCard label="Reviewers" value={dashboardData.stats.reviewers} icon={Users} gradient="bg-gradient-to-br from-emerald-400 to-emerald-600" />
        <StatCard label="Assignments" value={dashboardData.stats.assignments} icon={Laptop} gradient="bg-gradient-to-br from-purple-500 to-purple-700" />
        <StatCard label="Payments" value={dashboardData.stats.payments} icon={CreditCard} gradient="bg-gradient-to-br from-cyan-500 to-blue-600" />
        <StatCard label="Messages" value={dashboardData.stats.unread} icon={Mail} gradient="bg-gradient-to-br from-rose-400 to-rose-600" />
        <StatCard label="Books" value={dashboardData.stats.books} icon={Book} gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" />
        <StatCard label="Leads" value={dashboardData.stats.leads} icon={MessageSquare} gradient="bg-gradient-to-br from-slate-700 to-slate-900" />
      </div>

      {/* JOURNAL SUMMARY BAR */}
      <div className="flex items-center gap-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center gap-2.5 text-[11px] font-black text-slate-400 tracking-[2px] border-r border-slate-100 pr-8">
           <BarChart size={14} className="text-blue-600" /> BY JOURNAL
        </div>
        <div className="flex items-center gap-6 text-[11px] font-bold">
           <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-full shadow-sm"><div className="w-2 h-2 rounded-full bg-blue-600"></div><span className="text-slate-800">SJCM:</span><span className="text-slate-500">{loading ? '...' : dashboardData.stats.sjcm}</span></div>
           <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-full shadow-sm"><div className="w-2 h-2 rounded-full bg-purple-600"></div><span className="text-slate-800">SJHSS:</span><span className="text-slate-500">{loading ? '...' : dashboardData.stats.sjhss}</span></div>
        </div>
        <div className="ml-auto flex gap-3">
           <div className="bg-amber-50/50 text-emerald-600 border border-amber-100 inline-flex px-4 py-1.5 rounded-full items-center gap-2 text-[10px] font-black">
              <CheckCircle2 size={12} className="text-emerald-500" /> Accepted: {loading ? '...' : dashboardData.stats.accepted}
           </div>
           <div className="bg-rose-50/50 text-rose-600 border border-rose-100 inline-flex px-4 py-1.5 rounded-full items-center gap-2 text-[10px] font-black">
              <AlertCircle size={12} className="text-rose-500" /> Rejected: {loading ? '...' : dashboardData.stats.rejected}
           </div>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
         <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
            <Zap size={16} className="text-amber-500 fill-amber-300" />
            <h3 className="text-xs font-black text-slate-800 tracking-widest uppercase">Quick Actions</h3>
         </div>
         <div className="p-6 flex flex-wrap gap-4">
            <Button className="text-xs font-bold bg-white text-slate-700 border-slate-200 shadow-sm hover:bg-slate-50 h-10 px-6 rounded-xl gap-2 hover:border-blue-300 hover:text-blue-700 transition-all" variant="outline" onClick={() => setActiveTab('reviewers')}><UserPlus size={16} className="text-blue-600" /> Approve Reviewers</Button>
            <Button className="text-xs font-bold bg-white text-slate-700 border-slate-200 shadow-sm hover:bg-slate-50 h-10 px-6 rounded-xl gap-2 hover:border-blue-300 hover:text-blue-700 transition-all" variant="outline" onClick={() => setActiveTab('assign')}><ListChecks size={16} className="text-blue-600" /> Assign Work</Button>
            <Button className="text-xs font-bold bg-white text-slate-700 border-slate-200 shadow-sm hover:bg-slate-50 h-10 px-6 rounded-xl gap-2 hover:border-blue-300 hover:text-blue-700 transition-all" variant="outline" onClick={() => setActiveTab('manuscripts')}><FileText size={16} className="text-blue-600" /> Manuscripts</Button>
            <Button className="text-xs font-bold bg-white text-slate-700 border-slate-200 shadow-sm hover:bg-slate-50 h-10 px-6 rounded-xl gap-2 hover:border-blue-300 hover:text-blue-700 transition-all" variant="outline" onClick={() => setActiveTab('messages')}><MessageSquare size={16} className="text-blue-600" /> Messages</Button>
         </div>
      </div>

      {/* MIDDLE SECTION (TWO COLUMNS) */}
      <div className="grid grid-cols-12 gap-6">
         {/* RECENT MANUSCRIPTS */}
         <Card className="col-span-12 lg:col-span-6 border border-slate-100 shadow-sm overflow-hidden bg-white rounded-xl">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-2">
                 <FileText size={18} className="text-blue-600" />
                 <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Recent Manuscripts</h3>
               </div>
               <Button variant="secondary" size="sm" onClick={() => setActiveTab('manuscripts')} className="h-8 text-[11px] font-bold uppercase text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg px-4 border-none transition-colors">View All</Button>
            </div>
            <div className="overflow-x-auto min-h-[300px]">
               {loading ? (
                 <div className="flex items-center justify-center h-[300px] text-slate-400"><Loader2 className="animate-spin h-8 w-8" /></div>
               ) : (
               <table className="w-full text-left bg-white">
                  <thead className="border-b border-slate-100">
                     <tr className="uppercase text-xs font-semibold text-slate-500 bg-slate-50/50">
                        <th className="px-5 py-4">Title</th>
                        <th className="px-5 py-4">Author</th>
                        <th className="px-5 py-4">Applied</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {dashboardData.recentManuscripts.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50 border-b border-slate-50">
                           <td className="px-5 py-3.5 text-sm font-semibold text-slate-800 max-w-[250px] truncate">{item.title}</td>
                           <td className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase">{item.author}</td>
                           <td className="px-5 py-3.5">
                              <Badge variant="outline" className={`border text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${item.color}`}>
                                 {item.status}
                              </Badge>
                           </td>
                        </tr>
                     ))}
                     {dashboardData.recentManuscripts.length === 0 && (
                        <tr><td colSpan={3} className="px-5 py-8 text-center text-base font-medium text-slate-400">No recent manuscripts</td></tr>
                     )}
                  </tbody>
               </table>
               )}
            </div>
         </Card>

         {/* PENDING ASSIGNMENTS */}
         <Card className="col-span-12 lg:col-span-6 border border-slate-100 shadow-sm overflow-hidden bg-white rounded-xl">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-2">
                 <Laptop size={18} className="text-purple-600" />
                 <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Pending Assignments</h3>
               </div>
               <Button variant="secondary" size="sm" onClick={() => setActiveTab('assignments')} className="h-8 text-[11px] font-bold uppercase text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg px-4 border-none transition-colors">View All</Button>
            </div>
            <div className="overflow-x-auto min-h-[300px]">
               {loading ? (
                 <div className="flex items-center justify-center h-[300px] text-slate-400"><Loader2 className="animate-spin h-8 w-8" /></div>
               ) : (
               <table className="w-full text-left">
                  <thead className="border-b border-slate-100 bg-slate-50/50">
                     <tr className="uppercase text-xs font-semibold text-slate-500 tracking-wider">
                        <th className="px-5 py-4">Manuscript</th>
                        <th className="px-5 py-4">Reviewer</th>
                        <th className="px-5 py-4">Due</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {dashboardData.pendingAssignments.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50 border-b border-slate-50">
                           <td className="px-5 py-3.5 text-sm font-semibold text-slate-800 max-w-[250px] truncate">{item.manuscript}</td>
                           <td className="px-5 py-3.5 text-sm font-medium text-slate-600 flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shadow-sm">
                               {item.reviewer.charAt(0)}
                             </div>
                             {item.reviewer}
                           </td>
                           <td className="px-5 py-3.5">
                             <span className="text-xs font-bold text-rose-600 bg-rose-50 rounded-md inline-flex items-center px-2.5 py-1 border border-rose-100"><Calendar size={12} className="mr-1" /> {item.due}</span>
                           </td>
                        </tr>
                     ))}
                     {dashboardData.pendingAssignments.length === 0 && (
                        <tr><td colSpan={3} className="px-5 py-8 text-center text-base font-medium text-slate-400">No pending assignments</td></tr>
                     )}
                  </tbody>
               </table>
               )}
            </div>
         </Card>
      </div>

      {/* BOTTOM SECTION: REVIEWER APPROVALS */}
      <Card className="border border-slate-100 shadow-sm overflow-hidden bg-white rounded-xl">
         <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
               <Users size={18} className="text-emerald-500" />
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Pending Reviewer Approvals</h3>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setActiveTab('reviewers')} className="h-8 text-[11px] font-bold uppercase text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-4 border-none transition-colors">Manage All</Button>
         </div>
         <div className="overflow-x-auto min-h-[200px]">
            {loading ? (
              <div className="flex items-center justify-center h-[200px] text-slate-400"><Loader2 className="animate-spin h-8 w-8" /></div>
            ) : (
            <table className="w-full text-left">
               <thead className="border-b border-slate-100 bg-slate-50/50">
                  <tr className="uppercase text-xs font-semibold text-slate-500">
                     <th className="px-5 py-4">Name</th>
                     <th className="px-5 py-4">Email</th>
                     <th className="px-5 py-4">Role</th>
                     <th className="px-5 py-4">Applied</th>
                     <th className="px-5 py-4 text-center">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {dashboardData.pendingReviewerApprovals.map((r, i) => (
                     <tr key={i} className="hover:bg-slate-50 border-b border-slate-50">
                        <td className="px-5 py-3.5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {r.name.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{r.name}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-500">{r.email}</td>
                        <td className="px-5 py-3.5">
                           <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 text-[10px] font-bold px-2.5 py-1 rounded-full">{r.role || 'Reviewer'}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-500 font-medium">{r.applied}</td>
                        <td className="px-5 py-3.5 text-center">
                           <Button className="h-8 bg-slate-800 hover:bg-blue-600 text-[11px] font-bold uppercase px-5 rounded-lg text-white shadow-sm">Review</Button>
                        </td>
                     </tr>
                  ))}
                  {dashboardData.pendingReviewerApprovals.length === 0 && (
                     <tr><td colSpan={5} className="px-5 py-8 text-center text-base font-medium text-slate-400">No pending reviewer approvals</td></tr>
                  )}
               </tbody>
            </table>
            )}
         </div>
      </Card>
    </div>
  );

  const renderManuscripts = () => {
    const filteredManuscripts = allManuscripts.filter(m => {
       if (searchTerm) {
         const term = searchTerm.toLowerCase();
         if (!`${m.title || ''} ${m.author || ''} ${m.journal || ''} ${m.id || ''}`.toLowerCase().includes(term)) return false;
       }
       if (filterJournal !== 'All' && filterJournal !== m.journal) return false;
       if (filterStatus !== 'All' && filterStatus.toLowerCase() !== m.status.toLowerCase()) return false;
       
       const isPub = m.status?.toLowerCase() === 'published';
       const isRej = m.status?.toLowerCase() === 'rejected';
       if (!showPublished && isPub) return false;
       if (!showRejected && isRej) return false;
       
       return true;
    });

    return (
    <div className="space-y-6 text-left pb-16">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 print:hidden">
          <div className="pl-2">
             <h2 className="text-xl font-bold font-sans text-slate-800 tracking-tight">All Manuscripts</h2>
             <p className="text-xs font-medium text-slate-500 mt-0.5 max-w-2xl">Manage submissions. By default, the list shows Under Review, Under Process, Accepted, and Complement manuscripts.</p>
          </div>
          <div className="flex items-center gap-3 pr-2">
             <div className="flex items-center gap-2 mr-2">
                <Checkbox id="showPublished" checked={showPublished} onCheckedChange={(c) => setShowPublished(!!c)} />
                <label htmlFor="showPublished" className="text-xs font-bold text-slate-600 cursor-pointer">Show Published</label>
             </div>
             <div className="flex items-center gap-2 mr-4">
                <Checkbox id="showRejected" checked={showRejected} onCheckedChange={(c) => setShowRejected(!!c)} />
                <label htmlFor="showRejected" className="text-xs font-bold text-slate-600 cursor-pointer">Show Rejected</label>
             </div>
             <Button onClick={() => fetchManuscripts(true)} disabled={loadingManuscripts} variant="outline" size="sm" className="bg-white gap-2 font-bold text-[11px] h-9 px-4 border-slate-200 rounded-md shadow-sm"><RefreshCw size={14} className={loadingManuscripts ? "animate-spin" : ""} /> Refresh</Button>
             <Button onClick={() => window.print()} variant="outline" size="sm" className="bg-white gap-2 font-bold text-[11px] h-9 px-4 border-slate-200 rounded-md shadow-sm"><Printer size={14} /> Print</Button>
             <Button onClick={exportManuscriptsCSV} className="bg-indigo-700 hover:bg-indigo-800 gap-2 font-bold text-[11px] h-9 px-5 text-white shadow-md rounded-md"><FileDown size={14} /> Export CSV</Button>
          </div>
       </div>

       <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {/* FILTER ROW */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2 border-b border-slate-100 px-6 bg-white print:hidden">
             <div className="relative w-full max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Search by title, author, journal..." 
                   className="pl-9 h-9 text-xs border-slate-200 focus-visible:ring-blue-500 rounded-md shadow-sm w-full bg-slate-50/50"
                />
             </div>
             <div className="flex items-center gap-4">
                <Select value={filterJournal} onValueChange={setFilterJournal}>
                   <SelectTrigger className="w-[200px] h-9 text-xs font-semibold border-slate-200 shadow-sm rounded-md">
                      <SelectValue placeholder="All Journals" />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="All">All Journals</SelectItem>
                      <SelectItem value="Scholar Journal of Commerce and Management">SJCM</SelectItem>
                      <SelectItem value="Scholar Journal of Humanities and Social Sciences">SJHSS</SelectItem>
                   </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                   <SelectTrigger className="w-[160px] h-9 text-xs font-semibold border-slate-200 shadow-sm rounded-md">
                      <SelectValue placeholder="All Statuses" />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Accepted">Accepted</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Under Process">Under Process</SelectItem>
                      <SelectItem value="Complement">Complement</SelectItem>
                      <SelectItem value="Hold">Hold</SelectItem>
                   </SelectContent>
                </Select>
                
                <div className="text-xs font-bold text-slate-500 whitespace-nowrap min-w-[70px] text-right">{filteredManuscripts.length} record(s)</div>
             </div>
          </div>

          <div className="grid grid-cols-12 gap-x-4 px-6 py-4 bg-slate-50/80 border-b border-slate-100">
             <div className="col-span-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">MANUSCRIPT DETAILS <ChevronsUpDown size={10}/></div>
             <div className="col-span-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center flex items-center justify-center gap-1">DATE <ChevronsUpDown size={10}/></div>
             <div className="col-span-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">JOURNAL <ChevronsUpDown size={10}/></div>
             <div className="col-span-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">STATUS <ChevronsUpDown size={10}/></div>
             <div className="col-span-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">ACTIONS</div>
          </div>
          
          <div className="divide-y divide-slate-100 bg-[#FFFFF9]">
             {loadingManuscripts && allManuscripts.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-medium flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
             ) : filteredManuscripts.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-medium text-sm">No manuscripts found matching filters.</div>
             ) : (
                filteredManuscripts.slice(0, manuscriptsLimit).map((m, i) => (
                   <div key={i} className="grid grid-cols-12 gap-x-4 px-6 py-5 hover:bg-slate-50 items-center">
                      <div className="col-span-6 space-y-1.5">
                         <div className="flex items-center gap-2"><span className="text-[11px] font-black text-slate-600 tracking-wider uppercase">{m.id}</span>{m.isNew && <span className="text-rose-600 text-[9px] font-bold uppercase py-0.5 rounded leading-none italic">NEW</span>}</div>
                         <h4 className="text-[13px] font-bold text-slate-800 leading-snug pr-4">{m.title}</h4>
                         <div className="flex flex-col gap-y-0.5 mt-1.5 text-[10px]">
                            <span className="flex items-center gap-2 text-slate-500 font-bold uppercase"><Users size={12} className="text-slate-600" /> {m.author}</span>
                            <span className="flex items-center gap-2 text-blue-600 font-bold"><Mail size={12} className="text-slate-600" /> {m.email}</span>
                            <span className="flex items-center gap-2 text-emerald-600 font-bold"><Phone size={12} className="text-slate-600" /> {m.phone}</span>
                         </div>
                      </div>
                      <div className="col-span-1 flex items-center justify-center text-[11px] text-slate-600 font-medium">{m.date}</div>
                      <div className="col-span-3 flex items-center text-[10px] font-medium text-slate-600 leading-tight pr-4">{m.journal}</div>
                      <div className="col-span-1 flex items-center"><Badge variant="outline" className={`border text-[9px] font-black tracking-wide rounded-full px-2.5 py-0.5 shadow-sm bg-opacity-50 ${m.status?.toLowerCase() === 'accepted' || m.status?.toLowerCase() === 'published' ? 'bg-emerald-100 text-emerald-600 border-none' : m.status?.toLowerCase() === 'rejected' ? 'bg-rose-100 text-rose-600 border-none' : 'bg-blue-100 text-blue-600 border-none'}`}>{m.status}</Badge></div>
                      <div className="col-span-1 flex items-center justify-end print:hidden">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 bg-white border border-slate-100 rounded-md transition-colors"><MoreVertical size={14} /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white border-slate-100 shadow-xl rounded-xl p-1.5 font-medium text-slate-600">
                               <DropdownMenuItem onClick={() => { setSelectedManuscript(m); setIsDetailsModalOpen(true); }} className="focus:bg-slate-50 cursor-pointer text-xs rounded-lg py-2">
                                  <Eye className="mr-2 h-4 w-4 text-blue-700" /> View Details
                               </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => { 
                                  const rawM = m.raw || {};
                                  setEditForm({
                                     id: m.id,
                                     title: rawM.manuscript_title || m.title || '',
                                     journal: rawM.journal || m.journal || '',
                                     author: rawM.author_name || m.author || '',
                                     email: rawM.email || m.email || '',
                                     doi: rawM.doi || '',
                                     plagiarism: rawM.plagiarism_report || ''
                                  });
                                  setIsEditModalOpen(true);
                               }} className="focus:bg-slate-50 cursor-pointer text-xs rounded-lg py-2">
                                  <Edit className="mr-2 h-4 w-4 text-purple-600" /> Edit Manuscript
                               </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => { if (m.raw?.file_url) window.open(m.raw.file_url, '_blank'); else toast({title: "No document attached", variant: "destructive"}); }} className="focus:bg-slate-50 cursor-pointer text-xs rounded-lg py-2">
                                  <FileText className="mr-2 h-4 w-4 text-rose-600" /> View Document
                               </DropdownMenuItem>
                               
                               <DropdownMenuSeparator className="bg-slate-100 my-1" />
                               
                               <DropdownMenuItem onClick={() => updateManuscriptStatus(m.id, 'Under Review')} className="focus:bg-orange-50 cursor-pointer text-xs rounded-lg py-2 focus:text-orange-700">
                                  <Clock className="mr-2 h-4 w-4 text-orange-600" /> Under Review
                               </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => updateManuscriptStatus(m.id, 'Accepted')} className="focus:bg-emerald-50 cursor-pointer text-xs rounded-lg py-2 focus:text-emerald-700">
                                  <Check className="mr-2 h-4 w-4 text-emerald-600" /> Accept
                               </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => updateManuscriptStatus(m.id, 'Rejected')} className="focus:bg-rose-50 cursor-pointer text-xs rounded-lg py-2 focus:text-rose-700">
                                  <X className="mr-2 h-4 w-4 text-rose-600" /> Reject
                               </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => updateManuscriptStatus(m.id, 'Hold')} className="focus:bg-slate-100 cursor-pointer text-xs rounded-lg py-2">
                                  <Pause className="mr-2 h-4 w-4 text-slate-500" /> Hold
                               </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => updateManuscriptStatus(m.id, 'Complement')} className="focus:bg-blue-50 cursor-pointer text-xs rounded-lg py-2 focus:text-blue-700">
                                  <PlusCircle className="mr-2 h-4 w-4 text-slate-800" /> Complement
                               </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => updateManuscriptStatus(m.id, 'Published')} className="focus:bg-purple-50 cursor-pointer text-xs rounded-lg py-2 focus:text-purple-700">
                                  <Globe className="mr-2 h-4 w-4 text-purple-600" /> Mark Published
                               </DropdownMenuItem>
                            </DropdownMenuContent>
                         </DropdownMenu>
                      </div>
                   </div>
                ))
             )}
          </div>
          {allManuscripts.length >= manuscriptsLimit && (
             <div className="p-4 bg-white border-t border-slate-100 flex justify-center print:hidden">
                <Button onClick={() => setManuscriptsLimit(prev => prev + 10)} disabled={loadingManuscripts} variant="outline" className="text-xs font-bold text-slate-600 border-slate-200 bg-white hover:bg-slate-50 rounded-lg h-9 px-6 shadow-sm">
                   Load More Manuscripts
                </Button>
             </div>
          )}
       </div>
    </div>
  );
  };

  const updateReviewStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('assignments').update({ status: newStatus }).eq('id', id);
      if (!error) {
        toast({ title: `Review marked as ${newStatus}` });
        setAllReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      } else { throw error; }
    } catch(e) { toast({ title: 'Failed to update review status', variant: 'destructive' }); }
  };

  const exportAssignmentsCSV = () => {
    if (allReviews.length === 0) return;
    const filtered = allReviews.filter(r => showRevoked || r.status?.toLowerCase() !== 'revoked');
    const headers = ['ID', 'Manuscript Title', 'Reviewer', 'Email', 'Assigned At', 'Due Date', 'Status', 'Marks', 'Recommendation'];
    const csvData = filtered.map(r => [
      r.id,
      `"${(r.manuscript_title || '').replace(/"/g, '""')}"`,
      `"${(r.reviewer_full_name || '').replace(/"/g, '""')}"`,
      r.reviewer_email || '',
      r.assigned_at ? new Date(r.assigned_at).toLocaleDateString('en-GB') : '',
      r.due_date || '',
      r.status || 'Pending',
      r.overall_marks || '',
      `"${(r.recommendation || '').replace(/"/g, '""')}"`
    ].join(','));
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'scholar_india_assignments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendReminder = (email: string) => {
    toast({ title: `Reminder sent to ${email}` });
  };

  const renderAssignments = () => {
    const total = allReviews.length;
    const pending = allReviews.filter(r => r.status?.toLowerCase() === 'pending').length;
    const completed = allReviews.filter(r => r.status?.toLowerCase() === 'completed' || r.status?.toLowerCase() === 'approved' || r.status?.toLowerCase() === 'rejected').length;
    const revoked = allReviews.filter(r => r.status?.toLowerCase() === 'revoked').length;

    let filtered = allReviews;
    if (!showRevoked) filtered = filtered.filter(r => r.status?.toLowerCase() !== 'revoked');
    if (assignmentsFilterStatus !== 'All Statuses') {
      filtered = filtered.filter(r => {
        if (assignmentsFilterStatus === 'Pending') return r.status?.toLowerCase() === 'pending';
        if (assignmentsFilterStatus === 'Completed') return r.status?.toLowerCase() === 'completed' || r.status?.toLowerCase() === 'approved' || r.status?.toLowerCase() === 'rejected';
        return true;
      });
    }
    if (assignmentsSearchTerm) {
      const term = assignmentsSearchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        (r.manuscript_title && r.manuscript_title.toLowerCase().includes(term)) ||
        (r.reviewer_full_name && r.reviewer_full_name.toLowerCase().includes(term)) ||
        (r.manuscript_id && r.manuscript_id.toLowerCase().includes(term))
      );
    }

    return (
      <div className="space-y-6 text-left pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 py-2">
          <div className="pl-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">All Assignments</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Track reviewer assignments with status, ranking, and performance indicators.</p>
          </div>
          <div className="flex items-center gap-3 pr-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 shadow-sm transition-colors">
              <input type="checkbox" checked={showRevoked} onChange={(e) => setShowRevoked(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Show Revoked
            </label>
            <Button onClick={() => fetchReviews(true)} disabled={loadingReviews} variant="outline" className="bg-white gap-2 font-bold text-xs h-9 px-4 border-slate-200 rounded-lg shadow-sm">
              <RefreshCw size={14} className={loadingReviews ? 'animate-spin' : ''} /> Refresh
            </Button>
            <Button onClick={() => window.print()} variant="outline" className="bg-white gap-2 font-bold text-xs h-9 px-4 border-slate-200 rounded-lg shadow-sm">
              <Printer size={14} /> Print
            </Button>
            <Button onClick={exportAssignmentsCSV} className="bg-[#1e3a8a] hover:bg-blue-900 text-white gap-2 font-bold text-xs h-9 px-4 rounded-lg shadow-sm border-none">
              <Download size={14} /> Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-2">
          {/* Summary Cards */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500"><ListChecks size={20} /></div>
             <div><p className="text-2xl font-black text-slate-800 leading-none">{total}</p><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total</p></div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500"><Clock size={20} /></div>
             <div><p className="text-2xl font-black text-slate-800 leading-none">{pending}</p><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Pending</p></div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500"><CheckCircle2 size={20} /></div>
             <div><p className="text-2xl font-black text-slate-800 leading-none">{completed}</p><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Completed</p></div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500"><Ban size={20} /></div>
             <div><p className="text-2xl font-black text-slate-800 leading-none">{revoked}</p><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Revoked</p></div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm mx-2">
          {/* Header Action Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 border-b border-slate-100 bg-white relative z-10">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by manuscript, reviewer..."
                className="pl-10 h-10 w-full rounded-xl bg-slate-50/50 border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-indigo-500 shadow-sm"
                value={assignmentsSearchTerm}
                onChange={(e) => setAssignmentsSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
               <select
                 value={assignmentsFilterStatus}
                 onChange={e => setAssignmentsFilterStatus(e.target.value)}
                 className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
               >
                 <option>All Statuses</option>
                 <option>Pending</option>
                 <option>Completed</option>
               </select>
               <div className="text-xs font-bold text-slate-400 whitespace-nowrap pl-2 border-l border-slate-200">{filtered.length} record(s)</div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-x-4 px-6 py-3.5 bg-slate-50/80 border-b border-slate-100 items-center">
            <div className="col-span-4 lg:col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 hover:text-slate-700 cursor-pointer transition-colors">ASSIGNMENT / MANUSCRIPT DETAILS <ChevronsUpDown size={12} className="opacity-50" /></div>
            <div className="col-span-3 lg:col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 hover:text-slate-700 cursor-pointer transition-colors">REVIEWER <ChevronsUpDown size={12} className="opacity-50" /></div>
            <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 hover:text-slate-700 cursor-pointer transition-colors">ASSIGNED <ChevronsUpDown size={12} className="opacity-50" /></div>
            <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 hover:text-slate-700 cursor-pointer transition-colors">DUE DATE <ChevronsUpDown size={12} className="opacity-50" /></div>
            <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 hover:text-slate-700 cursor-pointer transition-colors">STATUS <ChevronsUpDown size={12} className="opacity-50" /></div>
            <div className="col-span-1 border-l border-slate-200 pl-4 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 hover:text-slate-700 cursor-pointer transition-colors">RANK <ChevronsUpDown size={12} className="opacity-50" /></div>
          </div>
          
          <div className="divide-y divide-slate-100 bg-[#FFFFF9]">
            {loadingReviews && allReviews.length === 0 ? (
               <div className="p-12 text-center text-slate-400 font-medium flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
            ) : filtered.length === 0 ? (
               <div className="p-12 text-center text-slate-400 font-medium text-sm">No assignments found.</div>
            ) : (
               filtered.map((r, index) => {
                 const isOverdue = r.due_date && new Date(r.due_date.split('/').reverse().join('-')) < new Date() && r.status !== 'Completed' && r.status !== 'Approved' && r.status !== 'Rejected';
                 return (
                   <div key={r.id || index} className="grid grid-cols-12 gap-x-4 px-6 py-4 hover:bg-slate-50 items-center transition-colors">
                     <div className="col-span-4 lg:col-span-3 space-y-1.5 pr-2">
                        <p className="text-[10px] font-bold text-slate-500">{r.assigned_at ? new Date(r.assigned_at).toLocaleString() : '—'}</p>
                        <p className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-snug">{r.manuscript_title || 'Untitled Manuscript'}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">MS ID: {r.manuscript_id || '—'}</p>
                     </div>
                     <div className="col-span-3 lg:col-span-3 space-y-1">
                        <p className="text-[11px] font-bold text-slate-800">{r.reviewer_full_name || '—'}</p>
                        <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1.5 truncate"><Mail size={12} className="text-slate-400"/> {r.reviewer_email || '—'}</p>
                        <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1.5"><Phone size={12} className="text-slate-400"/> —</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{r.reviewer_id || '—'}</p>
                     </div>
                     <div className="col-span-2 text-[10px] font-bold text-slate-600">
                        {r.assigned_at ? new Date(r.assigned_at).toLocaleString('en-GB') : '—'}
                     </div>
                     <div className={`col-span-1 text-[10px] font-bold flex items-center gap-1 ${isOverdue ? 'text-rose-600' : 'text-slate-600'}`}>
                        {r.due_date || '—'}
                        {isOverdue && <AlertCircle size={12} className="text-amber-500" />}
                     </div>
                     <div className="col-span-1">
                        <Badge variant="outline" className={`border-none tracking-wide text-[9px] font-bold px-2 py-0.5 ${r.status?.toLowerCase() === 'pending' ? 'bg-blue-50 text-blue-600' : r.status?.toLowerCase() === 'revoked' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                           {r.status || 'Pending'}
                        </Badge>
                     </div>
                     <div className="col-span-1 border-l border-slate-100 pl-4 flex items-center justify-between gap-1.5 text-[10px] font-bold text-slate-700">
                        <div className="flex flex-col gap-1 flex-1 pr-1">
                           {(() => {
                              let calculatedRank = '—';
                              if (r.overall_marks !== null && r.overall_marks !== undefined) {
                                 const mark = Number(r.overall_marks);
                                 if (!isNaN(mark)) {
                                    if (mark >= 10) calculatedRank = 'Great';
                                    else if (mark >= 8) calculatedRank = 'Good';
                                    else calculatedRank = 'Not Good';
                                 }
                              }
                              return calculatedRank !== '—' ? (
                                <span className="flex items-center gap-1.5 whitespace-nowrap">
                                  <Medal size={12} className={calculatedRank === 'Great' ? 'text-emerald-500' : calculatedRank === 'Good' ? 'text-blue-500' : 'text-amber-600'}/>
                                  {calculatedRank}
                                </span>
                              ) : r.recommendation ? (
                                <span className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis line-clamp-2" title={r.recommendation}>
                                  <Medal size={12} className="text-slate-400 shrink-0"/>
                                  <span className="truncate">{r.recommendation}</span>
                                </span>
                              ) : '—';
                           })()}
                        </div>
                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700 border border-slate-200 shrink-0">
                                 <MoreVertical size={14} />
                              </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="w-44 bg-white border-slate-100 shadow-xl rounded-xl p-1.5 font-medium text-slate-600">
                              <DropdownMenuItem onClick={() => handleSendReminder(r.reviewer_email || '')} className="focus:bg-amber-50 cursor-pointer text-xs rounded-lg py-2 focus:text-amber-700">
                                 <Bell className="mr-2 h-4 w-4 text-amber-600" /> Send Reminder
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateReviewStatus(r.id, 'Revoked')} className="focus:bg-rose-50 cursor-pointer text-xs rounded-lg py-2 focus:text-rose-700">
                                 <Ban className="mr-2 h-4 w-4 text-rose-600" /> Revoke
                              </DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
                     </div>
                   </div>
                 );
               })
            )}
            
            {filtered.length >= reviewsLimit && (
              <div className="p-4 bg-white border-t border-slate-100 flex justify-center">
                <Button onClick={() => setReviewsLimit(prev => prev + 10)} disabled={loadingReviews} variant="outline" className="text-xs font-bold text-slate-600 border-slate-200 bg-white hover:bg-slate-50 rounded-lg h-9 px-6 shadow-sm">
                  Load More
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleReviewAction = async (action: 'Approved' | 'Rejected') => {
    if (!selectedReview) return;
    setSubmittingReview(true);
    try {
      const updateData: any = { status: action };
      if (adminNote) updateData.notes = adminNote;
      const { error } = await supabase
        .from('assignments')
        .update(updateData)
        .eq('id', selectedReview.id);
      if (error) throw error;
      toast({ title: `Review ${action.toLowerCase()} successfully.` });
      setAllReviews(prev => prev.map(r => r.id === selectedReview.id ? { ...r, status: action } : r));
      setIsReviewModalOpen(false);
      setAdminNote('');
    } catch (e) {
      toast({ title: 'Failed to update review', variant: 'destructive' });
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderReviews = () => {
    const filtered = allReviews.filter(r => {
      if (!reviewsSearchTerm) return true;
      const s = reviewsSearchTerm.toLowerCase();
      return (r.manuscript_title || '').toLowerCase().includes(s)
          || (r.reviewer_full_name || '').toLowerCase().includes(s)
          || (r.reviewer_email || '').toLowerCase().includes(s)
          || (r.manuscript_id || '').toLowerCase().includes(s)
          || (r.reviewer_id || '').toLowerCase().includes(s);
    });

    const pendingCount = allReviews.filter(r => {
      const s = (r.status || '').toLowerCase();
      return s !== 'approved' && s !== 'rejected';
    }).length;

    return (
      <div className="space-y-6 text-left pb-16">
        <div className="flex flex-col md:flex-row justify-between gap-4 py-2">
          <div className="pl-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Approve Reviews</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Review completed assignments and approve or reject reviewer submissions.</p>
          </div>
          <div className="flex items-center gap-3 pr-2">
            {pendingCount > 0 && (
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                {pendingCount} pending review(s)
              </span>
            )}
            <Button onClick={() => fetchReviews(true)} disabled={loadingReviews} variant="outline" size="sm" className="bg-white gap-2 font-bold text-[11px] h-9 px-4 border-slate-200 rounded-md shadow-sm">
              <RefreshCw size={14} className={loadingReviews ? 'animate-spin' : ''} /> Refresh
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {/* Filter Row */}
          <div className="flex items-center gap-4 py-3 border-b border-slate-100 px-6 bg-white">
            <div className="relative w-full max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={reviewsSearchTerm}
                onChange={(e) => setReviewsSearchTerm(e.target.value)}
                placeholder="Search by manuscript or reviewer..."
                className="pl-9 h-9 text-xs border-slate-200 focus-visible:ring-blue-500 rounded-md shadow-sm w-full bg-slate-50/50"
              />
            </div>
            <div className="ml-auto text-xs font-bold text-blue-600">{filtered.length} pending review(s)</div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-x-3 px-6 py-3.5 bg-slate-50/80 border-b border-slate-100 items-center">
            <div className="col-span-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">ASSIGNED AT</div>
            <div className="col-span-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">MANUSCRIPT</div>
            <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">REVIEWER</div>
            <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">RECOMMENDATION</div>
            <div className="col-span-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">MARKS</div>
            <div className="col-span-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">SUBMITTED</div>
            <div className="col-span-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">STATUS</div>
            <div className="col-span-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">ACTIONS</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100 bg-[#FFFFF9]">
            {loadingReviews && allReviews.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium text-sm">No assignments found.</div>
            ) : (
              filtered.slice(0, reviewsLimit).map((r, i) => {
                const rawStatus = (r.status || '').toLowerCase();
                const reviewStatus = (r.review_status || '').toLowerCase();

                // Status badge based on assignment status column
                const statusLabel = r.status || 'Pending';
                const statusStyle =
                  rawStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  rawStatus === 'rejected' ? 'bg-rose-100 text-rose-700' :
                  rawStatus === 'approved' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-600';

                // Format assigned_at
                let assignedDisplay = r.assigned_at || '—';
                if (r.assigned_at) {
                  try {
                    const d = new Date(r.assigned_at);
                    if (!isNaN(d.getTime())) {
                      assignedDisplay = d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    }
                  } catch {}
                }

                return (
                  <div key={i} className="grid grid-cols-12 gap-x-3 px-6 py-4 hover:bg-slate-50 items-center">
                    {/* Assigned At */}
                    <div className="col-span-1">
                      <p className="text-[11px] font-medium text-slate-700 leading-tight">{assignedDisplay}</p>
                    </div>

                    {/* Manuscript */}
                    <div className="col-span-3 space-y-0.5">
                      <h4 className="text-[12px] font-bold text-slate-800 leading-snug line-clamp-2">{r.manuscript_title || 'Untitled'}</h4>
                      {r.manuscript_id && (
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-wide">{r.manuscript_id}</p>
                      )}
                    </div>

                    {/* Reviewer */}
                    <div className="col-span-2 space-y-0.5">
                      <p className="text-[12px] font-semibold text-slate-700 line-clamp-1">{r.reviewer_full_name || '—'}</p>
                      {r.reviewer_id && (
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-wide">{r.reviewer_id}</p>
                      )}
                    </div>

                    {/* Recommendation */}
                    <div className="col-span-2">
                      <span className="text-[11px] font-medium text-slate-600">{r.recommendation || '—'}</span>
                    </div>

                    {/* Marks */}
                    <div className="col-span-1">
                      {r.overall_marks ? (
                        <span className="text-[12px] font-bold text-slate-800">{r.overall_marks}<span className="text-slate-400 font-normal">/10</span></span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>

                    {/* Submitted date */}
                    <div className="col-span-1">
                      <span className="text-[11px] font-medium text-slate-500">{r.submission_date || '—'}</span>
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      <Badge variant="outline" className={`border text-[9px] font-black tracking-wide rounded px-2.5 py-0.5 shadow-sm border-none capitalize ${statusStyle}`}>
                        {statusLabel}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end">
                      <Button
                        size="sm"
                        className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-4 rounded-lg shadow-sm gap-1.5"
                        onClick={() => {
                          setSelectedReview(r);
                          setAdminNote(r.notes || '');
                          setIsReviewModalOpen(true);
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {allReviews.length >= reviewsLimit && (
            <div className="p-4 bg-white border-t border-slate-100 flex justify-center">
              <Button onClick={() => setReviewsLimit(prev => prev + 10)} disabled={loadingReviews} variant="outline" className="text-xs font-bold text-slate-600 border-slate-200 bg-white hover:bg-slate-50 rounded-lg h-9 px-6 shadow-sm">
                Load More
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getReviewerScore = (reviewer: any, manuscript: any) => {
    let score = 0;
    if (!reviewer || !manuscript) return 0;
    if (reviewer.journal === manuscript.journal) score += 50;
    if (reviewer.status && (reviewer.status.toLowerCase() === 'active' || reviewer.status.toLowerCase() === 'accepted')) score += 20;

    const mTitle = (manuscript.title || manuscript.manuscript_title || '').toLowerCase();
    const mArea = (manuscript.raw?.research_field || manuscript.raw?.area_of_research || '').toLowerCase();
    const rArea = (reviewer.area_of_interest || '').toLowerCase();
    
    if (rArea) {
       if (mArea && rArea.includes(mArea)) score += 30;
       const words = mTitle.split(' ').filter((w: string) => w.length > 4);
       words.forEach((w: string) => {
          if (rArea.includes(w)) score += 10;
       });
    }

    return score;
  };

  const handleOpenAssignModal = async (m: any) => {
    setSelectedManuscriptForAssign(m);
    setIsAssignModalOpen(true);
    setLoadingMatches(true);
    const d = new Date(Date.now() + 15 * 86400000);
    const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setAssignForm({ reviewerId: '', dueDate: dateString });
    try {
      // Fetch already-assigned reviewer IDs for this manuscript
      const { data: existingAssignments } = await supabase
        .from('assignments')
        .select('reviewer_id')
        .eq('manuscript_id', m.id);
      const alreadyAssignedIds = (existingAssignments || []).map((a: any) => a.reviewer_id);

      // Fetch all active reviewers then exclude already assigned
      const { data } = await supabase.from('reviewers').select('*').in('status', ['Active', 'Accepted']);
      if (data) {
        const available = data.filter((r: any) => !alreadyAssignedIds.includes(r.id));
        setMatchingReviewers(available);
      }
      // Store existing count on the manuscript object for UI
      setSelectedManuscriptForAssign({ ...m, assignedCount: (existingAssignments || []).length });
    } catch(e) {} finally { setLoadingMatches(false); }
  };

  const handleAssignReviewer = async () => {
    if (!selectedManuscriptForAssign || !assignForm.reviewerId || !assignForm.dueDate) return;
    const reviewer = matchingReviewers.find(r => r.id === assignForm.reviewerId);
    if (!reviewer) return;

    // Check the current assignment count (max 3)
    const { data: existingCount } = await supabase
      .from('assignments')
      .select('id')
      .eq('manuscript_id', selectedManuscriptForAssign.id);
    if ((existingCount || []).length >= 3) {
      toast({ title: 'Limit reached', description: 'A maximum of 3 reviewers can be assigned per manuscript.', variant: 'destructive' });
      return;
    }
    
    setAssigningReviewer(true);
    try {
      const parts = assignForm.dueDate.split('-');
      const formattedDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : assignForm.dueDate;

      const { error } = await supabase.from('assignments').insert({
        assigned_at: new Date().toISOString(),
        reviewer_id: reviewer.id,
        reviewer_full_name: `${reviewer.first_name || ''} ${reviewer.last_name || ''}`.trim(),
        reviewer_email: reviewer.email,
        manuscript_id: selectedManuscriptForAssign.id,
        manuscript_title: selectedManuscriptForAssign.title || selectedManuscriptForAssign.manuscript_title,
        status: 'Pending',
        due_date: formattedDate
      });

      if (error) throw error;
      toast({ title: 'Assigned successfully.' });
      setIsAssignModalOpen(false);
      setSelectedManuscriptForAssign(null);
      fetchReviews(true);
      fetchDashboardData(true);
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to assign reviewer', variant: 'destructive' });
    } finally {
      setAssigningReviewer(false);
    }
  };

  const renderAssign = () => {
    const assignableManuscripts = allManuscripts.filter(m => 
      m.status?.toLowerCase() === 'under review' && 
      (m.title || '').toLowerCase().includes(assignSearchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6 text-left pb-16">
        <div className="flex flex-col md:flex-row justify-between gap-4 py-2">
          <div className="pl-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Assign Work</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Assign reviewers to manuscripts using AI-assisted rank scores.</p>
          </div>
          <div className="flex items-center gap-3 pr-2">
            <Button onClick={() => fetchManuscripts(true)} disabled={loadingManuscripts} variant="outline" size="sm" className="bg-white gap-2 font-bold text-[11px] h-9 px-4 border-slate-200 rounded-md shadow-sm">
              <RefreshCw size={14} className={loadingManuscripts ? 'animate-spin' : ''} /> Refresh
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="flex items-center gap-4 py-3 border-b border-slate-100 px-6 bg-white">
            <div className="relative w-full max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={assignSearchTerm}
                onChange={(e) => setAssignSearchTerm(e.target.value)}
                placeholder="Search manuscripts to assign..."
                className="pl-9 h-9 text-xs border-slate-200 focus-visible:ring-blue-500 rounded-md shadow-sm w-full bg-slate-50/50"
              />
            </div>
            <div className="text-xs font-bold text-slate-400 whitespace-nowrap pl-2">{assignableManuscripts.length} record(s)</div>
          </div>
          
          <div className="grid grid-cols-12 gap-x-4 px-6 py-3.5 bg-slate-50/80 border-b border-slate-100 items-center">
            <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID</div>
            <div className="col-span-7 text-[10px] font-bold text-slate-500 uppercase tracking-widest">MANUSCRIPT DETAILS</div>
            <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">STATUS</div>
            <div className="col-span-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">ACTION</div>
          </div>

          <div className="divide-y divide-slate-100 bg-[#FFFFF9]">
             {loadingManuscripts && allManuscripts.length === 0 ? (
               <div className="p-12 text-center text-slate-400 font-medium flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
             ) : assignableManuscripts.length === 0 ? (
               <div className="p-12 text-center text-slate-400 font-medium text-sm">No available manuscripts.</div>
             ) : (
               assignableManuscripts.map((m, i) => (
                 <div key={i} className="grid grid-cols-12 gap-x-4 px-6 py-4 hover:bg-slate-50 items-center">
                   <div className="col-span-2 text-[9px] font-black text-slate-400 uppercase tracking-wider">{m.id}</div>
                   <div className="col-span-7 space-y-1">
                     <h4 className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-1">{m.title || 'Untitled'}</h4>
                     <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-2">
                       <span className="text-blue-600 truncate max-w-[200px]">{m.journal}</span> | <span className="truncate">{m.author}</span>
                     </p>
                   </div>
                   <div className="col-span-2">
                     <Badge variant="outline" className={`border-none tracking-wide text-[9px] font-bold ${m.status?.toLowerCase() === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-700'}`}>{m.status || 'Submitted'}</Badge>
                   </div>
                   <div className="col-span-1 flex justify-end">
                      <Button
                        size="sm"
                        className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 rounded-lg shadow-sm"
                        onClick={() => handleOpenAssignModal(m)}
                      >
                        Assign
                      </Button>
                   </div>
                 </div>
               ))
             )}
          </div>
        </div>
      </div>
    );
  };

  const renderPlaceholder = (title: string, icon: any) => {
    const IconComponent = icon;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-in zoom-in-95 duration-300">
        <div className="w-24 h-24 bg-slate-50 shadow-inner rounded-[2rem] flex items-center justify-center text-slate-300 mb-4 transform transition-transform hover:scale-110"><IconComponent size={48} strokeWidth={1.5} /></div>
        <div>
          <h3 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-400 tracking-tight">{title}</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-3 font-medium leading-relaxed">Enterprise module is currently synchronizing. Full ERP features will be available shortly.</p>
          <Button variant="outline" className="mt-8 border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 text-xs h-10 px-6 rounded-xl font-bold shadow-sm transition-all" onClick={() => setActiveTab('dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#e2e8f0] overflow-hidden font-sans print:h-auto print:block print:overflow-visible print:bg-white">
      <SEO title="Scholar India Publishers ERP" description="Admin Dashboard" />

      {/* COMPACT Sidebar with Modern Glassmorphism & Gradient */}
      <aside className="w-[260px] bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shadow-2xl z-50 overflow-hidden shrink-0 relative print:hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="p-6 text-left border-b border-white/5 relative z-10 transition-colors hover:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-xl flex-shrink-0 shadow-lg shadow-blue-500/20">S</div>
            <div>
              <h1 className="text-white font-bold text-[15px] tracking-tight leading-none mb-1">Scholar India</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,106,0.8)]"></span>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">ERP CONSOLE</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full custom-scrollbar p-4 space-y-1 relative z-10">
          <div className="mb-5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">Main Navigation</p>
            <NavItem icon={LayoutDashboard} label="Dashboard" id="dashboard" />
            <NavItem icon={FileText} label="Manuscripts" id="manuscripts" />
            <NavItem icon={Users} label="Approve Reviewers" id="reviewers" />
            <NavItem icon={CheckSquare} label="Approve Reviews" id="reviews" />
            <NavItem icon={ListChecks} label="Assign Work" id="assign" />
            <NavItem icon={List} label="Assignments" id="assignments" />
          </div>
          
          <div className="mb-5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">Financials & Publishing</p>
            <NavItem icon={FileCheck} label="Final Submissions" id="final_submissions" />
            <NavItem icon={CreditCard} label="Payments" id="payments" />
            <NavItem icon={Book} label="Books" id="books" />
            <NavItem icon={BookOpen} label="Journals" id="journals" />
            <NavItem icon={Archive} label="Archives" id="archives" />
          </div>

          <div className="mb-5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">Communication</p>
            <NavItem icon={Mail} label="Contact Leads" id="leads" />
            <NavItem icon={Newspaper} label="Newsletter" id="newsletter" />
            <NavItem icon={MessageSquare} label="Messages" id="messages" />
            <NavItem icon={Megaphone} label="Broadcast Popup" id="broadcast" />
          </div>

          <div className="mb-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">System</p>
            <NavItem icon={Calendar} label="Deadlines" id="deadlines" />
            <NavItem icon={BarChart} label="Performance" id="performance" />
            <NavItem icon={History} label="Login Activity" id="activity" />
            <NavItem icon={Users} label="Users" id="users" />
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-slate-950/50 shrink-0 relative z-10 backdrop-blur-md">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-3 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-500/20 rounded-xl transition-all"><LogOut size={16} /> Exit Enterprise System</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative print:overflow-visible print:block print:h-auto">
        {/* Subtle top background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-blue-100/40 blur-[120px] rounded-full pointer-events-none z-0 print:hidden"></div>

        {/* TOP BAR (HIDDEN IF DASHBOARD HOME FOR FULL MATCH) */}
        {activeTab !== 'dashboard' && (
           <header className="h-[76px] bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-8 flex items-center justify-between z-40 shrink-0 shadow-sm transition-all sticky top-0 print:hidden">
             <div className="text-left flex items-center gap-4">
               <div>
                 <h2 className="text-lg font-bold text-slate-800 tracking-tight capitalize">{activeTab.replace('_', ' ')}</h2>
                 <div className="flex items-center gap-2 mt-0.5 uppercase tracking-widest text-slate-400 font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] animate-pulse"></div>
                    <span className="text-[9px]">HQ Online</span>
                 </div>
               </div>
             </div>
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-right pl-2"><p className="text-xs font-bold text-slate-800 leading-none">Global Editor</p><p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Administrator</p></div>
                  <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm ring-2 ring-slate-100">GE</div>
               </div>
             </div>
           </header>
        )}

        <div className={`flex-1 overflow-y-auto p-10 relative z-10 custom-scrollbar print:overflow-visible print:h-auto print:p-0 ${activeTab === 'dashboard' ? 'pt-8' : ''}`}>
           <div className="max-w-[1600px] mx-auto pb-10 print:pb-0">
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'manuscripts' && renderManuscripts()}
              {activeTab === 'reviewers' && renderReviewers()}
              {activeTab === 'reviews' && renderReviews()}
              {activeTab === 'assign' && renderAssign()}
              {activeTab === 'assignments' && renderAssignments()}
              {activeTab === 'final_submissions' && <SubmissionComparison />}
              {activeTab === 'payments' && <AdminPayments />}
              {activeTab === 'books' && <AdminBooks />}
              {activeTab === 'leads' && <AdminContacts />}
              {activeTab === 'newsletter' && <AdminNewsletter />}
              {activeTab === 'deadlines' && <AdminDeadlines />}
              {activeTab === 'performance' && <AdminPerformance />}
              {activeTab === 'activity' && <AdminLogs />}
              {activeTab === 'users' && <AdminUsers />}
              {activeTab === 'journals' && <AdminJournals />}
              {activeTab === 'archives' && <AdminArchives />}
              {/* Placeholders for others while focused on Home RESTORE */}
              {activeTab !== 'dashboard' && activeTab !== 'manuscripts' && activeTab !== 'reviewers' && activeTab !== 'reviews' && activeTab !== 'assign' && activeTab !== 'assignments' && activeTab !== 'final_submissions' && activeTab !== 'payments' && activeTab !== 'books' && activeTab !== 'leads' && activeTab !== 'newsletter' && activeTab !== 'deadlines' && activeTab !== 'performance' && activeTab !== 'activity' && activeTab !== 'users' && activeTab !== 'journals' && activeTab !== 'archives' && renderPlaceholder(activeTab.toUpperCase(), LayoutDashboard)}
           </div>
        </div>
      </main>

      {/* Manuscript Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl p-0 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden gap-0 mt-8 max-h-[90vh]">
          <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
            <DialogTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <FileText className="h-4 w-4" /> Manuscript Details
            </DialogTitle>
          </DialogHeader>

          {selectedManuscript && (
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-[#f8f9fa] rounded-xl p-4 border-none shadow-sm h-full list-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">MANUSCRIPT ID</span>
                <span className="text-sm font-semibold text-slate-800 break-all">{selectedManuscript.id}</span>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 border-none shadow-sm h-full list-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">SUBMITTED DATE</span>
                <span className="text-sm font-semibold text-slate-800">{selectedManuscript.date}</span>
              </div>

              <div className="bg-[#f8f9fa] rounded-xl p-4 border-none shadow-sm h-full list-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">AUTHOR NAME</span>
                <span className="text-sm font-semibold text-slate-800">{selectedManuscript.author}</span>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 border-none shadow-sm h-full list-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">EMAIL</span>
                <span className="text-sm font-semibold text-slate-800">{selectedManuscript.email}</span>
              </div>

              <div className="bg-[#f8f9fa] rounded-xl p-4 border-none shadow-sm h-full list-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">MOBILE</span>
                <span className="text-sm font-semibold text-slate-800">{selectedManuscript.phone}</span>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 border-none shadow-sm h-full list-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">JOURNAL</span>
                <span className="text-sm font-semibold text-slate-800">{selectedManuscript.journal}</span>
              </div>

              <div className="bg-[#f8f9fa] rounded-xl p-4 border-none shadow-sm h-full list-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">MANUSCRIPT TITLE</span>
                <span className="text-sm font-semibold text-slate-800">{selectedManuscript.title}</span>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 border-none shadow-sm h-full list-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">AREA</span>
                <span className="text-sm font-semibold text-slate-800">{selectedManuscript.raw?.research_field || selectedManuscript.raw?.area_of_research || '—'}</span>
              </div>

              <div className="bg-[#f8f9fa] rounded-xl p-4 border-none shadow-sm h-full list-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">DESIGNATION</span>
                <span className="text-sm font-semibold text-slate-800">{selectedManuscript.raw?.designation || '—'}</span>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 border-none shadow-sm h-full list-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">DEPARTMENT</span>
                <span className="text-sm font-semibold text-slate-800">{selectedManuscript.raw?.department || '—'}</span>
              </div>

              <div className="bg-[#f8f9fa] rounded-xl p-4 border-none shadow-sm h-full list-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">ORGANIZATION</span>
                <span className="text-sm font-semibold text-slate-800">{selectedManuscript.raw?.affiliation || selectedManuscript.raw?.institution || '—'}</span>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 border-none shadow-sm h-full list-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">AUTHOR COUNT</span>
                <span className="text-sm font-semibold text-slate-800">{selectedManuscript.raw?.author_count || '1'}</span>
              </div>

              <div className="bg-[#f8f9fa] rounded-xl p-4 border-none shadow-sm h-full list-none md:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">AUTHORS DETAILS</span>
                <span className="text-sm font-semibold text-slate-800 leading-relaxed block">{selectedManuscript.raw?.author_names || '—'}</span>
              </div>

              <div className="bg-[#f8f9fa] rounded-xl p-4 border-none shadow-sm h-full list-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">STATUS</span>
                <span className="text-sm font-semibold text-slate-800">{selectedManuscript.status}</span>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 border-none shadow-sm h-full list-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">PLAGIARISM</span>
                <span className="text-sm font-semibold text-slate-800">{selectedManuscript.raw?.plagiarism_report ? `${selectedManuscript.raw.plagiarism_report}%` : '—'}</span>
              </div>
              
              <div className="bg-[#f8f9fa] rounded-xl p-4 border-none shadow-sm h-full list-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">DOI</span>
                <span className="text-sm font-semibold text-slate-800">{selectedManuscript.raw?.doi || '—'}</span>
              </div>
              
              <div className="bg-[#f8f9fa] rounded-xl p-4 border-none shadow-sm h-full list-none md:col-span-2 bg-gradient-to-r from-blue-50/50 to-transparent border-l-4 border-l-blue-600">
                <a href={selectedManuscript.raw?.file_url || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-3 font-semibold text-blue-700 hover:text-blue-800 transition-colors text-sm underline decoration-blue-200 underline-offset-4 font-sans">
                  <FileText className="h-5 w-5" /> View / Download Manuscript Document
                </a>
              </div>

            </div>
          </div>
          )}

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 sticky bottom-0 z-10 w-full mt-auto">
             <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)} className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 h-9 font-semibold shadow-sm text-[12px] px-6">Close</Button>
             <Button onClick={() => { 
                setIsDetailsModalOpen(false); 
                const rawM = selectedManuscript.raw || {};
                setEditForm({
                   id: selectedManuscript.id,
                   title: rawM.title || rawM.manuscript_title || selectedManuscript.title || '',
                   journal: rawM.journal || selectedManuscript.journal || '',
                   author: rawM.author_name || selectedManuscript.author || '',
                   email: rawM.email || selectedManuscript.email || '',
                   doi: rawM.doi || '',
                   plagiarism: rawM.plagiarism_report || ''
                });
                setTimeout(() => setIsEditModalOpen(true), 150);
             }} className="bg-[#1e40af] hover:bg-blue-900 border-none text-white h-9 font-semibold shadow-sm text-[12px] px-5 gap-2"><Edit className="w-3.5 h-3.5" /> Edit Manuscript</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Manuscript Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl p-0 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden gap-0 mt-8 max-h-[90vh]">
          <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
            <DialogTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Edit className="h-4 w-4" /> Edit Manuscript
            </DialogTitle>
          </DialogHeader>

          <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">Manuscript Title</label>
                <Input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="h-10 text-sm font-medium border-slate-200 shadow-sm rounded-lg text-slate-600 focus-visible:ring-1 focus-visible:ring-blue-600" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">Journal</label>
                <Input value={editForm.journal} onChange={e => setEditForm({...editForm, journal: e.target.value})} className="h-10 text-sm font-medium border-slate-200 shadow-sm rounded-lg text-slate-600 focus-visible:ring-1 focus-visible:ring-blue-600" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">Author Name</label>
                <Input value={editForm.author} onChange={e => setEditForm({...editForm, author: e.target.value})} className="h-10 text-sm font-medium border-slate-200 shadow-sm rounded-lg text-slate-600 focus-visible:ring-1 focus-visible:ring-blue-600" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">Email</label>
                <Input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="h-10 text-sm font-medium border-slate-200 shadow-sm rounded-lg text-slate-600 focus-visible:ring-1 focus-visible:ring-blue-600" />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">DOI</label>
                <Input value={editForm.doi} onChange={e => setEditForm({...editForm, doi: e.target.value})} className="h-10 text-sm font-medium border-slate-200 shadow-sm rounded-lg text-slate-600 focus-visible:ring-1 focus-visible:ring-blue-600" />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">Plagiarism (%)</label>
                <Input value={editForm.plagiarism} onChange={e => setEditForm({...editForm, plagiarism: e.target.value})} placeholder="e.g. 18" className="h-10 text-sm font-medium border-slate-200 shadow-sm rounded-lg text-slate-600 focus-visible:ring-1 focus-visible:ring-blue-600" />
              </div>
              
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-white sticky bottom-0 z-10 w-full mt-auto">
             <Button variant="outline" disabled={submittingEdit} onClick={() => setIsEditModalOpen(false)} className="bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 h-9 font-semibold shadow-sm text-[12px] px-6">Cancel</Button>
             <Button onClick={handleEditSubmit} disabled={submittingEdit} className="bg-[#1e40af] hover:bg-blue-900 border-none text-white h-9 font-semibold shadow-sm text-[12px] px-5 gap-2">
                 {submittingEdit ? <Loader2 size={14} className="animate-spin" /> : "Save Changes"}
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    {selectedReviewer && (
      <Dialog open={isReviewerDetailsModalOpen} onOpenChange={setIsReviewerDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-none shadow-2xl rounded-2xl scrollbar-hide p-0">
          <DialogHeader className="p-8 border-b border-slate-50 bg-slate-50/50 sticky top-0 z-10">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg">
                   <Users size={28} />
                </div>
                <div>
                   <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">{selectedReviewer.first_name} {selectedReviewer.last_name || ''}</DialogTitle>
                   <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1">Reviewer Profile # {selectedReviewer.id}</p>
                </div>
                <div className="ml-auto">
                   <Badge variant="outline" className={`text-[10px] font-black tracking-widest px-4 py-1.5 rounded-full border-none shadow-sm ${selectedReviewer.status?.toLowerCase() === 'active' || selectedReviewer.status?.toLowerCase() === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {selectedReviewer.status || 'Active'}
                   </Badge>
                </div>
             </div>
          </DialogHeader>

          <div className="p-8 space-y-8 text-left">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                   <p className="text-sm font-bold text-slate-700 flex items-center gap-2"><Mail size={14} className="text-blue-500" /> {selectedReviewer.email}</p>
                </div>
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</p>
                   <p className="text-sm font-bold text-slate-700 flex items-center gap-2"><Phone size={14} className="text-emerald-500" /> {selectedReviewer.mobile || selectedReviewer.phone || '-'}</p>
                </div>
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</p>
                   <Badge className="bg-blue-600 text-white border-none font-bold text-[10px]">{selectedReviewer.role || 'Reviewer'}</Badge>
                </div>
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100 md:col-span-2 lg:col-span-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institution</p>
                   <p className="text-sm font-bold text-slate-700 flex items-center gap-2"><Building size={14} className="text-slate-400" /> {selectedReviewer.institution || '-'}</p>
                </div>
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation</p>
                   <p className="text-sm font-bold text-slate-700">{selectedReviewer.designation || '-'}</p>
                </div>
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Journal</p>
                   <p className="text-sm font-bold text-blue-700">{selectedReviewer.journal || '-'}</p>
                </div>
             </div>

             <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-2"><BookOpen size={14} /> Academic Profiles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors bg-white shadow-sm space-y-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase">ORCID ID</p>
                       <p className="text-xs font-bold text-slate-600 flex items-center justify-between">
                          {selectedReviewer.orcid || 'Not provided'}
                          {selectedReviewer.orcid && <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600" onClick={() => window.open(`https://orcid.org/${selectedReviewer.orcid}`, '_blank')}><ExternalLink size={12} /></Button>}
                       </p>
                   </div>
                   <div className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors bg-white shadow-sm space-y-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase">Google Scholar</p>
                       <p className="text-xs font-bold text-slate-600 flex items-center justify-between truncate pr-8">
                          {selectedReviewer.google_scholar || 'Not provided'}
                          {selectedReviewer.google_scholar && <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600" onClick={() => window.open(selectedReviewer.google_scholar, '_blank')}><ExternalLink size={12} /></Button>}
                       </p>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-2"><List size={14} /> Additional Info</h3>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4">
                   <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">State / District</p><p className="text-xs font-bold text-slate-700">{selectedReviewer.state || '-'} / {selectedReviewer.district || '-'}</p></div>
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nationality</p><p className="text-xs font-bold text-slate-700">{selectedReviewer.nationality || '-'}</p></div>
                      <div className="col-span-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Area of Interest</p><p className="text-xs font-bold text-slate-700 leading-relaxed">{selectedReviewer.area_of_interest || '-'}</p></div>
                   </div>
                </div>
             </div>
             
             {selectedReviewer.message_to_editor && (
                <div className="space-y-3">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-2"><MessageSquare size={14} /> Message to Editor</h3>
                   <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 italic text-xs text-slate-600 leading-relaxed">
                      "{selectedReviewer.message_to_editor}"
                   </div>
                </div>
             )}
          </div>
          <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex justify-end gap-3 sticky bottom-0">
             <Button variant="outline" className="text-xs font-bold h-10 px-6 rounded-xl border-slate-200" onClick={() => setIsReviewerDetailsModalOpen(false)}>Close</Button>
             <Button className="text-xs font-bold h-10 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg" onClick={() => { updateReviewerStatus(selectedReviewer.id, 'Active'); setIsReviewerDetailsModalOpen(false); }}>Approve Reviewer</Button>
          </div>
        </DialogContent>
      </Dialog>
   )}

      {/* Review Details Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={(open) => { setIsReviewModalOpen(open); if (!open) setAdminNote(''); }}>
        <DialogContent className="max-w-3xl p-0 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden gap-0 max-h-[90vh]">
          <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
            <DialogTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <FileSearch className="h-4 w-4 text-blue-600" /> Review Details
            </DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Manuscript</p>
                  <p className="text-sm font-bold text-slate-800 leading-snug">{selectedReview.manuscript_title || '—'}</p>
                  {selectedReview.manuscript_id && <p className="text-[9px] font-black text-blue-600 uppercase mt-1">{selectedReview.manuscript_id}</p>}
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reviewer</p>
                  <p className="text-sm font-bold text-slate-800">{selectedReview.reviewer_full_name || '—'}</p>
                  {selectedReview.reviewer_id && <p className="text-[9px] font-black text-blue-600 uppercase mt-1">{selectedReview.reviewer_id}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Overall Marks</p>
                  <p className="text-3xl font-black text-emerald-600">
                    {selectedReview.overall_marks || '—'}
                    {selectedReview.overall_marks && <span className="text-base font-normal text-emerald-400">/10</span>}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Recommendation</p>
                  <p className="text-sm font-bold text-slate-800">{selectedReview.recommendation || '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Importance', value: selectedReview.importance },
                  { label: 'Title feedback', value: selectedReview.title_feedback },
                  { label: 'Abstract feedback', value: selectedReview.abstract_feedback },
                  { label: 'Scientific Correctness', value: selectedReview.scientific_correctness },
                  { label: 'References feedback', value: selectedReview.references_feedback },
                  { label: 'Language Quality', value: selectedReview.language_quality },
                  { label: 'General Comments', value: selectedReview.general_comments },
                  { label: 'Ethical Issues', value: selectedReview.ethical_issues },
                  { label: 'Ethical Details', value: selectedReview.ethical_details },
                  { label: 'Competing Interests', value: selectedReview.competing_interests },
                  { label: 'Plagiarism Suspected', value: selectedReview.plagiarism_suspected },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-semibold text-slate-700">{value || '—'}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700">Admin Note (for approve/reject)</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add your note here..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 sticky bottom-0 z-10">
            <Button onClick={() => handleReviewAction('Approved')} disabled={submittingReview} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-6 rounded-xl gap-2 shadow-sm">
              {submittingReview ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Approve
            </Button>
            <Button onClick={() => handleReviewAction('Rejected')} disabled={submittingReview} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 px-6 rounded-xl gap-2 shadow-sm">
              {submittingReview ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />} Reject
            </Button>
            <Button variant="outline" onClick={() => { setIsReviewModalOpen(false); setAdminNote(''); }} className="font-bold text-xs h-10 px-6 rounded-xl border-slate-200">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Work Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-xl p-0 bg-white border border-slate-100 shadow-2xl rounded-xl overflow-hidden gap-0">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-white">
            <DialogTitle className="flex items-center gap-2 text-[15px] font-bold text-slate-800">
              <UserPlus className="h-5 w-5 text-slate-800" /> Assign Reviewer
            </DialogTitle>
          </DialogHeader>

          <div className="p-8 space-y-7 bg-white">
          {selectedManuscriptForAssign && (
              <div className="p-4 bg-[#f8f9fa] rounded-lg border-none shadow-sm pb-5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">MANUSCRIPT</p>
                <h3 className="text-base font-bold text-slate-800 leading-tight mb-2">{selectedManuscriptForAssign.title || selectedManuscriptForAssign.manuscript_title}</h3>
                <div className="flex items-center gap-3">
                  <p className="text-[11px] font-medium text-slate-500 uppercase">ID: {selectedManuscriptForAssign.id}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    (selectedManuscriptForAssign.assignedCount || 0) >= 3
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-50 text-blue-600'
                  }`}>
                    {selectedManuscriptForAssign.assignedCount || 0}/3 Assigned
                  </span>
                </div>
                {(selectedManuscriptForAssign.assignedCount || 0) >= 3 && (
                  <p className="text-[11px] text-red-600 font-semibold mt-2">⚠ Maximum reviewers already assigned for this manuscript.</p>
                )}
              </div>
            )}

            <div className="space-y-2.5">
              <label className="text-[12px] font-bold text-slate-800">Select Reviewer / Board Member *</label>
              <div className="relative">
                <select 
                  className="w-full h-11 px-4 text-[13px] font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 appearance-none shadow-sm cursor-pointer"
                  value={assignForm.reviewerId}
                  onChange={(e) => setAssignForm({ ...assignForm, reviewerId: e.target.value })}
                  disabled={loadingMatches}
                >
                  <option value="" disabled>— Choose Active Reviewer —</option>
                  {matchingReviewers.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.first_name} {r.last_name || ''} ({r.role || 'Reviewer'}) - {r.journal || 'N/A'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800 font-black pointer-events-none stroke-[3]" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[12px] font-bold text-slate-800">Due Date *</label>
              <div className="relative">
                <Input 
                  type="date" 
                  value={assignForm.dueDate}
                  onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })}
                  className="w-full h-11 px-4 text-[13px] font-medium bg-white border border-slate-200 rounded-lg text-slate-700 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3">
             <Button 
               className="bg-[#2442a8] hover:bg-[#1a3385] text-white font-bold h-10 px-6 rounded-lg text-[13px] shadow-md transition-all gap-2"
               onClick={handleAssignReviewer}
               disabled={assigningReviewer || !assignForm.reviewerId || !assignForm.dueDate || (selectedManuscriptForAssign?.assignedCount || 0) >= 3}
             >
               {assigningReviewer ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check size={16} strokeWidth={3} />} Assign
             </Button>
             <Button variant="outline" onClick={() => setIsAssignModalOpen(false)} className="bg-slate-50 text-slate-700 font-bold border border-slate-200 h-10 px-6 rounded-lg hover:bg-slate-100 transition-colors text-[13px]">Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
