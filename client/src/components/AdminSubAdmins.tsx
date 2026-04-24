import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MAIL_SERVER_URL, MAIL_API_KEY } from "@/lib/config";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import {
  UserPlus, Edit, Trash2, Loader2, Shield, CheckSquare, Square,
  Eye, EyeOff, RefreshCw, ToggleLeft, ToggleRight
} from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';

// All available admin tabs with labels
const ALL_TABS = [
  { id: 'dashboard',        label: 'Dashboard' },
  { id: 'manuscripts',      label: 'Manuscripts' },
  { id: 'reviewers',        label: 'EB & Reviewers' },
  { id: 'reviews',          label: 'Approve Reviews' },
  { id: 'assign',           label: 'Assign Work' },
  { id: 'assignments',      label: 'Assignments' },
  { id: 'final_submissions',label: 'Final Submissions' },
  { id: 'payments',         label: 'Payments' },
  { id: 'books',            label: 'Books' },
  { id: 'journals',         label: 'Journals' },
  { id: 'archives',         label: 'Archives' },
  { id: 'certificates',     label: 'Certificates' },
  { id: 'leads',            label: 'Contact Leads' },
  { id: 'newsletter',       label: 'Newsletter' },
  { id: 'messages',         label: 'Messages' },
  { id: 'broadcast',        label: 'Broadcast Popup' },
  { id: 'deadlines',        label: 'Deadlines' },
  { id: 'performance',      label: 'Performance' },
  { id: 'activity',         label: 'Login Activity' },
  { id: 'users',            label: 'Users' },
];

const BLANK_FORM = {
  name: '', email: '', password: '', allowed_tabs: [] as string[], allowed_journals: [] as string[], is_active: true
};

