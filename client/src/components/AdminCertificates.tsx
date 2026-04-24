import { useState, useRef } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Award, User, Upload, Printer, CheckCircle2, FileUp, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { MAIL_SERVER_URL, MAIL_API_KEY } from "@/lib/config";
import { uploadToS3 } from '@/lib/s3Upload';

function generateCertNo(id: string) {
  const c = (id || '').replace(/[^A-Z0-9]/gi, '').toUpperCase().padEnd(12, 'X');
  return `${c.slice(0, 6)}/${c.slice(6, 12)}`;
}

function formatDate(s?: string) {
  if (!s) return new Date().toLocaleDateString('en-GB').replace(/\//g, '.');
  const d = new Date(s);
  if (isNaN(d.getTime())) return new Date().toLocaleDateString('en-GB').replace(/\//g, '.');
  return [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    d.getFullYear(),
  ].join('.');
}

// ─────────────────────────────────────────────────────────────────────────────
//  Building the print popup HTML
//  The certificate.png is used as the full background.
//  Only the dynamic text values are overlaid using absolute-% positioning.
// ─────────────────────────────────────────────────────────────────────────────
function buildPopupHtml(
  o: {
    name: string; designation: string; institution: string;
    reviewerId: string; journalName: string; manuscriptTitle: string;
    certNo: string; dateDisplay: string;
  },
  certUrl: string
) {
  const esc = (s: string) =>
    (s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const recipient = esc(
    [o.name, o.designation, o.institution].filter(Boolean).join(', ')
  );
  const mTitle =
    (o.manuscriptTitle || '').length > 60
      ? (o.manuscriptTitle || '').slice(0, 57) + '...'
      : (o.manuscriptTitle || '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Certificate – Scholar India Publishers</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:100%; height:100%; background:#bbb; }
  body { display:flex; justify-content:center; align-items:flex-start; padding:24px; }

  .cert {
    position:relative;
    width:960px;
    height:660px;
    flex-shrink:0;
    box-shadow:0 6px 28px rgba(0,0,0,.3);
  }

  .cert-bg {
    position:absolute;
    top:0; left:0; width:100%; height:100%;
    display: block;
  }

  .layer {
    position:absolute;
    font-family:Arial,Helvetica,sans-serif;
    color:#111827;
    z-index: 10;
  }

  .recipient {
    top:42%;
    left:50%;
    transform:translateX(-50%);
    font-family:Georgia,'Times New Roman',serif;
    font-size:22px;
    font-weight:700;
    color:#1e3a8a;
    text-decoration:none;
    white-space:nowrap;
    text-align:center;
    letter-spacing:0.02em;
    z-index: 11;
  }

  .val { font-size:12.5px; font-weight:700; color:#111827; text-transform:uppercase; }
  .v-rid  { top:61.5%; left:26%; }
  .v-jn   { top:65%;   left:34%;   }
  .v-mt   { top:68.5%; left:30%; }
  .v-dt   { top:72.5%;   left:20%;   }
  .v-cid  { top:76%;   left:26%; font-weight:700; }

  @media print {
    @page { size:A4 landscape; margin:0; }
    html,body { background:white; padding:0; }
    .cert { width:297mm; height:210mm; box-shadow:none; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    img { display: block !important; }
  }
</style>
</head>
<body>
<div class="cert">
  <img class="cert-bg" src="${certUrl}" alt="Certificate" id="bgImg" />
  <div class="layer recipient">${recipient}</div>
  <div class="layer val v-rid">${esc(o.reviewerId)}</div>
  <div class="layer val v-jn">${esc(o.journalName)}</div>
  <div class="layer val v-mt">${esc(mTitle)}</div>
  <div class="layer val v-dt">${esc(o.dateDisplay)}</div>
  <div class="layer val v-cid">${esc(o.certNo)}</div>
</div>
<script>
  function doPrint() {
    window.print();
    setTimeout(function() { window.close(); }, 500);
  }
  const img = document.getElementById('bgImg');
  if (img.complete) {
    setTimeout(doPrint, 1000);
  } else {
    img.onload = function() { setTimeout(doPrint, 1000); };
    img.onerror = function() { console.error('Failed to load image'); doPrint(); };
  }
</script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  React component
// ─────────────────────────────────────────────────────────────────────────────
export function AdminCertificates() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    designation: '',
    institution: '',
    reviewerId: '',
    journalName: '',
    manuscriptTitle: '',
    certDate: new Date().toISOString().split('T')[0],
    certNo: '',
    reviewerEmail: '',
  });

  const searchReviewers = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviewers')
        .select('id,first_name,last_name,designation,institution,journal,role,status,email')
        .or(
          `id.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
        )
        .limit(10);
      if (error) throw error;
      setResults(data || []);
      if (!data?.length) toast({ title: 'No results found' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const selectReviewer = (r: any) => {
    setForm(p => ({
      ...p,
      name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
      designation: r.designation || '',
      institution: r.institution || '',
      reviewerId: r.id || '',
      journalName: r.journal || '',
      certNo: generateCertNo(r.id || ''),
      reviewerEmail: r.email || '',
    }));
    setResults([]);
    setSelectedFile(null);
    setUploadedUrl('');
    setSavedSuccess(false);
  };

  const buildOpts = () => ({
    name: form.name,
    designation: form.designation,
    institution: form.institution,
    reviewerId: form.reviewerId,
    journalName: form.journalName,
    manuscriptTitle: form.manuscriptTitle,
    certNo: form.certNo || generateCertNo(form.reviewerId || form.name),
    dateDisplay: formatDate(form.certDate),
  });

  const printCertificate = () => {
    if (!form.name) {
      toast({ title: 'Select a reviewer first', variant: 'destructive' });
      return;
    }
    setGenerating(true);
    const certUrl = `${window.location.origin}/certificate.png`;
    const win = window.open('', '_blank', 'width=1040,height=760');
    if (!win) {
      setGenerating(false);
      toast({ title: 'Popup blocked', description: 'Allow popups and try again.', variant: 'destructive' });
      return;
    }
    win.document.write(buildPopupHtml(buildOpts(), certUrl));
    win.document.close();
    setGenerating(false);
  };


  const triggerEmail = async (endpoint: string, payload: any) => {
    try {
      const res = await fetch(`${MAIL_SERVER_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': MAIL_API_KEY },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Mail failed');
      return true;
    } catch (e) {
      console.error(`Mail trigger error [${endpoint}]:`, e);
      return false;
    }
  };

  // Upload PDF to S3 then save the link to the database
  const uploadAndSaveCertificate = async () => {
    if (!form.name) {
      toast({ title: 'Select a reviewer first', variant: 'destructive' });
      return;
    }
    if (!selectedFile) {
      toast({ title: 'Choose a PDF file', description: 'Select the certificate PDF to upload.', variant: 'destructive' });
      return;
    }
    if (!form.reviewerId) {
      toast({ title: 'Reviewer ID missing', description: 'Make sure a reviewer with a valid ID is selected.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      toast({ title: 'Uploading to S3…', description: 'Please wait.' });

      // 1. Upload PDF to S3 under reviewer-certificates/<reviewerId>/
      const renamedFile = new File(
        [selectedFile],
        `certificate_${form.reviewerId}_${Date.now()}.pdf`,
        { type: 'application/pdf' }
      );
      const s3Url = await uploadToS3(renamedFile, `reviewer-certificates/${form.reviewerId}`);
      setUploadedUrl(s3Url);

      // 2. Save record to DB
      const certNo = form.certNo || generateCertNo(form.reviewerId || form.name);
      const { error: dbError } = await supabase
        .from('reviewer_certificates')
        .insert({
          reviewer_id: form.reviewerId,
          reviewer_name: form.name,
          journal_name: form.journalName,
          manuscript_title: form.manuscriptTitle,
          certificate_url: s3Url,
          cert_no: certNo,
        });

      if (dbError) throw dbError;

      setSavedSuccess(true);

      // Trigger certificate notification email
      const emailTarget = form.reviewerEmail;
      if (emailTarget) {
        await triggerEmail('/send/certificate-generated', {
          name: form.name,
          email: emailTarget,
          reviewerId: form.reviewerId,
          journalName: form.journalName,
          manuscriptTitle: form.manuscriptTitle,
          certNo: certNo,
          certUrl: s3Url,
        });
      }

      toast({
        title: 'Certificate Uploaded & Saved!',
        description: `Stored in S3 and DB. Certificate ID: ${certNo}${emailTarget ? ' · Notification sent.' : ''}`,
      });
    } catch (error: any) {
      console.error('Upload/Save Error:', error);
      toast({
        title: 'Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const opts = buildOpts();
  const recipientPreview = [opts.name, opts.designation, opts.institution]
    .filter(Boolean)
    .join(', ');

  const overlayRows = [
    { top: 61.5, left: 26, val: opts.reviewerId, bold: true },
    { top: 65, left: 34, val: opts.journalName, bold: true },
    { top: 68.5, left: 30, val: opts.manuscriptTitle.length > 35 ? opts.manuscriptTitle.slice(0, 32) + '...' : opts.manuscriptTitle, bold: true },
    { top: 72.5, left: 20, val: opts.dateDisplay, bold: true },
    { top: 76, left: 26, val: opts.certNo || generateCertNo(form.reviewerId || form.name), bold: true },
  ];

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="pl-2 py-2">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Certificate Generator</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Search → select reviewer → fill details → Print locally → upload PDF → paste link to save in DB.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mx-2">

        {/* ── Left panel ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Reviewer search */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Search size={15} className="text-blue-900" />
              <span className="font-bold text-sm text-slate-800">Find Reviewer / Editor</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchReviewers()}
                  placeholder="Name, ID or email…"
                  className="h-9 text-sm bg-slate-50"
                />
                <Button onClick={searchReviewers} disabled={loading}
                  className="bg-[#1e3a8a] text-white h-9 px-3 shrink-0">
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                </Button>
              </div>
              {results.length > 0 && (
                <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 max-h-52 overflow-y-auto">
                  {results.map(r => (
                    <div key={r.id} onClick={() => selectReviewer(r)}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-blue-50/60 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <User size={13} className="text-blue-900" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-800 truncate">{r.first_name} {r.last_name || ''}</p>
                        <p className="text-[10px] text-slate-500 truncate">{r.id} · {r.role || 'Reviewer'}</p>
                      </div>
                      <Badge className={`text-[9px] font-bold border-none ${r.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {r.status || '—'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Certificate form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Award size={15} className="text-blue-900" />
              <span className="font-bold text-sm text-slate-800">Certificate Details</span>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: 'Reviewer Name *', key: 'name', placeholder: 'Dr. John Smith' },
                { label: 'Designation', key: 'designation', placeholder: 'Assistant Professor' },
                { label: 'Institution', key: 'institution', placeholder: 'Loyola College, Chennai' },
                { label: 'Reviewer ID', key: 'reviewerId', placeholder: '' },
                { label: 'Journal Name', key: 'journalName', placeholder: '' },
                { label: 'Manuscript Title', key: 'manuscriptTitle', placeholder: '' },
                { label: 'Certificate ID', key: 'certNo', placeholder: 'Auto-generated' },
              ].map(({ label, key, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{label}</label>
                  <Input
                    value={(form as any)[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="h-9 bg-slate-50 text-xs"
                  />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Issue Date</label>
                <Input
                  type="date"
                  value={form.certDate}
                  onChange={e => setForm(p => ({ ...p, certDate: e.target.value }))}
                  className="h-9 bg-slate-50 text-xs"
                />
              </div>

              {/* Step 1: Print */}
              <div className="pt-1">
                <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2">Step 1 — Print / Preview</p>
                <Button
                  variant="outline"
                  onClick={printCertificate}
                  disabled={generating || !form.name}
                  className="w-full border-slate-200 text-slate-700 font-bold text-sm h-11 gap-2 rounded-xl"
                >
                  <Printer size={16} />
                  Print / Preview Certificate
                </Button>
              </div>
            </div>
          </div>

          {/* Step 2: Upload PDF to S3 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-emerald-50 flex items-center gap-2">
              <FileUp size={15} className="text-emerald-700" />
              <span className="font-bold text-sm text-slate-800">Step 2 — Upload PDF to S3</span>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Select the printed/saved PDF. It will be uploaded to S3 under the reviewer's ID and the link will be saved automatically.
              </p>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0] || null;
                  setSelectedFile(f);
                  setSavedSuccess(false);
                  setUploadedUrl('');
                }}
              />

              {/* File picker trigger */}
              {!selectedFile ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl py-6 flex flex-col items-center gap-2 transition-colors cursor-pointer bg-slate-50 hover:bg-emerald-50/50"
                >
                  <FileUp size={22} className="text-slate-300" />
                  <span className="text-[12px] font-bold text-slate-500">Click to select certificate PDF</span>
                  <span className="text-[10px] text-slate-400">PDF files only</span>
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <FileUp size={16} className="text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-emerald-800 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-emerald-600">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={() => { setSelectedFile(null); setSavedSuccess(false); setUploadedUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="p-1 rounded-md hover:bg-emerald-100 transition-colors"
                  >
                    <X size={13} className="text-emerald-700" />
                  </button>
                </div>
              )}

              {/* Reviewer ID confirmation */}
              {form.reviewerId && (
                <p className="text-[10px] text-slate-500">
                  Will be stored under Reviewer ID: <span className="font-bold text-slate-700 font-mono">{form.reviewerId}</span>
                </p>
              )}

              {savedSuccess ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span className="text-[12px] font-bold text-emerald-700">Uploaded to S3 &amp; saved in database!</span>
                  </div>
                  {uploadedUrl && (
                    <a href={uploadedUrl} target="_blank" rel="noopener noreferrer"
                      className="block text-[10px] text-blue-600 hover:underline truncate">
                      {uploadedUrl}
                    </a>
                  )}
                </div>
              ) : (
                <Button
                  onClick={uploadAndSaveCertificate}
                  disabled={saving || !form.name || !selectedFile || !form.reviewerId}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm h-11 gap-2 rounded-xl mt-1 shadow-md"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {saving ? 'Uploading…' : 'Upload to S3 & Save'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Live Preview ── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Award size={15} className="text-blue-900" />
              <span className="font-bold text-sm text-slate-800">Live Preview</span>
              {form.name && (
                <Badge className="ml-auto bg-emerald-100 text-emerald-700 text-[9px] font-bold border-none">Ready</Badge>
              )}
            </div>
            <div className="p-4">
              {!form.name ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Award size={44} className="text-slate-200" />
                  <p className="text-slate-400 text-sm text-center">
                    Search and select a reviewer<br />to see a live preview
                  </p>
                </div>
              ) : (
                <div
                  className="relative w-full rounded shadow-lg border border-slate-200 overflow-hidden"
                  style={{
                    aspectRatio: '960 / 660',
                    backgroundColor: 'white'
                  }}
                >
                  <img
                    src="/certificate.png"
                    alt="Certificate Background"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                  {/* Recipient line */}
                  <div
                    className="absolute text-center"
                    style={{
                      top: '42%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontSize: 'clamp(10px, 1.4vw, 22px)',
                      color: '#1e3a8a',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {recipientPreview}
                  </div>

                  {/* Info value overlays */}
                  {overlayRows.map((row, i) => (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        top: `${row.top}%`,
                        left: `${row.left}%`,
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        fontSize: 'clamp(5px, 0.78vw, 11px)',
                        color: '#111827',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {row.val}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Workflow instructions */}
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-2">How it works</p>
            <ol className="text-[12px] text-blue-700 space-y-1.5 list-decimal list-inside">
              <li>Search and select the reviewer — their ID is auto-filled.</li>
              <li>Fill in manuscript title, date, and other details.</li>
              <li>Click <strong>Print / Preview</strong> — save as PDF locally using your browser.</li>
              <li>In Step 2, click the dashed area and select the saved PDF.</li>
              <li>Click <strong>Upload to S3 &amp; Save</strong> — the PDF is stored in S3 under the reviewer's ID and the link is saved in the database.</li>
              <li>The reviewer can verify their certificate at <strong>/certificate-verification</strong> using their Reviewer ID.</li>
            </ol>
          </div>
        </div>

      </div>
    </div>
  );
}
