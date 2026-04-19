import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  LogOut, User, FileText, Upload, Mail, Phone, 
  Building, Globe, Award, Calendar, CheckCircle,
  Clock, AlertCircle, Loader2, Download, Send as SendIcon, Lock,
  MessageCircle, Bell, LayoutDashboard, Menu, X, CheckCheck, ListTodo, FileCheck2, Inbox, ChevronRight
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import logoImage from "@assets/Untitled design (1)_1760793768867.png";
import { supabase } from "@/lib/supabase";

interface ReviewerProfile {
  reviewerId: string;
  submittedDate: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: string;
  designation: string;
  areaOfInterest: string;
  journal: string;
  orcid: string;
  googleScholar: string;
  institution: string;
  state: string;
  district: string;
  pinNumber: string;
  nationality: string;
  status: string;
  submittedAt?: string;
}

interface AssignedWork {
  manuscriptId: string;
  title: string;
  journal: string;
  submittedAt: string;
  status: string;
  dueDate?: string;
  manuscriptLink?: string;
  fileUrl?: string;
  reviewSubmitted?: boolean;
  reviewStatus?: string;
  mobile?: string;
  authorName?: string;
}

interface ReviewSubmission {
  selectedManuscriptForReview: string;
  importanceOfManuscript: string;
  titleSuitability: string;
  abstractComprehensive: string;
  scientificCorrectness: string;
  referencesSufficient: string;
  languageQuality: string;
  generalComments: string;
  ethicalIssues: string;
  ethicalIssuesDetails: string;
  competingInterests: string;
  plagiarismSuspected: string;
  plagiarismDetails: string;
  competingInterestDeclaration: boolean;
  overallMarks: number;
  recommendation: string;
}

interface MessageThread {
  manuscriptId: string;
  messages: Array<{
    type: 'reviewer' | 'admin';
    submittedAt: string;
    sender: string;
    message: string;
    isRead?: boolean;
  }>;
  latestMessage: string;
  hasUnread?: boolean;
}

