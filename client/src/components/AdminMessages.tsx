import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, User, Send, Search, 
  Loader2, CheckCircle2, Clock, Inbox,
  Filter, ArrowLeft, UserCircle2, ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash, Settings2 } from 'lucide-react';

interface Message {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  manuscript_id: string;
  message: string;
  submitted_at: string;
  type?: 'reviewer' | 'admin';
}

interface Thread {
  reviewer_id: string;
  reviewer_name: string;
  manuscript_id: string;
  messages: Message[];
  latest_date: string;
  has_new?: boolean;
}

export function AdminMessages() {
  const { toast } = useToast();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [reply, setReply] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [users, setUsers] = useState<{id: string, name: string}[]>([]);
  const [newChatData, setNewChatData] = useState({
    reviewerId: '',
    manuscriptId: 'GENERAL'
  });
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false);
  const [retentionDays, setRetentionDays] = useState('30');
  const [cleaningUp, setCleaningUp] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('reviewers')
        .select('id, first_name, last_name')
        .order('first_name');
      
      if (error) throw error;
      setUsers((data || []).map(u => ({
        id: u.id,
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.id
      })));
    } catch (err: any) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Fetch messages from reviewers
      const { data: revMsgs, error: revError } = await supabase
        .from('reviewer_messages')
        .select('*');
      
      if (revError) throw revError;

      // Fetch replies from admin
      const { data: admMsgs, error: admError } = await supabase
        .from('admin_replies')
        .select('*');
      
      if (admError) throw admError;

      // Group into threads by reviewer_id + manuscript_id
      const threadMap = new Map<string, Thread>();

      const allMessages = [
        ...(revMsgs || []).map(m => ({ ...m, type: 'reviewer' as const })),
        ...(admMsgs || []).map(m => ({ 
          ...m, 
          type: 'admin' as const, 
          message: m.reply_message,
          submitted_at: m.submitted_at || m.original_message_date
        }))
      ];

      allMessages.forEach(msg => {
        const key = `${msg.reviewer_id}_${msg.manuscript_id || 'GENERAL'}`;
        if (!threadMap.has(key)) {
          threadMap.set(key, {
            reviewer_id: msg.reviewer_id,
            reviewer_name: msg.reviewer_name || 'Unknown',
            manuscript_id: msg.manuscript_id || 'GENERAL',
            messages: [],
            latest_date: msg.submitted_at
          });
        }
        const thread = threadMap.get(key)!;
        thread.messages.push(msg);
        if (new Date(msg.submitted_at) > new Date(thread.latest_date)) {
          thread.latest_date = msg.submitted_at;
        }
      });

      // Sort messages within threads
      threadMap.forEach(thread => {
        thread.messages.sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());
      });

      // Convert to array and sort by latest activity
      const sortedThreads = Array.from(threadMap.values()).sort(
        (a, b) => new Date(b.latest_date).getTime() - new Date(a.latest_date).getTime()
      );

      setThreads(sortedThreads);
    } catch (err: any) {
      toast({ title: 'Error fetching messages', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedThread || !reply.trim()) return;

    setSubmittingReply(true);
    try {
      const submittedAt = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: true
      });

      const { error } = await supabase.from('admin_replies').insert({
        reviewer_id: selectedThread.reviewer_id,
        manuscript_id: selectedThread.manuscript_id === 'GENERAL' ? null : selectedThread.manuscript_id,
        reply_message: reply,
        submitted_at: submittedAt
      });

      if (error) throw error;

      toast({ title: 'Reply sent' });
      setReply('');
      
      // Update local state for immediate feedback
      const newMsg = {
        id: Math.random().toString(),
        reviewer_id: selectedThread.reviewer_id,
        reviewer_name: selectedThread.reviewer_name,
        manuscript_id: selectedThread.manuscript_id,
        message: reply,
        submitted_at: submittedAt,
        type: 'admin' as const
      };

      const updatedThreads = threads.map(t => {
        if (t.reviewer_id === selectedThread.reviewer_id && t.manuscript_id === selectedThread.manuscript_id) {
          const updated = { ...t, messages: [...t.messages, newMsg], latest_date: submittedAt };
          setSelectedThread(updated);
          return updated;
        }
        return t;
      });
      setThreads(updatedThreads);

    } catch (err: any) {
      toast({ title: 'Failed to send reply', description: err.message, variant: 'destructive' });
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCleanup = async () => {
    setCleaningUp(true);
    try {
      const days = parseInt(retentionDays);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const isoCutoff = cutoffDate.toISOString();

      // Delete from reviewer_messages
      const { error: revErr } = await supabase
        .from('reviewer_messages')
        .delete()
        .lt('submitted_at', isoCutoff);

      // Delete from admin_replies
      // Note: for admin_replies we might need to check multiple date fields depending on schema
      const { error: admErr } = await supabase
        .from('admin_replies')
        .delete()
        .lt('submitted_at', isoCutoff);

      if (revErr || admErr) throw new Error('Some deletions failed');

      toast({ 
        title: 'Cleanup Successful', 
        description: `Successfully removed messages older than ${days} days.` 
      });
      setIsCleanupModalOpen(false);
      fetchMessages();
    } catch (err: any) {
      toast({ title: 'Cleanup failed', description: err.message, variant: 'destructive' });
    } finally {
      setCleaningUp(false);
    }
  };

  const filteredThreads = threads.filter(t => 
    t.reviewer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.manuscript_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Inbox Sidebar */}
      <div className={`w-full md:w-[350px] border-r border-slate-50 flex flex-col bg-slate-50/30 ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 bg-white border-b border-slate-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Inbox className="w-6 h-6 text-blue-600" />
              Inbox
            </h2>
            <div className="flex items-center gap-1">
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => setIsCleanupModalOpen(true)}
                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg h-9 w-9"
                title="Data Retention / Cleanup"
              >
                <Settings2 className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => setIsNewChatModalOpen(true)}
                className="text-blue-600 hover:bg-blue-50 border border-blue-100 rounded-lg h-9 w-9"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search conversations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-slate-200 focus:ring-blue-600 bg-slate-50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {loading ? (
            <div className="p-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading...</p>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-400">No conversations found</p>
            </div>
          ) : (
            filteredThreads.map((thread, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedThread(thread)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                  selectedThread?.reviewer_id === thread.reviewer_id && selectedThread?.manuscript_id === thread.manuscript_id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'hover:bg-white text-slate-600'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className={`text-sm font-bold truncate ${selectedThread === thread ? 'text-white' : 'text-slate-800'}`}>
                    {thread.reviewer_name}
                  </p>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    selectedThread === thread ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {thread.manuscript_id === 'GENERAL' ? 'General' : thread.manuscript_id}
                  </span>
                </div>
                <p className={`text-xs line-clamp-1 mb-2 ${selectedThread === thread ? 'text-blue-100' : 'text-slate-500'}`}>
                  {thread.messages[thread.messages.length - 1]?.message}
                </p>
                <div className={`flex items-center gap-1.5 text-[10px] font-bold ${selectedThread === thread ? 'text-blue-200' : 'text-slate-400'}`}>
                  <Clock className="w-3 h-3" />
                  {new Date(thread.latest_date).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-white ${!selectedThread ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {selectedThread ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between shadow-sm z-10 shrink-0">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden" 
                  onClick={() => setSelectedThread(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                  <UserCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 tracking-tight leading-none mb-1">{selectedThread.reviewer_name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                      {selectedThread.manuscript_id === 'GENERAL' ? 'Portal Interaction' : `Ref: ${selectedThread.manuscript_id}`}
                    </span>
                    {selectedThread.manuscript_id !== 'GENERAL' && (
                       <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-slate-200 text-slate-400 h-4">
                         MS ATTACHED
                       </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <Badge className="bg-emerald-50 text-emerald-600 border-none px-2 py-0.5 text-[10px] font-black tracking-widest flex items-center gap-1 hover:bg-emerald-100 transition-colors cursor-default">
                   <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                   CONNECTED
                 </Badge>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-slate-50/30">
              {selectedThread.messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col ${msg.type === 'admin' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {msg.type === 'admin' ? 'HQ Response' : 'User Message'}
                    </span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-[10px] text-slate-400">{msg.submitted_at}</span>
                  </div>
                  <div className={`max-w-[75%] p-4 rounded-2xl text-sm shadow-sm transition-all hover:shadow-md ${
                    msg.type === 'admin' 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-slate-50 shrink-0 bg-white">
              <div className="flex gap-4 p-2 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner group focus-within:ring-2 focus-within:ring-blue-600 transition-all">
                <Textarea 
                  value={reply} 
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Draft your reply to the user..."
                  className="bg-transparent border-none focus-visible:ring-0 shadow-none min-h-[44px] h-[44px] py-3 text-sm font-medium resize-none text-slate-700"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendReply} 
                  disabled={submittingReply || !reply.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-11 rounded-xl shadow-lg shadow-blue-600/20 shrink-0"
                >
                  {submittingReply ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">
                 <span>Press Enter to send reply</span>
                 <span className="flex items-center gap-1"><ExternalLink size={10} /> Shift+Enter for newline</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-20 max-w-sm mx-auto">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Secure Member Comms</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Select a member conversation from the inbox to review their queries and provide detailed HQ responses.
            </p>
          </div>
        )}
      </div>

      <Dialog open={isNewChatModalOpen} onOpenChange={setIsNewChatModalOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
          <DialogHeader className="p-6 bg-slate-900">
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" /> Start New Conversation
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Member</label>
              <Select 
                value={newChatData.reviewerId} 
                onValueChange={(val) => setNewChatData({...newChatData, reviewerId: val})}
              >
                <SelectTrigger className="h-11 border-slate-200 focus:ring-blue-600">
                  <SelectValue placeholder="Begin typing name..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Related To</label>
              <Input 
                placeholder="Manuscript ID or GENERAL" 
                value={newChatData.manuscriptId}
                onChange={(e) => setNewChatData({...newChatData, manuscriptId: e.target.value})}
                className="h-11 border-slate-200 focus:ring-blue-600"
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-0">
            <Button variant="ghost" onClick={() => setIsNewChatModalOpen(false)} className="h-11 px-6 font-bold text-slate-500">Cancel</Button>
            <Button 
              onClick={() => {
                const user = users.find(u => u.id === newChatData.reviewerId);
                if (!user) return;
                
                const virtualThread: Thread = {
                  reviewer_id: user.id,
                  reviewer_name: user.name,
                  manuscript_id: newChatData.manuscriptId || 'GENERAL',
                  messages: [],
                  latest_date: new Date().toISOString()
                };
                
                // Check if already exists
                const existing = threads.find(t => t.reviewer_id === virtualThread.reviewer_id && t.manuscript_id === virtualThread.manuscript_id);
                if (existing) {
                  setSelectedThread(existing);
                } else {
                  setThreads([virtualThread, ...threads]);
                  setSelectedThread(virtualThread);
                }
                
                setIsNewChatModalOpen(false);
              }} 
              disabled={!newChatData.reviewerId}
              className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8 font-bold gap-2 shadow-lg shadow-blue-600/20"
            >
              Open Direct Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCleanupModalOpen} onOpenChange={setIsCleanupModalOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
          <DialogHeader className="p-6 bg-rose-900">
            <DialogTitle className="text-white flex items-center gap-2">
              <Trash className="w-5 h-5 text-rose-300" /> Message Retention Policy
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <DialogDescription className="text-slate-500 font-medium leading-relaxed">
              To maintain system performance and privacy, you can purge old message history. 
              This action is permanent and cannot be undone.
            </DialogDescription>
            
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Delete Messages Older Than</label>
              <Select 
                value={retentionDays} 
                onValueChange={setRetentionDays}
              >
                <SelectTrigger className="h-11 border-slate-200">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days (1 Week)</SelectItem>
                  <SelectItem value="30">30 Days (1 Month)</SelectItem>
                  <SelectItem value="90">90 Days (3 Months)</SelectItem>
                  <SelectItem value="180">180 Days (6 Months)</SelectItem>
                  <SelectItem value="365">365 Days (1 Year)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex gap-3 mt-4">
               <Trash className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
               <p className="text-[11px] text-rose-800 leading-normal font-medium">
                 This will delete all conversations from both reviewers and admin that exceed this time limit.
               </p>
            </div>
          </div>
          <DialogFooter className="p-6 pt-0">
            <Button variant="ghost" onClick={() => setIsCleanupModalOpen(false)} className="h-11 px-6 font-bold text-slate-500">Keep All</Button>
            <Button 
              onClick={handleCleanup} 
              disabled={cleaningUp}
              className="bg-rose-600 hover:bg-rose-700 text-white h-11 px-8 font-bold gap-2"
            >
              {cleaningUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
              Purge History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
