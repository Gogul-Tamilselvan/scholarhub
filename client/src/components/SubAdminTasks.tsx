import { useState, useEffect, useRef } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { uploadToS3 } from '@/lib/s3Upload';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import {
  Loader2, RefreshCw, Download, FileText, Upload, CheckCircle,
  ExternalLink, Clock, AlertTriangle, FileCheck, ChevronRight
} from 'lucide-react';

export function SubAdminTasks() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [useUrl, setUseUrl] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Get sub-admin email from session
  const getEmail = () => {
    try {
      const s = localStorage.getItem('subAdminSession');
      if (s) return JSON.parse(s).email as string;
    } catch {}
    return '';
  };

  const fetchTasks = async () => {
    setLoading(true);
    const email = getEmail();
    if (!email) { setLoading(false); return; }
    try {
      // fetch tasks for this sub-admin
      const { data: taskData, error } = await supabaseAdmin
        .from('publication_tasks')
        .select('*')
        .eq('assigned_to_email', email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with manuscript details
      if (taskData && taskData.length > 0) {
        const msIds = taskData.map(t => t.manuscript_id);
        const [{ data: mss }, { data: copyrights }, { data: papers }, { data: payments }] = await Promise.all([
          supabaseAdmin.from('manuscripts').select('*').in('id', msIds),
          supabaseAdmin.from('copyright_forms').select('*').in('manuscript_id', msIds),
          supabaseAdmin.from('final_papers').select('*').in('manuscript_id', msIds),
          supabaseAdmin.from('payments').select('*').in('manuscript_id', msIds),
        ]);

        const enriched = taskData.map(t => {
          const ms = (mss || []).find((m: any) => m.id === t.manuscript_id || m.manuscript_id === t.manuscript_id);
          const copyright = (copyrights || []).find((c: any) => c.manuscript_id === t.manuscript_id);
          const paper = (papers || []).find((p: any) => p.manuscript_id === t.manuscript_id);
          const payment = (payments || []).find((p: any) => p.manuscript_id === t.manuscript_id);
          return { ...t, ms, copyright, paper, payment };
        });
        setTasks(enriched);
      } else {
        setTasks([]);
      }
    } catch (err: any) {
      toast({ title: 'Error loading tasks', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const openTask = (task: any) => {
    setSelectedTask(task);
    setPdfFile(null);
    setPdfUrl(task.published_pdf_url || '');
    setUseUrl(true); // default to URL mode — no bucket setup needed
    setIsModalOpen(true);
  };

  const handleSubmitPdf = async () => {
    if (!selectedTask) return;
    if (!pdfFile && !pdfUrl.trim()) {
      toast({ title: 'Required', description: 'Please enter a URL or select a PDF file.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      let finalUrl = pdfUrl.trim();
      let finalName = pdfUrl.trim() ? 'External URL' : '';

      if (pdfFile && !useUrl) {
        // Upload directly to AWS S3
        finalUrl = await uploadToS3(pdfFile, 'publication-pdfs');
        finalName = pdfFile.name;
      }

      const { error } = await supabaseAdmin.from('publication_tasks').update({
        published_pdf_url: finalUrl,
        published_pdf_name: finalName || pdfFile?.name || 'publication.pdf',
        status: 'Submitted',
        submitted_at: new Date().toISOString()
      }).eq('id', selectedTask.id);

      if (error) throw error;

      toast({ title: 'PDF Submitted!', description: 'Admin will review and approve your submission.' });
      setIsModalOpen(false);
      fetchTasks();
    } catch (err: any) {
      toast({ title: 'Submission Failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const markInProgress = async (taskId: string) => {
    await supabaseAdmin.from('publication_tasks').update({ status: 'In Progress' }).eq('id', taskId);
    fetchTasks();
  };

  const statusColors: Record<string, string> = {
    'Assigned':    'bg-blue-50 text-blue-700 border-blue-200',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    'Submitted':   'bg-purple-50 text-purple-700 border-purple-200',
    'Approved':    'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const statusIcon: Record<string, any> = {
    'Assigned':    <Clock size={12} />,
    'In Progress': <AlertTriangle size={12} />,
    'Submitted':   <FileCheck size={12} />,
    'Approved':    <CheckCircle size={12} />,
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        <div className="pl-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-blue-600" /> My Publication Tasks
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Manuscripts assigned to you for final PDF preparation and upload.
          </p>
        </div>
        <Button onClick={fetchTasks} variant="outline" size="sm" disabled={loading}
          className="gap-2 font-bold text-[11px] h-9 px-4 border-slate-200 rounded-md bg-blue-50 text-blue-700 border-blue-100">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </Button>
      </div>

      {/* Task list */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-x-4 px-6 py-3 bg-slate-50/80 border-b border-slate-100">
          <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">MANUSCRIPT</div>
          <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">DOCUMENTS</div>
          <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">STATUS</div>
          <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ADMIN NOTE</div>
          <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">ACTION</div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-slate-400" /></div>
          ) : tasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm font-medium">
              No tasks assigned to you yet.
            </div>
          ) : tasks.map(task => (
            <div key={task.id} className="grid grid-cols-12 gap-x-4 px-6 py-4 hover:bg-slate-50 items-start">
              {/* Manuscript info */}
              <div className="col-span-3">
                <p className="text-[11px] font-black text-slate-700 tracking-wider">{task.manuscript_id}</p>
                <p className="text-[12px] font-bold text-slate-800 line-clamp-2 leading-snug mt-0.5">
                  {task.manuscript_title || task.ms?.manuscript_title || task.ms?.title || '—'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Assigned {new Date(task.created_at).toLocaleDateString('en-GB')}
                </p>
              </div>

              {/* Documents */}
              <div className="col-span-3 space-y-1.5">
                {task.ms?.file_url && (
                  <a href={task.ms.file_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:underline">
                    <Download size={11} /> Original Manuscript
                  </a>
                )}
                {task.copyright?.file_url || task.copyright?.file_link ? (
                  <a href={task.copyright.file_url || task.copyright.file_link} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-[11px] font-bold text-purple-600 hover:underline">
                    <Download size={11} /> Copyright Form
                  </a>
                ) : <p className="text-[10px] text-slate-300 italic">No copyright form</p>}
                {task.paper?.file_url || task.paper?.file_link ? (
                  <a href={task.paper.file_url || task.paper.file_link} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:underline">
                    <Download size={11} /> Final Manuscript
                  </a>
                ) : <p className="text-[10px] text-slate-300 italic">No final paper</p>}
                {task.published_pdf_url && (
                  <a href={task.published_pdf_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-[11px] font-bold text-orange-600 hover:underline">
                    <ExternalLink size={11} /> Published PDF (uploaded)
                  </a>
                )}
              </div>

              {/* Status */}
              <div className="col-span-2 flex justify-center">
                <Badge className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 border ${statusColors[task.status] || 'bg-slate-50 text-slate-500'}`}>
                  {statusIcon[task.status]} {task.status}
                </Badge>
              </div>

              {/* Notes */}
              <div className="col-span-2">
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                  {task.notes || <span className="italic text-slate-300">No instructions</span>}
                </p>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex flex-col items-end gap-2">
                {task.status === 'Approved' ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-bold px-3 py-1">
                    <CheckCircle size={11} className="mr-1" /> Approved
                  </Badge>
                ) : (
                  <>
                    {task.status === 'Assigned' && (
                      <Button size="sm" variant="outline" onClick={() => markInProgress(task.id)}
                        className="text-[10px] h-8 px-3 font-bold rounded-lg border-amber-300 text-amber-700 hover:bg-amber-50 gap-1">
                        <ChevronRight size={11} /> Start Working
                      </Button>
                    )}
                    <Button size="sm" onClick={() => openTask(task)}
                      className="text-[10px] h-8 px-3 font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white gap-1">
                      <Upload size={11} /> {task.published_pdf_url ? 'Re-upload PDF' : 'Upload PDF'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload PDF Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg bg-white rounded-2xl shadow-xl p-0 overflow-hidden">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50">
            <DialogTitle className="flex items-center gap-2 text-slate-800 font-bold text-base">
              <Upload size={18} className="text-blue-600" /> Submit Publication PDF
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              {selectedTask && <><span className="font-bold text-slate-700">{selectedTask.manuscript_id}</span> — {(selectedTask.manuscript_title || '').substring(0, 55)}</>}
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="px-6 py-5 space-y-5">
              {/* All documents for reference */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reference Documents</p>
                {selectedTask.ms?.file_url && (
                  <a href={selectedTask.ms.file_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline">
                    <FileText size={13} /> Original Manuscript
                  </a>
                )}
                {selectedTask.copyright && (
                  <a href={selectedTask.copyright.file_url || selectedTask.copyright.file_link} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-bold text-purple-600 hover:underline">
                    <FileText size={13} /> Copyright Form
                  </a>
                )}
                {selectedTask.paper && (
                  <a href={selectedTask.paper.file_url || selectedTask.paper.file_link} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:underline">
                    <FileText size={13} /> Final Manuscript
                  </a>
                )}
              </div>

              {/* Admin notes */}
              {selectedTask.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Admin Instructions</p>
                  <p className="text-sm text-amber-800 leading-relaxed">{selectedTask.notes}</p>
                </div>
              )}

              {/* Upload method toggle */}
              <div className="flex border border-slate-200 rounded-lg overflow-hidden text-[11px] font-bold">
                <button onClick={() => setUseUrl(false)}
                  className={`flex-1 py-2 ${!useUrl ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                  Upload File
                </button>
                <button onClick={() => setUseUrl(true)}
                  className={`flex-1 py-2 ${useUrl ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                  Enter URL
                </button>
              </div>

              {useUrl ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">PDF / Drive URL</label>
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={e => setPdfUrl(e.target.value)}
                    placeholder="https://drive.google.com/... or direct PDF link"
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Select PDF File</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    {pdfFile ? (
                      <div className="flex items-center justify-center gap-2 text-blue-700">
                        <FileCheck size={18} />
                        <span className="text-sm font-bold">{pdfFile.name}</span>
                        <span className="text-xs text-slate-400">({(pdfFile.size / 1024).toFixed(0)} KB)</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-500">Click to select PDF</p>
                        <p className="text-xs text-slate-400 mt-1">PDF files only, max 20MB</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={e => setPdfFile(e.target.files?.[0] || null)}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold h-9 px-5 rounded-lg">Cancel</Button>
                <Button
                  onClick={handleSubmitPdf}
                  disabled={uploading || (!pdfFile && !pdfUrl.trim())}
                  className="text-xs font-bold h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-2"
                >
                  {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  Submit for Review
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