export default function ReviewerDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ReviewerProfile | null>(null);
  const [assignedWorks, setAssignedWorks] = useState<AssignedWork[]>([]);
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [changingPassword, setChangingPassword] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState<any>(null);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const [reviewSubmission, setReviewSubmission] = useState<ReviewSubmission>({
    selectedManuscriptForReview: '',
    importanceOfManuscript: '',
    titleSuitability: '',
    abstractComprehensive: '',
    scientificCorrectness: '',
    referencesSufficient: '',
    languageQuality: '',
    generalComments: '',
    ethicalIssues: '',
    ethicalIssuesDetails: '',
    competingInterests: '',
    plagiarismSuspected: '',
    plagiarismDetails: '',
    competingInterestDeclaration: false,
    overallMarks: 5,
    recommendation: ''
  });

  useEffect(() => {
    const session = localStorage.getItem('reviewerSession');
    if (!session) {
      setLocation('/reviewer-login');
      return;
    }

    try {
      const sessionData = JSON.parse(session);
      const showPopupOnce = !sessionStorage.getItem('popupShownInSession');
      fetchProfileData(sessionData.email, sessionData.reviewerId, showPopupOnce);
      loadMessageCount(sessionData.reviewerId);
    } catch (err) {
      localStorage.removeItem('reviewerSession');
      setLocation('/reviewer-login');
    }

    const pollInterval = setInterval(() => {
      const s = localStorage.getItem('reviewerSession');
      if (s) {
        try {
          const d = JSON.parse(s);
          if (d.email && d.reviewerId) {
            fetchProfileData(d.email, d.reviewerId, false);
            loadMessageCount(d.reviewerId);
          }
        } catch (e) {
          console.error("Error parsing session in poll:", e);
        }
      }
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  const loadMessageCount = async (reviewerId: string) => {
    try {
      const { data: revMsgs } = await supabase.from('reviewer_messages').select('*').eq('reviewer_id', reviewerId);
      const { data: admMsgs } = await supabase.from('admin_replies').select('*').eq('reviewer_id', reviewerId);
      
      const threadMap = new Map<string, any[]>();
      
      (revMsgs || []).forEach(msg => {
        const msId = msg.manuscript_id || 'GENERAL';
        if (!threadMap.has(msId)) threadMap.set(msId, []);
        threadMap.get(msId)!.push({ type: 'reviewer', message: msg.message, submittedAt: msg.submitted_at, isRead: true });
      });
      
      (admMsgs || []).forEach(msg => {
        const msId = msg.manuscript_id || 'GENERAL';
        if (!threadMap.has(msId)) threadMap.set(msId, []);
        threadMap.get(msId)!.push({ type: 'admin', message: msg.reply_message, submittedAt: msg.submitted_at || msg.original_message_date, isRead: true });
      });
      
      const threadsList: MessageThread[] = Array.from(threadMap.entries()).map(([msId, msgs]) => {
        msgs.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
        return {
          manuscriptId: msId,
          messages: msgs,
          latestMessage: msgs.length ? msgs[msgs.length - 1].message : ''
        };
      });

      setUnreadMessageCount(0);
      setThreads(threadsList);
    } catch (err) {
      console.error('Error loading message count:', err);
    }
  };

  const fetchProfileData = async (email: string, reviewerId: string, showPopupOnce: boolean = false) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('reviewers')
        .select('*')
        .eq('email', email)
        .eq('id', reviewerId)
        .single();

      if (profileError || !profileData) {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        handleLogout();
        return;
      }

      const { data: adminMsg } = await supabase
        .from('admin_messages')
        .select('*')
        .eq('active', true)
        .eq('target_role', profileData.role || 'Reviewer')
        .maybeSingle();

      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select('*')
        .eq('reviewer_id', reviewerId);

      setProfile({
        reviewerId: profileData.id,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        email: profileData.email,
        role: profileData.role,
        status: profileData.status || 'Active',
        mobile: profileData.mobile,
        institution: profileData.institution,
        designation: profileData.designation,
        areaOfInterest: profileData.area_of_interest,
        journal: profileData.journal,
        orcid: profileData.orcid,
        googleScholar: profileData.google_scholar,
        submittedDate: profileData.submitted_date,
        nationality: profileData.nationality,
        pinNumber: profileData.pin_number,
        state: profileData.state,
        district: profileData.district
      });

      const formatted = (assignmentsData || []).map((a: any) => ({
        manuscriptId: a.manuscript_id,
        title: a.manuscript_title || '(No title)',
        journal: '',
        status: a.status || 'Pending',
        dueDate: a.due_date,
        manuscriptLink: a.manuscript_link,
        reviewSubmitted: !!a.recommendation || !!a.overall_marks,
        reviewStatus: a.status
      }));
      setAssignedWorks(formatted);

      if (showPopupOnce && adminMsg) {
        setPopupMessage({ title: adminMsg.title, content: adminMsg.content });
        setShowPopup(true);
        sessionStorage.setItem('popupShownInSession', 'true');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('reviewerSession');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    setLocation('/reviewer-login');
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors(['Passwords do not match']);
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.from('reviewers')
        .update({ new_password: passwordForm.newPassword })
        .eq('id', profile?.reviewerId);
        
      if (error) {
        setPasswordErrors([error.message]);
      } else {
        toast({ title: 'Success', description: 'Password changed successfully!' });
        setShowPasswordDialog(false);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
        setPasswordErrors([]);
      }
    } catch (error: any) {
      setPasswordErrors(['Failed to change password']);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const manuscriptId = selectedThread?.manuscriptId || 'GENERAL';
    if (!manuscriptId) return;

    setSendingMessage(true);
    try {
      const submittedAt = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: true
      });

      const { error } = await supabase.from('reviewer_messages').insert({
        reviewer_id: profile?.reviewerId,
        reviewer_name: `${profile?.firstName} ${profile?.lastName}`,
        manuscript_id: manuscriptId,
        message: newMessage,
        submitted_at: submittedAt
      });

      if (!error) {
        toast({ title: 'Success', description: 'Message sent to admin' });
        setNewMessage('');
        loadMessageCount(profile?.reviewerId || '');
      } else {
        toast({ title: 'Error', description: error.message || 'Failed to send message', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    } finally {
      setSendingMessage(false);
    }
  };

  const markMessageAsRead = async (manuscriptId: string) => {
    // Left empty since is_read wasn't strictly configured in current DB layout
  };

  const isDeadlineOver = (dueDate: string): boolean => {
    if (!dueDate) return false;
    try {
      const due = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return due < today;
    } catch {
      return false;
    }
  };

  const pendingWorks = assignedWorks.filter(w => {
    const isCompleted = w.reviewSubmitted || (w.status && w.status.toLowerCase().includes('completed'));
    return !isCompleted && w.status && (w.status.toLowerCase().includes('pending') || w.status.toLowerCase().includes('accepted'));
  });
  
  const completedWorks = assignedWorks.filter(w => w.reviewSubmitted || (w.status && w.status.toLowerCase().includes('completed')));
  
  const generalStatusBadge = (work: AssignedWork) => {
    if (work.reviewSubmitted) return <Badge className="bg-emerald-100 text-emerald-800 border-none font-medium text-[11px]">Completed</Badge>;
    if (isDeadlineOver(work.dueDate || '')) return <Badge className="bg-rose-100 text-rose-800 border-none font-medium text-[11px]">Overdue</Badge>;
    if (work.reviewStatus?.toLowerCase() === 'accepted') return <Badge className="bg-blue-100 text-blue-800 border-none font-medium text-[11px]">Accepted</Badge>;
    return <Badge className="bg-amber-100 text-amber-800 border-none font-medium text-[11px]">Pending Review</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading Portal...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md shadow-xl border-0">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Session Expired</h2>
            <p className="text-slate-500 mb-6">Please login again to access your dashboard.</p>
            <Button onClick={() => setLocation('/reviewer-login')} className="w-full">Return to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assignments', label: 'My Assignments', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadMessageCount },
    { id: 'profile', label: 'My Profile', icon: User }
  ];

  const getTabName = (id: string) => menuItems.find(m => m.id === id)?.label || 'Dashboard';
  const getInitials = () => `${(profile.firstName || 'U').charAt(0)}${(profile.lastName || 'A').charAt(0)}`;

  return (
    <div className="min-h-screen flex bg-[#f8fafc] font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0d162d] text-slate-300 flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 flex items-center gap-3 border-b border-white/10 shrink-0">
          <div className="bg-white rounded p-1 flex items-center justify-center h-10 w-10">
            <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-white font-bold tracking-wide">Scholar India</h2>
            <p className="text-[10px] text-blue-300 uppercase tracking-widest font-semibold mt-0.5">Member Portal</p>
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-4 px-2">Navigation</p>
          <nav className="space-y-1.5">
            {menuItems.map(item => {
              const isActive = currentMenu === item.id;
              return (
                <button 
                  key={item.id}
                  onClick={() => { setCurrentMenu(item.id); setMobileMenuOpen(false); }} 
                  className={`w-full flex justify-between items-center px-4 py-3 text-sm transition-all duration-200 ${isActive ? 'bg-blue-600 text-white font-medium rounded-r-full shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 rounded-lg'}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center shadow-sm">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-5 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 mb-5">
             <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {getInitials()}
             </div>
             <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{profile.firstName} {profile.lastName}</p>
                <p className="text-xs text-slate-400 truncate">{profile.role}</p>
             </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 hover:text-red-300 text-sm font-medium transition-colors w-full px-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Navbar */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-500 p-2 -ml-2" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 hidden sm:block">{getTabName(currentMenu)}</h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">Welcome, {profile.firstName} {profile.lastName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <button className="relative text-slate-500 hover:text-blue-600 transition-colors" onClick={() => setCurrentMenu('messages')}>
               <Bell className="w-5 h-5" />
               {unreadMessageCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border border-white rounded-full" />}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-md">
                 {getInitials()}
              </div>
              <div className="hidden sm:block text-right min-w-0">
                <p className="text-[13px] font-bold text-slate-800">{profile.firstName}</p>
                <p className="text-[11px] text-slate-500 truncate max-w-[120px]">Member / {profile.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* TAB: DASHBOARD */}
          {currentMenu === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <ListTodo className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned</p>
                      <h3 className="text-2xl font-black text-slate-800">{assignedWorks.length}</h3>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Review</p>
                      <h3 className="text-2xl font-black text-slate-800">{pendingWorks.length}</h3>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Completed</p>
                      <h3 className="text-2xl font-black text-slate-800">{completedWorks.length}</h3>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Unread Messages</p>
                      <h3 className="text-2xl font-black text-slate-800">{unreadMessageCount}</h3>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Assignments */}
              <Card className="border-0 shadow-md overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between py-4">
                  <CardTitle className="text-base font-bold text-slate-800">Active Assignments</CardTitle>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-medium" onClick={() => setCurrentMenu('assignments')}>View All</Button>
                </CardHeader>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100 text-left">
                      <tr>
                        <th className="px-6 py-4 whitespace-nowrap">Manuscript</th>
                        <th className="px-6 py-4 whitespace-nowrap">Journal</th>
                        <th className="px-6 py-4 whitespace-nowrap">Due Date</th>
                        <th className="px-6 py-4 whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 whitespace-nowrap text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-sm">
                      {assignedWorks.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                            No assignments found
                          </td>
                        </tr>
                      ) : (
                        assignedWorks.slice(0, 5).map((work, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-bold text-blue-600 block text-sm line-clamp-1">{work.title || 'Untitled'}</span>
                              <span className="text-slate-400 text-xs font-mono block mt-0.5">{work.manuscriptId}</span>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-700">{work.journal}</td>
                            <td className="px-6 py-4 font-medium text-slate-700">{work.dueDate || '-'}</td>
                            <td className="px-6 py-4">
                               {generalStatusBadge(work)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50" onClick={() => setCurrentMenu('assignments')}>
                                Details <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Recent Messages */}
              <Card className="border-0 shadow-md">
                <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between py-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-base font-bold text-slate-800">Recent Messages</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-medium" onClick={() => setCurrentMenu('messages')}>Open Inbox</Button>
                </CardHeader>
                <CardContent className="p-0">
                  {threads.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No recent messages</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                       {threads.slice(0, 3).map((th, idx) => {
                         const lastUserMessage = th.messages[th.messages.length - 1];
                         return (
                           <div key={idx} className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setSelectedThread(th); setCurrentMenu('messages'); }}>
                             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                               <User className="w-5 h-5 text-slate-500" />
                             </div>
                             <div className="min-w-0 flex-1">
                               <div className="flex justify-between items-start mb-0.5">
                                 <p className="text-sm font-bold text-slate-800">Admin <span className="text-xs text-slate-500 font-normal ml-1">({th.manuscriptId})</span></p>
                                 <span className="text-xs text-slate-400">{lastUserMessage?.submittedAt?.split(',')[0]}</span>
                               </div>
                               <p className="text-sm text-slate-600 truncate">{lastUserMessage?.message}</p>
                             </div>
                           </div>
                         );
                       })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB: MY ASSIGNMENTS */}
          {currentMenu === 'assignments' && (
            <div className="max-w-7xl mx-auto">
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-200 py-5">
                  <CardTitle className="text-lg font-bold text-slate-800">All Assignments</CardTitle>
                  <CardDescription>Manage and review your assigned manuscripts</CardDescription>
                </CardHeader>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 text-left">
                      <tr>
                        <th className="px-6 py-4 whitespace-nowrap">Manuscript</th>
                        <th className="px-6 py-4 whitespace-nowrap">Journal</th>
                        <th className="px-6 py-4 whitespace-nowrap">Due Date</th>
                        <th className="px-6 py-4 whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 whitespace-nowrap text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {assignedWorks.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-base">
                            No active assignments.
                          </td>
                        </tr>
                      ) : (
                        assignedWorks.map((work, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-all">
                            <td className="px-6 py-4">
                              <span className="font-bold text-blue-700 block text-sm line-clamp-2 leading-snug">{work.title || 'Untitled'}</span>
                              <span className="text-slate-400 text-xs font-mono inline-block mt-1">{work.manuscriptId}</span>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-700">{work.journal}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className={`font-semibold ${isDeadlineOver(work.dueDate || '') ? 'text-red-600' : 'text-slate-700'}`}>{work.dueDate || 'Not Set'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                               {generalStatusBadge(work)}
                            </td>
                            <td className="px-6 py-4 text-center">
                               <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                                 <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled={!!(work.reviewSubmitted || (work.status && work.status.toLowerCase().includes('completed')))}
                                    className="w-full sm:w-auto text-xs h-8 shadow-sm"
                                    onClick={() => {
                                      const url = work.manuscriptLink || work.fileUrl;
                                      if (url && typeof url === 'string') window.open(url, '_blank');
                                      else toast({ title: "Unavailable", description: "Manuscript file link not found.", variant: "destructive" });
                                    }}
                                  >
                                   <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                                 </Button>
                                 <Button 
                                    size="sm" 
                                    onClick={() => setReviewSubmission({ ...reviewSubmission, selectedManuscriptForReview: work.manuscriptId })}
                                    disabled={!!(work.reviewSubmitted || (work.status && work.status.toLowerCase().includes('completed')))}
                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-xs h-8 shadow-sm"
                                  >
                                   <FileCheck2 className="w-3.5 h-3.5 mr-1.5" /> Submit Review
                                 </Button>
                               </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB: MESSAGES */}
          {currentMenu === 'messages' && (
            <div className="max-w-7xl mx-auto h-[70vh] bg-white rounded-xl shadow-lg border border-slate-200 flex overflow-hidden">
               {/* Messages Sidebar */}
               <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
                  <div className="p-4 border-b border-slate-200 bg-white">
                    <h3 className="font-bold text-slate-800">Inbox</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {threads.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm">No conversations</div>
                    ) : (
                      threads.map((th, idx) => (
                        <button key={idx} onClick={() => { setSelectedThread(th); markMessageAsRead(th.manuscriptId); }} className={`w-full text-left p-4 border-b border-slate-100 hover:bg-white transition-colors ${selectedThread?.manuscriptId === th.manuscriptId ? 'bg-white border-l-4 border-l-blue-600 shadow-sm' : ''}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm text-slate-800">Admin</span>
                            <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded">{th.manuscriptId}</span>
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-1">{(th.messages[th.messages.length - 1]?.message || '').substring(0, 40)}...</p>
                        </button>
                      ))
                    )}
                  </div>
               </div>
               
               {/* Messages Content */}
               <div className="w-2/3 flex flex-col bg-white overflow-hidden">
                 {selectedThread ? (
                   <>
                     <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm z-10">
                       <h3 className="font-bold text-slate-800 flex items-center gap-2"><Inbox className="w-4 h-4 text-blue-600" /> MS: {selectedThread.manuscriptId}</h3>
                     </div>
                     <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                       {selectedThread.messages.map((msg, idx) => (
                         <div key={idx} className={`flex flex-col max-w-[80%] ${msg.type === 'reviewer' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                           <span className="text-[10px] text-slate-400 font-medium mb-1 px-1">{msg.type === 'reviewer' ? 'You' : 'Admin'} • {msg.submittedAt}</span>
                           <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.type === 'reviewer' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                             {msg.message}
                           </div>
                         </div>
                       ))}
                     </div>
                     <div className="p-4 border-t border-slate-200 bg-white">
                       <div className="flex gap-2">
                         <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type your reply here..." className="bg-slate-50 shadow-inner border-slate-200" onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
                         <Button onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()} className="bg-blue-600 hover:bg-blue-700 shadow-md">
                           <SendIcon className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Send</span>
                         </Button>
                       </div>
                     </div>
                   </>
                 ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                     <MessageCircle className="w-12 h-12 mb-4 text-slate-300" />
                     <p>Select a conversation to start messaging</p>
                   </div>
                 )}
               </div>
            </div>
          )}

          {/* TAB: MY PROFILE */}
          {currentMenu === 'profile' && (
            <div className="max-w-4xl mx-auto">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-white border-b border-slate-200 py-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-800">My Profile</CardTitle>
                      <CardDescription>View your registered portal profile details</CardDescription>
                    </div>
                    <Button onClick={() => setShowPasswordDialog(true)} variant="outline" className="shadow-sm">
                      <Lock className="w-4 h-4 mr-2" /> Change Password
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Personal Details</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">Full Name</p>
                          <p className="font-semibold text-slate-800">{profile.firstName} {profile.lastName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">Email / Member ID</p>
                          <p className="font-semibold text-slate-800">{profile.email} <span className="text-slate-400 font-normal">({profile.reviewerId})</span></p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">Mobile Number</p>
                          <p className="font-semibold text-slate-800">{profile.mobile || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">Status & Role</p>
                          <div className="flex gap-2 items-center mt-1">
                             <Badge className={profile.status === 'Active' ? 'bg-green-100 text-green-800 border-none' : 'bg-yellow-100 text-yellow-800 border-none'}>{profile.status}</Badge>
                             <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">{profile.role}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Academic Profile</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">Institution</p>
                          <p className="font-semibold text-slate-800">{profile.institution} <span className="text-slate-500 font-normal">({profile.designation})</span></p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">Journal Assigned</p>
                          <p className="font-semibold text-slate-800">{profile.journal || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">Area of Interest</p>
                          <p className="font-semibold text-slate-800">{profile.areaOfInterest || '-'}</p>
                        </div>
                        <div className="flex gap-6 pt-2">
                           {profile.orcid && (
                             <a href={profile.orcid} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline text-sm flex items-center gap-1"><Globe className="w-4 h-4"/> ORCID Profile</a>
                           )}
                           {profile.googleScholar && (
                             <a href={profile.googleScholar} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline text-sm flex items-center gap-1"><Award className="w-4 h-4"/> Google Scholar</a>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </main>
      </div>

      {/* Review Submission Dialog Modal */}
      <Dialog open={!!reviewSubmission.selectedManuscriptForReview} onOpenChange={(open) => !open && setReviewSubmission({ ...reviewSubmission, selectedManuscriptForReview: '' })}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-slate-200 pb-4 mb-4">
            <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Upload className="w-5 h-5 text-blue-600" /> Submit Peer Review</DialogTitle>
            <DialogDescription>
              Complete your evaluation for Manuscript {reviewSubmission.selectedManuscriptForReview}
            </DialogDescription>
          </DialogHeader>
          
          <form className="space-y-8" onSubmit={async (e) => {
              e.preventDefault();
              if (!reviewSubmission.importanceOfManuscript.trim() || !reviewSubmission.generalComments.trim() || !reviewSubmission.recommendation) {
                toast({ title: 'Error', description: 'Please fill all required fields and select a recommendation', variant: 'destructive' });
                return;
              }
              if (!reviewSubmission.competingInterestDeclaration) {
                toast({ title: 'Error', description: 'You must declare competing interests before submitting.', variant: 'destructive' });
                return;
              }
              setIsSubmittingReview(true);
              try {
                const { error } = await supabase.from('assignments').update({
                  recommendation: reviewSubmission.recommendation,
                  overall_marks: String(reviewSubmission.overallMarks),
                  importance: reviewSubmission.importanceOfManuscript,
                  title_feedback: reviewSubmission.titleSuitability,
                  abstract_feedback: reviewSubmission.abstractComprehensive,
                  scientific_correctness: reviewSubmission.scientificCorrectness,
                  references_feedback: reviewSubmission.referencesSufficient,
                  language_quality: reviewSubmission.languageQuality,
                  general_comments: reviewSubmission.generalComments,
                  ethical_issues: reviewSubmission.ethicalIssues,
                  ethical_details: reviewSubmission.ethicalIssuesDetails,
                  competing_interests: reviewSubmission.competingInterests,
                  plagiarism_suspected: reviewSubmission.plagiarismSuspected,
                  status: 'Completed'
                }).eq('manuscript_id', reviewSubmission.selectedManuscriptForReview)
                  .eq('reviewer_id', profile?.reviewerId);

                if (!error) {
                   toast({ title: 'Success', description: 'Your review has been submitted successfully!' });
                   setReviewSubmission({...reviewSubmission, selectedManuscriptForReview: ''});
                   window.location.reload();
                } else {
                   toast({ title: 'Error', description: error.message || 'Submission failed.', variant: 'destructive' });
                }
              } catch (err) {
                toast({ title: 'Error', description: 'Network error occurred.', variant: 'destructive' });
              } finally {
                setIsSubmittingReview(false);
              }
          }}>
            <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
               <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">Importance of Manuscript *</label>
                  <Textarea placeholder="Rate the importance and relevance..." value={reviewSubmission.importanceOfManuscript} onChange={e => setReviewSubmission({...reviewSubmission, importanceOfManuscript: e.target.value})} className="bg-white" required />
               </div>
               <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">Title Suitability</label>
                  <Textarea placeholder="Comments on title..." value={reviewSubmission.titleSuitability} onChange={e => setReviewSubmission({...reviewSubmission, titleSuitability: e.target.value})} className="bg-white" />
               </div>
               <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">Abstract Comprehensiveness</label>
                  <Textarea placeholder="Is the abstract complete?" value={reviewSubmission.abstractComprehensive} onChange={e => setReviewSubmission({...reviewSubmission, abstractComprehensive: e.target.value})} className="bg-white" />
               </div>
               <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">Scientific Correctness</label>
                  <Textarea placeholder="Methodology, logic, correctness..." value={reviewSubmission.scientificCorrectness} onChange={e => setReviewSubmission({...reviewSubmission, scientificCorrectness: e.target.value})} className="bg-white" />
               </div>
            </div>

            <div className="space-y-3">
               <label className="text-sm font-bold text-slate-700">General Comments to Editor/Author *</label>
               <Textarea placeholder="Provide detailed review comments..." value={reviewSubmission.generalComments} onChange={e => setReviewSubmission({...reviewSubmission, generalComments: e.target.value})} className="min-h-[120px]" required />
            </div>

            <div className="grid md:grid-cols-2 gap-6 bg-amber-50/50 p-6 rounded-xl border border-amber-100">
               <div className="space-y-3">
                 <label className="text-sm font-bold text-slate-700">Overall Rating (1-10)</label>
                 <Input type="number" min="1" max="10" value={reviewSubmission.overallMarks} onChange={e => setReviewSubmission({...reviewSubmission, overallMarks: parseInt(e.target.value) || 0})} className="bg-white" />
               </div>
               <div className="space-y-3">
                 <label className="text-sm font-bold text-slate-700">Final Recommendation *</label>
                 <select className="w-full h-10 border border-slate-200 rounded-md px-3 bg-white text-sm" value={reviewSubmission.recommendation} onChange={e => setReviewSubmission({...reviewSubmission, recommendation: e.target.value})} required>
                    <option value="">Select an option</option>
                    <option value="accept">Accept Submission</option>
                    <option value="minor_revisions">Revisions Required (Minor)</option>
                    <option value="major_revisions">Revisions Required (Major)</option>
                    <option value="reject">Decline Submission</option>
                 </select>
               </div>
            </div>

            <div className="p-4 bg-slate-100 rounded-lg flex items-start gap-3 border border-slate-200">
               <input type="checkbox" id="compete" className="mt-1 w-4 h-4" checked={reviewSubmission.competingInterestDeclaration} onChange={e => setReviewSubmission({...reviewSubmission, competingInterestDeclaration: e.target.checked})} />
               <label htmlFor="compete" className="text-sm text-slate-700 font-medium">I declare that I have evaluated this manuscript strictly ethically, and I have no conflict of interest with the authors.</label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
               <Button type="button" variant="outline" onClick={() => setReviewSubmission({...reviewSubmission, selectedManuscriptForReview: ''})}>Cancel</Button>
               <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmittingReview}>
                 {isSubmittingReview ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <SendIcon className="w-4 h-4 mr-2" />}
                 Submit Review Result
               </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Utilities Dialogs */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {passwordErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 p-3 rounded">
                {passwordErrors.map((e,i)=><p key={i} className="text-sm text-red-600">{e}</p>)}
              </div>
            )}
            <Input type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}/>
            <Input type="password" placeholder="Confirm Password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}/>
            <Button onClick={handleChangePassword} disabled={changingPassword || !passwordForm.newPassword} className="w-full bg-blue-600">Change Password</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent>
          <DialogHeader><DialogTitle>{popupMessage?.title || 'Notice'}</DialogTitle></DialogHeader>
          <div className="py-4"><p className="text-slate-700 whitespace-pre-wrap">{popupMessage?.content}</p></div>
          <Button onClick={() => setShowPopup(false)} className="w-full bg-blue-600">Close</Button>
        </DialogContent>
      </Dialog>

    </div>
  );
}
