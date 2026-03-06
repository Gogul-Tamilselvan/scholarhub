import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  LogOut, User, FileText, Upload, BookOpen, Mail, Phone, 
  Building, MapPin, Globe, Award, Calendar, CheckCircle, CheckCheck,
  Clock, AlertCircle, Loader2, Download, Send as SendIcon, Lock, MessageSquare, Search, Zap, Menu, X
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

interface Profile {
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
  reviewSubmitted?: boolean;
  reviewStatus?: string;
  mobile?: string;
  authorName?: string;
}

interface MessageThread {
  manuscriptId: string;
  messages: Array<{
    type: 'reviewer' | 'admin';
    submittedAt: string;
    sender: string;
    message: string;
  }>;
  latestMessage: string;
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
  competingInterestDeclaration: boolean;
  overallMarks: number;
}

function UnifiedPortalDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assignedWorks, setAssignedWorks] = useState<AssignedWork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [manuscripts, setManuscripts] = useState<any[]>([]);
  const [currentMenu, setCurrentMenu] = useState('profile');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [changingPassword, setChangingPassword] = useState(false);
  const [popupMessage, setPopupMessage] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [reviewerMessages, setReviewerMessages] = useState<Record<string, string>>({});
  const [sendingMessage, setSendingMessage] = useState<Record<string, boolean>>({});
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
    competingInterestDeclaration: false,
    overallMarks: 5
  });
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [idSearch, setIdSearch] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [mobileSearch, setMobileSearch] = useState('');
  const [filteredManuscripts, setFilteredManuscripts] = useState<any[]>([]);
  const [manuscriptsLoading, setManuscriptsLoading] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect if user is Reviewer or Editor/Board Member
  const isReviewer = profile?.role?.toLowerCase() === 'reviewer';
  const isEditor = profile?.role?.toLowerCase().includes('editor') || profile?.role?.toLowerCase().includes('board');

  useEffect(() => {
    const sessionStr = localStorage.getItem('reviewerSession');
    if (!sessionStr) {
      setLocation('/reviewer-login');
      return;
    }
    const session = JSON.parse(sessionStr);
    const popupShownInSession = sessionStorage.getItem('popupShownInSession');
    fetchProfileData(session.email, session.reviewerId, !popupShownInSession);
    loadMessageCount(session.reviewerId);
    loadMessageThreads(session.reviewerId);
    if (isEditor) {
      loadManuscripts();
      loadPerformanceMetrics();
      loadCalendarData();
    }
    const pollInterval = setInterval(() => {
      fetchProfileData(session.email, session.reviewerId, false);
    }, 15000);
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    let filtered = manuscripts;
    if (idSearch.trim()) {
      filtered = filtered.filter(m => 
        m['Manuscript ID']?.toUpperCase().includes(idSearch.toUpperCase())
      );
    }
    if (authorSearch.trim()) {
      filtered = filtered.filter(m => 
        m['First Author Name']?.toLowerCase().includes(authorSearch.toLowerCase()) ||
        m['Email']?.toLowerCase().includes(authorSearch.toLowerCase())
      );
    }
    if (mobileSearch.trim()) {
      filtered = filtered.filter(m => 
        m['Mobile']?.includes(mobileSearch)
      );
    }
    setFilteredManuscripts(filtered);
  }, [idSearch, authorSearch, mobileSearch, manuscripts]);

  const loadMessageCount = async (reviewerId: string) => {
    try {
      const response = await fetch(`/api/reviewer/message-threads?reviewerId=${reviewerId}`);
      const data = await response.json();
      // Count only unread messages (latest message from admin = unread by reviewer)
      const unreadCount = data.threads?.reduce((count: number, thread: any) => {
        if (thread.messages && thread.messages.length > 0) {
          const latestMessage = thread.messages[thread.messages.length - 1];
          // Unread if last message is from admin (reviewer hasn't replied yet)
          if (latestMessage?.type === 'admin') {
            return count + 1;
          }
        }
        return count;
      }, 0) || 0;
      setUnreadMessageCount(unreadCount);
    } catch (err) {
      console.error('Error loading message count:', err);
    }
  };

  const loadMessageThreads = async (reviewerId: string) => {
    try {
      const response = await fetch(`/api/reviewer/message-threads?reviewerId=${reviewerId}`);
      const data = await response.json();
      setMessageThreads(data.threads || []);
    } catch (err) {
      console.error('Error loading message threads:', err);
    }
  };

  const loadPerformanceMetrics = async () => {
    try {
      setPerformanceLoading(true);
      const response = await fetch('/api/admin/reviewer-performance');
      const data = await response.json();
      if (data.success) {
        setPerformanceMetrics(data.metrics || []);
      }
    } catch (err) {
      console.error('Error loading performance metrics:', err);
    } finally {
      setPerformanceLoading(false);
    }
  };

  const loadCalendarData = async () => {
    try {
      setCalendarLoading(true);
      const response = await fetch('/api/admin/deadline-calendar');
      const data = await response.json();
      if (data.success) {
        setCalendarData(data.calendarData || []);
      }
    } catch (err) {
      console.error('Error loading calendar:', err);
    } finally {
      setCalendarLoading(false);
    }
  };

  const fetchProfileData = async (email: string, reviewerId: string, showPopupOnce: boolean = false) => {
    try {
      // Get role from session for popup message fetch
      const sessionStr = localStorage.getItem('reviewerSession');
      const session = sessionStr ? JSON.parse(sessionStr) : {};
      const userRole = session.role || 'Reviewer';
      
      const [profileRes, popupRes] = await Promise.all([
        fetch('/api/reviewer-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, reviewerId })
        }),
        fetch(`/api/admin/popup-message?role=${userRole}`)
      ]);
      const result = await profileRes.json();
      const popupData = await popupRes.json();
      if (profileRes.ok && result.success) {
        setProfile(result.profile);
        setAssignedWorks(result.assignedWorks || []);
        if (showPopupOnce && popupData.success && popupData.message) {
          setPopupMessage(popupData.message);
          setShowPopup(true);
          sessionStorage.setItem('popupShownInSession', 'true');
        }
      } else {
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({ title: "Error", description: "Unable to load profile data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadManuscripts = async () => {
    try {
      setManuscriptsLoading(true);
      const response = await fetch('/api/manuscripts-all');
      const data = await response.json();
      if (data.success && data.manuscripts) {
        setManuscripts(data.manuscripts);
        setFilteredManuscripts(data.manuscripts);
      }
    } catch (err) {
      console.error('Error loading manuscripts:', err);
      toast({ title: 'Error', description: 'Failed to load manuscripts', variant: 'destructive' });
    } finally {
      setManuscriptsLoading(false);
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
      const response = await fetch('/api/reviewer/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reviewerId: profile?.reviewerId, 
          email: profile?.email,
          newPassword: passwordForm.newPassword 
        })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Success', description: 'Password changed successfully!' });
        setShowPasswordDialog(false);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
        setPasswordErrors([]);
      } else {
        setPasswordErrors(data.errors || [data.message]);
      }
    } catch (error: any) {
      setPasswordErrors(['Failed to change password']);
    } finally {
      setChangingPassword(false);
    }
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

  const getStatusBadge = (status: string, dueDate?: string) => {
    if (dueDate && isDeadlineOver(dueDate)) {
      return <Badge className="bg-gradient-to-r from-red-100 to-orange-100 text-red-800 dark:from-red-900/40 dark:to-orange-900/40 dark:text-red-300 border border-red-300 dark:border-red-700/50">⚠️ Deadline Over</Badge>;
    }
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved') || statusLower.includes('active')) {
      return <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 dark:from-emerald-900/40 dark:to-green-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">✓ {status}</Badge>;
    } else if (statusLower.includes('process') || statusLower.includes('pending')) {
      return <Badge className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 dark:from-amber-900/40 dark:to-yellow-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">⟳ {status}</Badge>;
    } else if (statusLower.includes('rejected')) {
      return <Badge className="bg-gradient-to-r from-rose-100 to-red-100 text-rose-800 dark:from-rose-900/40 dark:to-red-900/40 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50">✕ {status}</Badge>;
    }
    return <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/40 dark:to-indigo-900/40 dark:text-blue-300 border border-blue-300 dark:border-blue-700/50">{status}</Badge>;
  };

  // Get dynamic menu items based on role
  const getMenuItems = (): Array<{ id: string; label: string; icon: any; disabled?: boolean }> => {
    const baseItems = [{ id: 'profile', label: 'Profile', icon: User }];
    if (isReviewer) {
      return [
        ...baseItems,
        { id: 'assignments', label: 'Assignments', icon: FileText },
        { id: 'messages', label: `Messages${unreadMessageCount > 0 ? ` (${unreadMessageCount})` : ''}`, icon: Mail },
        { id: 'review-submit', label: 'Submit Review', icon: Upload, disabled: !!(profile?.status && profile.status.toLowerCase() !== 'active') || assignedWorks.filter(w => !w.reviewSubmitted && w.status && w.status.toLowerCase().includes('pending')).length === 0 }
      ];
    } else {
      return [
        ...baseItems,
        { id: 'track', label: 'Manuscripts', icon: BookOpen },
        { id: 'performance', label: 'Performance', icon: Award },
        { id: 'deadlines', label: 'Deadlines', icon: Calendar },
        { id: 'messages', label: `Messages${unreadMessageCount > 0 ? ` (${unreadMessageCount})` : ''}`, icon: MessageSquare }
      ];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Session Expired</h2>
              <p className="text-gray-600 mb-4">Please login again to access your dashboard.</p>
              <Button onClick={() => setLocation('/reviewer-login')}>Go to Login</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={`${isReviewer ? 'Reviewer' : 'Editor'} Dashboard - Scholar India Publishers`} description="Access your portal dashboard." />
      <Header />
      
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{popupMessage?.title || 'Important Message'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 whitespace-pre-wrap">{popupMessage?.content}</p>
          </div>
          <Button onClick={() => setShowPopup(false)} className="w-full">Close</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Create a strong password (8+ chars, uppercase, lowercase, number, special char)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {passwordErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                {passwordErrors.map((err, idx) => <p key={idx} className="text-sm text-red-600">{err}</p>)}
              </div>
            )}
            <Input type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
            <Input type="password" placeholder="Confirm Password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} />
            <Button onClick={handleChangePassword} disabled={changingPassword || !passwordForm.newPassword} className="w-full">
              {changingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Change Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <main className="flex-1 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/30 dark:to-background py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {(profile.firstName || 'U').charAt(0)}{(profile.lastName || 'A').charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent dark:from-blue-100 dark:to-blue-300">
                  Welcome back, {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-blue-600 dark:text-blue-300 font-medium">
                  {profile.role} • {profile.journal}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPasswordDialog(true)} className="border-blue-300 hover-elevate">
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {profile.status && profile.status.toLowerCase() !== 'active' && isReviewer && (
            <Card className="mb-6 border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-lg text-yellow-900 dark:text-yellow-100 mb-2">Application Under Review</h3>
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm leading-relaxed">
                      Your reviewer application is being reviewed by our Managing Editor. We'll notify you once approved, and you'll gain access to all features.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-6 max-w-full flex-col md:flex-row">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center gap-2 p-2 border rounded-lg border-gray-300 dark:border-gray-600"
              data-testid="button-mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span className="font-medium">Menu</span>
            </button>

            {/* Sidebar */}
            <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 dark:from-blue-950 dark:via-blue-900 dark:to-slate-900 rounded-xl border-2 border-blue-700 dark:border-blue-600 shadow-xl`}>
              <div className="px-6 py-5 bg-gradient-to-r from-blue-900 to-blue-800 border-b-2 border-yellow-400">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
                    <span className="text-blue-900 font-bold text-lg">SIP</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{isReviewer ? 'Reviewer' : 'Editor'} Portal</p>
                    <p className="text-blue-200 text-xs">{profile.role}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 px-4 py-4">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => !item.disabled && setCurrentMenu(item.id)}
                      disabled={item.disabled}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left border-l-4 ${
                        currentMenu === item.id
                          ? 'bg-gradient-to-r from-blue-500/20 to-transparent border-l-yellow-400 text-white shadow-lg'
                          : item.disabled
                          ? 'border-l-blue-700 text-blue-300 opacity-50 cursor-not-allowed'
                          : 'border-l-blue-700 text-blue-100 hover:text-white hover:bg-blue-800/30'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-blue-200 dark:border-blue-900 shadow-lg p-6 overflow-y-auto max-h-[calc(100vh-180px)]">
              {currentMenu === 'profile' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-300/50 dark:from-blue-900/40 dark:to-blue-800/20 dark:border-blue-600/50 rounded-xl p-4 text-center">
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">Status</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{profile.status}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-300/50 dark:from-purple-900/40 dark:to-purple-800/20 dark:border-purple-600/50 rounded-xl p-4 text-center">
                      <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase mb-2">Role</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{profile.role || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-300/50 dark:from-emerald-900/40 dark:to-emerald-800/20 dark:border-emerald-600/50 rounded-xl p-4 text-center">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2">Journal</p>
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{profile.journal || 'N/A'}</p>
                    </div>
                  </div>

                  <Card className="shadow-xl border-2 border-blue-200 dark:border-blue-800 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white rounded-none">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="bg-blue-400/30 p-2 rounded-lg">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        Your Profile
                      </CardTitle>
                      <CardDescription className="text-blue-100 mt-2">
                        Complete information registered with Scholar India Publishers
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          {[
                            { icon: Award, label: 'Reviewer/Editor ID', value: profile.reviewerId },
                            { icon: User, label: 'Full Name', value: `${profile.firstName} ${profile.lastName}` },
                            { icon: Mail, label: 'Email', value: profile.email },
                            { icon: Phone, label: 'Mobile', value: profile.mobile || 'Not provided' },
                            { icon: BookOpen, label: 'Designation', value: profile.designation },
                            { icon: Building, label: 'Institution', value: profile.institution }
                          ].map((item, idx) => {
                            const Icon = item.icon;
                            return (
                              <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600/50 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{item.value}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="space-y-4">
                          {[
                            { icon: BookOpen, label: 'Area of Interest', value: profile.areaOfInterest },
                            { icon: Globe, label: 'ORCID ID', value: profile.orcid ? <a href={profile.orcid} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">{profile.orcid}</a> : 'Not provided' },
                            { icon: Award, label: 'Google Scholar', value: profile.googleScholar ? <a href={profile.googleScholar} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">Profile</a> : 'Not provided' }
                          ].map((item, idx) => {
                            const Icon = item.icon;
                            return (
                              <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600/50 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{item.value}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {isReviewer && currentMenu === 'assignments' && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Assigned Works
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      {assignedWorks.length} manuscript(s) assigned to you for review
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-2">Total Assigned</p>
                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{assignedWorks.length}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase mb-2">Completed</p>
                        <p className="text-3xl font-bold text-green-700 dark:text-green-300">{assignedWorks.filter(w => w.reviewStatus && (w.reviewStatus.toLowerCase() === 'accepted' || w.status?.toLowerCase().includes('completed') || w.status?.toLowerCase().includes('submitted'))).length}</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase mb-2">Pending</p>
                        <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{assignedWorks.filter(w => !w.reviewSubmitted && w.status && w.status.toLowerCase().includes('pending')).length}</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 mb-6" />
                    {assignedWorks.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Assigned or Pending Work</h3>
                        <p className="text-gray-500">You don't have any assigned or pending work at your end.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {assignedWorks.map((work, index) => (
                          <div key={index} className="border border-blue-200 dark:border-blue-700/50 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
                            <div className="grid grid-cols-1 gap-3">
                              <div className="flex flex-wrap justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-mono text-xs font-semibold text-blue-600 mb-1">{work.manuscriptId}</p>
                                  <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">{work.title || '(No title)'}</p>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  {work.status?.toLowerCase().includes('pending') && !work.reviewSubmitted && (
                                    <>
                                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={async () => {
                                        const session = JSON.parse(localStorage.getItem('reviewerSession') || '{}');
                                        await fetch('/api/assignment/accept', {
                                          method: 'POST',
                                          headers: {'Content-Type': 'application/json'},
                                          body: JSON.stringify({reviewerId: session.reviewerId, manuscriptId: work.manuscriptId})
                                        });
                                        window.location.reload();
                                      }} data-testid={`button-accept-${work.manuscriptId}`}>Accept</Button>
                                      <Button size="sm" variant="outline" onClick={async () => {
                                        const session = JSON.parse(localStorage.getItem('reviewerSession') || '{}');
                                        await fetch('/api/assignment/reject', {
                                          method: 'POST',
                                          headers: {'Content-Type': 'application/json'},
                                          body: JSON.stringify({reviewerId: session.reviewerId, manuscriptId: work.manuscriptId})
                                        });
                                        window.location.reload();
                                      }} data-testid={`button-reject-${work.manuscriptId}`}>Reject</Button>
                                    </>
                                  )}
                                  {work.manuscriptLink && (work.reviewStatus && work.reviewStatus.toLowerCase() === 'accepted' || JSON.parse(localStorage.getItem('assignmentStatus-' + work.manuscriptId) || '{"status":"pending"}').status === 'accepted') && (
                                    <a href={work.manuscriptLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium" data-testid={`link-download-${work.manuscriptId}`}>
                                      <Download className="w-3 h-3" />
                                      Download
                                    </a>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</p>
                                  <p className="font-bold text-red-600 dark:text-red-400">{work.dueDate || 'Not set'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
                                  {work.reviewStatus && work.reviewStatus.toLowerCase() === 'accepted' ? (
                                    <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                                  ) : work.reviewSubmitted ? (
                                    <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>
                                  ) : (
                                    getStatusBadge(work.status, work.dueDate)
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Journal</p>
                                  <p className="text-gray-900 dark:text-gray-100">{work.journal || '-'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {isReviewer && currentMenu === 'messages' && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Messages with Admin
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">Send a message to admin:</p>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Your message to admin..." value={reviewerMessages['GENERAL'] || ''} onChange={(e) => setReviewerMessages({...reviewerMessages, 'GENERAL': e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm" />
                        <Button size="sm" onClick={async () => {
                          if (!reviewerMessages['GENERAL']?.trim()) return;
                          setSendingMessage({...sendingMessage, 'GENERAL': true});
                          try {
                            const sessionStr = localStorage.getItem('reviewerSession');
                            const session = sessionStr ? JSON.parse(sessionStr) : {};
                            const response = await fetch('/api/reviewer/send-message', {
                              method: 'POST',
                              headers: {'Content-Type': 'application/json'},
                              body: JSON.stringify({
                                reviewerId: session.reviewerId,
                                manuscriptId: 'GENERAL',
                                message: reviewerMessages['GENERAL']
                              })
                            });
                            if (response.ok) {
                              setReviewerMessages({...reviewerMessages, 'GENERAL': ''});
                              toast({title: 'Success', description: 'Message sent to admin'});
                              loadMessageThreads(session.reviewerId);
                            }
                          } catch (err) {
                            toast({title: 'Error', description: 'Failed to send message', variant: 'destructive'});
                          } finally {
                            setSendingMessage({...sendingMessage, 'GENERAL': false});
                          }
                        }} disabled={sendingMessage['GENERAL'] || !reviewerMessages['GENERAL']?.trim()}>Send</Button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Conversations ({messageThreads.length})</h4>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          {messageThreads.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>No messages yet</p>
                            </div>
                          ) : (
                            messageThreads.map((thread, idx) => (
                              <button key={idx} onClick={() => setSelectedThread(thread)} className={`w-full p-4 text-left border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedThread?.manuscriptId === thread.manuscriptId ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}>
                                <p className="font-medium text-gray-900 dark:text-gray-100">MS: {thread.manuscriptId}</p>
                                <p className="text-xs text-gray-500 mt-1">{thread.messages?.length || 0} messages</p>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        {selectedThread ? (
                          <>
                            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">MS: {selectedThread.manuscriptId}</h4>
                              {selectedThread.readByBoth && (
                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
                                  <CheckCheck className="w-4 h-4" />
                                  <span>Read</span>
                                </div>
                              )}
                            </div>
                            <div className="max-h-[250px] overflow-y-auto p-4 space-y-3" onMouseEnter={() => {
                              if (selectedThread && !selectedThread.readByBoth) {
                                const sessionStr = localStorage.getItem('reviewerSession');
                                const session = sessionStr ? JSON.parse(sessionStr) : {};
                                fetch('/api/reviewer/message-read', {
                                  method: 'POST',
                                  headers: {'Content-Type': 'application/json'},
                                  body: JSON.stringify({reviewerId: session.reviewerId, manuscriptId: selectedThread.manuscriptId})
                                }).catch(e => console.error('Error marking as read:', e));
                              }
                            }}>
                              {selectedThread.messages?.map((msg, idx) => (
                                <div key={idx} className={`p-3 rounded-lg max-w-[85%] ${msg.type === 'admin' ? 'bg-blue-100 dark:bg-blue-900/30 ml-auto' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                  <span className="text-xs font-medium">{msg.sender}</span>
                                  <p className="text-sm text-gray-800 dark:text-gray-200">{msg.message}</p>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-[350px] text-gray-500">
                            <p>Select a conversation</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isReviewer && currentMenu === 'review-submit' && (
                <Card className="shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Submit Manuscript Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {profile.status && profile.status.toLowerCase() !== 'active' ? (
                      <div className="text-center py-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200">
                        <Clock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Application Under Review</h3>
                        <p className="text-blue-700 dark:text-blue-200">Once approved, you'll be able to submit reviews.</p>
                      </div>
                    ) : assignedWorks.filter(w => !w.reviewSubmitted && w.status && w.status.toLowerCase().includes('pending')).length === 0 ? (
                      <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Pending Manuscripts</h3>
                        <p className="text-gray-500">You don't have any pending manuscripts to review.</p>
                      </div>
                    ) : (
                      <p className="text-gray-600">Select a manuscript from your assignments to submit a review.</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {isEditor && currentMenu === 'track' && (
                <div className="space-y-4">
                  <div className="flex gap-3 mb-4">
                    <Input placeholder="Manuscript ID" value={idSearch} onChange={(e) => setIdSearch(e.target.value)} className="flex-1" />
                    <Input placeholder="Author Name" value={authorSearch} onChange={(e) => setAuthorSearch(e.target.value)} className="flex-1" />
                    <Input placeholder="Mobile" value={mobileSearch} onChange={(e) => setMobileSearch(e.target.value)} className="flex-1" />
                  </div>
                  {manuscriptsLoading ? (
                    <Card><CardContent className="pt-6 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></CardContent></Card>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left">Manuscript ID</th>
                            <th className="px-4 py-3 text-left">Title</th>
                            <th className="px-4 py-3 text-left">Author</th>
                            <th className="px-4 py-3 text-left">Journal</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-center">Download</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredManuscripts.map((m, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="px-4 py-3">{m['Manuscript ID']}</td>
                              <td className="px-4 py-3">{m['Manuscript Title'] || '-'}</td>
                              <td className="px-4 py-3">{m['First Author Name']}</td>
                              <td className="px-4 py-3">{m['Journal Type'] || '-'}</td>
                              <td className="px-4 py-3">
                                <Badge className={m['Status'] === 'Published' ? 'bg-green-100 text-green-800' : m['Status'] === 'Accepted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                                  {m['Status']}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {m['File URL'] ? <a href={m['File URL']} target="_blank" rel="noopener noreferrer" className="text-blue-600"><Download className="w-4 h-4" /></a> : <span className="text-gray-400">N/A</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {isEditor && currentMenu === 'performance' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">Total Reviewers</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{performanceMetrics.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase mb-1">Avg Completion</p>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100">{performanceMetrics.length > 0 ? Math.round(performanceMetrics.reduce((a, b) => a + (b.completionRate || 0), 0) / performanceMetrics.length) : 0}%</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase mb-1">Active</p>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{performanceMetrics.filter(m => m.status === 'Active').length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase mb-1">Pending</p>
                      <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{performanceMetrics.filter(m => m.status !== 'Active').length}</p>
                    </div>
                  </div>
                  {performanceLoading ? (
                    <Card><CardContent className="pt-6 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></CardContent></Card>
                  ) : performanceMetrics.length === 0 ? (
                    <Card><CardContent className="pt-6 text-center text-gray-600">No performance data available</CardContent></Card>
                  ) : (
                    <Card>
                      <CardHeader><CardTitle>Performance Metrics</CardTitle></CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                              <tr>
                                <th className="px-3 py-2 text-left">Reviewer ID</th>
                                <th className="px-3 py-2 text-left">Name</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2 text-center">Assigned</th>
                                <th className="px-3 py-2 text-center">Completed</th>
                                <th className="px-3 py-2 text-center">Completion %</th>
                              </tr>
                            </thead>
                            <tbody>
                              {performanceMetrics.map((metric, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                  <td className="px-3 py-2 font-mono text-xs">{metric.reviewerId}</td>
                                  <td className="px-3 py-2">{metric.firstName} {metric.lastName}</td>
                                  <td className="px-3 py-2"><Badge className={metric.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>{metric.status}</Badge></td>
                                  <td className="px-3 py-2 text-center">{metric.totalAssigned}</td>
                                  <td className="px-3 py-2 text-center text-green-600">{metric.completed}</td>
                                  <td className="px-3 py-2 text-center">{metric.completionRate}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {isEditor && currentMenu === 'deadlines' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">Total Deadlines</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{calendarData.reduce((sum, d) => sum + (d.count || 0), 0)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase mb-1">Overdue</p>
                      <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{calendarData.filter(d => d.isPast).reduce((sum, d) => sum + (d.count || 0), 0)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase mb-1">Upcoming</p>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100">{calendarData.filter(d => !d.isPast).reduce((sum, d) => sum + (d.count || 0), 0)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <Button variant={filterStatus === 'all' ? 'default' : 'outline'} onClick={() => setFilterStatus('all')} size="sm">All</Button>
                    <Button variant={filterStatus === 'overdue' ? 'default' : 'outline'} onClick={() => setFilterStatus('overdue')} size="sm">Overdue</Button>
                    <Button variant={filterStatus === 'upcoming' ? 'default' : 'outline'} onClick={() => setFilterStatus('upcoming')} size="sm">Upcoming</Button>
                  </div>
                  {calendarLoading ? (
                    <Card><CardContent className="pt-6 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></CardContent></Card>
                  ) : (
                    <div className="space-y-3">
                      {calendarData.filter(d => filterStatus === 'all' || (filterStatus === 'overdue' && d.isPast) || (filterStatus === 'upcoming' && !d.isPast)).map((day, idx) => (
                        <Card key={idx} className={day.isPast ? 'border-amber-300' : ''}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className={`w-5 h-5 ${day.isPast ? 'text-amber-600' : 'text-blue-600'}`} />
                                <div>
                                  <p className="font-semibold">{new Date(day.date).toLocaleDateString('en-IN')}</p>
                                  <p className="text-xs text-gray-500">{day.count} deadline(s)</p>
                                </div>
                              </div>
                              {day.isPast && <Badge className="bg-amber-100 text-amber-800">Overdue</Badge>}
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {isEditor && currentMenu === 'messages' && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Messages with Admin
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">Send a message to admin:</p>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Your message to admin..." value={reviewerMessages['GENERAL'] || ''} onChange={(e) => setReviewerMessages({...reviewerMessages, 'GENERAL': e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm" />
                        <Button size="sm" onClick={async () => {
                          if (!reviewerMessages['GENERAL']?.trim()) return;
                          setSendingMessage({...sendingMessage, 'GENERAL': true});
                          try {
                            const sessionStr = localStorage.getItem('reviewerSession');
                            const session = sessionStr ? JSON.parse(sessionStr) : {};
                            const response = await fetch('/api/reviewer/send-message', {
                              method: 'POST',
                              headers: {'Content-Type': 'application/json'},
                              body: JSON.stringify({
                                reviewerId: session.reviewerId,
                                manuscriptId: 'GENERAL',
                                message: reviewerMessages['GENERAL']
                              })
                            });
                            if (response.ok) {
                              setReviewerMessages({...reviewerMessages, 'GENERAL': ''});
                              toast({title: 'Success', description: 'Message sent to admin'});
                              loadMessageThreads(session.reviewerId);
                            }
                          } catch (err) {
                            toast({title: 'Error', description: 'Failed to send message', variant: 'destructive'});
                          } finally {
                            setSendingMessage({...sendingMessage, 'GENERAL': false});
                          }
                        }} disabled={sendingMessage['GENERAL'] || !reviewerMessages['GENERAL']?.trim()}>Send</Button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Conversations ({messageThreads.length})</h4>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          {messageThreads.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>No messages yet</p>
                            </div>
                          ) : (
                            messageThreads.map((thread, idx) => (
                              <button key={idx} onClick={() => setSelectedThread(thread)} className={`w-full p-4 text-left border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedThread?.manuscriptId === thread.manuscriptId ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}>
                                <p className="font-medium text-gray-900 dark:text-gray-100">MS: {thread.manuscriptId}</p>
                                <p className="text-xs text-gray-500 mt-1">{thread.messages?.length || 0} messages</p>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        {selectedThread ? (
                          <>
                            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">MS: {selectedThread.manuscriptId}</h4>
                              {selectedThread.readByBoth && (
                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
                                  <CheckCheck className="w-4 h-4" />
                                  <span>Read</span>
                                </div>
                              )}
                            </div>
                            <div className="max-h-[250px] overflow-y-auto p-4 space-y-3" onMouseEnter={() => {
                              if (selectedThread && !selectedThread.readByBoth) {
                                const sessionStr = localStorage.getItem('reviewerSession');
                                const session = sessionStr ? JSON.parse(sessionStr) : {};
                                fetch('/api/reviewer/message-read', {
                                  method: 'POST',
                                  headers: {'Content-Type': 'application/json'},
                                  body: JSON.stringify({reviewerId: session.reviewerId, manuscriptId: selectedThread.manuscriptId})
                                }).catch(e => console.error('Error marking as read:', e));
                              }
                            }}>
                              {selectedThread.messages?.map((msg, idx) => (
                                <div key={idx} className={`p-3 rounded-lg max-w-[85%] ${msg.type === 'admin' ? 'bg-blue-100 dark:bg-blue-900/30 ml-auto' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                  <span className="text-xs font-medium">{msg.sender}</span>
                                  <p className="text-sm text-gray-800 dark:text-gray-200">{msg.message}</p>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-[350px] text-gray-500">
                            <p>Select a conversation</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default UnifiedPortalDashboard;
