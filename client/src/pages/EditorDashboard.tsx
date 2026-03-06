import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  LogOut, Loader2, AlertCircle, FileText, MessageCircle, Download, 
  Award, Calendar, Mail, Phone, Building, Globe, User, BarChart3,
  Clock, CheckCircle, Lock, Bell, Send as SendIcon, Upload
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

interface EditorProfile {
  reviewerId: string;
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
  nationality: string;
  status: string;
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
  authorName?: string;
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

export default function EditorDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [editor, setEditor] = useState<EditorProfile | null>(null);
  const [assignedWorks, setAssignedWorks] = useState<AssignedWork[]>([]);
  const [currentMenu, setCurrentMenu] = useState('profile');
  const [error, setError] = useState<string | null>(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [changingPassword, setChangingPassword] = useState(false);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedManuscript, setSelectedManuscript] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
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
      if (sessionData.role !== 'Editor') {
        setError('This dashboard is for Editors only');
        setIsLoading(false);
        return;
      }
      fetchEditorProfile(sessionData.email, sessionData.reviewerId);
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
          if (d.role === 'Editor' && d.email && d.reviewerId) {
            fetchEditorProfile(d.email, d.reviewerId);
            loadMessageCount(d.reviewerId);
          }
        } catch (e) {
          console.error("Error parsing session in poll:", e);
        }
      }
    }, 30000); // Increased from 5000 to 30000 to reduce unnecessary API calls and potential session conflicts

    return () => clearInterval(pollInterval);
  }, []);

  const loadMessageCount = async (reviewerId: string) => {
    try {
      const response = await fetch(`/api/reviewer/message-threads?reviewerId=${reviewerId}`);
      const data = await response.json();
      const unreadCount = data.threads?.filter((thread: any) => {
        const latestMessage = thread.messages?.[thread.messages.length - 1];
        return latestMessage?.type === 'admin' && !latestMessage?.isRead;
      })?.length || 0;
      setUnreadMessageCount(unreadCount);
      setThreads(data.threads || []);
    } catch (err) {
      console.error('Error loading message count:', err);
    }
  };

  const fetchEditorProfile = async (email: string, reviewerId: string) => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/reviewer-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reviewerId })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setEditor(result.profile);
        setAssignedWorks(result.assignedWorks || []);
        setLastUpdated(new Date());
      } else if (response.status === 404 || response.status === 401) {
        setError(result.message || 'Failed to load profile');
        handleLogout();
      } else {
        setError(result.message || 'Failed to load profile');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('reviewerSession');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
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
        body: JSON.stringify({ reviewerId: editor?.reviewerId, email: editor?.email, newPassword: passwordForm.newPassword })
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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const manuscriptId = selectedThread?.manuscriptId || selectedManuscript;
    if (!manuscriptId) {
      toast({ title: 'Error', description: 'Please select a manuscript', variant: 'destructive' });
      return;
    }

    setSendingMessage(true);
    try {
      const submittedAt = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: true
      });

      const response = await fetch('/api/send-reviewer-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerId: editor?.reviewerId,
          reviewerName: `${editor?.firstName} ${editor?.lastName}`,
          manuscriptId,
          message: newMessage,
          submittedAt
        })
      });

      const result = await response.json();
      if (result.success) {
        toast({ title: 'Success', description: 'Message sent to admin' });
        setNewMessage('');
        setSelectedManuscript('');
        loadMessageCount(editor?.reviewerId || '');
      } else {
        toast({ title: 'Error', description: result.message || 'Failed to send message', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    } finally {
      setSendingMessage(false);
    }
  };

  const markMessageAsRead = async (manuscriptId: string) => {
    try {
      await fetch('/api/reviewer/mark-message-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerId: editor?.reviewerId, manuscriptId })
      });
      loadMessageCount(editor?.reviewerId || '');
    } catch (err) {
      console.error('Error marking message as read:', err);
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

  const getDaysRemaining = (dueDate: string): number => {
    if (!dueDate) return 0;
    try {
      const due = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const pendingWorks = assignedWorks.filter(w => !w.reviewSubmitted && w.status && (w.status.toLowerCase().includes('pending') || w.status.toLowerCase().includes('accepted')));
  const completedWorks = assignedWorks.filter(w => w.reviewSubmitted || (w.status && w.status.toLowerCase().includes('completed')));
  const upcomingDeadlines = assignedWorks.filter(w => w.dueDate && !w.reviewSubmitted && !isDeadlineOver(w.dueDate)).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  const overdueWorks = assignedWorks.filter(w => w.dueDate && !w.reviewSubmitted && isDeadlineOver(w.dueDate));

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">Loading Editor Dashboard...</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Fetching your profile and assignments</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => setLocation('/reviewer-login')}>Return to Login</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!editor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
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

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'manuscripts', label: 'Manuscripts', icon: FileText },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'submit-review', label: 'Submit Review', icon: Upload, disabled: pendingWorks.length === 0 },
    { id: 'deadlines', label: 'Deadlines', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadMessageCount }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <SEO title="Editor Dashboard - Scholar India Publishers" description="Access your editor dashboard for manuscript management and reviews." />
      <Header />

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Create a strong password with at least 8 characters</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {passwordErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                {passwordErrors.map((err, idx) => <p key={idx} className="text-sm text-red-600">{err}</p>)}
              </div>
            )}
            <Input type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} data-testid="input-new-password" />
            <Input type="password" placeholder="Confirm Password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} data-testid="input-confirm-password" />
            <Button onClick={handleChangePassword} disabled={changingPassword || !passwordForm.newPassword} className="w-full" data-testid="button-submit-password">
              {changingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Change Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <main className="flex-1 py-4 md:py-6">
        <div className="container mx-auto px-3 md:px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {(editor.firstName || 'E').charAt(0)}{(editor.lastName || 'D').charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-dashboard-title">
                    {editor.firstName} {editor.lastName}
                  </h1>
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-semibold rounded-full">
                    <span className={`w-2 h-2 rounded-full bg-green-500 ${isRefreshing ? 'animate-ping' : 'animate-pulse'}`}></span>
                    LIVE
                  </span>
                </div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Editor ID: {editor.reviewerId} | Updated: {lastUpdated.toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setShowPasswordDialog(true)} className="gap-1" data-testid="button-change-password">
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Password</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1 text-red-600 border-red-300" data-testid="button-logout">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
            <div className="lg:w-56 flex-shrink-0">
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-3 border-b border-emerald-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                      <span className="text-emerald-900 font-bold text-xs">SIP</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Editor Portal</p>
                      <p className="text-emerald-200 text-xs">{editor.journal}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  {menuItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => !item.disabled && setCurrentMenu(item.id)}
                        disabled={item.disabled}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          currentMenu === item.id
                            ? 'bg-emerald-700 text-white'
                            : item.disabled
                            ? 'text-emerald-300 opacity-50 cursor-not-allowed'
                            : 'text-emerald-100 hover:bg-emerald-800'
                        }`}
                        data-testid={`menu-${item.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && item.badge > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{item.badge}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {currentMenu === 'profile' && (
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="w-5 h-5" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Status</p>
                        <Badge className={editor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{editor.status}</Badge>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs font-bold text-purple-600 uppercase mb-1">Role</p>
                        <p className="font-semibold text-purple-800 dark:text-purple-300">{editor.role}</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs font-bold text-blue-600 uppercase mb-1">Journal</p>
                        <p className="font-semibold text-blue-800 dark:text-blue-300 text-xs">{editor.journal}</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs font-bold text-amber-600 uppercase mb-1">Editor ID</p>
                        <p className="font-mono font-semibold text-amber-800 dark:text-amber-300 text-xs">{editor.reviewerId}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{editor.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Mobile</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{editor.mobile || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Award className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Designation</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{editor.designation}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Building className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Institution</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{editor.institution}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Area of Interest</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{editor.areaOfInterest}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Globe className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">ORCID</p>
                            {editor.orcid ? (
                              <a href={editor.orcid} target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-600 hover:underline truncate block">{editor.orcid}</a>
                            ) : (
                              <p className="font-medium text-gray-500">Not provided</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Award className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Google Scholar</p>
                            {editor.googleScholar ? (
                              <a href={editor.googleScholar} target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-600 hover:underline">View Profile</a>
                            ) : (
                              <p className="font-medium text-gray-500">Not provided</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Globe className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Nationality</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{editor.nationality || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentMenu === 'manuscripts' && (
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5" />
                      Assigned Manuscripts
                    </CardTitle>
                    <CardDescription className="text-emerald-100">View all manuscripts assigned to you</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {assignedWorks.length === 0 ? (
                      <div className="p-8 text-center">
                        <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-700 dark:text-gray-300 font-medium">No manuscripts assigned yet</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">New assignments will appear here automatically</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Manuscript ID</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Title</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Journal</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Due Date</th>
                              <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Download</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {assignedWorks.map((work, idx) => (
                              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-3 font-mono text-emerald-700 dark:text-emerald-300 font-semibold" data-testid={`text-ms-id-${idx}`}>{work.manuscriptId}</td>
                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 max-w-xs truncate" data-testid={`text-ms-title-${idx}`}>{work.title || 'Untitled'}</td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{work.journal}</td>
                                <td className="px-4 py-3">
                                  {work.reviewSubmitted ? (
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Completed</Badge>
                                  ) : isDeadlineOver(work.dueDate || '') ? (
                                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Overdue</Badge>
                                  ) : (
                                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Pending</Badge>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {work.dueDate ? (
                                    <span className={isDeadlineOver(work.dueDate) ? 'text-red-600 font-semibold' : 'text-gray-700 dark:text-gray-300'}>
                                      {new Date(work.dueDate).toLocaleDateString('en-IN')}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {work.manuscriptLink && typeof work.manuscriptLink === 'string' && work.manuscriptLink.startsWith('http') ? (
                                    <a href={work.manuscriptLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800" data-testid={`link-download-${idx}`}>
                                      <Download className="w-4 h-4" />
                                      <span className="hidden sm:inline">Download</span>
                                    </a>
                                  ) : work.fileUrl && typeof work.fileUrl === 'string' && work.fileUrl.startsWith('http') ? (
                                    <a href={work.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800" data-testid={`link-download-${idx}`}>
                                      <Download className="w-4 h-4" />
                                      <span className="hidden sm:inline">Download</span>
                                    </a>
                                  ) : (
                                    <span className="text-gray-400">N/A</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {currentMenu === 'performance' && (
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="w-5 h-5" />
                      Performance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-900/10 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4 text-center">
                        <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Total Assigned</p>
                        <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">{assignedWorks.length}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 border border-green-200 dark:border-green-700 rounded-xl p-4 text-center">
                        <p className="text-xs font-bold text-green-600 uppercase mb-1">Completed</p>
                        <p className="text-3xl font-bold text-green-800 dark:text-green-200">{completedWorks.length}</p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-center">
                        <p className="text-xs font-bold text-amber-600 uppercase mb-1">Pending</p>
                        <p className="text-3xl font-bold text-amber-800 dark:text-amber-200">{pendingWorks.length}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10 border border-purple-200 dark:border-purple-700 rounded-xl p-4 text-center">
                        <p className="text-xs font-bold text-purple-600 uppercase mb-1">Completion Rate</p>
                        <p className="text-3xl font-bold text-purple-800 dark:text-purple-200">{assignedWorks.length > 0 ? Math.round((completedWorks.length / assignedWorks.length) * 100) : 0}%</p>
                      </div>
                    </div>
                    
                    {overdueWorks.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <h4 className="font-semibold text-red-800 dark:text-red-200">Overdue Reviews</h4>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-300">You have {overdueWorks.length} overdue review(s). Please complete them as soon as possible.</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">Recent Activity</h4>
                      {completedWorks.length === 0 ? (
                        <p className="text-gray-500 text-sm">No completed reviews yet</p>
                      ) : (
                        <div className="space-y-2">
                          {completedWorks.slice(0, 5).map((work, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{work.manuscriptId}</p>
                                  <p className="text-xs text-gray-500">{work.title?.substring(0, 40)}...</p>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-800">Completed</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentMenu === 'submit-review' && (
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Upload className="w-5 h-5" />
                      Peer Review Form
                    </CardTitle>
                    <CardDescription className="text-emerald-100">Complete your editorial review for assigned manuscripts</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    {pendingWorks.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                        <p className="text-gray-600">No pending reviews. All caught up!</p>
                      </div>
                    ) : (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!reviewSubmission.selectedManuscriptForReview) {
                          toast({ title: 'Error', description: 'Please select a manuscript', variant: 'destructive' });
                          return;
                        }
                        if (!reviewSubmission.importanceOfManuscript.trim() || !reviewSubmission.generalComments.trim()) {
                          toast({ title: 'Error', description: 'Please fill all required fields (Importance and General Comments)', variant: 'destructive' });
                          return;
                        }
                        if (!reviewSubmission.recommendation) {
                          toast({ title: 'Error', description: 'Please select a recommendation', variant: 'destructive' });
                          return;
                        }
                        if (!reviewSubmission.competingInterestDeclaration) {
                          toast({ title: 'Error', description: 'Please declare that you have no competing interest', variant: 'destructive' });
                          return;
                        }
                        setIsSubmittingReview(true);
                        try {
                          const payload = {
                            reviewerId: editor?.reviewerId || '',
                            reviewerName: `${editor?.firstName} ${editor?.lastName}`,
                            manuscriptId: reviewSubmission.selectedManuscriptForReview,
                            ...reviewSubmission
                          };
                          const response = await fetch('/api/submit-review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                          const result = await response.json();
                          if (response.ok && result.success) {
                            toast({ title: 'Success', description: 'Your review has been submitted successfully!' });
                            setReviewSubmission({
                              selectedManuscriptForReview: '', importanceOfManuscript: '', titleSuitability: '', abstractComprehensive: '', scientificCorrectness: '', referencesSufficient: '', languageQuality: '', generalComments: '', ethicalIssues: '', ethicalIssuesDetails: '', competingInterests: '', plagiarismSuspected: '', plagiarismDetails: '', competingInterestDeclaration: false, overallMarks: 5, recommendation: ''
                            });
                            const s = localStorage.getItem('reviewerSession');
                            if (s) {
                              const d = JSON.parse(s);
                              fetchEditorProfile(d.email, d.reviewerId);
                            }
                          } else {
                            toast({ title: 'Error', description: result.message || 'Failed to submit review', variant: 'destructive' });
                          }
                        } catch (error) {
                          toast({ title: 'Error', description: 'Unable to submit review. Please try again.', variant: 'destructive' });
                        } finally {
                          setIsSubmittingReview(false);
                        }
                      }} className="space-y-6">
                        
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                          <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            General Guidelines for Peer Review
                          </h4>
                          <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc pl-5">
                            <li><strong>AI-generated or AI-assisted review comments are strictly prohibited.</strong></li>
                            <li>NO manuscript should be rejected only on the basis of 'lack of Novelty', provided it is scientifically robust and technically sound.</li>
                          </ul>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Manuscript *</label>
                          <select value={reviewSubmission.selectedManuscriptForReview} onChange={(e) => setReviewSubmission({...reviewSubmission, selectedManuscriptForReview: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800" data-testid="select-manuscript-review">
                            <option value="">-- Select Manuscript --</option>
                            {pendingWorks.map((work, idx) => (
                              <option key={idx} value={work.manuscriptId}>{work.manuscriptId} - {(work.title || 'Untitled').substring(0, 40)}</option>
                            ))}
                          </select>
                        </div>

                        {reviewSubmission.selectedManuscriptForReview && (
                          <>
                            <div className="border-t pt-4">
                              <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                PART 1: Review Comments
                              </h3>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Importance of Manuscript for Scientific Community *
                                    <span className="text-xs text-gray-500 ml-2">(Minimum 3-4 sentences required)</span>
                                  </label>
                                  <textarea value={reviewSubmission.importanceOfManuscript} onChange={(e) => setReviewSubmission({...reviewSubmission, importanceOfManuscript: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg h-28 resize-none bg-white dark:bg-gray-800" placeholder="Please write a few sentences regarding the importance of this manuscript for the scientific community..." data-testid="textarea-importance" />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Is the title of the article suitable?
                                    <span className="text-xs text-gray-500 ml-2">(If not, please suggest an alternative title)</span>
                                  </label>
                                  <textarea value={reviewSubmission.titleSuitability} onChange={(e) => setReviewSubmission({...reviewSubmission, titleSuitability: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg h-20 resize-none bg-white dark:bg-gray-800" placeholder="Comment on title suitability and suggest alternatives if needed..." />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Is the abstract comprehensive?
                                    <span className="text-xs text-gray-500 ml-2">(Suggest additions or deletions if needed)</span>
                                  </label>
                                  <textarea value={reviewSubmission.abstractComprehensive} onChange={(e) => setReviewSubmission({...reviewSubmission, abstractComprehensive: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg h-20 resize-none bg-white dark:bg-gray-800" placeholder="Is the abstract comprehensive? Do you suggest the addition or deletion of some points?" />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Is the manuscript scientifically correct?
                                  </label>
                                  <textarea value={reviewSubmission.scientificCorrectness} onChange={(e) => setReviewSubmission({...reviewSubmission, scientificCorrectness: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg h-20 resize-none bg-white dark:bg-gray-800" placeholder="Comment on the scientific correctness of the manuscript..." />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Are the references sufficient and recent?
                                    <span className="text-xs text-gray-500 ml-2">(Suggest additional references if needed)</span>
                                  </label>
                                  <textarea value={reviewSubmission.referencesSufficient} onChange={(e) => setReviewSubmission({...reviewSubmission, referencesSufficient: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg h-20 resize-none bg-white dark:bg-gray-800" placeholder="Are references sufficient and recent? Mention any additional references..." />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Is the language/English quality suitable for scholarly communications?
                                  </label>
                                  <textarea value={reviewSubmission.languageQuality} onChange={(e) => setReviewSubmission({...reviewSubmission, languageQuality: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg h-20 resize-none bg-white dark:bg-gray-800" placeholder="Comment on language quality and readability..." />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    General/Optional Comments *
                                  </label>
                                  <textarea value={reviewSubmission.generalComments} onChange={(e) => setReviewSubmission({...reviewSubmission, generalComments: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg h-28 resize-none bg-white dark:bg-gray-800" placeholder="Provide detailed feedback and any additional comments..." data-testid="textarea-general-comments" />
                                </div>
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                PART 2: Ethics & Integrity
                              </h3>
                              
                              <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Are there ethical issues?</label>
                                  <select value={reviewSubmission.ethicalIssues} onChange={(e) => setReviewSubmission({...reviewSubmission, ethicalIssues: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Competing interest issues?</label>
                                  <select value={reviewSubmission.competingInterests} onChange={(e) => setReviewSubmission({...reviewSubmission, competingInterests: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plagiarism suspected?</label>
                                  <select value={reviewSubmission.plagiarismSuspected} onChange={(e) => setReviewSubmission({...reviewSubmission, plagiarismSuspected: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                  </select>
                                </div>
                              </div>

                              {reviewSubmission.ethicalIssues === 'Yes' && (
                                <div className="mt-4">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Describe the ethical issues in detail</label>
                                  <textarea value={reviewSubmission.ethicalIssuesDetails} onChange={(e) => setReviewSubmission({...reviewSubmission, ethicalIssuesDetails: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg h-20 resize-none bg-white dark:bg-gray-800" placeholder="Please describe the ethical issues..." />
                                </div>
                              )}

                              {reviewSubmission.plagiarismSuspected === 'Yes' && (
                                <div className="mt-4">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provide proofs or web links for suspected plagiarism</label>
                                  <textarea value={reviewSubmission.plagiarismDetails} onChange={(e) => setReviewSubmission({...reviewSubmission, plagiarismDetails: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg h-20 resize-none bg-white dark:bg-gray-800" placeholder="Provide related proofs or web links..." />
                                </div>
                              )}
                            </div>

                            <div className="border-t pt-4">
                              <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                PART 3: Declaration of Competing Interest
                              </h3>
                              
                              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <input type="checkbox" checked={reviewSubmission.competingInterestDeclaration} onChange={(e) => setReviewSubmission({...reviewSubmission, competingInterestDeclaration: e.target.checked})} className="mt-1 w-5 h-5" data-testid="checkbox-declaration" />
                                <label className="text-sm text-gray-700 dark:text-gray-300">
                                  <span className="font-semibold">I declare that I have no competing interest as a reviewer.</span>
                                  <span className="block text-xs text-gray-500 mt-1">This declaration is mandatory to submit your review.</span>
                                </label>
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                PART 4: Objective Evaluation
                              </h3>
                              
                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Overall Marks (0-10) *</label>
                                  <input type="range" min="0" max="10" value={reviewSubmission.overallMarks} onChange={(e) => setReviewSubmission({...reviewSubmission, overallMarks: parseInt(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>0 (Reject)</span>
                                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{reviewSubmission.overallMarks}</span>
                                    <span>10 (Accept)</span>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendation *</label>
                                  <select value={reviewSubmission.recommendation} onChange={(e) => setReviewSubmission({...reviewSubmission, recommendation: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" data-testid="select-recommendation">
                                    <option value="">-- Select Recommendation --</option>
                                    <option value="Accept As It Is">Accept As It Is (Score: 9-10)</option>
                                    <option value="Minor Revision">Minor Revision (Score: 8-9)</option>
                                    <option value="Major Revision">Major Revision (Score: 7-8)</option>
                                    <option value="Serious Major Revision">Serious Major Revision (Score: 5-7)</option>
                                    <option value="Rejected (Repairable)">Rejected with Repairable Deficiencies (Score: 3-5)</option>
                                    <option value="Strongly Rejected">Strongly Rejected (Irreparable Deficiencies) (Score: 0-3)</option>
                                  </select>
                                </div>
                              </div>

                              <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-3">
                                <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm mb-2">Scoring Guidelines:</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                                  <div>Accept As It Is: 9-10</div>
                                  <div>Minor Revision: 8-9</div>
                                  <div>Major Revision: 7-8</div>
                                  <div>Serious Major Revision: 5-7</div>
                                  <div>Rejected (Repairable): 3-5</div>
                                  <div>Strongly Rejected: 0-3</div>
                                </div>
                              </div>
                            </div>

                            <Button type="submit" disabled={isSubmittingReview} className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 text-lg" data-testid="button-submit-review">
                              {isSubmittingReview ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                              Submit Peer Review
                            </Button>
                          </>
                        )}
                      </form>
                    )}
                  </CardContent>
                </Card>
              )}

              {currentMenu === 'deadlines' && (
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="w-5 h-5" />
                      Upcoming Deadlines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    {upcomingDeadlines.length === 0 && overdueWorks.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                        <p className="text-gray-600 dark:text-gray-300 font-medium">No pending work</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">All reviews completed or no assignments yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {overdueWorks.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              Overdue ({overdueWorks.length})
                            </h4>
                            <div className="space-y-2">
                              {overdueWorks.map((work, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                                  <div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{work.manuscriptId}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">{work.title || 'Untitled'}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-red-600">Overdue</p>
                                    <p className="text-xs text-gray-500">{work.dueDate ? new Date(work.dueDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {upcomingDeadlines.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Upcoming ({upcomingDeadlines.length})
                            </h4>
                            <div className="space-y-2">
                              {upcomingDeadlines.map((work, idx) => {
                                const daysLeft = getDaysRemaining(work.dueDate || '');
                                return (
                                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <div>
                                      <p className="font-semibold text-gray-900 dark:text-gray-100">{work.manuscriptId}</p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">{work.title || 'Untitled'}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className={`text-sm font-bold ${daysLeft <= 3 ? 'text-amber-600' : 'text-green-600'}`}>
                                        {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                                      </p>
                                      <p className="text-xs text-gray-500">{work.dueDate ? new Date(work.dueDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {currentMenu === 'messages' && (
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MessageCircle className="w-5 h-5" />
                      Messages
                      {unreadMessageCount > 0 && (
                        <Badge className="bg-red-500 text-white ml-2">{unreadMessageCount} unread</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 border-b font-semibold text-sm">
                          Conversations ({threads.length})
                        </div>
                        {threads.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                            <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No messages yet</p>
                            <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">Start a conversation about your assignments</p>
                          </div>
                        ) : (
                          <div className="max-h-64 overflow-y-auto">
                            {threads.map((thread, idx) => {
                              const latestMsg = thread.messages?.[thread.messages.length - 1];
                              const hasUnread = latestMsg?.type === 'admin' && !latestMsg?.isRead;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setSelectedThread(thread);
                                    if (hasUnread) markMessageAsRead(thread.manuscriptId);
                                  }}
                                  className={`w-full p-3 text-left border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                                    selectedThread?.manuscriptId === thread.manuscriptId ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                                  }`}
                                  data-testid={`button-thread-${idx}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-sm flex items-center gap-1">
                                        {hasUnread && <Bell className="w-3 h-3 text-red-500" />}
                                        MS: {thread.manuscriptId}
                                      </p>
                                      <p className="text-xs text-gray-500">{thread.messages?.length || 0} messages</p>
                                    </div>
                                    {hasUnread && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 border-b font-semibold text-sm">
                          {selectedThread ? `Conversation: ${selectedThread.manuscriptId}` : 'Select a conversation'}
                        </div>
                        {selectedThread ? (
                          <div>
                            <div className="h-48 overflow-y-auto p-3 space-y-2">
                              {selectedThread.messages?.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.type === 'reviewer' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                    msg.type === 'reviewer'
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                  }`}>
                                    <p>{msg.message}</p>
                                    <p className="text-xs opacity-70 mt-1">{msg.submittedAt}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="p-3 border-t flex gap-2">
                              <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1"
                                data-testid="input-message"
                              />
                              <Button onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()} size="sm" data-testid="button-send-message">
                                {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                            <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">Select a conversation to view</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Start New Conversation</h4>
                      <div className="flex gap-2">
                        <select value={selectedManuscript} onChange={(e) => setSelectedManuscript(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700">
                          <option value="">Select Manuscript</option>
                          {assignedWorks.map((work, idx) => (
                            <option key={idx} value={work.manuscriptId}>{work.manuscriptId}</option>
                          ))}
                        </select>
                        <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Your message..." className="flex-1" />
                        <Button onClick={handleSendMessage} disabled={sendingMessage || !selectedManuscript || !newMessage.trim()} size="sm">
                          <SendIcon className="w-4 h-4" />
                        </Button>
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
