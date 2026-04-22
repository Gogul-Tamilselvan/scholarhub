import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive, Calendar, ChevronRight, FileText, ArrowLeft, ExternalLink, BookMarked } from "lucide-react";

interface PublicSpecialIssueArchiveProps {
  specialIssue: any;
  onBack: () => void;
}

export default function PublicSpecialIssueArchive({ specialIssue, onBack }: PublicSpecialIssueArchiveProps) {
  const [volumes, setVolumes] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  
  const [selectedVolume, setSelectedVolume] = useState<any>(null);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If specialIssue is actually an issue (from new hierarchy)
    if (specialIssue && specialIssue.si_volume_id) {
       setSelectedVolume(specialIssue.si_volume);
       handleSelectIssue(specialIssue);
    } 
    // If it's a volume
    else if (specialIssue && (specialIssue.volume_number || specialIssue.journal_id)) {
      handleSelectVolume(specialIssue);
    } 
    else {
      // Legacy path
      loadVolumes();
    }
  }, [specialIssue.id]);

  async function loadVolumes() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("si_volumes")
        .select("*")
        .eq("special_issue_id", specialIssue.id)
        .order("volume_number", { ascending: false });
      if (error) throw error;
      setVolumes(data || []);
    } catch (err) {
      console.error("Failed to load SI volumes", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectVolume = async (vol: any) => {
    setSelectedVolume(vol);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("si_issues")
        .select("*")
        .eq("si_volume_id", vol.id)
        .order("issue_number", { ascending: true });
      if (error) throw error;
      setIssues(data || []);
    } catch (err) {
      console.error("Failed to load SI issues", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIssue = async (issue: any) => {
    setSelectedIssue(issue);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("si_articles")
        .select("*")
        .eq("si_issue_id", issue.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setArticles(data || []);
    } catch (err) {
      console.error("Failed to load SI articles", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (selectedIssue) {
      setSelectedIssue(null);
    } else if (selectedVolume) {
      setSelectedVolume(null);
    } else {
      onBack();
    }
  };

  const cleanAuthors = (authors: string) => {
    return authors.replace(/[\*†‡1-9]/g, '').replace(/,\s*$/, '').trim();
  };

  if (selectedIssue) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-[#213361] rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Archive className="h-16 w-16 -mr-4 -mt-4 rotate-12" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <button 
              onClick={handleBack} 
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center"
              aria-label="Go back"
            >
              <ArrowLeft className="h-6 w-6 text-white" />
            </button>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">{selectedIssue.label || `Issue ${selectedIssue.issue_number}`}</h2>
              <p className="text-sm font-medium text-blue-100 mt-1">{selectedVolume.label || `Volume ${selectedVolume.volume_number}`} • {articles.length} Article(s)</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading articles...</div>
          ) : articles.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Articles Yet</h3>
              <p className="text-gray-500 mt-2">Articles for this issue will appear here once published.</p>
            </div>
          ) : (
            articles.map((article) => (
              <div 
                key={article.id} 
                className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-900 transition-all shadow-sm hover:shadow-md"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold tracking-wider uppercase border border-blue-100 dark:border-blue-800">
                          Research Article
                        </span>
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-[#213361] dark:text-gray-100 leading-tight">
                        <a href={`/si-article/${article.id}`} className="hover:text-blue-600 transition-colors">
                          {article.title}
                        </a>
                      </h3>
                      <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                        {cleanAuthors(article.authors)}
                      </p>
                      <div className="flex flex-wrap items-center gap-5 text-xs text-gray-500 dark:text-gray-400 font-bold pt-2">
                        {article.pages && <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg"><FileText className="h-4 w-4 text-blue-500" /> Pages: {article.pages}</span>}
                        {article.doi && <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg"><ExternalLink className="h-4 w-4 text-emerald-500" /> DOI: {article.doi}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-3 min-w-[160px] border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6">
                      <a
                        href={`/si-article/${article.id}`}
                        className="w-full text-center px-5 py-2.5 bg-slate-50 dark:bg-gray-800 border-2 border-slate-100 dark:border-gray-700 hover:border-blue-400 hover:text-blue-600 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl transition-all"
                      >
                        Abstract
                      </a>
                      {article.pdf_url && (
                        <a
                          href={article.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full text-center px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          <FileText className="h-4 w-4" /> PDF Full Text
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (selectedVolume) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-[#213361] rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar className="h-16 w-16 -mr-4 -mt-4 rotate-12" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <button 
              onClick={handleBack} 
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center"
              aria-label="Go back"
            >
              <ArrowLeft className="h-6 w-6 text-white" />
            </button>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">{selectedVolume.label || `Volume ${selectedVolume.volume_number}`}</h2>
              <p className="text-sm font-medium text-blue-100 mt-1">{selectedVolume.period} • {issues.length} Issue(s)</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading issues...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-800 p-6 transition-all cursor-pointer hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 group"
                onClick={() => handleSelectIssue(issue)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800 group-hover:bg-[#213361] group-hover:text-white transition-all">
                      <FileText className="h-6 w-6 text-[#213361] group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#213361] dark:text-blue-300 group-hover:text-blue-700 transition-colors">{issue.label || `Issue ${issue.issue_number}`}</h3>
                      <p className="text-sm font-medium text-gray-500">{issue.period}</p>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:translate-x-1 transition-all">
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#213361] rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <BookMarked className="h-16 w-16 -mr-4 -mt-4 rotate-12" />
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <button 
            onClick={onBack} 
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">{specialIssue.title}</h2>
            <p className="text-sm font-medium text-blue-100 mt-1">Special Issue Archives</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading volumes...</div>
      ) : volumes.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Archive className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Archives Yet</h3>
          <p className="text-gray-500 mt-2">Volumes and issues will appear here once published.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {volumes.map((vol) => (
            <div
              key={vol.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-800 p-6 cursor-pointer hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900 transition-all group"
              onClick={() => handleSelectVolume(vol)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800 group-hover:bg-[#213361] group-hover:text-white transition-all">
                    <Archive className="h-8 w-8 text-[#213361] group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-[#213361] dark:text-blue-300 group-hover:text-blue-700 transition-colors">{vol.label || `Volume ${vol.volume_number}`}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                        <span className="text-xs font-bold text-blue-800 dark:text-blue-200">{vol.period}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:translate-x-1 transition-all">
                  <ChevronRight className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
