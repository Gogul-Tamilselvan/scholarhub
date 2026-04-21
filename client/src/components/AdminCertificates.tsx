import { useState } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Download, Award, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DEFAULTS = {
  editorName: 'Dr. K. Lirsn',
  editorTitle: 'Chief Managing Editor',
  orgName: 'Scholar India Publishers',
  validationLink: 'https://www.scholarindiapub.com/reviewer-login',
  regLine: 'India: 2/477, Perumal Kovil Street, Mettuchery, Mappedu, Tiruvallur, Chennai \u2013 631402, Tamilnadu. Tel: +91 9360932655',
  recognitionText: 'in recognition of an outstanding contribution to the quality of peer-reviewing.',
};

function generateCertNo(id: string) {
  const c = (id || '').replace(/[^A-Z0-9]/gi, '').toUpperCase().padEnd(12, 'X');
  return `${c.slice(0, 6)}/${c.slice(6, 12)}`;
}
function formatDate(s?: string) {
  if (!s) return new Date().toLocaleDateString('en-GB').replace(/\//g, '.');
  const d = new Date(s);
  if (isNaN(d.getTime())) return new Date().toLocaleDateString('en-GB').replace(/\//g, '.');
  return [String(d.getDate()).padStart(2, '0'), String(d.getMonth() + 1).padStart(2, '0'), d.getFullYear()].join('.');
}

// ─────────────────────────────────────────────────────────
//  PURE SVG CERTIFICATE  (960 × 660)
//  SVG polygons = triangles that ALWAYS render, no CSS tricks
// ─────────────────────────────────────────────────────────
function buildCertSVG(o: {
  name: string; institution: string; certNo: string; dateDisplay: string;
  certTitle: string; recognitionText: string; validationLink: string;
  username: string; password: string; editorName: string; editorTitle: string;
}) {
  // Scalloped rosette (18 circles arranged in a ring around the ribbon center)
  const RCX = 480, RCY = 496, RRING = 36, RSMALL = 8.5;
  const scallops = Array.from({ length: 18 }, (_, i) => {
    const a = (i * 20 - 90) * Math.PI / 180;
    return `<circle cx="${(RCX + RRING * Math.cos(a)).toFixed(1)}" cy="${(RCY + RRING * Math.sin(a)).toFixed(1)}" r="${RSMALL}" fill="#1e3a8a"/>`;
  }).join('');

  // Simple text-wrap helper (split by word at maxChars)
  const wrap = (text: string, maxChars = 72): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      const next = cur ? cur + ' ' + w : w;
      if (next.length <= maxChars) { cur = next; }
      else { if (cur) lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines;
  };
  const recLines = wrap(o.recognitionText);

  // Escape HTML special chars in text content
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const usernameRow = o.username
    ? `<text x="70" y="512" font-family="Arial,sans-serif" font-size="12" fill="#111827">Username: ${esc(o.username)}</text>` : '';
  const passwordRow = o.password
    ? `<text x="70" y="527" font-family="Arial,sans-serif" font-size="12" fill="#111827">Password: ${esc(o.password)}</text>` : '';

  return `<svg width="960" height="660" viewBox="0 0 960 660" xmlns="http://www.w3.org/2000/svg">

  <!-- White background -->
  <rect width="960" height="660" fill="#ffffff"/>

  <!-- Thick navy border (inset slightly so it doesn't get clipped) -->
  <rect x="4" y="4" width="952" height="652" rx="0" ry="0"
        fill="none" stroke="#1a2d70" stroke-width="9"/>

  <!-- ★ GOLD triangle – top-left ★ -->
  <polygon points="0,0 118,0 0,118" fill="#c99010"/>

  <!-- ★ GOLD triangle – bottom-left ★ -->
  <polygon points="0,562 0,660 98,660" fill="#c99010"/>

  <!-- ★ NAVY filled triangle – top-right (cert no lives here) ★ -->
  <polygon points="736,0 960,0 960,175" fill="#1a2d70"/>

  <!-- Certificate number in white on the navy triangle -->
  <text x="946" y="22" text-anchor="end"
        font-family="Arial,Helvetica,sans-serif" font-size="11.5" font-weight="700" fill="#ffffff">
    Certificate No: ${esc(o.certNo)}
  </text>

  <!-- ══════ BOOK LOGO (centred at x=480, top region) ══════ -->
  <g transform="translate(453,28)">
    <path d="M27 4 Q8 7 2 14 L2 50 Q10 46 27 49 Z"  fill="#dbeafe" stroke="#1a2d70" stroke-width="1.3"/>
    <path d="M27 4 Q46 7 52 14 L52 50 Q44 46 27 49 Z" fill="#dbeafe" stroke="#1a2d70" stroke-width="1.3"/>
    <line x1="27" y1="4"  x2="27" y2="49" stroke="#1a2d70" stroke-width="1.7"/>
    <line x1="7"  y1="20" x2="25" y2="19" stroke="#1a2d70" stroke-width="0.8" opacity="0.5"/>
    <line x1="6"  y1="28" x2="25" y2="27" stroke="#1a2d70" stroke-width="0.8" opacity="0.5"/>
    <line x1="7"  y1="36" x2="25" y2="35" stroke="#1a2d70" stroke-width="0.8" opacity="0.5"/>
    <line x1="29" y1="19" x2="47" y2="20" stroke="#1a2d70" stroke-width="0.8" opacity="0.5"/>
    <line x1="29" y1="27" x2="48" y2="28" stroke="#1a2d70" stroke-width="0.8" opacity="0.5"/>
    <line x1="29" y1="35" x2="47" y2="36" stroke="#1a2d70" stroke-width="0.8" opacity="0.5"/>
  </g>

  <!-- Organisation name -->
  <text x="480" y="108"
        text-anchor="middle" font-family="Arial,Helvetica,sans-serif"
        font-size="23" font-weight="900" fill="#1a2d70">
    ${esc(DEFAULTS.orgName)}
  </text>

  <!-- Certificate title (italic blue) -->
  <text x="480" y="148"
        text-anchor="middle" font-family="Georgia,'Times New Roman',serif"
        font-size="22" font-style="italic" font-weight="bold" fill="#2155c4">
    ${esc(o.certTitle)}
  </text>

  <!-- "awarded to" -->
  <text x="480" y="175"
        text-anchor="middle" font-family="Georgia,serif"
        font-size="15" font-style="italic" fill="#4b5563">awarded to</text>

  <!-- Recipient name (large bold) -->
  <text x="480" y="223"
        text-anchor="middle" font-family="Georgia,'Times New Roman',serif"
        font-size="34" font-weight="700" fill="#111827">
    ${esc(o.name)}
  </text>

  <!-- Institution -->
  <text x="480" y="251"
        text-anchor="middle" font-family="Georgia,serif"
        font-size="15" fill="#374151">
    ${esc(o.institution)}
  </text>

  <!-- Recognition text (italic blue, wraps to multiple lines) -->
  ${recLines.map((line, i) =>
    `<text x="480" y="${287 + i * 23}" text-anchor="middle"
          font-family="Georgia,serif" font-size="16.5" font-style="italic" fill="#2155c4">
      ${esc(line)}
    </text>`).join('\n  ')}

  <!-- ══════ BOTTOM-LEFT INFO BLOCK ══════ -->
  <text x="70" y="452" font-family="Arial,sans-serif" font-size="13.5" font-weight="700" fill="#111827">Date: ${esc(o.dateDisplay)}</text>
  <text x="70" y="474" font-family="Arial,sans-serif" font-size="13.5" font-weight="700" fill="#111827">Validation Link:</text>
  <text x="70" y="491" font-family="Arial,sans-serif" font-size="12.5" fill="#2155c4">${esc(o.validationLink)}</text>
  ${usernameRow}
  ${passwordRow}
  <text x="70" y="544" font-family="Arial,sans-serif" font-size="11.5" fill="#374151">Please use your login and password to check the</text>
  <text x="70" y="558" font-family="Arial,sans-serif" font-size="11.5" fill="#374151">authenticity.</text>

  <!-- ══════ RIBBON ROSETTE (centre) ══════ -->
  <!-- Scalloped outer ring -->
  ${scallops}
  <!-- Ribbon tails -->
  <path d="M459,530 L446,576 L${RCX},558 L514,576 L501,530 Z" fill="#1e3a8a"/>
  <path d="M464,530 L${RCX},546 L496,530 Z" fill="#ffffff" opacity="0.35"/>
  <!-- Circles -->
  <circle cx="${RCX}" cy="${RCY}" r="29" fill="#1e3a8a"/>
  <circle cx="${RCX}" cy="${RCY}" r="23" fill="#2563eb"/>
  <circle cx="${RCX}" cy="${RCY}" r="19" fill="#1a3080"/>
  <!--  ★ star -->
  <text x="${RCX}" y="${RCY + 7}" text-anchor="middle" font-size="20" fill="#ffffff">&#9733;</text>

  <!-- ══════ SIGNATURE (right) ══════ -->
  <!-- Cursive signature path -->
  <path d="M726,542 C736,525 748,519 760,530 C768,537 776,523 788,519 C798,515 808,527 820,522 C830,518 842,514 856,524"
        stroke="#1a1a2e" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M730,547 C748,544 770,546 790,544 C808,542 826,544 850,540"
        stroke="#1a1a2e" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.6"/>
  <!-- Signature line -->
  <line x1="718" y1="554" x2="894" y2="554" stroke="#111827" stroke-width="1.5"/>
  <!-- Editor name & title -->
  <text x="806" y="572" text-anchor="middle"
        font-family="Georgia,serif" font-size="14.5" font-weight="700" fill="#2155c4">
    ${esc(o.editorName)}
  </text>
  <text x="806" y="589" text-anchor="middle"
        font-family="Georgia,serif" font-size="13" fill="#2155c4">
    ${esc(o.editorTitle)}
  </text>

  <!-- ══════ FOOTER ══════ -->
  <line x1="68" y1="616" x2="892" y2="616" stroke="#d1d5db" stroke-width="1"/>
  <text x="480" y="632" text-anchor="middle"
        font-family="Arial,sans-serif" font-size="11.5" font-weight="700" fill="#374151">Reg.Offices</text>
  <text x="480" y="647" text-anchor="middle"
        font-family="Arial,sans-serif" font-size="10.8" fill="#374151">
    ${esc(DEFAULTS.regLine)}
  </text>

</svg>`;
}

// ─────────────────────────────────────────────────────────
//  POPUP HTML WRAPPER  (SVG + print trigger)
// ─────────────────────────────────────────────────────────
function buildPopupHtml(svgString: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Certificate – Scholar India Publishers</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html { background:#e0e0e0; }
  body { display:flex; justify-content:center; align-items:flex-start; padding:24px; min-height:100vh; }
  svg { display:block; box-shadow:0 8px 32px rgba(0,0,0,0.25); }
  @media print {
    @page { size: A4 landscape; margin: 0; }
    html, body { background:white; padding:0; display:block; }
    svg { box-shadow:none; width:100%; height:auto; }
  }
</style>
</head>
<body>
${svgString}
<script>
  setTimeout(function(){ window.print(); }, 600);
</script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────
//  REACT COMPONENT
// ─────────────────────────────────────────────────────────
export function AdminCertificates() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    name: '', institution: '', certType: 'reviewer',
    certDate: new Date().toISOString().split('T')[0],
    validationLink: DEFAULTS.validationLink,
    username: '', password: '',
    recognitionText: DEFAULTS.recognitionText,
    editorName: DEFAULTS.editorName,
    editorTitle: DEFAULTS.editorTitle,
    certNo: '',
  });

  const searchReviewers = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviewers')
        .select('id,first_name,last_name,institution,role,status,email,new_password')
        .or(`id.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
        .limit(10);
      if (error) throw error;
      setResults(data || []);
      if (!data?.length) toast({ title: 'No results found' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const selectReviewer = (r: any) => {
    setForm(p => ({
      ...p,
      name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
      institution: r.institution || '',
      certType: r.role?.toLowerCase().includes('editorial') ? 'editorial' : 'reviewer',
      username: r.email || '',
      password: r.new_password || '',
      certNo: generateCertNo(r.id || ''),
    }));
  };

  const getTitle = (t = form.certType) =>
    t === 'editorial'
      ? 'Certificate of Appreciation for Editorial Board Membership'
      : 'Certificate of Excellence in Peer-Reviewing';

  const buildOpts = () => ({
    name: form.name,
    institution: form.institution,
    certNo: form.certNo || generateCertNo(form.name),
    dateDisplay: formatDate(form.certDate),
    certTitle: getTitle(),
    recognitionText: form.recognitionText,
    validationLink: form.validationLink,
    username: form.username,
    password: form.password,
    editorName: form.editorName,
    editorTitle: form.editorTitle,
  });

  const printCertificate = () => {
    if (!form.name) { toast({ title: 'Select a reviewer first', variant: 'destructive' }); return; }
    setGenerating(true);
    const win = window.open('', '_blank', 'width=1020,height=740');
    if (!win) {
      setGenerating(false);
      toast({ title: 'Popup blocked', description: 'Allow popups for this site.', variant: 'destructive' });
      return;
    }
    win.document.write(buildPopupHtml(buildCertSVG(buildOpts())));
    win.document.close();
    setGenerating(false);
  };

  // Live SVG preview (React renders same SVG inline)
  const previewSvg = form.name ? buildCertSVG(buildOpts()) : null;

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="pl-2 py-2">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Certificate Generator</h2>
        <p className="text-xs text-slate-500 mt-0.5">Search → select reviewer → customise → Generate → save as PDF.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mx-2">
        {/* ── Left panel ── */}
        <div className="lg:col-span-2 space-y-4">

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Search size={15} className="text-blue-900" /><span className="font-bold text-sm text-slate-800">Find Reviewer / Editor</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <Input value={search} onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchReviewers()}
                  placeholder="Name, ID or email..." className="h-9 text-sm bg-slate-50" />
                <Button onClick={searchReviewers} disabled={loading}
                  className="bg-[#1e3a8a] text-white h-9 px-3 shrink-0">
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                </Button>
              </div>
              {results.length > 0 && (
                <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 max-h-52 overflow-y-auto">
                  {results.map(r => (
                    <div key={r.id} onClick={() => selectReviewer(r)}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-blue-50/60 transition-colors ${form.username === r.email ? 'bg-blue-50 border-l-2 border-blue-700' : ''}`}>
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

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Award size={15} className="text-blue-900" /><span className="font-bold text-sm text-slate-800">Certificate Details</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Type</label>
                  <select value={form.certType} onChange={e => setForm(p => ({ ...p, certType: e.target.value }))}
                    className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="reviewer">Peer-Reviewing</option>
                    <option value="editorial">Editorial Board</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Issue Date</label>
                  <Input type="date" value={form.certDate} onChange={e => setForm(p => ({ ...p, certDate: e.target.value }))} className="h-9 bg-slate-50 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Recipient Name *</label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="h-9 bg-slate-50 text-xs" placeholder="e.g. Dr. John Smith" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Institution</label>
                <Input value={form.institution} onChange={e => setForm(p => ({ ...p, institution: e.target.value }))} className="h-9 bg-slate-50 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Recognition Text</label>
                <Textarea value={form.recognitionText} onChange={e => setForm(p => ({ ...p, recognitionText: e.target.value }))} className="bg-slate-50 text-xs min-h-[58px] resize-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Validation Link</label>
                <Input value={form.validationLink} onChange={e => setForm(p => ({ ...p, validationLink: e.target.value }))} className="h-9 bg-slate-50 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Username</label>
                  <Input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} className="h-9 bg-slate-50 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Password</label>
                  <Input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="h-9 bg-slate-50 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Editor Name</label>
                  <Input value={form.editorName} onChange={e => setForm(p => ({ ...p, editorName: e.target.value }))} className="h-9 bg-slate-50 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Editor Title</label>
                  <Input value={form.editorTitle} onChange={e => setForm(p => ({ ...p, editorTitle: e.target.value }))} className="h-9 bg-slate-50 text-xs" />
                </div>
              </div>
              <Button onClick={printCertificate} disabled={generating || !form.name}
                className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-sm h-11 gap-2 rounded-xl mt-1 shadow-md">
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Generate & Download PDF
              </Button>
            </div>
          </div>
        </div>

        {/* ── Right: Live SVG Preview ── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Award size={15} className="text-blue-900" />
              <span className="font-bold text-sm text-slate-800">Preview — what-you-see is what-you-print</span>
              {form.name && <Badge className="ml-auto bg-emerald-100 text-emerald-700 text-[9px] font-bold border-none">Ready</Badge>}
            </div>
            <div className="p-4">
              {!previewSvg ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Award size={44} className="text-slate-200" />
                  <p className="text-slate-400 text-sm text-center">Search and select a reviewer<br/>to see a live preview</p>
                </div>
              ) : (
                /* dangerouslySetInnerHTML renders the SVG exactly as it will print */
                <div
                  className="w-full overflow-hidden rounded shadow-lg border border-slate-200"
                  dangerouslySetInnerHTML={{ __html: previewSvg }}
                  style={{ lineHeight: 0 }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
