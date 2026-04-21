import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Megaphone, Plus, Trash2, Send, 
  Users, UserCheck, MessageSquare, Loader2,
  AlertCircle, CheckCircle2, Monitor
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Broadcast {
  id: string;
  title: string;
  content: string;
  target_role: string;
  active: boolean;
  created_at: string;
}

export function AdminBroadcast() {
  const { toast } = useToast();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_role: 'All'
  });

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBroadcasts(data || []);
    } catch (err: any) {
      toast({ title: 'Error fetching broadcasts', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill in both title and content', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      // First, deactivate any existing broadcasts for the same role if we want only one at a time
      // The requirement says "if i send message in brodcast it will show in all editor and reviwer page"
      // Usually only one active broadcast makes sense for a role
      
      const { error } = await supabase.from('admin_messages').insert({
        title: formData.title,
        content: formData.content,
        target_role: formData.target_role,
        active: true
      });

      if (error) throw error;

      toast({ title: 'Broadcast Sent', description: 'Your message will now appear to targeted users.' });
      setIsModalOpen(false);
      setFormData({ title: '', content: '', target_role: 'All' });
      fetchBroadcasts();
    } catch (err: any) {
      toast({ title: 'Failed to send broadcast', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_messages')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchBroadcasts();
    } catch (err: any) {
      toast({ title: 'Error updating status', description: err.message, variant: 'destructive' });
    }
  };

  const deleteBroadcast = async (id: string) => {
    if (!confirm('Are you sure you want to delete this broadcast?')) return;
    
    try {
      const { error } = await supabase
        .from('admin_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchBroadcasts();
    } catch (err: any) {
      toast({ title: 'Error deleting broadcast', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-600" />
            Global Broadcast System
          </h2>
          <p className="text-sm text-slate-500 mt-1">Send popup alerts to Editor and Reviewer dashboards</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-11 px-6 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" /> New Broadcast
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-500 font-medium tracking-wide">Loading history...</p>
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Megaphone className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Broadcasts Yet</h3>
            <p className="text-slate-500 max-w-xs mt-2">Create your first broadcast message to reach all reviewer and editor portals.</p>
          </div>
        ) : (
          broadcasts.map((broadcast) => (
            <Card key={broadcast.id} className={`border-none shadow-sm h-full transition-all duration-300 ${broadcast.active ? 'ring-1 ring-blue-100' : 'opacity-75'}`}>
              <CardContent className="p-0">
                <div className="flex items-start gap-4 p-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${broadcast.active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 truncate">{broadcast.title}</h4>
                        <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase py-0.5 px-2 bg-slate-50 text-slate-500 border-none">
                          {broadcast.target_role}
                        </Badge>
                        {broadcast.active ? (
                          <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] uppercase font-black tracking-widest px-2 py-0.5">Active</Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-500 border-none text-[10px] uppercase font-black tracking-widest px-2 py-0.5">Inactive</Badge>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">{new Date(broadcast.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {broadcast.content}
                    </p>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleStatus(broadcast.id, broadcast.active)}
                        className={`text-xs font-bold gap-1.5 h-8 px-3 rounded-lg ${broadcast.active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                      >
                        {broadcast.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                        {broadcast.active ? 'Deactivate' : 'Activate Now'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteBroadcast(broadcast.id)}
                        className="text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 gap-1.5 h-8 px-3 rounded-lg ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
          <DialogHeader className="p-6 bg-slate-900">
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" /> Create New Broadcast
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Audience</label>
              <Select 
                value={formData.target_role} 
                onValueChange={(val) => setFormData({...formData, target_role: val})}
              >
                <SelectTrigger className="h-11 border-slate-200 focus:ring-blue-600">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Portal Users</SelectItem>
                  <SelectItem value="Reviewer">Reviewers Only</SelectItem>
                  <SelectItem value="Editor">Editors Only</SelectItem>
                  <SelectItem value="Editorial Board Member">EB Members Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Broadcast Title</label>
              <Input 
                placeholder="e.g. System Maintenance Update" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="h-11 border-slate-200 focus:ring-blue-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Message Content</label>
              <Textarea 
                placeholder="Enter detailed message..." 
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="min-h-[120px] border-slate-200 focus:ring-blue-600 resize-none"
              />
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-800 leading-normal">
                This message will appear as a modal popup when targeted users login to their dashboard. Only one message can be active per role at a time.
              </p>
            </div>
          </div>
          <DialogFooter className="p-6 pt-0">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={submitting} className="h-11 px-6 font-bold text-slate-500">Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8 font-bold gap-2 shadow-lg shadow-blue-600/20"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
