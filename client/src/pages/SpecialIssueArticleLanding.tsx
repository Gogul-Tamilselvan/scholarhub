import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, FileText, Loader2 } from "lucide-react";
import { downloadPdf } from "@/lib/downloadPdf";
import { Link } from "wouter";
import ArticleSEO from "@/components/ArticleSEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function SpecialIssueArticleLanding() {
  const [, params] = useRoute("/si-article/:id");
  const articleId = params?.id;

  const [article, setArticle] = useState<any>(null);
  const [journalTitle, setJournalTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      if (!articleId) return;
      setLoading(true);
      try {
        // Step 1: Fetch the article itself (safe — no joins that may not exist)
        const { data: articleData, error: articleError } = await supabase
          .from("si_articles")
          .select("*")
          .eq("id", articleId)
          .single();

        if (articleError || !articleData) {
          setNotFound(true);
          return;
        }

        // Step 2: Try to get special issue info from special_issue_id (new system)
        if (articleData.special_issue_id) {
          const { data: siData } = await supabase
            .from("journal_special_issues")
            .select("*, journals(title)")
            .eq("id", articleData.special_issue_id)
            .single();
          if (siData) {
            articleData.journal_special_issues = siData;
            if (siData.journals?.title) setJournalTitle(siData.journals.title);
          }
        }

        // Step 3: Fallback — try legacy si_issues → si_volumes join
        if (!articleData.journal_special_issues && articleData.si_issue_id) {
          const { data: issueData } = await supabase
            .from("si_issues")
            .select("*, si_volumes(*)")
            .eq("id", articleData.si_issue_id)
            .single();
          if (issueData) {
            articleData.si_issues = issueData;
            const jId = issueData.si_volumes?.journal_id;
            if (jId) {
              if (jId === '__sjcm__') setJournalTitle('Scholar Journal of Commerce and Management');
              else if (jId === '__sjhss__') setJournalTitle('Scholar Journal of Humanities and Social Sciences');
              else {
                const { data: jData } = await supabase.from('journals').select('title').eq('id', jId).single();
                if (jData) setJournalTitle(jData.title);
              }
            }
          }
        }

        setArticle(articleData);
      } catch (err) {
        console.error("Failed to load article", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [articleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#213361]" />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center flex-col gap-4">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
            <p className="text-muted-foreground mb-4">The article you're looking for doesn't exist.</p>
            <Button asChild className="bg-[#213361]"><Link href="/">Return to Home</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cleanAuthors = (raw: string) => raw.replace(/[*†‡§¶]/g, "").replace(/\s+,/g, ",").replace(/\s{2,}/g, " ").trim();
  const cleanAuthorsForCitation = (raw: string) => raw.replace(/[*†‡§¶]/g, "").replace(/[\d⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾]/g, "").replace(/\s+,/g, ",").replace(/\s{2,}/g, " ").trim();
  const toTitleCase = (str: string) => {
    const minor = new Set(["a","an","the","and","but","or","for","nor","on","at","to","by","in","of","up","as","with","from","into","through","during","before","after","above","below","between","against"]);
    return str.toLowerCase().split(" ").map((w, i) => (i === 0 || !minor.has(w)) ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(" ");
  };
  const toSentenceCase = (str: string) => {
    const lower = str.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const volumeLabel = article.journal_special_issues ? 'Special Issue' : (article.si_issues?.si_volumes?.label || `Volume ${article.si_issues?.si_volumes?.volume_number || 1}`);
  const issueLabel = article.journal_special_issues ? article.journal_special_issues.title : (article.si_issues?.label || `Issue ${article.si_issues?.issue_number || 1}`);
  
  let year = new Date().getFullYear().toString();
  if (article.journal_special_issues?.description) {
      const match = article.journal_special_issues.description.match(/\d{4}/);
      if (match) year = match[0];
  } else if (article.si_issues?.period) {
      const match = article.si_issues.period.match(/\d{4}/);
      if (match) year = match[0];
  }

  const generateAPA7Citation = () => {
    const authors = cleanAuthorsForCitation(article.authors);
    const title = toSentenceCase(article.title);
    const doi = article.doi ? ` https://doi.org/${article.doi}` : "";
    return `${authors}. (${year}). ${title}. ${journalTitle}, ${volumeLabel}(${issueLabel}), ${article.pages}.${doi}`;
  };

  const generateHarvardCitation = () => {
    const authors = cleanAuthorsForCitation(article.authors);
    const title = toTitleCase(article.title);
    const doi = article.doi ? ` Available at: https://doi.org/${article.doi}` : "";
    return `${authors} ${year}, '${title}', ${journalTitle}, ${volumeLabel}(${issueLabel}), pp. ${article.pages}.${doi}`;
  };

  const generateMLACitation = () => {
    const authors = cleanAuthorsForCitation(article.authors);
    const title = toTitleCase(article.title);
    const doi = article.doi ? ` doi:${article.doi}.` : "";
    return `${authors}. "${title}." ${journalTitle}, vol. ${volumeLabel}, no. ${issueLabel}, ${year}, pp. ${article.pages}.${doi}`;
  };

  const generateChicagoCitation = () => {
    const authors = cleanAuthorsForCitation(article.authors);
    const title = toTitleCase(article.title);
    const doi = article.doi ? `. https://doi.org/${article.doi}` : "";
    return `${authors}. "${title}." ${journalTitle} ${volumeLabel}, no. ${issueLabel} (${year}): ${article.pages}${doi}`;
  };

  const [firstPage, lastPage] = (article.pages || "").includes("-") ? article.pages.split("-").map((p: any) => p.trim()) : [article.pages, article.pages];

  return (
    <>
      <ArticleSEO
        title={article.title}
        authors={article.authors}
        journal={journalTitle}
        volume={volumeLabel}
        issue={issueLabel}
        firstPage={firstPage}
        lastPage={lastPage}
        year={year}
        pdfUrl={article.pdf_url}
        abstract={article.abstract}
        keywords={typeof article.keywords === 'string' ? article.keywords.split(',').map((k: string) => k.trim()) : (article.keywords || [])}
        doi={article.doi}
        articleUrl={`/si-article/${article.id}`}
      />
      <Header />
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-28">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <Button variant="ghost" className="mb-6 text-blue-600 hover:text-blue-900 dark:text-blue-400" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="h-1 w-full bg-[#213361]" />
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 px-6 py-6">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#213361]/10 border border-[#213361]/20">
                      <span className="text-xs font-semibold text-[#213361] dark:text-blue-300 uppercase tracking-wide">Special Issue Article</span>
                    </div>
                    <CardTitle className="text-xl md:text-2xl font-serif leading-relaxed text-gray-900 dark:text-gray-50 font-bold">{article.title}</CardTitle>
                    <div className="space-y-2 pt-1">
                      <p className="text-base font-semibold text-gray-800 dark:text-gray-200">{cleanAuthors(article.authors)}</p>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {article.affiliation?.split('\n').map((aff: string, idx: number) => (
                          aff.trim() && <div key={idx} className="leading-relaxed">{aff.trim()}</div>
                        ))}
                      </div>
                      <div className="pt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-semibold text-[#213361] dark:text-blue-400">DOI: </span>
                          {article.doi ? <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer" className="text-[#213361] dark:text-blue-400 hover:underline font-medium">{article.doi}</a> : <span className="text-gray-400 italic">(will be added later)</span>}
                        </p>
                        <button
                          onClick={() => downloadPdf(article.pdf_url, article.title?.replace(/[^a-z0-9]/gi, '_') + '.pdf')}
                          className="inline-flex items-center gap-2 bg-[#213361] hover:bg-[#2a4078] text-white font-semibold shadow-sm transition-all w-full md:w-auto px-4 py-2 rounded-md text-sm"
                        >
                          <Download className="h-4 w-4" /> Download Full Article PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="mt-6 space-y-6">
                  {article.abstract && (
                    <div>
                      <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-gray-100 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-1">Abstract</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-justify">{article.abstract}</p>
                    </div>
                  )}

                  {article.keywords && (
                    <div>
                      <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-gray-100 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-1">Keywords</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {typeof article.keywords === 'string' ? article.keywords.split(',').join(' · ') : (Array.isArray(article.keywords) ? article.keywords.join(' · ') : '')}
                      </p>
                    </div>
                  )}

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 pb-6">
                    <h3 className="text-base font-bold mb-3 text-gray-900 dark:text-gray-100 uppercase tracking-wide">How to Cite</h3>
                    <div className="space-y-3">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#213361] text-white"><span className="text-xs font-bold uppercase tracking-wider">APA (7th Edition)</span></div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed px-4 py-3 font-mono">{generateAPA7Citation()}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#213361] text-white"><span className="text-xs font-bold uppercase tracking-wider">Harvard</span></div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed px-4 py-3 font-mono">{generateHarvardCitation()}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#213361] text-white"><span className="text-xs font-bold uppercase tracking-wider">MLA (9th Edition)</span></div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed px-4 py-3 font-mono">{generateMLACitation()}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#213361] text-white"><span className="text-xs font-bold uppercase tracking-wider">Chicago</span></div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed px-4 py-3 font-mono">{generateChicagoCitation()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <div className="space-y-4 sticky top-28">
                <Card className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="h-1 w-full bg-[#213361]" />
                  <CardHeader className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3"><CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Journal Information</CardTitle></CardHeader>
                  <CardContent className="px-4 py-3 space-y-3 text-xs">
                    <div><p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Journal</p><p className="text-gray-600 dark:text-gray-400">{journalTitle}</p></div>
                    <div><p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Special Issue</p><p className="text-gray-600 dark:text-gray-400">{article.journal_special_issues?.title || article.si_issues?.title}</p></div>
                    <div><p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Volume/Issue</p><p className="text-gray-600 dark:text-gray-400">{volumeLabel}, {issueLabel}</p></div>
                    <div><p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Publication Year</p><p className="text-gray-600 dark:text-gray-400">{year}</p></div>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="h-1 w-full bg-[#213361]" />
                  <CardHeader className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
                    <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      Our Journals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-3 flex flex-col gap-1">
                    <Button variant="ghost" className="w-full justify-start text-xs text-[#213361] hover:bg-slate-100 h-auto py-2 px-2 whitespace-normal text-left leading-tight" asChild>
                      <Link href="/commerce-management">Scholar Journal of Commerce and Management</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-xs text-[#213361] hover:bg-slate-100 h-auto py-2 px-2 whitespace-normal text-left leading-tight" asChild>
                      <Link href="/humanities">Scholar Journal of Humanities and Social Sciences</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-xs text-[#213361] hover:bg-slate-100 h-auto py-2 px-2 whitespace-normal text-left leading-tight" asChild>
                      <Link href="/journals">View All Journals</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="h-1 w-full bg-[#213361]" />
                  <CardHeader className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3"><CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Contribute</CardTitle></CardHeader>
                  <CardContent className="px-4 py-3">
                    <Button className="w-full bg-[#213361] hover:bg-[#2a4078] text-white font-semibold text-sm" asChild><Link href="/submit-manuscript">Submit Manuscript</Link></Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
