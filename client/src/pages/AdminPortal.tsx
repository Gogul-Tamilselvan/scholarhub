// Forcing refresh by adding this unique ID: FORCE_REFRESH_9999
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  BookOpen, 
  CreditCard, 
  Mail, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  ChevronRight,
  User,
  Phone,
  Clock,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Menu,
  X,
  Bell,
  RefreshCw,
  Printer,
  Download
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

const CACHE_TTL = 300000; // 5 minutes

export default function AdminPortal() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Manuscript Specific States
  const [manuscripts, setManuscripts] = useState<any[]>([]);
  const [loadingManuscripts, setLoadingManuscripts] = useState(false);
  const [manuscriptSearch, setManuscriptSearch] = useState("");
  const [showPublished, setShowPublished] = useState(true);
  const [showRejected, setShowRejected] = useState(true);
  const [selectedJournal, setSelectedJournal] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Assignments / Approve Reviews States
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    (window as any).VERSION = "PORTAL_V2_3";
    fetchDashboardData();
    if (activeTab === "manuscripts") {
      fetchManuscripts();
    }
    if (activeTab === "assignments") {
      fetchAssignments();
    }
  }, [activeTab, manuscriptSearch, showPublished, showRejected, selectedJournal, selectedStatus, assignmentSearch, assignmentStatusFilter]);

  const fetchManuscripts = async () => {
    setLoadingManuscripts(true);
    try {
      let query = supabase.from('manuscripts').select('*').order('submitted_at', { ascending: false });

      if (manuscriptSearch) {
        query = query.or(`manuscript_title.ilike.%${manuscriptSearch}%,author_name.ilike.%${manuscriptSearch}%`);
      }

      if (selectedJournal !== 'all') {
        query = query.ilike('journal', `%${selectedJournal}%`);
      }

      // If checkboxes are unchecked, hide those statuses
      if (!showPublished) query = query.not('status', 'ilike', 'Published');
      if (!showRejected) query = query.not('status', 'ilike', 'Rejected');

      const { data, error } = await query;
      if (error) throw error;
      setManuscripts(data || []);
    } catch(err) { console.error(err); }
    finally { setLoadingManuscripts(false); }
  };

  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    try {
      let query = supabase
        .from('assignments')
        .select('*, reviewers(first_name, last_name, email, designation, institution), manuscripts(manuscript_title, author_name, journal)')
        .order('assigned_at', { ascending: false });

      if (assignmentSearch) {
        query = query.or(
          `manuscripts.manuscript_title.ilike.%${assignmentSearch}%,reviewers.first_name.ilike.%${assignmentSearch}%,reviewers.last_name.ilike.%${assignmentSearch}%`
        );
      }

      if (assignmentStatusFilter !== 'all') {
        query = query.ilike('review_status', `%${assignmentStatusFilter}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAssignments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const updateReviewStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('assignments')
        .update({ review_status: newStatus })
        .eq('id', id);
      if (error) throw error;
      setAssignments(prev =>
        prev.map(a => (a.id === id ? { ...a, review_status: newStatus } : a))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const fetchDashboardData = async (forceRefetch = false) => {
    setLoading(true);
    try {
      const [
        { count: manuscriptsCount },
        { count: reviewersCount },
        { count: assignmentsCount },
        { count: paymentsCount },
        { data: reviewers },
        { data: manuscriptsData },
        { data: assignments }
      ] = await Promise.all([
        supabase.from('manuscripts').select('*', { count: 'exact', head: true }),
        supabase.from('reviewers').select('*', { count: 'exact', head: true }),
        supabase.from('assignments').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('*', { count: 'exact', head: true }),
        supabase.from('reviewers').select('*').order('submitted_at', { ascending: false }).limit(5),
        supabase.from('manuscripts').select('*').order('submitted_at', { ascending: false }).limit(6),
        supabase.from('assignments').select('*, reviewers(first_name, last_name), manuscripts(manuscript_title)').order('assigned_at', { ascending: false }).limit(5)
      ]);

      setDashboardData({
        stats: {
          manuscripts: manuscriptsCount || 0,
          reviewers: reviewersCount || 0,
          assignments: assignmentsCount || 0,
          payments: paymentsCount || 0,
        },
        recentManuscripts: manuscriptsData || [],
        pendingAssignments: assignments || [],
        recentReviewers: reviewers || []
      });
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Redesigned Sidebar */}
      <div className={`bg-[#0f172a] text-slate-300 w-64 transition-all duration-300 ${isSidebarOpen ? '' : '-ml-64'}`}>
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center">
               <LayoutDashboard className="w-5 h-5 text-white" />
             </div>
             <span className="font-bold text-white tracking-tight">SCHOLAR INDIA</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[2px]">Admin Portal v2.3</p>
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'manuscripts', label: 'Manuscripts', icon: FileText },
            { id: 'reviewers', label: 'Reviewers', icon: Users },
            { id: 'assignments', label: 'Assignments', icon: MessageSquare },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'books', label: 'Books', icon: BookOpen },
          ].map(item => (
            <button
              key={item.id}
              onClick={() =&gt; setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                  : 'hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              &lt;item.icon className="w-4 h-4" /&gt;
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
           <div className="flex items-center gap-4">
              <button onClick={() =&gt; setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"&gt;
                {isSidebarOpen ? &lt;X className="w-5 h-5" /&gt; : &lt;Menu className="w-5 h-5" /&gt;}
              &lt;/button&gt;
              &lt;h1 className="text-xl font-bold text-slate-800"&gt;
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              &lt;/h1&gt;
           &lt;/div&gt;
           &lt;div className="flex items-center gap-4"&gt;
              &lt;Button variant="ghost" size="icon" className="relative"&gt;
                &lt;Bell className="w-5 h-5 text-slate-500" /&gt;
                &lt;span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"&gt;&lt;/span&gt;
              &lt;/Button&gt;
              &lt;div className="w-px h-6 bg-slate-200 mx-2"&gt;&lt;/div&gt;
              &lt;Button variant="ghost" className="font-bold text-slate-700" onClick={() =&gt; setLocation("/login")}&gt;
                &lt;LogOut className="w-4 h-4 mr-2" /&gt; Log Out
              &lt;/Button&gt;
           &lt;/div&gt;
        &lt;/header&gt;

        &lt;main className="flex-1 overflow-y-auto p-8"&gt;
          {activeTab === 'dashboard' &amp;&amp; (
            &lt;div className="space-y-8 animate-in fade-in duration-500"&gt;
              {/* Stats Grid */}
              &lt;div className="grid grid-cols-4 gap-6"&gt;
                {[
                  { label: "Total Manuscripts", value: dashboardData?.stats.manuscripts, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Active Reviewers", value: dashboardData?.stats.reviewers, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Pending Assignments", value: dashboardData?.stats.assignments, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Total Payments", value: dashboardData?.stats.payments, icon: CreditCard, color: "text-indigo-600", bg: "bg-indigo-50" }
                ].map((stat, i) =&gt; (
                  &lt;Card key={i} className="p-6 border-none shadow-sm flex items-center gap-4"&gt;
                    &lt;div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}&gt;
                      &lt;stat.icon className={`w-6 h-6 ${stat.color}`} /&gt;
                    &lt;/div&gt;
                    &lt;div&gt;
                      &lt;p className="text-xs font-bold text-slate-400 uppercase tracking-wider"&gt;{stat.label}&lt;/p&gt;
                      &lt;h3 className="text-2xl font-black text-slate-800 mt-0.5"&gt;{stat.value || 0}&lt;/h3&gt;
                    &lt;/div&gt;
                  &lt;/Card&gt;
                ))}
              &lt;/div&gt;

              &lt;div className="grid grid-cols-2 gap-8"&gt;
                {/* Recent Items Lists */}
                &lt;Card className="border-none shadow-sm overflow-hidden"&gt;
                   &lt;div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center"&gt;
                      &lt;h3 className="text-sm font-bold text-slate-800 uppercase"&gt;Recent Manuscripts&lt;/h3&gt;
                      &lt;Button variant="ghost" size="sm" onClick={() =&gt; setActiveTab("manuscripts")}&gt;View All&lt;/Button&gt;
                   &lt;/div&gt;
                   &lt;div className="divide-y divide-slate-100"&gt;
                      {dashboardData?.recentManuscripts.map((m: any) =&gt; (
                        &lt;div key={m.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between"&gt;
                           &lt;div&gt;
                              &lt;h4 className="text-sm font-bold text-slate-800 line-clamp-1"&gt;{m.manuscript_title}&lt;/h4&gt;
                              &lt;p className="text-xs text-slate-500"&gt;{m.author_name}&lt;/p&gt;
                           &lt;/div&gt;
                           &lt;Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100"&gt;{m.status}&lt;/Badge&gt;
                        &lt;/div&gt;
                      ))}
                   &lt;/div&gt;
                &lt;/Card&gt;

                &lt;Card className="border-none shadow-sm overflow-hidden"&gt;
                   &lt;div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center"&gt;
                      &lt;h3 className="text-sm font-bold text-slate-800 uppercase"&gt;Active Assignments&lt;/h3&gt;
                   &lt;/div&gt;
                   &lt;div className="divide-y divide-slate-100"&gt;
                      {dashboardData?.pendingAssignments.map((a: any) =&gt; (
                        &lt;div key={a.id} className="p-4 hover:bg-slate-50 transition-colors"&gt;
                           &lt;h4 className="text-sm font-bold text-slate-800 line-clamp-1"&gt;{a.manuscripts?.manuscript_title}&lt;/h4&gt;
                           &lt;div className="flex items-center justify-between mt-1"&gt;
                              &lt;p className="text-xs text-slate-500"&gt;Reviewer: {a.reviewers?.first_name} {a.reviewers?.last_name}&lt;/p&gt;
                              &lt;p className="text-[10px] font-bold text-amber-600"&gt;Due: {a.due_date}&lt;/p&gt;
                           &lt;/div&gt;
                        &lt;/div&gt;
                      ))}
                   &lt;/div&gt;
                &lt;/Card&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          )}

          {activeTab === 'manuscripts' &amp;&amp; (
            &lt;div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500"&gt;
               &lt;div className="flex justify-between items-end"&gt;
                  &lt;div&gt;
                    &lt;h2 className="text-2xl font-black text-slate-800"&gt;All Manuscripts&lt;/h2&gt;
                    &lt;p className="text-slate-500 text-sm font-medium mt-1"&gt;Manage and track all {manuscripts.length} submissions&lt;/p&gt;
                  &lt;/div&gt;
                  &lt;div className="flex gap-4"&gt;
                    &lt;div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm"&gt;
                       &lt;label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer"&gt;
                          &lt;input type="checkbox" checked={showPublished} onChange={() =&gt; setShowPublished(!showPublished)} className="w-4 h-4 rounded text-indigo-600" /&gt;
                          Show Published
                       &lt;/label&gt;
                       &lt;label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer"&gt;
                          &lt;input type="checkbox" checked={showRejected} onChange={() =&gt; setShowRejected(!showRejected)} className="w-4 h-4 rounded text-indigo-600" /&gt;
                          Show Rejected
                       &lt;/label&gt;
                    &lt;/div&gt;
                    &lt;Button className="bg-indigo-600 hover:bg-indigo-700 font-bold"&gt;
                      &lt;Download className="w-4 h-4 mr-2" /&gt; Export CSV
                    &lt;/Button&gt;
                  &lt;/div&gt;
               &lt;/div&gt;

               &lt;Card className="p-4 border-none shadow-sm bg-white"&gt;
                  &lt;div className="flex gap-4"&gt;
                    &lt;div className="relative flex-1"&gt;
                      &lt;Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /&gt;
                      &lt;Input 
                        placeholder="Search by title, author, or ID..." 
                        className="pl-10 h-11 border-slate-200 focus:ring-indigo-500"
                        value={manuscriptSearch}
                        onChange={(e) =&gt; setManuscriptSearch(e.target.value)}
                      /&gt;
                    &lt;/div&gt;
                    &lt;select 
                      className="h-11 px-4 rounded-md border border-slate-200 text-sm font-semibold bg-white outline-none focus:border-indigo-500"
                      value={selectedJournal}
                      onChange={(e) =&gt; setSelectedJournal(e.target.value)}
                    &gt;
                      &lt;option value="all"&gt;All Journals&lt;/option&gt;
                      &lt;option value="Commerce"&gt;Commerce &amp; Management&lt;/option&gt;
                      &lt;option value="Humanities"&gt;Humanities &amp; Social Sciences&lt;/option&gt;
                    &lt;/select&gt;
                  &lt;/div&gt;
               &lt;/Card&gt;

               &lt;div className="space-y-4"&gt;
                  {loadingManuscripts ? (
                    &lt;div className="flex flex-col items-center justify-center py-20 gap-4"&gt;
                      &lt;RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /&gt;
                      &lt;p className="font-bold text-slate-400"&gt;Syncing with database...&lt;/p&gt;
                    &lt;/div&gt;
                  ) : manuscripts.map((m) =&gt; (
                    &lt;Card key={m.id} className="p-0 border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow"&gt;
                       &lt;div className="flex h-full"&gt;
                          &lt;div className={`w-1.5 ${m.status?.toLowerCase() === 'accepted' ? 'bg-emerald-500' : m.status?.toLowerCase() === 'rejected' ? 'bg-rose-500' : 'bg-blue-500'}`}&gt;&lt;/div&gt;
                          &lt;div className="flex-1 p-5 flex items-start justify-between"&gt;
                             &lt;div className="space-y-3"&gt;
                                &lt;div className="flex items-center gap-2"&gt;
                                   &lt;span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded"&gt;{m.id}&lt;/span&gt;
                                   &lt;Badge variant="outline" className="text-[10px] font-bold border-slate-200"&gt;{m.journal}&lt;/Badge&gt;
                                &lt;/div&gt;
                                &lt;h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors"&gt;{m.manuscript_title}&lt;/h3&gt;
                                &lt;div className="flex flex-wrap gap-x-6 gap-y-2"&gt;
                                   &lt;div className="flex items-center gap-2 text-sm text-slate-600 font-semibold"&gt;
                                      &lt;User className="w-4 h-4 text-slate-400" /&gt; {m.author_name}
                                   &lt;/div&gt;
                                   &lt;div className="flex items-center gap-2 text-sm text-slate-500 font-medium"&gt;
                                      &lt;Mail className="w-4 h-4 text-slate-400" /&gt; {m.email}
                                   &lt;/div&gt;
                                   {m.submitted_at &amp;&amp; (
                                     &lt;div className="flex items-center gap-2 text-sm text-slate-500"&gt;
                                        &lt;Clock className="w-4 h-4 text-slate-400" /&gt; {m.submitted_at}
                                     &lt;/div&gt;
                                   )}
                                &lt;/div&gt;
                             &lt;/div&gt;
                             &lt;div className="flex flex-col items-end justify-between h-full gap-4"&gt;
                                &lt;Badge className={`px-4 py-1.5 text-xs font-bold ${
                                  m.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 
                                  m.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 
                                  'bg-blue-100 text-blue-700'
                                }`}&gt;{m.status}&lt;/Badge&gt;
                                &lt;div className="flex gap-2"&gt;
                                   &lt;Button variant="outline" size="sm" className="font-bold border-slate-200"&gt;Actions&lt;/Button&gt;
                                   &lt;Button size="sm" className="bg-slate-800 hover:bg-black font-bold"&gt;Details&lt;/Button&gt;
                                &lt;/div&gt;
                             &lt;/div&gt;
                          &lt;/div&gt;
                       &lt;/div&gt;
                    &lt;/Card&gt;
                  ))}
               &lt;/div&gt;
            &lt;/div&gt;
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Approve Reviews</h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">
                    {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <button
                  onClick={() => fetchAssignments()}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>

              {/* Filters */}
              <Card className="p-4 border-none shadow-sm bg-white">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search by manuscript title or reviewer name..."
                      className="pl-10 h-11 border-slate-200 focus:ring-indigo-500"
                      value={assignmentSearch}
                      onChange={(e) => setAssignmentSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="h-11 px-4 rounded-md border border-slate-200 text-sm font-semibold bg-white outline-none focus:border-indigo-500"
                    value={assignmentStatusFilter}
                    onChange={(e) => setAssignmentStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </Card>

              {/* Assignment List */}
              <div className="space-y-4">
                {loadingAssignments ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="font-bold text-slate-400">Loading assignments...</p>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                    <AlertCircle className="w-10 h-10" />
                    <p className="font-bold">No assignments found</p>
                    <p className="text-sm">Try adjusting your search or filter</p>
                  </div>
                ) : assignments.map((a) => {
                  const status = (a.review_status || 'pending').toLowerCase();
                  const statusColor =
                    status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    status === 'rejected' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                    'bg-amber-100 text-amber-700 border-amber-200';
                  const barColor =
                    status === 'approved' ? 'bg-emerald-500' :
                    status === 'completed' ? 'bg-blue-500' :
                    status === 'rejected' ? 'bg-rose-500' : 'bg-amber-400';

                  return (
                    <Card key={a.id} className="p-0 border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="flex h-full">
                        <div className={`w-1.5 flex-shrink-0 ${barColor}`} />
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between gap-4">
                            {/* Left: Manuscript + Reviewer info */}
                            <div className="space-y-2 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{a.id}</span>
                                {a.manuscripts?.journal && (
                                  <Badge variant="outline" className="text-[10px] font-bold border-slate-200">{a.manuscripts.journal}</Badge>
                                )}
                              </div>
                              <h3 className="text-base font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                                {a.manuscripts?.manuscript_title || 'Untitled Manuscript'}
                              </h3>
                              <p className="text-xs text-slate-500 font-medium">
                                Author: <span className="font-bold text-slate-700">{a.manuscripts?.author_name || '—'}</span>
                              </p>
                              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1">
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                  Reviewer: {a.reviewers?.first_name} {a.reviewers?.last_name}
                                </div>
                                {a.reviewers?.designation && (
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                    {a.reviewers.designation}
                                  </div>
                                )}
                                {a.due_date && (
                                  <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold">
                                    <Clock className="w-3.5 h-3.5" /> Due: {a.due_date}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right: Status + Actions */}
                            <div className="flex flex-col items-end gap-3 flex-shrink-0">
                              <Badge className={`px-3 py-1 text-xs font-bold border ${statusColor} capitalize`}>
                                {a.review_status || 'Pending'}
                              </Badge>
                              <div className="flex gap-2">
                                <button
                                  disabled={updatingId === a.id || status === 'approved'}
                                  onClick={() => updateReviewStatus(a.id, 'approved')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  disabled={updatingId === a.id || status === 'rejected'}
                                  onClick={() => updateReviewStatus(a.id, 'rejected')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        &lt;/main&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}
