import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Award, ExternalLink, ShieldCheck, FileText, BookOpen, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

export default function CertificateVerification() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) {
      toast({ title: 'Enter a search term', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setSearched(false);
    try {
      const { data, error } = await supabase
        .from('reviewer_certificates')
        .select('*')
        .or(
          `reviewer_name.ilike.%${q}%,reviewer_id.ilike.%${q}%,cert_no.ilike.%${q}%,journal_name.ilike.%${q}%`
        )
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setResults(data || []);
      setSearched(true);
      if (!data?.length) {
        toast({ title: 'No certificates found', description: 'Try a different name, ID, or certificate number.' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <SEO
        title="Certificate Verification | Scholar India Publishers"
        description="Verify the authenticity of reviewer and editor certificates issued by Scholar India Publishers. Search by name, reviewer ID, or certificate number."
      />
      <Header />

      {/* Hero */}
      <section className="relative bg-[#0d162d] text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-5%] w-[50%] h-[180%] rounded-full bg-[#1e3a8a]/25 blur-[120px]" />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        </div>
        <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 mb-6">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">Official Verification Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4 tracking-tight">
            Certificate Verification
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Verify the authenticity of peer-review certificates issued by Scholar India Publishers.
            Search by reviewer name, reviewer ID, or certificate number.
          </p>
        </div>
      </section>

      {/* Search Panel */}
      <section className="bg-white py-10 border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-300" />
              <h2 className="text-white font-bold text-base">Search Certificate Records</h2>
            </div>
            <div className="p-6">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Search by Name / Reviewer ID / Certificate Number
              </label>
              <div className="flex gap-3">
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g. Dr. John Smith  or  REV001234  or  REV001/234567"
                  className="h-11 text-sm bg-slate-50 border-slate-200 focus-visible:ring-[#1e3a8a] flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-[#1e3a8a] hover:bg-blue-900 text-white h-11 px-5 font-bold rounded-xl gap-2 shrink-0"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  Search
                </Button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Tip: You can also search by journal name to see all certificates issued for a particular journal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="bg-slate-50 py-12 min-h-[40vh]">
        <div className="max-w-4xl mx-auto px-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-[#1e3a8a] animate-spin" />
              <p className="text-slate-500 text-sm">Searching certificate records…</p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-20">
              <ShieldCheck className="w-14 h-14 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-1">No Certificates Found</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                We couldn't find any certificate matching your search. Please check the name, ID, or certificate number and try again.
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-700">
                  {results.length} Certificate{results.length > 1 ? 's' : ''} Found
                </h3>
                <Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px] font-bold">Verified Records</Badge>
              </div>

              {results.map(cert => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Top accent */}
                  <div className="h-1 bg-gradient-to-r from-[#1e3a8a] via-amber-400 to-[#1e3a8a]" />

                  <div className="p-5 flex flex-col sm:flex-row gap-4 items-start">
                    {/* Icon */}
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-[#1e3a8a]/10 flex items-center justify-center">
                      <Award className="w-6 h-6 text-[#1e3a8a]" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-base font-black text-slate-900">{cert.reviewer_name}</h4>
                        <Badge className="bg-[#1e3a8a]/10 text-[#1e3a8a] border-none text-[10px] font-bold uppercase">{cert.reviewer_id}</Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-2">
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Journal</p>
                            <p className="text-[12px] text-slate-700 font-semibold">{cert.journal_name || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FileText className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Manuscript</p>
                            <p className="text-[12px] text-slate-700 font-semibold line-clamp-2">{cert.manuscript_title || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Certificate No.</p>
                            <p className="text-[12px] text-slate-700 font-bold font-mono">{cert.cert_no}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Issued On</p>
                            <p className="text-[12px] text-slate-700 font-semibold">{formatDate(cert.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* View Certificate */}
                    {cert.certificate_url && (
                      <div className="shrink-0 self-center sm:self-start pt-1">
                        <a
                          href={cert.certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#1e3a8a] hover:bg-blue-900 text-white text-[12px] font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm whitespace-nowrap"
                        >
                          <ExternalLink size={13} />
                          View Certificate
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Footer ribbon */}
                  <div className="px-5 py-2 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-bold text-emerald-700">Verified · Issued by Scholar India Publishers</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Initial state */}
          {!loading && !searched && (
            <div className="text-center py-20">
              <Award className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-500 mb-1">Verify a Certificate</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Enter the reviewer's name, ID, or certificate number above to verify the authenticity of a peer-review certificate.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
