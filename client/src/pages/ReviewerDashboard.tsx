import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  LogOut, User, FileText, Upload, Mail, Phone, 
  Building, Globe, Award, Calendar, CheckCircle,
  Clock, AlertCircle, Loader2, Download, Send as SendIcon, Lock,
  MessageCircle, Bell, LayoutDashboard, Menu, X, CheckCheck, ListTodo, FileCheck2, Inbox, ChevronRight,
  Shield, Star, Info, Check, BarChart3
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";
import logoImage from "@assets/Untitled design (1)_1760793768867.png";
import { supabase, supabaseAdmin } from "@/lib/supabase";

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

interface PasswordForm {
  currentPassword: '';
  newPassword: '';
  confirmPassword: '';
}
const triggerEmail = async (endpoint: string, payload: any) => {
  const MAIL_SERVER_URL = "https://scholar-hub-server-seven.vercel.app";
  const MAIL_API_KEY = "scholar_india_mail_secret_2026";
  try {
    const res = await fetch(`${MAIL_SERVER_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": MAIL_API_KEY },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (e) {
    console.error("Mail trigger error:", e);
    return null;
  }
};

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
    const checkAuth = async () => {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const localSession = localStorage.getItem('reviewerSession');

      if (!authSession) {
        if (localSession) handleLogout();
        else setLocation('/reviewer-login');
        return;
      }

      if (localSession) {
        try {
          const sessionData = JSON.parse(localSession);
          const showPopupOnce = !sessionStorage.getItem('popupShownInSession');
          fetchProfileData(sessionData.email, sessionData.reviewerId, showPopupOnce);
          loadMessageCount(sessionData.reviewerId);
        } catch (err) {
          handleLogout();
        }
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') handleLogout();
    });

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
    }, 60000); // 1 minute is enough for background sync

    return () => {
      subscription.unsubscribe();
      clearInterval(pollInterval);
    };
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
        .or(`target_role.eq.All,target_role.eq.${profileData.role || 'Reviewer'}`)
        .order('created_at', { ascending: false })
        .limit(1)
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
        reviewSubmitted: a.status === 'Completed',
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('reviewerSession');
    sessionStorage.clear();
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
      // Update secure Supabase Auth password
      const { error: authError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (authError) throw authError;

      // Update the legacy display password if needed, but not necessary for auth
      const { error: dbError } = await supabase.from('reviewers')
        .update({ new_password: passwordForm.newPassword })
        .eq('id', profile?.reviewerId);
        
      if (dbError) console.error('Error syncing display password:', dbError);

      toast({ title: "Password Updated", description: "Your secure credentials have been updated." });
      setIsChangePasswordOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPasswordErrors(['Failed to change password']);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewSubmission.selectedManuscriptForReview) return;
    if (!reviewSubmission.competingInterestDeclaration) {
      toast({ title: "Required", description: "Please accept the declaration to submit your review.", variant: "destructive" });
      return;
    }
    if (!reviewSubmission.recommendation) {
      toast({ title: "Required", description: "Please select a recommendation.", variant: "destructive" });
      return;
    }

    setIsSubmittingReview(true);
    try {
      const { error, data: updatedRows } = await supabaseAdmin
        .from('assignments')
        .update({
          status: 'Completed',
          recommendation: reviewSubmission.recommendation,
          overall_marks: String(reviewSubmission.overallMarks || 0),
          notes: JSON.stringify(reviewSubmission)
        })
        .eq('reviewer_id', profile?.reviewerId)
        .eq('manuscript_id', reviewSubmission.selectedManuscriptForReview)
        .select('id');

      if (error) throw error;
      if (!updatedRows || updatedRows.length === 0) {
        throw new Error(`No matching assignment found. reviewer_id=${profile?.reviewerId}, manuscript_id=${reviewSubmission.selectedManuscriptForReview}`);
      }

      toast({ 
        title: "Review Submitted", 
        description: "Your review has been successfully recorded. Thank you for your contribution." 
      });

      // Trigger Confirmation Email for Reviewer
      triggerEmail('/send/reviewer-assignment-update', {
        email: profile?.email,
        type: 'COMPLETED',
        details: {
          rName: `${profile?.firstName} ${profile?.lastName}`,
          mID: reviewSubmission.selectedManuscriptForReview,
          mTitle: assignedWorks.find(w => w.manuscriptId === reviewSubmission.selectedManuscriptForReview)?.title || 'Manuscript'
        }
      });

      // Update local state
      setAssignedWorks(prev => prev.map(w => 
        w.manuscriptId === reviewSubmission.selectedManuscriptForReview 
          ? { ...w, reviewSubmitted: true, status: 'Completed' } 
          : w
      ));

      setReviewSubmission({
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
        overallMarks: 50,
        recommendation: ''
      });

    } catch (err: any) {
      toast({ title: "Submission Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmittingReview(false);
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
    <>
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
                              <span className="font-bold text-blue-600 block text-sm line-clamp-1">{work.title || work.manuscriptId || 'Untitled'}</span>
                              {work.manuscriptId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(work.manuscriptId) && (
                                <span className="text-slate-400 text-xs font-mono block mt-0.5">{work.manuscriptId}</span>
                              )}
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
                              <span className="font-bold text-blue-700 block text-sm line-clamp-2 leading-snug">{work.title || work.manuscriptId || 'Untitled'}</span>
                              {work.manuscriptId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(work.manuscriptId) && (
                                <span className="text-slate-400 text-xs font-mono inline-block mt-1">{work.manuscriptId}</span>
                              )}
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

          {/* TAB: MY PROFILE (Redesigned) */}
          {currentMenu === 'profile' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
                <p className="text-slate-500 text-sm">View your profile details and update your password</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Profile Details Card */}
                <Card className="lg:col-span-6 border-0 shadow-sm overflow-hidden">
                  <CardHeader className="bg-white border-b border-slate-50 flex flex-row items-center gap-2 py-4">
                    <User className="w-4 h-4 text-blue-600" />
                    <CardTitle className="text-sm font-bold text-slate-800">Profile Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="w-16 h-16 rounded-full bg-[#1e40af] text-white flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-blue-50">
                          {getInitials()}
                       </div>
                       <div>
                          <h3 className="text-lg font-bold text-slate-800 leading-none mb-1.5">{profile.firstName} {profile.lastName}</h3>
                          <Badge className="bg-blue-100 text-blue-700 border-none font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                            {profile.role}
                          </Badge>
                       </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: 'Reviewer ID', value: profile.reviewerId },
                        { label: 'Email', value: profile.email },
                        { label: 'Mobile', value: profile.mobile || '-' },
                        { label: 'Designation', value: profile.designation || '-' },
                        { label: 'Institution', value: profile.institution || '-' },
                        { label: 'Journal', value: profile.journal || '-' },
                        { label: 'Status', value: profile.status, isStatus: true },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                          <span className="text-xs font-semibold text-slate-400">{item.label}</span>
                          {item.isStatus ? (
                            <Badge className={`${item.value === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} border-none font-bold text-[10px] px-3`}>
                              {item.value}
                            </Badge>
                          ) : (
                            <span className="text-xs font-bold text-slate-700">{item.value}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Change Password Card */}
                <Card className="lg:col-span-6 border-0 shadow-sm overflow-hidden">
                  <CardHeader className="bg-white border-b border-slate-50 flex flex-row items-center gap-2 py-4">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <CardTitle className="text-sm font-bold text-slate-800">Change Password</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                       <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                       <p className="text-[11px] text-blue-800 leading-snug font-medium">
                         Your default password is your Reviewer/Editor ID. Change it to something secure.
                       </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                        <Input 
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          placeholder="Current password" 
                          className="bg-slate-50/50 border-slate-200 h-10" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                        <Input 
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          placeholder="Min 6 characters" 
                          className="bg-slate-50/50 border-slate-200 h-10" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                        <Input 
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          placeholder="Repeat new password" 
                          className="bg-slate-50/50 border-slate-200 h-10" 
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleChangePassword} 
                      disabled={changingPassword}
                      className="w-full bg-[#1e40af] hover:bg-blue-800 text-white font-bold h-10 gap-2 shadow-lg shadow-blue-900/10"
                    >
                      {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      Update Password
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Review Performance Card */}
              <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-50 flex flex-row items-center gap-2 py-4">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <CardTitle className="text-sm font-bold text-slate-800">Review Performance</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Assigned', value: assignedWorks.length, icon: ListTodo, color: 'blue' },
                      { label: 'Completed', value: completedWorks.length, icon: CheckCircle, color: 'emerald' },
                      { label: 'Pending', value: pendingWorks.length, icon: Clock, color: 'amber' },
                      { label: 'Revoked', value: assignedWorks.filter(w => w.status?.toLowerCase() === 'revoked').length, icon: AlertCircle, color: 'rose' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-4 transition-all hover:shadow-md">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          stat.color === 'blue' ? 'bg-blue-100/50 text-blue-600' :
                          stat.color === 'emerald' ? 'bg-emerald-100/50 text-emerald-600' :
                          stat.color === 'amber' ? 'bg-amber-100/50 text-amber-600' :
                          'bg-rose-100/50 text-rose-600'
                        }`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                           <h4 className="text-xl font-black text-slate-800 leading-none mb-1">{stat.value}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Completion Rate</span>
                       <span className="text-xs font-black text-slate-800">
                         {assignedWorks.length > 0 ? Math.round((completedWorks.length / assignedWorks.length) * 100) : 0}%
                       </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                         style={{ width: `${assignedWorks.length > 0 ? (completedWorks.length / assignedWorks.length) * 100 : 0}%` }}
                       />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </main>
      </div>

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

    {/* Submit Review Modal (Redesigned) */}
    <Dialog 
      open={!!reviewSubmission.selectedManuscriptForReview} 
      onOpenChange={(open) => !open && setReviewSubmission({...reviewSubmission, selectedManuscriptForReview: ''})}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl rounded-2xl bg-white">
        <DialogHeader className="p-6 bg-white border-b border-slate-50 sticky top-0 z-20">
          <DialogTitle className="flex items-center gap-2 text-slate-800">
             <FileCheck2 className="w-5 h-5 text-blue-600" /> Submit Review
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
             <Info className="w-5 h-5 text-blue-600 shrink-0" />
             <p className="text-sm text-blue-800 font-bold">
               Manuscript: {assignedWorks.find(w => w.manuscriptId === reviewSubmission.selectedManuscriptForReview)?.title || 'Selected Paper'} 
               <span className="text-blue-600 font-medium ml-2">({reviewSubmission.selectedManuscriptForReview})</span>
             </p>
          </div>

          {/* Part 1: Review Comments */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
              <MessageCircle className="w-4 h-4 text-blue-500" /> Part 1: Review Comments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500">Importance / Relevance</Label>
                <Select value={reviewSubmission.importanceOfManuscript} onValueChange={v => setReviewSubmission({...reviewSubmission, importanceOfManuscript: v})}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500">Language Quality</Label>
                <Select value={reviewSubmission.languageQuality} onValueChange={v => setReviewSubmission({...reviewSubmission, languageQuality: v})}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500">Title Feedback</Label>
              <Textarea 
                placeholder="Comment on the title clarity and accuracy..."
                value={reviewSubmission.titleSuitability}
                onChange={e => setReviewSubmission({...reviewSubmission, titleSuitability: e.target.value})}
                className="bg-slate-50 border-slate-200 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500">Abstract Feedback</Label>
              <Textarea 
                placeholder="Comment on the abstract..."
                value={reviewSubmission.abstractComprehensive}
                onChange={e => setReviewSubmission({...reviewSubmission, abstractComprehensive: e.target.value})}
                className="bg-slate-50 border-slate-200 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500">Scientific Correctness</Label>
              <Select value={reviewSubmission.scientificCorrectness} onValueChange={v => setReviewSubmission({...reviewSubmission, scientificCorrectness: v})}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High Confidence</SelectItem>
                  <SelectItem value="Reliable">Reliable</SelectItem>
                  <SelectItem value="Questionable">Questionable</SelectItem>
                  <SelectItem value="Inaccurate">Inaccurate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500">References Feedback</Label>
              <Textarea 
                placeholder="Comment on references..."
                value={reviewSubmission.referencesSufficient}
                onChange={e => setReviewSubmission({...reviewSubmission, referencesSufficient: e.target.value})}
                className="bg-slate-50 border-slate-200 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500">General Comments</Label>
              <Textarea 
                placeholder="Overall comments and suggestions for the author..."
                value={reviewSubmission.generalComments}
                onChange={e => setReviewSubmission({...reviewSubmission, generalComments: e.target.value})}
                className="bg-slate-50 border-slate-200 min-h-[120px]"
              />
            </div>
          </section>

          {/* Part 2: Ethics & Integrity */}
          <section className="space-y-4 pt-4">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
              <Shield className="w-4 h-4 text-orange-500" /> Part 2: Ethics & Integrity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500">Ethical Issues Identified?</Label>
                <Select value={reviewSubmission.ethicalIssues} onValueChange={v => setReviewSubmission({...reviewSubmission, ethicalIssues: v})}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No">No Issues</SelectItem>
                    <SelectItem value="Yes">Yes, Minor Issues</SelectItem>
                    <SelectItem value="Serious">Yes, Serious Concerns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500">Competing Interests</Label>
                <Select value={reviewSubmission.competingInterests} onValueChange={v => setReviewSubmission({...reviewSubmission, competingInterests: v})}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Yes">Yes (Disclosed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500">Ethical Details (if any)</Label>
              <Textarea 
                placeholder="Describe any ethical concerns..."
                value={reviewSubmission.ethicalIssuesDetails}
                onChange={e => setReviewSubmission({...reviewSubmission, ethicalIssuesDetails: e.target.value})}
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500">Plagiarism Suspected?</Label>
                <Select value={reviewSubmission.plagiarismSuspected} onValueChange={v => setReviewSubmission({...reviewSubmission, plagiarismSuspected: v})}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No">No suspicion</SelectItem>
                    <SelectItem value="Yes">Yes, suspected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
          </section>

          {/* Part 3: Objective Evaluation */}
          <section className="space-y-4 pt-4">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
              <Star className="w-4 h-4 text-emerald-500" /> Part 3: Objective Evaluation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500">Overall Marks (out of 100)</Label>
                <Input 
                  type="number"
                  min="0"
                  max="100"
                  value={reviewSubmission.overallMarks}
                  onChange={e => setReviewSubmission({...reviewSubmission, overallMarks: parseInt(e.target.value) || 0})}
                  className="bg-slate-50 border-slate-200"
                  placeholder="e.g., 75"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500">Recommendation <span className="text-rose-500">*</span></Label>
                <Select value={reviewSubmission.recommendation} onValueChange={v => setReviewSubmission({...reviewSubmission, recommendation: v})}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select recommendation..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Accept">Accept</SelectItem>
                    <SelectItem value="Minor Revision">Minor Revision</SelectItem>
                    <SelectItem value="Major Revision">Major Revision</SelectItem>
                    <SelectItem value="Reject">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Part 4: Declaration */}
          <section className="space-y-4 pt-4">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-purple-500" /> Part 4: Declaration
            </h3>
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <Checkbox 
                id="declaration" 
                checked={reviewSubmission.competingInterestDeclaration}
                onCheckedChange={(checked) => setReviewSubmission({...reviewSubmission, competingInterestDeclaration: !!checked})}
                className="mt-1"
              />
              <Label htmlFor="declaration" className="text-xs text-slate-600 leading-relaxed font-medium">
                I declare that I have reviewed this manuscript impartially and have no undisclosed conflict of interest. 
                The review is my own work and reflects my honest academic judgment.
              </Label>
            </div>
          </section>
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 sticky bottom-0 z-20">
          <Button variant="ghost" onClick={() => setReviewSubmission({...reviewSubmission, selectedManuscriptForReview: ''})} className="font-bold text-slate-500">Cancel</Button>
          <Button 
            onClick={handleSubmitReview} 
            disabled={isSubmittingReview}
            className="bg-[#1e40af] hover:bg-blue-800 text-white font-bold px-8 shadow-lg shadow-blue-900/10 gap-2"
          >
            {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
