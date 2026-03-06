import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Users, FileText, Send, Send as SendIcon, Zap, CheckCircle, Clock, MessageSquare, ExternalLink, Award, Download, Search, Check, ChevronsUpDown, Loader2, CreditCard, Bell, Trash2, Lock, Mail, Calendar, AlertCircle, CheckCheck, Plus, Edit2, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import SEO from '@/components/SEO';
import { Textarea } from '@/components/ui/textarea';

// Excel download helper
const downloadExcel = (data: any[], filename: string) => {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const convertToCSV = (data: any[]) => {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const csv = [headers.join(',')];
  for (const row of data) {
    const values = headers.map(h => {
      const v = row[h] || '';
      return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
    });
    csv.push(values.join(','));
  }
  return csv.join('\n');
};

// Manual Assignment Form Component
function AdminAssignmentForm({ onAssignmentSuccess }: any) {
  const { toast } = useToast();
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [manuscripts, setManuscripts] = useState<any[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [selectedManuscript, setSelectedManuscript] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [reviewerOpen, setReviewerOpen] = useState(false);
  const [manuscriptOpen, setManuscriptOpen] = useState(false);

  useEffect(() => {
    try {
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession) {
        const session = JSON.parse(adminSession);
        setAdminEmail(session.email);
      }
    } catch (err) {
      console.error('Error reading admin session:', err);
    }
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [reviewersRes, manuscriptsRes] = await Promise.all([
        fetch('/api/admin/reviewers-for-assignment', { credentials: 'include' }),
        fetch('/api/admin/manuscripts-for-assignment', { credentials: 'include' })
      ]);
      const reviewersData = await reviewersRes.json();
      const manuscriptsData = await manuscriptsRes.json();
      setReviewers(reviewersData.reviewers || []);
      setManuscripts(manuscriptsData.manuscripts || []);
    } catch (err) {
      console.error('Error loading form data:', err);
      toast({ title: 'Error', description: 'Failed to load reviewers and manuscripts', variant: 'destructive' });
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReviewers.length === 0 || !selectedManuscript) {
      toast({ title: 'Error', description: 'Please select at least one reviewer and a manuscript', variant: 'destructive' });
      return;
    }

    if (selectedReviewers.length > 3) {
      toast({ title: 'Error', description: 'Maximum 3 reviewers can be assigned to a manuscript', variant: 'destructive' });
      return;
    }

    if (!dueDate) {
      toast({ title: 'Error', description: 'Please set a due date for review', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/assign-manuscript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reviewerIds: selectedReviewers,
          manuscriptId: selectedManuscript,
          notes,
          dueDate,
          adminEmail
        })
      });
      const data = await response.json();
      
      if (data.success) {
        toast({ title: 'Success', description: `Manuscript assigned to ${selectedReviewers.length} reviewer(s) successfully!` });
        setSelectedReviewers([]);
        setSelectedManuscript('');
        setNotes('');
        setDueDate('');
        onAssignmentSuccess?.();
        loadFormData();
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) return (
    <div className="text-center py-8">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
      <p className="text-gray-600 dark:text-gray-400">Loading reviewers and manuscripts...</p>
    </div>
  );

  const activeReviewers = reviewers.filter((r) => (r.status || r.Status || '').toLowerCase() === 'active');
  const manuscriptsForAssignment = manuscripts.filter((m) => (m['Status'] || m.status || '').toLowerCase() === 'under review');
  
  const selectedManuscriptData = manuscriptsForAssignment.find(m => (m['Manuscript ID'] || m.id) === selectedManuscript);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Reviewers (Max 3)</label>
        <Popover open={reviewerOpen} onOpenChange={setReviewerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={reviewerOpen}
              className="w-full justify-between h-auto min-h-10 py-2"
              disabled={loading}
              data-testid="button-select-reviewer"
            >
              <div className="flex flex-wrap gap-1">
                {selectedReviewers.length > 0 ? (
                  selectedReviewers.map(id => {
                    const r = activeReviewers.find(rev => (rev.reviewerId || rev['Reviewer ID'] || rev.id) === id);
                    return (
                      <Badge key={id} variant="secondary" className="mr-1">
                        {r?.firstName || r?.['First Name'] || r?.name || id}
                      </Badge>
                    );
                  })
                ) : (
                  <span className="text-gray-500">-- Choose Reviewers (2-3 recommended) --</span>
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search reviewer..." data-testid="input-search-reviewer" />
              <CommandEmpty>No reviewer found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {activeReviewers.map((reviewer) => {
                    const revId = reviewer.reviewerId || reviewer['Reviewer ID'] || reviewer.id;
                    const isSelected = selectedReviewers.includes(revId);
                    return (
                      <CommandItem
                        key={revId}
                        value={revId}
                        onSelect={() => {
                          if (isSelected) {
                            setSelectedReviewers(selectedReviewers.filter(id => id !== revId));
                          } else if (selectedReviewers.length < 3) {
                            setSelectedReviewers([...selectedReviewers, revId]);
                          } else {
                            toast({ title: "Limit Reached", description: "You can select up to 3 reviewers" });
                          }
                        }}
                        data-testid={`option-reviewer-${revId}`}
                      >
                        <Check
                          className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{reviewer.firstName || reviewer['First Name'] || reviewer.name} {reviewer.lastName || reviewer['Last Name'] || ''}</span>
                          <span className="text-xs text-gray-500">{reviewer.email || reviewer['Email']}</span>
                          {reviewer.institution && <span className="text-[10px] text-gray-400 italic">{reviewer.institution}</span>}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {reviewers.length > 0 && activeReviewers.length === 0 && (
          <p className="text-sm text-red-600 mt-2">No active reviewers available for assignment. Please wait for reviewer applications to be approved.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Manuscript</label>
        <Popover open={manuscriptOpen} onOpenChange={setManuscriptOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={manuscriptOpen}
              className="w-full justify-between"
              disabled={loading}
              data-testid="button-select-manuscript"
            >
              {selectedManuscriptData
                ? `${selectedManuscriptData['Manuscript ID'] || selectedManuscriptData.manuscriptId} - ${selectedManuscriptData['Manuscript Title'] || selectedManuscriptData.title}`
                : '-- Choose Manuscript --'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search manuscript..." data-testid="input-search-manuscript" />
              <CommandEmpty>No manuscript found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {manuscriptsForAssignment.map((manuscript) => {
                    const msId = manuscript['Manuscript ID'] || manuscript.id;
                    return (
                    <CommandItem
                      key={msId}
                      value={msId}
                      onSelect={(currentValue) => {
                        setSelectedManuscript(currentValue === selectedManuscript ? '' : currentValue);
                        setManuscriptOpen(false);
                      }}
                      data-testid={`option-manuscript-${msId}`}
                    >
                      <Check
                        className={cn('mr-2 h-4 w-4', selectedManuscript === msId ? 'opacity-100' : 'opacity-0')}
                      />
                      {manuscript['Manuscript ID'] || manuscript.manuscriptId} - {manuscript['Manuscript Title'] || manuscript.title} ({manuscript['Status'] || manuscript.status || 'Unknown'})
                    </CommandItem>
                  );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date for Review</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={loading}
          data-testid="input-due-date"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={loading}
          data-testid="input-notes"
          placeholder="Add any assignment notes..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 h-24"
        />
      </div>

      <Button
        type="submit"
        disabled={loading || selectedReviewers.length === 0 || !selectedManuscript || !dueDate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        data-testid="button-assign"
      >
        {loading ? 'Assigning...' : `Assign ${selectedReviewers.length > 0 ? selectedReviewers.length : ''} Manuscript`}
      </Button>
    </form>
  );
}

// Reviewers List Component
function AdminReviewersList({ roleFilter }: { roleFilter?: string }) {
  const { toast } = useToast();
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [filteredReviewers, setFilteredReviewers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [resetPasswordReviewerId, setResetPasswordReviewerId] = useState<string | null>(null);
  const [resetPasswordForm, setResetPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession) {
        const session = JSON.parse(adminSession);
        setAdminEmail(session.email);
      }
    } catch (err) {
      console.error('Error reading admin session:', err);
    }
    loadReviewers();
  }, []);

  useEffect(() => {
    let filtered = reviewers.filter(r => 
      r.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Apply role filter if provided
    if (roleFilter) {
      filtered = filtered.filter(r => r.role === roleFilter);
    }
    
    setFilteredReviewers(filtered);
  }, [searchTerm, reviewers, roleFilter]);

  const loadReviewers = async () => {
    try {
      const response = await fetch('/api/admin/reviewers', { credentials: 'include' });
      const data = await response.json();
      const normalized = (data.reviewers || []).map((r: any) => ({
        id: r['Reviewer ID'] || r.reviewerId || r.id,
        firstName: r['First Name'] || r.firstName,
        lastName: r['Last Name'] || r.lastName,
        email: r.Email || r.email,
        role: r.Role || r.role,
        journal: r.Journal || r.journal,
        status: r.Status || r.status,
        designation: r.Designation || r.designation,
        institution: r.Institution || r.institution
      }));
      setReviewers(normalized);
    } catch (err) {
      console.error('Error loading reviewers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reviewerId: string, newStatus: string) => {
    setProcessingId(reviewerId);
    try {
      const email = adminEmail || localStorage.getItem('adminSession')?.split('"email":"')[1]?.split('"')[0] || 'unknown';
      const response = await fetch('/api/admin/update-reviewer-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ reviewerId, status: newStatus, adminEmail: email })
      });
      const data = await response.json();

      if (data.success || response.ok) {
        toast({ title: 'Success', description: `Reviewer status updated to ${newStatus}` });
        loadReviewers();
      } else {
        toast({ title: 'Error', description: data.error || data.message || 'Failed to update status', variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Error updating reviewer status:', err);
      toast({ title: 'Error', description: err.message || 'An error occurred', variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordForm.newPassword || !resetPasswordForm.confirmPassword) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    if (resetPasswordForm.newPassword.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }

    setResetPasswordLoading(true);
    try {
      // Find the reviewer to get email
      const reviewer = reviewers.find(r => r.id === resetPasswordReviewerId);
      if (!reviewer) {
        toast({ title: 'Error', description: 'Reviewer not found', variant: 'destructive' });
        return;
      }

      const response = await fetch('/api/admin/reset-reviewer-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ 
          reviewerId: resetPasswordReviewerId,
          email: reviewer.email,
          newPassword: resetPasswordForm.newPassword
        })
      });
      const data = await response.json();

      if (data.success) {
        toast({ title: 'Success', description: 'Password reset successfully' });
        setResetPasswordReviewerId(null);
        setResetPasswordForm({ newPassword: '', confirmPassword: '' });
        loadReviewers();
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to reset password', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'An error occurred', variant: 'destructive' });
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleDeactivate = async (reviewerId: string) => {
    if (!confirm('Are you sure you want to deactivate this reviewer? They will no longer be able to access the portal.')) {
      return;
    }
    
    setDeactivatingId(reviewerId);
    try {
      const response = await fetch('/api/admin/deactivate-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ reviewerId })
      });
      const data = await response.json();

      if (data.success) {
        toast({ title: 'Success', description: 'Reviewer deactivated successfully' });
        loadReviewers();
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to deactivate reviewer', variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Error deactivating reviewer:', err);
      toast({ title: 'Error', description: err.message || 'An error occurred', variant: 'destructive' });
    } finally {
      setDeactivatingId(null);
    }
  };

  if (loading) return (
    <div className="text-center py-8">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
      <p className="text-gray-600 dark:text-gray-400">Loading reviewers...</p>
    </div>
  );
  const displayText = roleFilter ? (roleFilter === 'Editor' ? 'editors' : 'editorial board members') : 'reviewers';
  if (reviewers.length === 0) return (
    <div className="text-center py-8">
      <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
      <p className="text-gray-600 dark:text-gray-400 font-medium">No {displayText} found</p>
      <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">New applications will appear here automatically</p>
    </div>
  );
  if (filteredReviewers.length === 0) return (
    <div className="text-center py-8">
      <Search className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
      <p className="text-gray-600 dark:text-gray-400 font-medium">No {displayText} matching filters</p>
      <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Try adjusting your search or filter criteria</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-1">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by ID, email, or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-reviewers"
          className="flex-1"
        />
      </div>
      <div className="overflow-x-auto">
      <table className="w-full text-xs md:text-sm">
        <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
          <tr>
            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-gray-900 dark:text-gray-100">ID</th>
            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-gray-900 dark:text-gray-100">Name</th>
            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-gray-900 dark:text-gray-100">Email</th>
            <th className="hidden md:table-cell px-2 md:px-4 py-2 md:py-3 text-left text-gray-900 dark:text-gray-100">Role</th>
            <th className="hidden lg:table-cell px-2 md:px-4 py-2 md:py-3 text-left text-gray-900 dark:text-gray-100">Journal</th>
            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-gray-900 dark:text-gray-100">Status</th>
            <th className="px-1 md:px-4 py-2 md:py-3 text-center text-gray-900 dark:text-gray-100">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredReviewers.map((reviewer, idx) => (
            <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-2 md:px-4 py-2 md:py-3 text-gray-900 dark:text-gray-100 text-xs md:text-sm" data-testid={`text-reviewer-id-${reviewer.id}`}>{reviewer.id || '-'}</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-gray-900 dark:text-gray-100 text-xs md:text-sm" data-testid={`text-reviewer-name-${reviewer.id}`}>{reviewer.firstName} {reviewer.lastName}</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-gray-900 dark:text-gray-100 text-xs md:text-sm" data-testid={`text-reviewer-email-${reviewer.id}`}>{reviewer.email}</td>
              <td className="hidden md:table-cell px-2 md:px-4 py-2 md:py-3 text-gray-900 dark:text-gray-100 text-xs md:text-sm" data-testid={`text-reviewer-role-${reviewer.id}`}>{reviewer.role || '-'}</td>
              <td className="hidden lg:table-cell px-2 md:px-4 py-2 md:py-3 text-gray-900 dark:text-gray-100 text-xs md:text-sm" data-testid={`text-reviewer-journal-${reviewer.id}`}>{reviewer.journal || '-'}</td>
              <td className="px-2 md:px-4 py-2 md:py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  reviewer.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 
                  reviewer.status === 'Hold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                  reviewer.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`} data-testid={`badge-status-${reviewer.id}`}>
                  {reviewer.status || 'Pending'}
                </span>
              </td>
              <td className="px-1 md:px-4 py-2 md:py-3">
                <div className="flex gap-1 md:gap-2 flex-wrap justify-center items-center">
                  <Button
                    size="sm"
                    variant={reviewer.status === 'Active' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(reviewer.id, 'Active')}
                    disabled={processingId === reviewer.id}
                    data-testid={`button-status-active-${reviewer.id}`}
                    className="text-xs px-2 whitespace-nowrap"
                  >
                    {processingId === reviewer.id ? '...' : 'Active'}
                  </Button>
                  <Button
                    size="sm"
                    variant={reviewer.status === 'Hold' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(reviewer.id, 'Hold')}
                    disabled={processingId === reviewer.id}
                    data-testid={`button-status-hold-${reviewer.id}`}
                    className="text-xs px-2 border-yellow-300 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20 whitespace-nowrap"
                  >
                    {processingId === reviewer.id ? '...' : 'Hold'}
                  </Button>
                  <Button
                    size="sm"
                    variant={reviewer.status === 'Rejected' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(reviewer.id, 'Rejected')}
                    disabled={processingId === reviewer.id}
                    data-testid={`button-status-rejected-${reviewer.id}`}
                    className="text-xs px-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 whitespace-nowrap"
                  >
                    {processingId === reviewer.id ? '...' : 'Reject'}
                  </Button>
                  {reviewer.status === 'Active' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setResetPasswordReviewerId(reviewer.id)}
                        data-testid={`button-reset-password-${reviewer.id}`}
                        className="text-xs border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 whitespace-nowrap"
                        title="Reset password manually"
                      >
                        <Lock className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeactivate(reviewer.id)}
                        disabled={deactivatingId === reviewer.id}
                        data-testid={`button-deactivate-${reviewer.id}`}
                        className="text-xs border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 whitespace-nowrap"
                        title="Deactivate reviewer account"
                      >
                        {deactivatingId === reviewer.id ? (
                          <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Deactivating...</>
                        ) : (
                          <><Trash2 className="w-3 h-3" /></>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetPasswordReviewerId} onOpenChange={(open) => !open && setResetPasswordReviewerId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Reviewer Password</DialogTitle>
            <DialogDescription>Set a new password for this reviewer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                placeholder="Enter new password (min 8 chars)"
                value={resetPasswordForm.newPassword}
                onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, newPassword: e.target.value })}
                data-testid="input-reset-password-new"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm password"
                value={resetPasswordForm.confirmPassword}
                onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, confirmPassword: e.target.value })}
                data-testid="input-reset-password-confirm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setResetPasswordReviewerId(null);
                  setResetPasswordForm({ newPassword: '', confirmPassword: '' });
                }}
                disabled={resetPasswordLoading}
                className="flex-1"
                data-testid="button-reset-password-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetPassword}
                disabled={resetPasswordLoading}
                className="flex-1"
                data-testid="button-reset-password-submit"
              >
                {resetPasswordLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Reset Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Assignments Tracking Component
function AdminAssignmentsList() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    const filtered = assignments.filter(a => 
      a.reviewerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.manuscriptId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAssignments(filtered);
  }, [searchTerm, assignments]);

  const loadAssignments = async () => {
    try {
      const response = await fetch('/api/admin/assignments', { credentials: 'include' });
      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      console.error('Error loading assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (reviewerId: string, manuscriptId: string, idx: number) => {
    setRemindingId(`${reviewerId}-${idx}`);
    try {
      const response = await fetch('/api/admin/send-task-reminder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ reviewerId, manuscriptId })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Success', description: 'Reminder notification sent to reviewer!' });
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to send reminder', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({ title: 'Error', description: 'Failed to send reminder', variant: 'destructive' });
    } finally {
      setRemindingId(null);
    }
  };

  const revokeAssignment = async (reviewerId: string, manuscriptId: string, idx: number) => {
    if (!confirm('Are you sure you want to revoke this assignment?')) return;
    
    setRevokingId(`${reviewerId}-${idx}`);
    try {
      const response = await fetch('/api/admin/revoke-assignment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ reviewerId, manuscriptId })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Success', description: 'Assignment revoked successfully!' });
        await loadAssignments();
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to revoke assignment', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error revoking assignment:', error);
      toast({ title: 'Error', description: 'Failed to revoke assignment', variant: 'destructive' });
    } finally {
      setRevokingId(null);
    }
  };

  if (loading) return (
    <div className="text-center py-8">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
      <p className="text-gray-600 dark:text-gray-400">Loading assignments...</p>
    </div>
  );
  if (assignments.length === 0) return (
    <div className="text-center py-8">
      <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
      <p className="text-gray-600 dark:text-gray-400 font-medium">No assignments found</p>
      <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Assignments will appear here after manuscripts are assigned</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-1">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by reviewer ID or manuscript ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-assignments"
          className="flex-1"
        />
      </div>
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
          <tr>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Reviewer ID</th>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Manuscript ID</th>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Assigned Date</th>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Due Date</th>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Status</th>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Marks</th>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Recommendation</th>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Notes</th>
            <th className="px-4 py-3 text-center text-gray-900 dark:text-gray-100">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredAssignments.map((assignment, idx) => (
            <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium" data-testid={`text-reviewer-id-${idx}`}>{assignment.reviewerId}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100" data-testid={`text-ms-id-${idx}`}>{assignment.manuscriptId}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100 text-xs" data-testid={`text-assigned-${idx}`}>{assignment.assignedAt}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100" data-testid={`text-due-${idx}`}>{assignment.dueDate}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit ${
                  assignment.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 
                  'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                }`} data-testid={`badge-status-${idx}`}>
                  {assignment.status === 'Completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {assignment.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100" data-testid={`text-marks-${idx}`}>{assignment.overallMarks || '-'}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100 text-xs" data-testid={`text-recommendation-${idx}`}>{assignment.recommendation || '-'}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs max-w-xs truncate" data-testid={`text-notes-${idx}`} title={assignment.notes}>{assignment.notes}</td>
              <td className="px-4 py-3 text-center">
                <div className="flex gap-2 justify-center items-center flex-wrap">
                  {assignment.status !== 'Completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendReminder(assignment.reviewerId, assignment.manuscriptId, idx)}
                      disabled={remindingId === `${assignment.reviewerId}-${idx}`}
                      className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 whitespace-nowrap"
                      data-testid={`button-remind-${idx}`}
                    >
                      {remindingId === `${assignment.reviewerId}-${idx}` ? (
                        <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Sending...</>
                      ) : (
                        <><Bell className="w-3 h-3 mr-1" />Remind</>
                      )}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => revokeAssignment(assignment.reviewerId, assignment.manuscriptId, idx)}
                    disabled={revokingId === `${assignment.reviewerId}-${idx}`}
                    className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 whitespace-nowrap"
                    data-testid={`button-revoke-${idx}`}
                  >
                    {revokingId === `${assignment.reviewerId}-${idx}` ? (
                      <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Revoking...</>
                    ) : (
                      <><Trash2 className="w-3 h-3 mr-1" />Revoke</>
                    )}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

// Reviewer Messages Component with Thread View and Reply
function AdminReviewerMessages() {
  const { toast } = useToast();
  const [threads, setThreads] = useState<any[]>([]);
  const [filteredThreads, setFilteredThreads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    try {
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession) {
        const session = JSON.parse(adminSession);
        setAdminEmail(session.email);
      }
    } catch (err) {
      console.error('Error reading admin session:', err);
    }
    loadThreads();
  }, []);

  useEffect(() => {
    // Filter: only unread messages (where latest message is from reviewer) + search term
    const unreadThreads = threads.filter(t => {
      const latestMessage = t.messages?.[t.messages.length - 1];
      return latestMessage?.type === 'reviewer';
    });
    
    const filtered = unreadThreads.filter(t => 
      t.reviewerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.manuscriptId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reviewerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.messages?.some((m: any) => m.message?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredThreads(filtered);
  }, [searchTerm, threads]);

  const loadThreads = async () => {
    try {
      const response = await fetch('/api/admin/message-threads', { credentials: 'include' });
      const data = await response.json();
      setThreads(data.threads || []);
    } catch (err) {
      console.error('Error loading message threads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedThread) return;

    setSendingReply(true);
    try {
      const response = await fetch('/api/admin/reply-to-message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({
          reviewerId: selectedThread.reviewerId,
          manuscriptId: selectedThread.manuscriptId,
          message: replyMessage,
          adminEmail: adminEmail
        })
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Reply Sent', description: 'Your reply has been sent to the reviewer.' });
        setReplyMessage('');
        await loadThreads();
        // Refresh selected thread
        const updatedThread = threads.find(t => 
          t.reviewerId === selectedThread.reviewerId && t.manuscriptId === selectedThread.manuscriptId
        );
        if (updatedThread) {
          setSelectedThread(updatedThread);
        }
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to send reply', variant: 'destructive' });
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading message threads...</div>;
  
  const unreadThreads = threads.filter(t => {
    const latestMessage = t.messages?.[t.messages.length - 1];
    return latestMessage?.type === 'reviewer';
  });
  
  if (unreadThreads.length === 0) return <div className="text-center py-8 text-gray-600">No unread reviewer messages yet</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-1">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by reviewer ID, manuscript ID, name, or message..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-messages"
          className="flex-1"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Thread List */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Unread Conversations ({filteredThreads.length})</h4>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {filteredThreads.map((thread, idx) => (
              <button
                key={`${thread.reviewerId}-${thread.manuscriptId}`}
                onClick={() => setSelectedThread(thread)}
                className={`w-full p-4 text-left border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  selectedThread?.reviewerId === thread.reviewerId && selectedThread?.manuscriptId === thread.manuscriptId
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                    : ''
                }`}
                data-testid={`button-thread-${idx}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{thread.reviewerName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{thread.reviewerId}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">MS: {thread.manuscriptId}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {thread.messages?.length || 0} msgs
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{thread.latestMessage?.split(',')[0]}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread Detail / Conversation */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {selectedThread ? (
            <>
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{selectedThread.reviewerName}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedThread.reviewerId} | MS: {selectedThread.manuscriptId}
                  </p>
                </div>
                {selectedThread.readByBoth && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
                    <CheckCheck className="w-4 h-4" />
                    <span>Read</span>
                  </div>
                )}
              </div>
              <div className="max-h-[350px] overflow-y-auto p-4 space-y-3" onMouseEnter={() => {
                if (selectedThread && !selectedThread.readByBoth) {
                  fetch('/api/admin/message-read', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({reviewerId: selectedThread.reviewerId, manuscriptId: selectedThread.manuscriptId})
                  }).catch(e => console.error('Error marking as read:', e));
                }
              }}>
                {selectedThread.messages?.map((msg: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg max-w-[85%] ${
                      msg.type === 'admin'
                        ? 'bg-blue-100 dark:bg-blue-900/30 ml-auto text-right'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                    data-testid={`message-${idx}`}
                  >
                    <div className="flex items-center gap-2 mb-1 justify-between">
                      <span className={`text-xs font-medium ${
                        msg.type === 'admin' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {msg.type === 'admin' ? 'Admin' : msg.sender}
                      </span>
                      <span className="text-xs text-gray-500">{msg.submittedAt}</span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{msg.message}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !sendingReply && handleSendReply()}
                    disabled={sendingReply}
                    data-testid="input-reply-message"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyMessage.trim()}
                    data-testid="button-send-reply"
                  >
                    {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[450px] text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable Approval Component
function ApprovalCard({ items, title, emptyTitle, emptyDesc, onStatusChange, processingId }: any) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(items);

  useEffect(() => {
    setData(items);
    setLoading(false);
  }, [items]);

  const handleStatusChange = async (itemId: string, status: string) => {
    await onStatusChange(itemId, status);
  };

  if (loading) return <div className="text-center py-8">Loading {title.toLowerCase()}...</div>;
  if (data.length === 0) return (
    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{emptyTitle}</h3>
      <p className="text-gray-500 dark:text-gray-400">{emptyDesc}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>{data.length}</strong> {title.toLowerCase()} awaiting approval. Click Approve to activate or use Hold/Reject to change status.
        </p>
      </div>

      {data.map((item: any, idx: number) => (
        <Card key={idx} className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <div className="space-y-1 mt-2 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">ID: <span className="font-mono font-medium">{item.id}</span></p>
                  <p className="text-gray-600 dark:text-gray-400">Email: <span className="font-medium">{item.email}</span></p>
                  <p className="text-gray-600 dark:text-gray-400">Institution: <span className="font-medium">{item.institution || '-'}</span></p>
                  <p className="text-gray-600 dark:text-gray-400">Journal: <span className="font-medium">{item.journal}</span></p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                item.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                item.status === 'Hold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              }`}>
                {item.status}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* ORCID and Google Scholar Links */}
            <div className="flex flex-wrap gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              {item.orcid && (
                <a
                  href={item.orcid}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                  data-testid={`link-orcid-${item.id}`}
                >
                  <ExternalLink className="w-4 h-4" />
                  ORCID Profile
                </a>
              )}
              {item.googleScholar && (
                <a
                  href={item.googleScholar}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  data-testid={`link-scholar-${item.id}`}
                >
                  <ExternalLink className="w-4 h-4" />
                  Google Scholar
                </a>
              )}
              {!item.orcid && !item.googleScholar && (
                <span className="text-xs text-gray-500 dark:text-gray-400">No profile links provided</span>
              )}
            </div>

            {/* Status Change Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleStatusChange(item.id, 'Active')}
                disabled={processingId === item.id}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                data-testid={`button-approve-${item.id}`}
              >
                <CheckCircle className="w-4 h-4" />
                {processingId === item.id ? 'Processing...' : 'Approve'}
              </Button>
              <Button
                onClick={() => handleStatusChange(item.id, 'Hold')}
                disabled={processingId === item.id}
                variant="outline"
                className="border-yellow-300 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20 flex items-center gap-2"
                data-testid={`button-hold-${item.id}`}
              >
                <Clock className="w-4 h-4" />
                Hold
              </Button>
              <Button
                onClick={() => handleStatusChange(item.id, 'Rejected')}
                disabled={processingId === item.id}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 flex items-center gap-2"
                data-testid={`button-reject-${item.id}`}
              >
                <Clock className="w-4 h-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Reviewer Approvals Component
function AdminReviewerApprovals() {
  const { toast } = useToast();
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    try {
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession) {
        const session = JSON.parse(adminSession);
        setAdminEmail(session.email);
      }
    } catch (err) {
      console.error('Error reading admin session:', err);
    }
    loadReviewersForApproval();
  }, []);

  const loadReviewersForApproval = async () => {
    try {
      const response = await fetch('/api/admin/reviewers-for-approval', { credentials: 'include' });
      const data = await response.json();
      const normalized = (data.reviewers || []).map((r: any) => ({
        id: r['Reviewer ID'] || r.reviewerId || r.id,
        firstName: r['First Name'] || r.firstName,
        lastName: r['Last Name'] || r.lastName,
        email: r.Email || r.email,
        designation: r.Designation || r.designation,
        institution: r.Institution || r.institution,
        areaOfInterest: r['Area of Interest'] || r.areaOfInterest
      }));
      setReviewers(normalized);
    } catch (err) {
      console.error('Error loading reviewers for approval:', err);
      toast({ title: 'Error', description: 'Failed to load reviewers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reviewerId: string, status: string) => {
    setProcessingId(reviewerId);
    try {
      const email = adminEmail || localStorage.getItem('adminSession')?.split('"email":"')[1]?.split('"')[0] || 'unknown';
      const response = await fetch('/api/admin/update-reviewer-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ reviewerId, status, adminEmail: email })
      });
      const data = await response.json();

      if (data.success || response.ok) {
        toast({ title: 'Success', description: `Reviewer status updated to ${status}` });
        loadReviewersForApproval();
      } else {
        toast({ title: 'Error', description: data.error || data.message || 'Failed to update status', variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Error updating reviewer status:', err);
      toast({ title: 'Error', description: err.message || 'An error occurred', variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="text-center py-8">Loading reviewers for approval...</div>;
  if (reviewers.length === 0) return (
    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Pending Reviewer Approvals</h3>
      <p className="text-gray-500 dark:text-gray-400">All reviewer applications have been processed.</p>
    </div>
  );

  return <ApprovalCard items={reviewers} title="Reviewer(s)" emptyTitle="No Pending Approvals" emptyDesc="All reviewer applications have been processed." onStatusChange={handleStatusChange} processingId={processingId} />;
}

// Editorial Board Approvals Component
function AdminEditorialBoardApprovals() {
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    try {
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession) {
        const session = JSON.parse(adminSession);
        setAdminEmail(session.email);
      }
    } catch (err) {
      console.error('Error reading admin session:', err);
    }
    loadEditorialBoardForApproval();
  }, []);

  const loadEditorialBoardForApproval = async () => {
    try {
      const response = await fetch('/api/admin/editorial-board-for-approval', { credentials: 'include' });
      const data = await response.json();
      const normalized = (data.members || []).map((m: any) => ({
        id: m['Reviewer ID'] || m.reviewerId || m.id,
        firstName: m['First Name'] || m.firstName,
        lastName: m['Last Name'] || m.lastName,
        email: m.Email || m.email,
        designation: m.Designation || m.designation,
        institution: m.Institution || m.institution,
        areaOfInterest: m['Area of Interest'] || m.areaOfInterest
      }));
      setMembers(normalized);
    } catch (err) {
      console.error('Error loading editorial board for approval:', err);
      toast({ title: 'Error', description: 'Failed to load editorial board members', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (memberId: string, status: string) => {
    setProcessingId(memberId);
    try {
      const email = adminEmail || localStorage.getItem('adminSession')?.split('"email":"')[1]?.split('"')[0] || 'unknown';
      const response = await fetch('/api/admin/update-reviewer-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ reviewerId: memberId, status, adminEmail: email })
      });
      const data = await response.json();

      if (data.success || response.ok) {
        toast({ title: 'Success', description: `Editorial board member status updated to ${status}` });
        loadEditorialBoardForApproval();
      } else {
        toast({ title: 'Error', description: data.error || data.message || 'Failed to update status', variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Error updating editorial board status:', err);
      toast({ title: 'Error', description: err.message || 'An error occurred', variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="text-center py-8">Loading editorial board members for approval...</div>;
  if (members.length === 0) return (
    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Pending Editorial Board Approvals</h3>
      <p className="text-gray-500 dark:text-gray-400">All editorial board applications have been processed.</p>
    </div>
  );

  return <ApprovalCard items={members} title="Editorial Board Member(s)" emptyTitle="No Pending Approvals" emptyDesc="All editorial board applications have been processed." onStatusChange={handleStatusChange} processingId={processingId} />;
}

// Deadline Calendar Component
function AdminDeadlineCalendar() {
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      const response = await fetch('/api/admin/deadline-calendar', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setCalendarData(data.calendarData || []);
      }
    } catch (err) {
      console.error('Error loading calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = calendarData.filter(day => {
    if (filterStatus === 'overdue') return day.isPast;
    if (filterStatus === 'upcoming') return !day.isPast;
    return true;
  });

  const upcomingCount = calendarData.filter(d => !d.isPast).reduce((sum, d) => sum + d.count, 0);
  const overdueCount = calendarData.filter(d => d.isPast).reduce((sum, d) => sum + d.count, 0);

  if (loading) return <div className="text-center py-8">Loading calendar...</div>;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">Total Deadlines</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{calendarData.reduce((sum, d) => sum + d.count, 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase mb-1">Overdue</p>
          <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{overdueCount}</p>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase mb-1">Upcoming</p>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">{upcomingCount}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('all')}
          size="sm"
          data-testid="button-filter-all"
        >
          All Deadlines
        </Button>
        <Button
          variant={filterStatus === 'overdue' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('overdue')}
          size="sm"
          data-testid="button-filter-overdue"
        >
          Overdue
        </Button>
        <Button
          variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('upcoming')}
          size="sm"
          data-testid="button-filter-upcoming"
        >
          Upcoming
        </Button>
      </div>

      {filteredData.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-600 dark:text-gray-400">
            No deadlines found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredData.map((day, dayIdx) => (
            <Card key={dayIdx} className={day.isPast ? 'border-amber-300 dark:border-amber-700' : ''} data-testid={`card-deadline-${dayIdx}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-5 h-5 ${day.isPast ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />
                    <div>
                      <CardTitle className="text-lg">
                        {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </CardTitle>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {day.isPast && <span className="text-amber-600 dark:text-amber-400">⚠️ Overdue</span>}
                      </p>
                    </div>
                  </div>
                  <Badge className={day.isPast ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}>
                    {day.count} assignment{day.count !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {day.assignments.map((assignment: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50" data-testid={`item-assignment-${dayIdx}-${idx}`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{assignment.manuscript?.title || 'N/A'}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{assignment.manuscript?.journal}</p>
                      </div>
                      <Badge className={
                        assignment.status === 'Completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : assignment.status === 'Rejected'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                      }>
                        {assignment.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p><span className="font-semibold">Reviewer:</span> {assignment.reviewer?.firstName} {assignment.reviewer?.lastName}</p>
                      <p><span className="font-semibold">Manuscript ID:</span> {assignment.manuscriptId}</p>
                      <p><span className="font-semibold">Assigned:</span> {new Date(assignment.assignedAt).toLocaleDateString('en-IN')}</p>
                      {assignment.notes && <p><span className="font-semibold">Notes:</span> {assignment.notes}</p>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Reviewer Performance Dashboard Component
function AdminReviewerPerformance() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/admin/reviewer-performance', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setMetrics(data.metrics || []);
      }
    } catch (err) {
      console.error('Error loading performance metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading performance metrics...</div>;
  if (metrics.length === 0) return <div className="text-center py-8 text-gray-600">No reviewer performance data available</div>;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">Total Reviewers</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{metrics.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase mb-1">Avg Completion Rate</p>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">{Math.round(metrics.reduce((a, b) => a + b.completionRate, 0) / metrics.length)}%</p>
        </div>
        <div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase mb-1">Active</p>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{metrics.filter(m => m.status === 'Active').length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase mb-1">Pending</p>
          <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{metrics.filter(m => m.status !== 'Active').length}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>Ranked by completion rate and turnaround time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-3 font-semibold">Reviewer ID</th>
                  <th className="text-left py-3 px-3 font-semibold">Name</th>
                  <th className="text-left py-3 px-3 font-semibold">Status</th>
                  <th className="text-center py-3 px-3 font-semibold">Assigned</th>
                  <th className="text-center py-3 px-3 font-semibold">Completed</th>
                  <th className="text-center py-3 px-3 font-semibold">Completion Rate</th>
                  <th className="text-center py-3 px-3 font-semibold">Avg Turnaround</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50" data-testid={`row-performance-${idx}`}>
                    <td className="py-3 px-3 font-mono text-xs font-semibold text-blue-700 dark:text-blue-300">{metric.reviewerId}</td>
                    <td className="py-3 px-3">{metric.firstName} {metric.lastName}</td>
                    <td className="py-3 px-3">
                      <Badge className={metric.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}>
                        {metric.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-center font-semibold">{metric.totalAssigned}</td>
                    <td className="py-3 px-3 text-center font-semibold text-green-700 dark:text-green-300">{metric.completed}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: `${metric.completionRate}%`}}></div>
                        </div>
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 w-8 text-right">{metric.completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-xs">{metric.avgTurnaroundDays} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Submitted Reviews Component (for admin review approval)
function AdminSubmittedReviews() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const response = await fetch('/api/admin/submitted-reviews', { credentials: 'include' });
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Error loading submitted reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (reviewerId: string, manuscriptId: string) => {
    setProcessingId(`${reviewerId}-${manuscriptId}`);
    try {
      const response = await fetch('/api/admin/accept-review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ reviewerId, manuscriptId })
      });
      const data = await response.json();
      if (data.success) {
        toast({ 
          title: 'Review Accepted', 
          description: data.manuscriptAccepted 
            ? 'Manuscript status updated to Accepted!' 
            : 'Review marked as completed.'
        });
        loadReviews();
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reviewerId: string, manuscriptId: string) => {
    setProcessingId(`${reviewerId}-${manuscriptId}`);
    try {
      const response = await fetch('/api/admin/reject-review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ reviewerId, manuscriptId })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Review Rejected', description: 'Review has been rejected.' });
        loadReviews();
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="text-center py-8">Loading submitted reviews...</div>;
  if (reviews.length === 0) return (
    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Pending Reviews</h3>
      <p className="text-gray-500 dark:text-gray-400">All submitted reviews have been processed.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>{reviews.length}</strong> review(s) awaiting your approval. Accept 2 reviews for a manuscript to automatically update its status to "Accepted".
        </p>
      </div>
      
      {reviews.map((review, idx) => {
        const reviewKey = `${review.reviewerId}-${review.manuscriptId}`;
        const isExpanded = expandedReview === reviewKey;
        const isProcessing = processingId === reviewKey;
        
        return (
          <Card key={idx} className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    {review.manuscriptId}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Reviewed by: <span className="font-medium">{review.reviewerId}</span> | 
                    Submitted: <span className="font-medium">{review.submissionDate}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    parseInt(review.overallMarks) >= 8 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    parseInt(review.overallMarks) >= 5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    Marks: {review.overallMarks}/10
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {review.recommendation}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setExpandedReview(isExpanded ? null : reviewKey)}
                className="mb-4"
                data-testid={`button-expand-${idx}`}
              >
                {isExpanded ? 'Hide Details' : 'Show Full Review Comments'}
              </Button>
              
              {isExpanded && (
                <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Importance of Manuscript</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{review.importance || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Title Feedback</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{review.titleFeedback || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Abstract Feedback</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{review.abstractFeedback || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Scientific Correctness</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{review.scientificCorrectness || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">References Feedback</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{review.referencesFeedback || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Language Quality</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{review.languageQuality || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">General Comments</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{review.generalComments || 'Not provided'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Ethical Issues</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{review.ethicalIssues || 'No'}</p>
                      {review.ethicalDetails && (
                        <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">{review.ethicalDetails}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Plagiarism Suspected</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{review.plagiarismSuspected || 'None reported'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleAccept(review.reviewerId, review.manuscriptId)}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  data-testid={`button-accept-${idx}`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {isProcessing ? 'Processing...' : 'Accept Review'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleReject(review.reviewerId, review.manuscriptId)}
                  disabled={isProcessing}
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 flex items-center gap-2"
                  data-testid={`button-reject-${idx}`}
                >
                  <Clock className="w-4 h-4" />
                  {isProcessing ? 'Processing...' : 'Reject Review'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Payments List Component
function AdminPaymentsList() {
  const [payments, setPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [approvingEmail, setApprovingEmail] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    const filtered = payments.filter(p => 
      p.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.manuscriptTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transactionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPayments(filtered);
  }, [searchTerm, payments]);

  const loadPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments', { credentials: 'include' });
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (err) {
      console.error('Error loading payments:', err);
      toast({ title: 'Error', description: 'Failed to load payments', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (payment: any) => {
    setApprovingEmail(payment.email);
    try {
      const response = await fetch('/api/admin/approve-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({
          email: payment.email,
          transactionNumber: payment.transactionNumber,
          manuscriptTitle: payment.manuscriptTitle
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast({ title: 'Success', description: 'Payment approved! Manuscript status updated to Published.' });
        loadPayments();
      } else {
        toast({ title: 'Error', description: result.message || 'Failed to approve payment', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Error approving payment:', err);
      toast({ title: 'Error', description: 'Failed to approve payment', variant: 'destructive' });
    } finally {
      setApprovingEmail(null);
    }
  };

  if (loading) return (
    <div className="text-center py-8">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
      <p className="text-gray-600 dark:text-gray-400">Loading payments...</p>
    </div>
  );
  if (payments.length === 0) return (
    <div className="text-center py-8">
      <CreditCard className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
      <p className="text-gray-600 dark:text-gray-400 font-medium">No payments found</p>
      <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Payment records will appear here after submissions</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-1">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name, email, title, or transaction ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-payments"
          className="flex-1"
        />
      </div>
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
          <tr>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Author Name</th>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Email</th>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Manuscript Title</th>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Author Type</th>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Amount</th>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Mode</th>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Transaction ID</th>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Date</th>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Proof</th>
            <th className="px-4 py-3 text-center text-gray-900 dark:text-gray-100">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map((payment, idx) => (
            <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium" data-testid={`text-author-${idx}`}>{payment.firstName}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100 text-xs" data-testid={`text-email-${idx}`}>{payment.email}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100 max-w-xs truncate" data-testid={`text-title-${idx}`}>{payment.manuscriptTitle}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100 text-xs" data-testid={`text-author-type-${idx}`}>{payment.authorType === 'indian' ? 'Indian' : 'International'}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-semibold" data-testid={`text-amount-${idx}`}>{payment.currency} {payment.amountPaid || payment.calculatedAmount}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100 text-xs" data-testid={`text-mode-${idx}`}>{payment.modeOfPayment}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-mono text-xs" data-testid={`text-txn-${idx}`}>{payment.transactionNumber}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100 text-xs" data-testid={`text-date-${idx}`}>{payment.dateOfPayment}</td>
              <td className="px-4 py-3 text-center">
                {payment.paymentProofUrl && (
                  <a 
                    href={payment.paymentProofUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    data-testid={`link-proof-${idx}`}
                  >
                    <Download className="w-4 h-4 inline" />
                  </a>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <Button
                  size="sm"
                  onClick={() => handleApprovePayment(payment)}
                  disabled={approvingEmail === payment.email}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid={`button-approve-payment-${idx}`}
                >
                  {approvingEmail === payment.email ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve
                    </>
                  )}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// Helper component for manuscript detail rows
function MsDetailRow({ label, value, isMono, isFull, isStatus }: { label: string; value: string; isMono?: boolean; isFull?: boolean; isStatus?: boolean }) {
  return (
    <div className={cn("space-y-1", isFull && "col-span-2")}>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      <div className={cn(
        "text-sm font-medium text-gray-800 dark:text-gray-200",
        isMono && "font-mono font-bold text-[#213361] dark:text-blue-300",
        isStatus && "text-blue-600 font-bold"
      )}>
        {value || '—'}
      </div>
    </div>
  );
}

// Manuscripts List Component
function AdminManuscriptsList() {
  const [manuscripts, setManuscripts] = useState<any[]>([]);
  const [filteredManuscripts, setFilteredManuscripts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedManuscript, setSelectedManuscript] = useState<any | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadManuscripts();
    loadAssignments();
  }, []);

  useEffect(() => {
    let filtered = manuscripts.filter(m => {
      const id = (m['Manuscript ID'] || m.manuscriptId || '').toLowerCase();
      const title = (m['Manuscript Title'] || m.title || '').toLowerCase();
      const author = (m['First Author Name'] || m.author || '').toLowerCase();
      return id.includes(searchTerm.toLowerCase()) ||
             title.includes(searchTerm.toLowerCase()) ||
             author.includes(searchTerm.toLowerCase());
    });
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => (m['Status'] || m.status || '').toLowerCase() === statusFilter.toLowerCase());
    }
    setFilteredManuscripts(filtered);
  }, [searchTerm, statusFilter, manuscripts]);

  const loadManuscripts = async () => {
    try {
      const response = await fetch('/api/admin/manuscripts', { credentials: 'include' });
      const data = await response.json();
      setManuscripts(data.manuscripts || []);
    } catch (err) {
      console.error('Error loading manuscripts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await fetch('/api/admin/assignments', { credentials: 'include' });
      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      console.error('Error loading assignments:', err);
    }
  };

  const getAssignmentStatus = (manuscriptId: string) => {
    const assignment = assignments.find(a => a.manuscriptId === manuscriptId);
    if (!assignment) return 'Unassigned';
    return assignment.status || 'Pending';
  };

  const handleStatusChange = async (manuscriptId: string, newStatus: string) => {
    setUpdatingStatus(manuscriptId);
    try {
      const response = await fetch('/api/admin/update-manuscript-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ manuscriptId, newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setManuscripts(prev => prev.map(m => {
          const msId = m['Manuscript ID'] || m.manuscriptId;
          return msId === manuscriptId ? { ...m, ['Status']: newStatus, status: newStatus } : m;
        }));
        toast({ title: 'Success', description: `Status updated to "${newStatus}"` });
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to update status', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) return (
    <div className="text-center py-8">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
      <p className="text-gray-600 dark:text-gray-400">Loading manuscripts...</p>
    </div>
  );

  const statusCounts = {
    all: manuscripts.length,
    'under review': manuscripts.filter(m => (m['Status'] || '').toLowerCase() === 'under review').length,
    accepted: manuscripts.filter(m => (m['Status'] || '').toLowerCase() === 'accepted').length,
    published: manuscripts.filter(m => (m['Status'] || '').toLowerCase() === 'published').length,
    rejected: manuscripts.filter(m => (m['Status'] || '').toLowerCase() === 'rejected').length,
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All', count: statusCounts.all, color: 'bg-gray-100 text-gray-700' },
          { key: 'under review', label: 'Under Review', count: statusCounts['under review'], color: 'bg-amber-100 text-amber-700' },
          { key: 'accepted', label: 'Accepted', count: statusCounts.accepted, color: 'bg-green-100 text-green-700' },
          { key: 'published', label: 'Published', count: statusCounts.published, color: 'bg-blue-100 text-blue-700' },
          { key: 'rejected', label: 'Rejected', count: statusCounts.rejected, color: 'bg-red-100 text-red-700' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              statusFilter === tab.key ? tab.color + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            <span className={`rounded-full px-1.5 text-[10px] font-black ${statusFilter === tab.key ? 'bg-white/60' : 'bg-gray-200'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by ID, title, or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-manuscripts"
          className="flex-1 bg-transparent text-sm outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400"
        />
      </div>

      {/* Table */}
      {filteredManuscripts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
          <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No manuscripts found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#213361] text-white">
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest">Manuscript ID</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest">Date</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest">Title / Author</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest">Journal</th>
                  <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest">Contact</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest">Assigned</th>
                  <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredManuscripts.map((manuscript, idx) => {
                  const id = manuscript['Manuscript ID'] || manuscript.manuscriptId;
                  const rawStatus = (manuscript['Status'] || manuscript.status || 'Under Review').toLowerCase();
                  const assignStatus = getAssignmentStatus(id);
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#213361] dark:text-blue-300 text-xs">{id}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{manuscript['Submitted At'] || manuscript.submittedDate || 'N/A'}</td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p
                          className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-2 cursor-pointer hover:underline"
                          onClick={() => setSelectedManuscript(manuscript)}
                          data-testid={`text-ms-title-${idx}`}
                        >
                          {manuscript['Manuscript Title'] || manuscript.title}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{manuscript['First Author Name'] || manuscript.author}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 max-w-[120px]">{manuscript['Journal Type'] || manuscript.journal}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                          rawStatus === 'published' ? 'bg-blue-100 text-blue-700' :
                          rawStatus === 'accepted' ? 'bg-green-100 text-green-700' :
                          rawStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`} data-testid={`text-ms-status-${idx}`}>
                          {manuscript['Status'] || manuscript.status || 'Under Review'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[10px] text-gray-600 dark:text-gray-400">
                        <p className="font-bold truncate max-w-[120px]">{manuscript['Email'] || 'N/A'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          assignStatus !== 'Unassigned'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-orange-100 text-orange-700'
                        }`} data-testid={`badge-ms-assigned-${idx}`}>
                          {assignStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-bold text-gray-600">
                              Actions ▾
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-44 p-1" align="end">
                            <div className="flex flex-col">
                              <button
                                className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-100 rounded text-left text-gray-700"
                                onClick={() => setSelectedManuscript(manuscript)}
                              >
                                <Search className="w-3 h-3 text-blue-600" /> View Details
                              </button>
                              <div className="h-px bg-gray-100 my-1" />
                              {updatingStatus === id ? (
                                <div className="flex items-center justify-center py-2">
                                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                </div>
                              ) : (
                                <>
                                  <button className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-100 rounded text-left text-green-700" onClick={() => handleStatusChange(id, 'Accepted')}>
                                    <CheckCircle className="w-3 h-3" /> Accept
                                  </button>
                                  <button className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-100 rounded text-left text-amber-700" onClick={() => handleStatusChange(id, 'Under Review')}>
                                    <Clock className="w-3 h-3" /> Under Review
                                  </button>
                                  <button className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-100 rounded text-left text-blue-700" onClick={() => handleStatusChange(id, 'Published')}>
                                    <ExternalLink className="w-3 h-3" /> Publish
                                  </button>
                                  <button className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-100 rounded text-left text-red-700" onClick={() => handleStatusChange(id, 'Rejected')}>
                                    <AlertCircle className="w-3 h-3" /> Reject
                                  </button>
                                  {manuscript['File URL'] && typeof manuscript['File URL'] === 'string' && manuscript['File URL'].startsWith('http') && (
                                    <>
                                      <div className="h-px bg-gray-100 my-1" />
                                      <a
                                        href={manuscript['File URL']}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-100 rounded text-left text-gray-700"
                                        data-testid={`link-download-${idx}`}
                                      >
                                        <Download className="w-3 h-3" /> Download
                                      </a>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={selectedManuscript !== null} onOpenChange={(open) => !open && setSelectedManuscript(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-[#213361] px-8 py-6 text-white">
            <DialogTitle className="text-2xl font-bold text-white mb-1">Manuscript Details</DialogTitle>
            <DialogDescription className="text-blue-200 text-sm">
              ID: {selectedManuscript?.['Manuscript ID'] || selectedManuscript?.manuscriptId}
            </DialogDescription>
          </div>
          <div className="p-8 max-h-[75vh] overflow-y-auto bg-white dark:bg-gray-900">
            {selectedManuscript && (
              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                <MsDetailRow label="Manuscript ID" value={selectedManuscript['Manuscript ID'] || selectedManuscript.manuscriptId} isMono />
                <MsDetailRow label="Submitted Date" value={selectedManuscript['Submitted At'] || 'N/A'} />
                <MsDetailRow label="First Author" value={selectedManuscript['First Author Name'] || 'N/A'} />
                <MsDetailRow label="Email" value={selectedManuscript['Email'] || 'N/A'} />
                <MsDetailRow label="Mobile Number" value={selectedManuscript['Mobile Number'] || 'N/A'} />
                <MsDetailRow label="Journal" value={selectedManuscript['Journal Type'] || 'N/A'} />
                <MsDetailRow label="Status" value={selectedManuscript['Status'] || 'N/A'} isStatus isFull />
                <MsDetailRow label="Manuscript Title" value={selectedManuscript['Manuscript Title'] || 'N/A'} isFull />
                <MsDetailRow label="Research Field" value={selectedManuscript['Research Field'] || 'N/A'} />
                <MsDetailRow label="Number of Authors" value={selectedManuscript['Number of Authors'] || 'N/A'} />
                <MsDetailRow label="Designation" value={selectedManuscript['Designation'] || 'N/A'} />
                <MsDetailRow label="Department" value={selectedManuscript['Department'] || 'N/A'} />
                <MsDetailRow label="Organisation" value={selectedManuscript['Organisation'] || 'N/A'} />
                <MsDetailRow label="DOI" value={selectedManuscript['DOI'] || 'N/A'} />

                <div className="col-span-2 pt-4 border-t border-gray-100 flex items-center gap-3">
                  {selectedManuscript['File URL'] && typeof selectedManuscript['File URL'] === 'string' && selectedManuscript['File URL'].startsWith('http') && (
                    <Button asChild className="bg-[#213361] hover:bg-[#2a4078]">
                      <a href={selectedManuscript['File URL']} target="_blank" rel="noopener noreferrer" data-testid="link-download-manuscript">
                        <Download className="w-4 h-4 mr-2" /> Download Paper
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setSelectedManuscript(null)}>Close</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [currentMenu, setCurrentMenu] = useState('reviewer-approval');
  const [stats, setStats] = useState({
    reviewersCount: 0,
    editorialCount: 0,
    manuscriptsCount: 0,
    assignmentsCount: 0,
    pendingReviewsCount: 0
  });
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [changingPassword, setChangingPassword] = useState(false);
  const [settingPopup, setSettingPopup] = useState(false);
  const [loginActivities, setLoginActivities] = useState<any[]>([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState<string | null>(null);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupContent, setPopupContent] = useState('');
  const [popupRole, setPopupRole] = useState('Editor');
  const [popupExpiry, setPopupExpiry] = useState('');
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const downloadTabData = async (endpoint: string, filename: string) => {
    try {
      const res = await fetch(endpoint);
      const result = await res.json();
      if (result.success && result.data) {
        downloadExcel(result.data, filename);
        toast({ title: 'Success', description: 'Data downloaded as CSV' });
      } else {
        toast({ title: 'Error', description: 'Failed to download data', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Error downloading data', variant: 'destructive' });
    }
  };

  const fetchLoginActivities = async () => {
    try {
      const res = await fetch('/api/admin/login-activities', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setLoginActivities(data.activities);
      }
    } catch (error) {
      console.error('Error fetching login activities:', error);
    }
  };

  const fetchNewsletterSubscribers = async () => {
    try {
      const res = await fetch('/api/admin/newsletter-subscribers', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setNewsletterSubscribers(data.subscribers || []);
      }
    } catch (error) {
      console.error('Error fetching newsletter subscribers:', error);
    }
  };

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      setLocation('/admin/login');
      return;
    }

    try {
      const session = JSON.parse(adminSession);
      setAdminEmail(session.email);
      setIsAuthenticated(true);
      
      // Load statistics
      loadStats();
      // Load message count
      loadMessageCount();
      // Load login activities
      fetchLoginActivities();
      // Load newsletter subscribers
      fetchNewsletterSubscribers();

      // Poll for updated stats every 5 seconds for live login activity tracking
      const pollInterval = setInterval(() => {
        loadStats();
        loadMessageCount();
        fetchLoginActivities();
        if (currentMenu === 'newsletter') {
          fetchNewsletterSubscribers();
        }
      }, 5000);

      return () => clearInterval(pollInterval);
    } catch (err) {
      localStorage.removeItem('adminSession');
      setLocation('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [setLocation]);

  const loadMessageCount = async () => {
    try {
      const response = await fetch('/api/admin/message-threads', { credentials: 'include' });
      const data = await response.json();
      // Count only unread messages (threads where latest message is from reviewer)
      const unreadCount = data.threads?.filter((thread: any) => {
        const latestMessage = thread.messages?.[thread.messages.length - 1];
        return latestMessage?.type === 'reviewer';
      })?.length || 0;
      setUnreadMessageCount(unreadCount);
    } catch (err) {
      console.error('Error loading message count:', err);
    }
  };

  useEffect(() => {
    // 5-minute inactivity auto-logout
    const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        localStorage.removeItem('adminSession');
        toast({
          title: 'Session Expired',
          description: 'You have been logged out due to inactivity.',
          variant: 'destructive'
        });
        setLocation('/admin/login');
      }, INACTIVITY_TIMEOUT);
    };

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer);
    });

    // Initialize timer on component mount
    resetInactivityTimer();

    // Cleanup
    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [setLocation, toast]);

  const loadStats = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/admin/stats', { credentials: 'include' });
      const data = await response.json();
      if (response.ok) {
        setStats(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    setLocation('/admin/login');
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors(['Passwords do not match']);
      return;
    }
    setChangingPassword(true);
    try {
      const response = await fetch('/api/admin/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Success', description: 'Password changed successfully!' });
        setShowPasswordDialog(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
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

  const handleSetPopupMessage = async () => {
    if (!popupTitle.trim() || !popupContent.trim()) {
      toast({ title: 'Error', description: 'Title and message are required', variant: 'destructive' });
      return;
    }
    setSettingPopup(true);
    try {
      const response = await fetch('/api/admin/set-popup-message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({
          title: popupTitle,
          content: popupContent,
          targetRole: popupRole,
          expiresAt: popupExpiry || null
        })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Success', description: 'Broadcast message sent successfully!' });
        setPopupTitle('');
        setPopupContent('');
        setPopupRole('Editor');
        setPopupExpiry('');
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to set message', variant: 'destructive' });
    } finally {
      setSettingPopup(false);
    }
  };

  const handleAutoAssign = async () => {
    setAutoAssigning(true);
    try {
      const response = await fetch('/api/admin/auto-assign-under-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Auto-Assignment Complete',
          description: `${data.assigned} manuscript(s) assigned to reviewers successfully!`,
        });
        loadStats();
      } else {
        toast({
          title: 'Auto-Assignment Result',
          description: data.message || 'No manuscripts to assign',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to auto-assign manuscripts',
        variant: 'destructive',
      });
    } finally {
      setAutoAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Admin Dashboard...</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO
        title="Admin Dashboard - Scholar India Publishers"
        description="Administrator panel for managing reviewers and manuscript assignments."
      />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              data-testid="button-mobile-menu-toggle"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-blue-900 dark:text-blue-300">Admin Dashboard</h1>
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-semibold rounded-full">
                  <span className={`w-2 h-2 rounded-full bg-green-500 ${isRefreshing ? 'animate-ping' : 'animate-pulse'}`}></span>
                  LIVE
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Logged in as: {adminEmail} | Updated: {lastUpdated.toLocaleTimeString()}</p>
            </div>
          </div>
          <div className="flex gap-1 md:gap-2 flex-wrap justify-end">
            <Button
              variant="outline"
              onClick={() => setCurrentMenu('popup-messages')}
              data-testid="button-set-popup"
              size="sm"
              className="flex items-center gap-1 md:gap-2 text-purple-600 text-xs md:text-sm"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Popup</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(true)}
              data-testid="button-change-admin-password"
              size="sm"
              className="flex items-center gap-1 md:gap-2 text-blue-600 text-xs md:text-sm"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Password</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              data-testid="button-logout"
              size="sm"
              className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent data-testid="dialog-admin-change-password">
            <DialogHeader>
              <DialogTitle>Change Admin Password</DialogTitle>
              <DialogDescription>Create a strong password with at least 8 characters, uppercase, lowercase, number, and special character</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {passwordErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  {passwordErrors.map((err, idx) => (
                    <p key={idx} className="text-sm text-red-600">{err}</p>
                  ))}
                </div>
              )}
              <Input
                type="password"
                placeholder="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                data-testid="input-current-password"
              />
              <Input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                data-testid="input-admin-new-password"
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                data-testid="input-admin-confirm-password"
              />
              <Button
                onClick={handleChangePassword}
                disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                className="w-full"
                data-testid="button-submit-admin-password"
              >
                {changingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Change Password
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 max-w-7xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total Reviewers</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-300 mt-1">{stats.reviewersCount}</p>
                </div>
                <Users className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Editorial Members</p>
                  <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-300 mt-1">{stats.editorialCount}</p>
                </div>
                <Award className="w-12 h-12 text-indigo-600 dark:text-indigo-400 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total Papers</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-300 mt-1">{stats.manuscriptsCount}</p>
                </div>
                <FileText className="w-12 h-12 text-green-600 dark:text-green-400 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Reviews</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-300 mt-1">{stats.pendingReviewsCount}</p>
                </div>
                <Clock className="w-12 h-12 text-orange-600 dark:text-orange-400 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu - Sidebar + Content */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 max-w-full">
          {/* Sidebar Menu */}
          <div className={`${mobileMenuOpen ? 'block' : 'hidden md:block'} w-full md:w-72 flex-shrink-0 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 dark:from-blue-950 dark:via-blue-900 dark:to-slate-900 rounded-xl border-2 border-blue-700 dark:border-blue-600 shadow-2xl overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-180px)]`}>
            {/* Header Section with Logo */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-900 to-blue-800 border-b-2 border-yellow-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
                  <span className="text-blue-900 font-bold text-lg">SIP</span>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Admin Portal</p>
                  <p className="text-blue-200 text-xs">Scholar India Publishers</p>
                </div>
              </div>
            </div>

            {/* Section 1 - Approvals & Workflow */}
            <div className="px-6 py-3 bg-gradient-to-r from-blue-800/50 to-blue-700/30 border-b border-blue-600">
              <p className="text-xs font-bold text-yellow-300 uppercase tracking-widest">✓ Approvals & Workflow</p>
            </div>
            <div className="space-y-2 px-4 py-4">
              {[
                { id: 'reviewer-approval', label: 'Approve Reviewers', icon: Award, color: 'amber', bgColor: 'from-amber-500/20' },
                { id: 'editorial-approval', label: 'Approve Board', icon: Award, color: 'purple', bgColor: 'from-purple-500/20' },
                { id: 'assign', label: 'Assign Work', icon: Zap, color: 'yellow', bgColor: 'from-yellow-400/20' },
                { id: 'review-approval', label: 'Approve Reviews', icon: CheckCircle, color: 'green', bgColor: 'from-green-500/20' }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentMenu(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left border-l-4 ${
                      currentMenu === item.id
                        ? `bg-gradient-to-r ${item.bgColor} to-transparent border-l-yellow-400 text-white shadow-lg`
                        : 'border-l-blue-700 text-blue-100 hover:text-white hover:bg-blue-800/30'
                    }`}
                    data-testid={`menu-${item.id}`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Section 2 - Tracking & Management */}
            <div className="px-6 py-3 bg-gradient-to-r from-blue-800/50 to-blue-700/30 border-b border-blue-600">
              <p className="text-xs font-bold text-yellow-300 uppercase tracking-widest">📊 Tracking & Management</p>
            </div>
            <div className="space-y-2 px-4 py-4">
              {[
                { id: 'assignments', label: 'Assignments', icon: FileText, color: 'indigo', bgColor: 'from-indigo-500/20' },
                { id: 'reviewers', label: 'Reviewers', icon: Users, color: 'cyan', bgColor: 'from-cyan-500/20' },
                { id: 'board', label: 'Board Members', icon: Award, color: 'pink', bgColor: 'from-pink-500/20' },
                { id: 'manuscripts', label: 'Manuscripts', icon: FileText, color: 'rose', bgColor: 'from-rose-500/20' },
                { id: 'messages', label: `Messages${unreadMessageCount > 0 ? ` (${unreadMessageCount})` : ''}`, icon: MessageSquare, color: 'lime', bgColor: 'from-lime-500/20' },
                { id: 'payments', label: 'Payments', icon: CreditCard, color: 'violet', bgColor: 'from-violet-500/20' },
                { id: 'newsletter', label: 'Newsletter', icon: Mail, color: 'blue', bgColor: 'from-blue-400/20' }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentMenu(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left border-l-4 ${
                      currentMenu === item.id
                        ? `bg-gradient-to-r ${item.bgColor} to-transparent border-l-yellow-400 text-white shadow-lg`
                        : 'border-l-blue-700 text-blue-100 hover:text-white hover:bg-blue-800/30'
                    }`}
                    data-testid={`menu-${item.id}`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.id === 'messages' && unreadMessageCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 ml-2">{unreadMessageCount}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Section 3 - Activity & Audit */}
            <div className="px-6 py-3 bg-gradient-to-r from-blue-800/50 to-blue-700/30 border-b border-blue-600">
              <p className="text-xs font-bold text-yellow-300 uppercase tracking-widest">📋 Activity & Audit</p>
            </div>
            <div className="space-y-2 px-4 py-4">
              {[
                { id: 'login-activity', label: 'Login Activity', icon: LogOut, color: 'orange', bgColor: 'from-orange-500/20' },
                { id: 'popup-messages', label: 'Popup Messages', icon: Bell, color: 'cyan', bgColor: 'from-cyan-500/20' },
                { id: 'performance', label: 'Performance', icon: Award, color: 'emerald', bgColor: 'from-emerald-500/20' },
                { id: 'deadlines', label: 'Deadline Calendar', icon: Calendar, color: 'indigo', bgColor: 'from-indigo-500/20' }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentMenu(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left border-l-4 ${
                      currentMenu === item.id
                        ? `bg-gradient-to-r ${item.bgColor} to-transparent border-l-yellow-400 text-white shadow-lg`
                        : 'border-l-blue-700 text-blue-100 hover:text-white hover:bg-blue-800/30'
                    }`}
                    data-testid={`menu-${item.id}`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-blue-200 dark:border-blue-900 shadow-lg p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-180px)]">
            {currentMenu === 'assign' && (
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    Auto-Assign Under Review Manuscripts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Automatically assign all manuscripts marked as "Under Review" to available reviewers using round-robin distribution.
                  </p>
                  <Button
                    onClick={handleAutoAssign}
                    disabled={autoAssigning}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    data-testid="button-auto-assign"
                  >
                    {autoAssigning ? 'Assigning...' : 'Auto-Assign Now'}
                  </Button>
                </CardContent>
              </Card>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Manual Assignment</h3>
                <AdminAssignmentForm onAssignmentSuccess={() => loadStats()} />
              </div>
            </div>
            )}
            {currentMenu === 'reviewer-approval' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  Reviewer Approvals
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Review and approve pending reviewer applications. Approved reviewers (status: Active) become available for manuscript assignments.
                </p>
              </div>
              <AdminReviewerApprovals />
            </div>
            )}
            {currentMenu === 'editorial-approval' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Editorial Board Approvals
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Review and approve pending editorial board member applications. Approved members (status: Active) become visible on journal pages.
                </p>
              </div>
              <AdminEditorialBoardApprovals />
            </div>
            )}
            {currentMenu === 'review-approval' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Review Approval
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Review submitted peer reviews from reviewers. Accept or reject each review. 
                  When you accept 2 reviews for the same manuscript, the manuscript status will automatically update to "Accepted".
                </p>
              </div>
              <AdminSubmittedReviews />
            </div>
            )}
            {currentMenu === 'assignments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Assignment Tracking</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Monitor all manuscript assignments, reviewer completion status, and marks</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => downloadTabData('/api/admin/export/assignments', 'assignments.csv')} data-testid="button-download-assignments">
                  <Download className="w-4 h-4 mr-2" /> Download as CSV
                </Button>
              </div>
              <AdminAssignmentsList />
            </div>
            )}
            {currentMenu === 'reviewers' && (
            <div className="space-y-4">
              <div className="flex justify-end mb-4">
                <Button size="sm" variant="outline" onClick={() => downloadTabData('/api/admin/export/reviewers', 'reviewers.csv')} data-testid="button-download-reviewers">
                  <Download className="w-4 h-4 mr-2" /> Download as CSV
                </Button>
              </div>
              <AdminReviewersList roleFilter="Reviewer" />
            </div>
            )}
            {currentMenu === 'board' && (
            <div className="space-y-4">
              <div className="flex justify-end mb-4">
                <Button size="sm" variant="outline" onClick={() => downloadTabData('/api/admin/export/board', 'board.csv')} data-testid="button-download-board">
                  <Download className="w-4 h-4 mr-2" /> Download as CSV
                </Button>
              </div>
              <AdminReviewersList roleFilter="Editorial Board Member" />
            </div>
            )}
            {currentMenu === 'messages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Reviewer Messages
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">View all messages sent by reviewers about their assigned manuscripts</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => downloadTabData('/api/admin/export/messages', 'messages.csv')} data-testid="button-download-messages">
                  <Download className="w-4 h-4 mr-2" /> Download as CSV
                </Button>
              </div>
              <AdminReviewerMessages />
            </div>
            )}
            {currentMenu === 'manuscripts' && (
            <div className="space-y-4">
              <div className="flex justify-end mb-4">
                <Button size="sm" variant="outline" onClick={() => downloadTabData('/api/admin/export/manuscripts', 'manuscripts.csv')} data-testid="button-download-manuscripts">
                  <Download className="w-4 h-4 mr-2" /> Download as CSV
                </Button>
              </div>
              <AdminManuscriptsList />
            </div>
            )}
            {currentMenu === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-violet-600" />
                    Payment Records
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Track all author payment submissions with proof and transaction details</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => downloadTabData('/api/admin/export/payments', 'payments.csv')} data-testid="button-download-payments">
                  <Download className="w-4 h-4 mr-2" /> Download as CSV
                </Button>
              </div>
              <AdminPaymentsList />
            </div>
            )}
            {currentMenu === 'popup-messages' && (
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border border-cyan-200 dark:border-cyan-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-cyan-600" />
                    Broadcast Message to Editors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message Title</label>
                    <input type="text" placeholder="Enter title" value={popupTitle} onChange={(e) => setPopupTitle(e.target.value)} className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-800 dark:border-cyan-700" data-testid="input-popup-title" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message Content</label>
                    <textarea placeholder="Enter message content" value={popupContent} onChange={(e) => setPopupContent(e.target.value)} className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-800 dark:border-cyan-700 resize-none h-24" data-testid="textarea-popup-content" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Role</label>
                      <select value={popupRole} onChange={(e) => setPopupRole(e.target.value)} className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-800 dark:border-cyan-700" data-testid="select-popup-role">
                        <option value="Editor">Editor</option>
                        <option value="Reviewer">Reviewer</option>
                        <option value="Editorial Board Member">Editorial Board Member</option>
                        <option value="All">All Roles</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expires On (optional)</label>
                      <input type="date" value={popupExpiry} onChange={(e) => setPopupExpiry(e.target.value)} className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-800 dark:border-cyan-700" data-testid="input-popup-expiry" />
                    </div>
                  </div>
                  <Button onClick={handleSetPopupMessage} disabled={!popupTitle || !popupContent} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" data-testid="button-set-popup">
                    Send Broadcast Message
                  </Button>
                </CardContent>
              </Card>
            </div>
            )}
            {currentMenu === 'newsletter' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Newsletter Subscribers
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">View all email subscribers to the newsletter</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => downloadTabData('/api/admin/export/newsletter', 'newsletter_subscribers.csv')} data-testid="button-download-newsletter">
                  <Download className="w-4 h-4 mr-2" /> Download as CSV
                </Button>
              </div>
              <Card>
                <CardContent className="pt-6">
                  {newsletterSubscribers.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No newsletter subscribers yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Email</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Subscribed At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {newsletterSubscribers.map((subscriber: any, idx: number) => (
                            <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700/50" data-testid={`row-subscriber-${idx}`}>
                              <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{subscriber.email}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">{subscriber.subscribedAt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Subscribers: <span className="font-bold text-gray-900 dark:text-gray-100">{newsletterSubscribers.length}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}
            {currentMenu === 'performance' && (
              <AdminReviewerPerformance />
            )}
            {currentMenu === 'deadlines' && (
              <AdminDeadlineCalendar />
            )}
            {currentMenu === 'login-activity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <LogOut className="w-5 h-5 text-orange-600" />
                    Reviewer/Editor Login Activity
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Click on a Reviewer/Editor ID to view their login activities</p>
                </div>
                <Button 
                  onClick={fetchLoginActivities}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  data-testid="button-refresh-login-activities"
                >
                  <span>🔄</span>
                  Refresh Now
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {/* Left Panel: List of Reviewer/Editor IDs */}
                <Card className="col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Users ({new Set(loginActivities.map(a => a.reviewerId)).size})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {loginActivities.length === 0 ? (
                        <p className="text-sm text-gray-500 p-2">No login activities yet</p>
                      ) : (
                        Array.from(new Set(loginActivities.map(a => a.reviewerId))).map((id) => (
                          <button
                            key={id}
                            onClick={() => setSelectedReviewerId(id as string)}
                            className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                              selectedReviewerId === id
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            data-testid={`button-reviewer-id-${id}`}
                          >
                            {id}
                          </button>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Right Panel: Activities for Selected ID */}
                <Card className="col-span-3">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                      {selectedReviewerId ? `Login Activities - ${selectedReviewerId}` : 'Select a user to view activities'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!selectedReviewerId ? (
                      <p className="text-sm text-gray-500 text-center py-8">Select a Reviewer/Editor ID from the left to view their login activities</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-3">Time</th>
                              <th className="text-left py-2 px-3">Activity</th>
                              <th className="text-left py-2 px-3">Name</th>
                              <th className="text-left py-2 px-3">Email</th>
                              <th className="text-left py-2 px-3">Role</th>
                              <th className="text-left py-2 px-3">Journal</th>
                              <th className="text-left py-2 px-3">IP Address</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loginActivities.filter(a => a.reviewerId === selectedReviewerId).length === 0 ? (
                              <tr>
                                <td colSpan={7} className="text-center py-4 text-gray-500">No activities found</td>
                              </tr>
                            ) : (
                              loginActivities
                                .filter(a => a.reviewerId === selectedReviewerId)
                                .sort((a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime())
                                .map((activity, idx) => {
                                  const getActivityBadge = (type: string) => {
                                    const colors: Record<string, [string, string]> = {
                                      'login': ['bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', 'Login'],
                                      'update': ['bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100', 'Update'],
                                      'message': ['bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100', 'Message'],
                                      'review_submission': ['bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100', 'Review']
                                    };
                                    const [bgClass, label] = colors[type] || colors['login'];
                                    return <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${bgClass}`}>{label}</span>;
                                  };
                                  return (
                                    <tr key={activity.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700/50" data-testid={`row-login-${idx}`}>
                                      <td className="py-2 px-3 text-xs">{new Date(activity.loginTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                                      <td className="py-2 px-3">{getActivityBadge((activity as any).activityType || 'login')}</td>
                                      <td className="py-2 px-3">{activity.firstName} {activity.lastName}</td>
                                      <td className="py-2 px-3 text-xs">{activity.email}</td>
                                      <td className="py-2 px-3"><Badge variant="outline" className="text-xs">{activity.role}</Badge></td>
                                      <td className="py-2 px-3 text-xs">{activity.journal}</td>
                                      <td className="py-2 px-3 text-xs">{activity.ipAddress || 'N/A'}</td>
                                    </tr>
                                  );
                                })
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