export function AdminSubAdmins() {
  const { toast } = useToast();
  const [subAdmins, setSubAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [journals, setJournals] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [showPassword, setShowPassword] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSubAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('sub_admins')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSubAdmins(data || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchJournals = async () => {
    try {
      const { data } = await supabaseAdmin.from('journals').select('id, title');
      setJournals(data || []);
    } catch (e) {}
  };

  useEffect(() => { 
    fetchSubAdmins();
    fetchJournals();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...BLANK_FORM });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEdit = (sa: any) => {
    setEditingId(sa.id);
    setForm({
      name: sa.name || '',
      email: sa.email || '',
      password: '',          // don't pre-fill; blank = keep existing
      allowed_tabs: sa.allowed_tabs || [],
      allowed_journals: sa.allowed_journals || [],
      is_active: sa.is_active ?? true
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const toggleTab = (id: string) => {
    setForm(f => ({
      ...f,
      allowed_tabs: f.allowed_tabs.includes(id)
        ? f.allowed_tabs.filter(t => t !== id)
        : [...f.allowed_tabs, id]
    }));
  };

  const selectAll = () => setForm(f => ({ ...f, allowed_tabs: ALL_TABS.map(t => t.id) }));
  const clearAll  = () => setForm(f => ({ ...f, allowed_tabs: [] }));

  const toggleJournal = (id: string) => {
    setForm(f => ({
      ...f,
      allowed_journals: f.allowed_journals.includes(id)
        ? f.allowed_journals.filter(t => t !== id)
        : [...f.allowed_journals, id]
    }));
  };

  const selectAllJournals = () => setForm(f => ({ ...f, allowed_journals: journals.map(j => j.title) }));
  const clearAllJournals  = () => setForm(f => ({ ...f, allowed_journals: [] }));


  const triggerEmail = async (endpoint: string, payload: any) => {
    try {
      const res = await fetch(`${MAIL_SERVER_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MAIL_API_KEY
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Mail failed');
      return true;
    } catch (e) {
      console.error(`Mail trigger error [${endpoint}]:`, e);
      return false;
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: 'Required', description: 'Name and email are required.', variant: 'destructive' }); return;
    }
    if (!editingId && !form.password.trim()) {
      toast({ title: 'Required', description: 'Password is required for new sub-admins.', variant: 'destructive' }); return;
    }
    if (form.allowed_tabs.length === 0) {
      toast({ title: 'Required', description: 'Select at least one tab permission.', variant: 'destructive' }); return;
    }

    setSaving(true);
    try {
      const email = form.email.trim().toLowerCase();
      const password = form.password.trim();
      let authUserId = null;

      if (editingId) {
        // 1. Update identifying info in sub_admins table
        const { data: currentSa } = await supabaseAdmin.from('sub_admins').select('auth_id').eq('id', editingId).single();
        authUserId = currentSa?.auth_id;

        // 2. If password changed, update in Supabase Auth
        if (password && authUserId) {
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
            password: password
          });
          if (updateError) throw updateError;
        }
      } else {
        // 1. Create user in Supabase Auth first
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: { role: 'sub_admin', name: form.name.trim() }
        });

        if (authError) {
          if (authError.message.includes('already been registered')) {
            // If already exists in Auth, we might want to link it if we know what we're doing
            // For now, let's just abort to be safe or try to find it
            throw new Error('A user with this email already exists in Supabase Auth.');
          }
          throw authError;
        }
        authUserId = authUser.user?.id;
      }

      const payload: any = {
        name: form.name.trim(),
        email: email,
        allowed_tabs: form.allowed_tabs,
        allowed_journals: form.allowed_journals,
        is_active: form.is_active,
        auth_id: authUserId // Link to the Auth User
      };
      
      // Store plain password only if explicitly needed for old logic, but better to stop storing it
      // if (password) payload.password = password; 

      let error;
      if (editingId) {
        ({ error } = await supabaseAdmin.from('sub_admins').update(payload).eq('id', editingId));
      } else {
        ({ error } = await supabaseAdmin.from('sub_admins').insert(payload));
      }
      if (error) throw error;

      if (!editingId) {
        // Send email with credentials for new sub-admin
        await triggerEmail('/send/subadmin-credentials', {
          name: form.name.trim(),
          email: email,
          password: password
        });
      }

      toast({ title: editingId ? 'Sub-Admin Updated' : 'Sub-Admin Created', description: `${form.name} can now access the dashboard.` });
      setIsModalOpen(false);
      fetchSubAdmins();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete sub-admin "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const { error } = await supabaseAdmin.from('sub_admins').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: `${name} has been removed.` });
      fetchSubAdmins();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (sa: any) => {
    try {
      const { error } = await supabaseAdmin
        .from('sub_admins').update({ is_active: !sa.is_active }).eq('id', sa.id);
      if (error) throw error;
      toast({ title: sa.is_active ? 'Deactivated' : 'Activated', description: sa.name });
      fetchSubAdmins();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        <div className="pl-2">
          <h2 className="text-xl font-bold font-sans text-slate-800 tracking-tight flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" /> Sub-Admin Management
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Create sub-admins and control which dashboard tabs they can access.
          </p>
        </div>
        <div className="flex items-center gap-3 pr-2">
          <Button onClick={() => fetchSubAdmins()} variant="outline" size="sm" disabled={loading}
            className="bg-white gap-2 font-bold text-[11px] h-9 px-4 border-slate-200 rounded-md shadow-sm text-blue-700 bg-blue-50 border-blue-100">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
          <Button onClick={openCreate} size="sm"
            className="gap-2 font-bold text-[11px] h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm">
            <UserPlus size={14} /> New Sub-Admin
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-12 gap-x-4 px-6 py-3 bg-slate-50/80 border-b border-slate-100">
          <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">NAME / EMAIL</div>
          <div className="col-span-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ALLOWED TABS</div>
          <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">STATUS</div>
          <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">ACTIONS</div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-slate-400" /></div>
          ) : subAdmins.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm font-medium">
              No sub-admins yet. Click "New Sub-Admin" to create one.
            </div>
          ) : (
            subAdmins.map(sa => (
              <div key={sa.id} className="grid grid-cols-12 gap-x-4 px-6 py-4 hover:bg-slate-50 items-start">
                <div className="col-span-3">
                  <p className="text-[13px] font-bold text-slate-800">{sa.name}</p>
                  <p className="text-[11px] text-blue-600 font-mono">{sa.email}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Created {sa.created_at ? new Date(sa.created_at).toLocaleDateString('en-GB') : '—'}
                  </p>
                </div>
                <div className="col-span-5 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {(sa.allowed_tabs || []).length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic">No tabs assigned</span>
                    ) : (sa.allowed_tabs || []).map((tab: string) => {
                      const t = ALL_TABS.find(x => x.id === tab);
                      return (
                        <Badge key={tab} variant="outline"
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border-blue-200">
                          {t?.label || tab}
                        </Badge>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-1 border-t border-slate-50 pt-1.5">
                    {(sa.allowed_journals || []).length === 0 ? (
                      <span className="text-[10px] text-emerald-600/50 italic font-medium">Full Journal Access</span>
                    ) : (sa.allowed_journals || []).map((j: string) => (
                      <Badge key={j} variant="outline"
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border-emerald-200">
                        {j}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 flex justify-center">
                  <button onClick={() => toggleActive(sa)} title="Toggle active">
                    {sa.is_active
                      ? <ToggleRight size={24} className="text-emerald-500 cursor-pointer hover:text-emerald-600" />
                      : <ToggleLeft size={24} className="text-slate-300 cursor-pointer hover:text-slate-400" />}
                  </button>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(sa)}
                    className="h-7 text-[10px] font-bold px-3 rounded-lg border-slate-200">
                    <Edit size={11} className="mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(sa.id, sa.name)}
                    disabled={deletingId === sa.id}
                    className="h-7 text-[10px] font-bold px-3 rounded-lg border-red-200 text-red-600 hover:bg-red-50">
                    {deletingId === sa.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Shield className="h-5 w-5 text-blue-600" />
              {editingId ? 'Edit Sub-Admin' : 'Create New Sub-Admin'}
            </DialogTitle>
            <DialogDescription>
              {editingId ? 'Update credentials and tab access.' : 'Set up login credentials and choose which dashboard tabs this sub-admin can see.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Priya Sharma" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email *</label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="priya@scholarindia.com" className="h-9 text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Password {editingId ? '(leave blank to keep current)' : '*'}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder={editingId ? '••••••••' : 'Set a secure password'}
                  className="h-9 text-sm pr-10"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Tab permissions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Tab Access Permissions *</label>
                <div className="flex gap-2">
                  <button onClick={selectAll}
                    className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                    <CheckSquare size={11} /> Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button onClick={clearAll}
                    className="text-[10px] font-bold text-slate-400 hover:underline flex items-center gap-1">
                    <Square size={11} /> Clear
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-4 border border-slate-100">
                {ALL_TABS.map(tab => (
                  <label key={tab.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-white rounded-lg px-2 py-1.5 transition-colors">
                    <input
                      type="checkbox"
                      checked={form.allowed_tabs.includes(tab.id)}
                      onChange={() => toggleTab(tab.id)}
                      className="h-3.5 w-3.5 rounded text-blue-600 border-slate-300"
                    />
                    <span className="text-[11px] font-medium text-slate-700">{tab.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-slate-400">
                {form.allowed_tabs.length} of {ALL_TABS.length} tabs selected
              </p>
            </div>

            {/* Journal permissions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Journal Access Restrictions</label>
                <div className="flex gap-2">
                  <button onClick={selectAllJournals}
                    className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1">
                    <CheckSquare size={11} /> Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button onClick={clearAllJournals}
                    className="text-[10px] font-bold text-slate-400 hover:underline flex items-center gap-1">
                    <Square size={11} /> Clear (Global Access)
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-[150px] overflow-y-auto">
                {journals.map(j => (
                  <label key={j.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-white rounded-lg px-2 py-1.5 transition-colors">
                    <input
                      type="checkbox"
                      checked={form.allowed_journals.includes(j.title)}
                      onChange={() => toggleJournal(j.title)}
                      className="h-3.5 w-3.5 rounded text-emerald-600 border-slate-300"
                    />
                    <span className="text-[11px] font-medium text-slate-700">{j.title}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Note: Leave empty to grant access to ALL journals.
              </p>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <input type="checkbox" id="sa-active" checked={form.is_active}
                onChange={e => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded text-blue-600" />
              <label htmlFor="sa-active" className="text-sm font-medium text-slate-700 cursor-pointer">
                Account is Active (can login immediately)
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}
                className="text-xs font-bold h-9 px-5 rounded-lg">Cancel</Button>
              <Button onClick={handleSave} disabled={saving}
                className="text-xs font-bold h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-2">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Shield size={13} />}
                {editingId ? 'Save Changes' : 'Create Sub-Admin'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
