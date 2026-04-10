import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Archive,
  Edit,
  Send,
  BookOpen,
  Calendar,
  Users,
  Database,
  Mail,
  Wallet,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Award,
  Clock,
  ShieldCheck,
  Search,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import GeneralManuscriptSubmissionForm from "./GeneralManuscriptSubmissionForm";
import ReviewerApplicationForm from "./ReviewerApplicationForm";
import Footer from "./Footer";

// Clean author names — strip *, †, ‡, superscript digits
const cleanAuthors = (raw: string) =>
  raw
    .replace(/[*†‡§¶]/g, "")
    .replace(/[\d⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾]/g, "")
    .replace(/\s+,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();

interface EditorialMember {
  name: string;
  designation: string;
  institution: string;
  location: string;
  email: string;
  profileUrl?: string;
}

interface Article {
  id: number;
  articleId: string;
  title: string;
  authors: string;
  affiliation: string;
  pages: string;
  doi?: string;
}

interface TabbedJournalPageProps {
  title: string;
  aim: string;
  scope: string;
  publicationTypes: string;
  researchFocus: string;
  targetAudience: string;
  subject: string;
  subjectCovers?: string[];
  editorInChief?: EditorialMember | null;
  managingEditor?: EditorialMember | null;
  associateEditors?: EditorialMember[];
  boardMembers?: EditorialMember[];
  articles?: Article[];
  archivedArticles?: Article[];
  v2i1Articles?: Article[];
  currentVolume?: string;
  currentIssue?: string;
  startingYear?: string;
  referenceStyle?: "APA" | "APA_MLA";
}

export default function TabbedJournalPage({
  title,
  aim,
  scope,
  publicationTypes,
  researchFocus,
  targetAudience,
  subject,
  subjectCovers = [],
  editorInChief,
  managingEditor,
  associateEditors = [],
  boardMembers = [],
  articles = [],
  archivedArticles = [],
  v2i1Articles = [],
  currentVolume = "2",
  currentIssue = "1",
  startingYear = "2026",
  referenceStyle = "APA",
}: TabbedJournalPageProps) {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.slice(1);
    return hash || "overview";
  });
  const [selectedVolume, setSelectedVolume] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [showReviewerForm, setShowReviewerForm] = useState(false);

  // Track visit on mount
  useEffect(() => {
    const journalId = title.toLowerCase().includes('commerce') ? 'sjcm' : 'sjhss';
    apiRequest('POST', `/api/track-visit/${journalId}`).catch(console.error);
  }, [title]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const parts = hash.split('/');
      const baseTab = parts[0];
      
      if (baseTab !== activeTab) {
        setActiveTab(baseTab);
      }

      if (baseTab === "archives") {
        const vol = parts[1] || null;
        const issue = parts[2] || null;
        if (vol !== selectedVolume) setSelectedVolume(vol);
        if (issue !== selectedIssue) setSelectedIssue(issue);
      } else {
        setSelectedVolume(null);
        setSelectedIssue(null);
      }
    }
  }, [location]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
    if (value !== "archives") {
      setSelectedVolume(null);
      setSelectedIssue(null);
    }
  };

  const handleBack = () => {
    if (selectedIssue) {
      setSelectedIssue(null);
      window.location.hash = `archives/${selectedVolume}`;
    } else if (selectedVolume) {
      setSelectedVolume(null);
      window.location.hash = "archives";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar Menu */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Journal Menu */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="bg-[#213361] px-6 py-4">
                  <h2 className="text-xl font-serif font-bold text-white tracking-wide">Journal Menu</h2>
                </div>
                <nav className="flex flex-col py-2">
                  {[
                    { value: "overview", label: "Overview", icon: BookOpen },
                    { value: "editorial-board", label: "Editorial Board", icon: Users },
                    { value: "current-issue", label: "Current Issue", icon: FileText },
                    { value: "archives", label: "Archives", icon: Archive },
                    { value: "guidelines", label: "Author Guidelines", icon: Edit },
                    { value: "indexing", label: "Indexing", icon: Database },
                    { value: "reviewers", label: "Reviewers", icon: UserCheck },
                    { value: "submit", label: "Submit Manuscript", icon: Send },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => handleTabChange(item.value)}
                      className={`flex items-center justify-between w-full px-6 py-3.5 transition-all duration-200 group ${
                        activeTab === item.value
                          ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-900 text-blue-900 dark:text-blue-300"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <item.icon className={`h-5 w-5 transition-colors ${activeTab === item.value ? "text-blue-900 dark:text-blue-300" : "text-gray-400 group-hover:text-blue-600"}`} />
                        <span className="font-semibold text-sm">{item.label}</span>
                      </div>
                      {activeTab === item.value && <ChevronRight className="h-4 w-4 animate-in fade-in slide-in-from-left-2 duration-300" />}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Support Section */}
              <div className="bg-[#213361] rounded-xl p-6 text-white shadow-xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Mail className="h-16 w-16 -mr-4 -mt-4 rotate-12" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-6 relative z-10 text-white">Support</h3>
                <div className="space-y-6 relative z-10">
                  <div className="flex gap-4">
                    <Mail className="h-6 w-6 text-blue-300 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-1">EMAIL US</p>
                      <a href="mailto:editor@scholarindiapub.com" className="text-sm font-semibold hover:text-yellow-400 transition-colors break-words block">
                        editor@scholarindiapub.com
                      </a>
                    </div>
                  </div>
                  <Link href="/contact" className="flex items-center gap-4 group/link">
                    <Send className="h-6 w-6 text-blue-300 group-hover/link:text-yellow-400 transition-colors shrink-0" />
                    <span className="text-sm font-semibold group-hover/link:text-yellow-400 transition-colors">Send Inquiry Form</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="overview" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardHeader className="bg-[#213361] border-0">
                <CardTitle className="text-2xl font-serif text-white">Journal Particulars</CardTitle>
              </CardHeader>
              <CardContent className="mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-200 pl-4">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Title</p>
                      <p className="text-base text-gray-900 dark:text-gray-100">{title}</p>
                    </div>
                    <div className="border-l-4 border-blue-200 pl-4">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Frequency</p>
                      <p className="text-base text-gray-900 dark:text-gray-100">Quarterly</p>
                    </div>
                    <div className="border-l-4 border-blue-200 pl-4">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">ISSN</p>
                      <p className="text-base text-gray-900 dark:text-gray-100">XXXXX</p>
                    </div>
                    <div className="border-l-4 border-blue-200 pl-4">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Publisher Name</p>
                      <p className="text-base text-gray-900 dark:text-gray-100">Scholar India Publishers</p>
                    </div>
                    <div className="border-l-4 border-blue-200 pl-4">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Publisher Address</p>
                      <p className="text-base text-gray-900 dark:text-gray-100">2/477, Perumal Kovil Street, Mettuchery, Mappedu, Tiruvallur, Chennai - 631402, Tamilnadu, India</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-200 pl-4">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Starting Year</p>
                      <p className="text-base text-gray-900 dark:text-gray-100">{startingYear}</p>
                    </div>
                    <div className="border-l-4 border-blue-200 pl-4">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Subject</p>
                      <p className="text-base text-gray-900 dark:text-gray-100">{subject}</p>
                    </div>
                    <div className="border-l-4 border-blue-200 pl-4">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Language</p>
                      <p className="text-base text-gray-900 dark:text-gray-100">English</p>
                    </div>
                    <div className="border-l-4 border-blue-200 pl-4">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Publication Format</p>
                      <p className="text-base text-gray-900 dark:text-gray-100">Online (Open Access)</p>
                    </div>
                    <div className="border-l-4 border-blue-200 pl-4">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Email</p>
                      <p className="text-base text-gray-900 dark:text-gray-100">prof.klirsn@gmail.com / editor@scholarindiapub.com</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {subjectCovers && subjectCovers.length > 0 && (
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
                <CardHeader className="bg-[#213361] border-0">
                  <CardTitle className="text-2xl font-serif text-white">Subject Covers</CardTitle>
                </CardHeader>
                <CardContent className="mt-4">
                  <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
                    Manuscripts that are suitable for publication in {title.includes("Commerce") ? "SJCM" : "SJHSS"} cover various domains of {subject.toLowerCase()}. The below mentioned domains are only indicative:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {subjectCovers.map((domain, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0"></div>
                        <span className="text-base">{domain}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardHeader className="bg-[#213361] border-0">
                <CardTitle className="text-2xl font-serif text-white">Aim</CardTitle>
              </CardHeader>
              <CardContent className="mt-4">
                <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">{aim}</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardHeader className="bg-[#213361] border-0">
                <CardTitle className="text-2xl font-serif text-white">Scope</CardTitle>
              </CardHeader>
              <CardContent className="mt-4">
                <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">{scope}</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardHeader className="bg-[#213361] border-0">
                <CardTitle className="text-2xl font-serif text-white">Publication Types</CardTitle>
              </CardHeader>
              <CardContent className="mt-4">
                <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">{publicationTypes}</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardHeader className="bg-[#213361] border-0">
                <CardTitle className="text-2xl font-serif text-white">Research Focus</CardTitle>
              </CardHeader>
              <CardContent className="mt-4">
                <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">{researchFocus}</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardHeader className="bg-[#213361] border-0">
                <CardTitle className="text-2xl font-serif text-white">Target Audience</CardTitle>
              </CardHeader>
              <CardContent className="mt-4">
                <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">{targetAudience}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="editorial-board">
            <div className="space-y-8">
              {editorInChief && (
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
                  <CardHeader className="bg-[#213361] border-0">
                    <CardTitle className="text-2xl font-serif text-white">Editor-in-Chief</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{editorInChief.name}</h3>
                          <p className="text-blue-600 dark:text-blue-400 font-medium">{editorInChief.designation}</p>
                          <p className="text-gray-700 dark:text-gray-300">{editorInChief.institution}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{editorInChief.location}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Mail className="h-4 w-4" />
                            <a href={`mailto:${editorInChief.email}`} className="text-sm hover:underline">{editorInChief.email}</a>
                          </div>
                          {editorInChief.profileUrl && (
                            <Button asChild variant="outline" size="sm" className="h-7 text-[10px] font-bold border-blue-200 text-blue-700 hover:bg-blue-50">
                              <a href={editorInChief.profileUrl} target="_blank" rel="noopener noreferrer">
                                <Users className="h-3 w-3 mr-1.5" /> View Profile
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {managingEditor && (
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
                  <CardHeader className="bg-[#213361] border-0">
                    <CardTitle className="text-2xl font-serif text-white">Managing Editor</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{managingEditor.name}</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">{managingEditor.designation}</p>
                        <p className="text-gray-700 dark:text-gray-300">{managingEditor.institution}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{managingEditor.location}</p>
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2">
                          {managingEditor.email.split("/").map((email, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                              <Mail className="h-4 w-4" />
                              <a href={`mailto:${email.trim()}`} className="text-sm hover:underline">{email.trim()}</a>
                            </div>
                          ))}
                        </div>
                        {managingEditor.profileUrl && (
                          <div className="flex items-center">
                            <Button asChild variant="outline" size="sm" className="h-7 text-[10px] font-bold border-blue-200 text-blue-700 hover:bg-blue-50">
                              <a href={managingEditor.profileUrl} target="_blank" rel="noopener noreferrer">
                                <Users className="h-3 w-3 mr-1.5" /> View Profile
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {associateEditors.length > 0 && (
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
                  <CardHeader className="bg-[#213361] border-0">
                    <CardTitle className="text-2xl font-serif text-white">Associate Editors</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {associateEditors.map((member, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                          <h4 className="font-bold text-gray-900 dark:text-gray-100">{member.name}</h4>
                          <p className="text-sm text-blue-600 dark:text-blue-400">{member.designation}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{member.institution}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{member.location}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                              <Mail className="h-3 w-3" />
                              <a href={`mailto:${member.email}`} className="text-xs hover:underline">{member.email}</a>
                            </div>
                            {member.profileUrl && (
                              <Button asChild variant="ghost" size="sm" className="h-6 text-[10px] font-bold text-blue-700 hover:bg-blue-50 p-0 hover:px-2 transition-all">
                                <a href={member.profileUrl} target="_blank" rel="noopener noreferrer">
                                  <Users className="h-3 w-3 mr-1" /> Profile
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {boardMembers.length > 0 ? (
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
                  <CardHeader className="bg-[#213361] border-0">
                    <CardTitle className="text-2xl font-serif text-white">Editorial Board Members</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {boardMembers.map((member, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                          <h4 className="font-bold text-gray-900 dark:text-gray-100">{member.name}</h4>
                          <p className="text-sm text-blue-600 dark:text-blue-400">{member.designation}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{member.institution}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{member.location}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                              <Mail className="h-3 w-3" />
                              <a href={`mailto:${member.email}`} className="text-xs hover:underline">{member.email}</a>
                            </div>
                            {member.profileUrl && (
                              <Button asChild variant="ghost" size="sm" className="h-6 text-[10px] font-bold text-blue-700 hover:bg-blue-50 p-0 hover:px-2 transition-all">
                                <a href={member.profileUrl} target="_blank" rel="noopener noreferrer">
                                  <Users className="h-3 w-3 mr-1" /> Profile
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
                  <CardHeader className="bg-[#213361] border-0">
                    <CardTitle className="text-2xl font-serif text-white">Editorial Board Members</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-16 pb-16 text-center">
                    <Users className="h-20 w-20 text-blue-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold mb-3 text-blue-900 dark:text-blue-300">Join Our Editorial Board</h3>
                    <p className="text-base text-blue-600 dark:text-blue-400 max-w-md mx-auto mb-8">
                      We are currently in the process of forming the editorial board for this journal. If you are a qualified academic professional interested in joining, we invite you to apply.
                    </p>
                    <Button 
                      onClick={() => handleTabChange("reviewers")}
                      className="bg-blue-900 hover:bg-blue-800 text-white"
                      size="lg"
                    >
                      Apply for Editorial Board / Reviewer
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="current-issue">
            <Card className="bg-white dark:bg-gray-900 overflow-hidden">
              <CardHeader className="bg-[#213361] border-0 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl md:text-2xl font-serif text-white">Current Issue (April - June 2026)</CardTitle>
                      <p className="text-sm md:text-base font-medium text-blue-100">
                        (Volume {currentVolume}, Issue {currentIssue})
                      </p>
                    </div>
                  </div>
                  {currentVolume !== "1" && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white hover:bg-white/10 transition-colors"
                      onClick={() => {
                        setActiveTab("archives");
                        setSelectedVolume("v1");
                        setSelectedIssue("i1");
                        window.location.hash = "archives/v1/i1";
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" /> Previous Issue (Vol 1, Issue 1)
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {articles && articles.length > 0 ? (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <Card key={article.id} className="border-l-4 border-[#213361] shadow-md hover:shadow-lg transition-all bg-white dark:bg-gray-900 overflow-hidden mb-6">
                        <CardContent className="p-4 md:p-5">
                          <div className="flex flex-col md:flex-row gap-4 md:gap-5">
                            <div className="flex-shrink-0 hidden md:flex">
                              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                                <span className="text-base font-bold text-[#213361] dark:text-blue-300">{article.id}</span>
                              </div>
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 md:hidden mb-1">
                                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-[#213361] dark:text-blue-300 text-[10px] font-bold rounded">Article {article.id}</span>
                                </div>
                                <Link href={`/article/${article.articleId}`} className="block group">
                                  <h4 className="text-sm md:text-base font-serif font-bold text-[#213361] dark:text-blue-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors cursor-pointer leading-snug uppercase tracking-wide">
                                    {article.title}
                                  </h4>
                                </Link>
                                <div className="flex flex-wrap items-center gap-y-1 text-gray-600 dark:text-gray-400">
                                  <Users className="h-3.5 w-3.5 mr-2 text-blue-600 dark:text-blue-400 shrink-0" />
                                  <span className="text-sm font-medium">{cleanAuthors(article.authors)}</span>
                                </div>
                                {article.affiliation && (
                                  <div className="flex items-start gap-2 text-gray-500 dark:text-gray-500 italic text-xs">
                                    <BookOpen className="h-3.5 w-3.5 mr-2 text-blue-400 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                      {article.affiliation.split('\n').map((aff, idx) => (
                                        aff.trim() && (
                                          <div key={idx}>{aff.trim()}</div>
                                        )
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-3 border-t border-gray-50 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mr-1">Pages</span>
                                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{article.pages}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <ExternalLink className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mr-1">DOI</span>
                                  {article.doi ? (
                                    <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all">{article.doi}</a>
                                  ) : (
                                    <span className="text-xs font-semibold text-gray-500 italic">In progress</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 ml-auto">
                                  <Button asChild variant="ghost" className="h-8 text-xs font-bold text-blue-700 hover:text-blue-800 hover:bg-blue-50 px-3 border border-transparent hover:border-blue-100">
                                    <Link href={`/article/${article.articleId}`}>
                                      <Search className="h-3.5 w-3.5 mr-2" /> Abstract
                                    </Link>
                                  </Button>
                                  <Button asChild variant="ghost" className="h-8 text-xs font-bold text-blue-900 hover:text-blue-800 hover:bg-blue-50 px-3 border border-transparent hover:border-blue-100">
                                        <a href={
                                          article.articleId === "sjhss-v1i2-001"
                                            ? "/downloads/SIPHSv1i201.pdf"
                                            : article.articleId === "sjhss-v1i2-002"
                                              ? "/downloads/SIPHSv1i202.pdf"
                                              : `/downloads/${article.articleId}.pdf`
                                        } target="_blank" rel="noopener noreferrer">
                                      <FileText className="h-3.5 w-3.5 mr-2" /> Full PDF
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="pt-16 pb-16 text-center">
                    <Calendar className="h-20 w-20 text-blue-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold mb-3 text-blue-900 dark:text-blue-300">Coming Soon</h3>
                    <p className="text-base text-blue-600 dark:text-blue-400 max-w-md mx-auto">
                      Volume {currentVolume}, Issue {currentIssue} (April - June 2026) is currently under preparation.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archives">
            <div className="space-y-0">
              {(() => {
                const isCommerce = title.toLowerCase().includes('commerce');
                const volumes = isCommerce
                  ? [
                      { key: "v2", label: "Volume 2 (Current)", period: "Jan - Dec 2026", status: "In Progress", issues: [
                        { num: 1, label: "Issue 1", period: "Jan - Mar 2026", hasArticles: true, getArticles: () => v2i1Articles },
                        { num: 2, label: "Issue 2", period: "Apr - Jun 2026", hasArticles: true, getArticles: () => articles },
                        { num: 3, label: "Issue 3", period: "Jul - Sep 2026", hasArticles: false, getArticles: () => [] as Article[] },
                        { num: 4, label: "Issue 4", period: "Oct - Dec 2026", hasArticles: false, getArticles: () => [] as Article[] },
                      ]},
                      { key: "v1", label: "Volume 1", period: "Oct - Dec 2025", status: "Published", issues: [
                        { num: 1, label: "Issue 1", period: "Oct - Dec 2025", hasArticles: true, getArticles: () => archivedArticles },
                      ]},
                    ]
                  : [
                      { key: "v1", label: "Volume 1 (Current)", period: "Jan - Dec 2026", status: "In Progress", issues: [
                        { num: 1, label: "Issue 1", period: "Jan - Mar 2026", hasArticles: true, getArticles: () => archivedArticles },
                        { num: 2, label: "Issue 2", period: "Apr - Jun 2026", hasArticles: true, getArticles: () => articles },
                        { num: 3, label: "Issue 3", period: "Jul - Sep 2026", hasArticles: false, getArticles: () => [] as Article[] },
                        { num: 4, label: "Issue 4", period: "Oct - Dec 2026", hasArticles: false, getArticles: () => [] as Article[] },
                      ]},
                    ];
                const currentVol = volumes.find(v => v.key === selectedVolume);
                const currentIssueData = currentVol?.issues.find(i => `i${i.num}` === selectedIssue);

                if (!selectedVolume) {
                  return (
                    <div className="space-y-6">
                      <div className="bg-[#213361] rounded-xl p-6 text-white">
                        <div className="flex items-center gap-3">
                          <Archive className="h-7 w-7 text-yellow-400" />
                          <div>
                            <h2 className="text-2xl font-serif font-bold">Archives</h2>
                            <p className="text-blue-200 text-sm mt-1">Browse past volumes and issues</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {volumes.map((vol) => (
                          <div
                            key={vol.key}
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover-elevate transition-all"
                            onClick={() => {
                              setSelectedVolume(vol.key);
                              window.location.hash = `archives/${vol.key}`;
                            }}
                            data-testid={`card-volume-${vol.key}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                                  <Archive className="h-7 w-7 text-[#213361] dark:text-blue-300" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-serif font-bold text-[#213361] dark:text-blue-300">{vol.label}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-semibold text-blue-800 dark:text-blue-400">{vol.period}</span>
                                  </div>
                                  <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${vol.status === "In Progress" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"}`}>
                                    {vol.status}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="h-6 w-6 text-blue-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (!selectedIssue && currentVol) {
                  return (
                    <div className="space-y-6">
                      <div className="bg-[#213361] rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button onClick={handleBack} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" data-testid="button-back-volumes">
                              <ArrowLeft className="h-5 w-5 text-white" />
                            </button>
                            <div>
                              <h2 className="text-2xl font-serif font-bold">{currentVol.label}</h2>
                              <p className="text-blue-200 text-sm mt-1">{currentVol.period} &middot; {currentVol.issues.length} {currentVol.issues.length === 1 ? "Issue" : "Quarterly Issues"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={`grid grid-cols-1 ${currentVol.issues.length > 1 ? "md:grid-cols-2" : ""} gap-4`}>
                        {currentVol.issues.map((issue) => (
                          <div
                            key={issue.num}
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-all cursor-pointer hover-elevate"
                            onClick={() => {
                              const issueKey = `i${issue.num}`;
                              setSelectedIssue(issueKey);
                              window.location.hash = `archives/${selectedVolume}/${issueKey}`;
                            }}
                            data-testid={`card-issue-${issue.num}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                                  <FileText className="h-5 w-5 text-[#213361] dark:text-blue-300" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-serif font-bold text-[#213361] dark:text-blue-300">{issue.label}</h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{issue.period}</p>
                                  {!issue.hasArticles && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-1">Upcoming</p>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-blue-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (currentVol && currentIssueData) {
                  const issueArticles = currentIssueData.getArticles();
                  const volNum = currentVol.key.replace("v", "");
                  return (
                    <div className="space-y-6">
                      <div className="bg-[#213361] rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button onClick={handleBack} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" data-testid="button-back-issues">
                              <ArrowLeft className="h-5 w-5 text-white" />
                            </button>
                            <div>
                              <h2 className="text-2xl font-serif font-bold">
                                Volume {volNum}, Issue {currentIssueData.num}
                              </h2>
                              <p className="text-blue-200 text-sm mt-1">{currentIssueData.period}</p>
                            </div>
                          </div>
                          {issueArticles.length > 0 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                              {issueArticles.length} Articles
                            </span>
                          )}
                        </div>
                      </div>

                      {issueArticles.length > 0 ? (
                        <div className="space-y-4">
                          {issueArticles.map((article) => (
                            <Card key={article.id} className="border-l-4 border-[#213361] shadow-md hover:shadow-lg transition-all bg-white dark:bg-gray-900 overflow-hidden mb-6">
                              <CardContent className="p-4 md:p-5">
                                <div className="flex flex-col md:flex-row gap-4 md:gap-5">
                                  <div className="flex-shrink-0 hidden md:flex">
                                    <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                                      <span className="text-base font-bold text-[#213361] dark:text-blue-300">{article.id}</span>
                                    </div>
                                  </div>
                                  <div className="flex-1 space-y-3">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2 md:hidden mb-1">
                                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-[#213361] dark:text-blue-300 text-[10px] font-bold rounded">Article {article.id}</span>
                                      </div>
                                      <Link href={`/article/${article.articleId}`} className="block group">
                                        <h4 className="text-sm md:text-base font-serif font-bold text-[#213361] dark:text-blue-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors cursor-pointer leading-snug uppercase tracking-wide">
                                          {article.title}
                                        </h4>
                                      </Link>
                                      <div className="flex flex-wrap items-center gap-y-1 text-gray-600 dark:text-gray-400">
                                        <Users className="h-3.5 w-3.5 mr-2 text-blue-600 dark:text-blue-400 shrink-0" />
                                        <span className="text-sm font-medium">{cleanAuthors(article.authors)}</span>
                                      </div>
                                      {article.affiliation && (
                                        <div className="flex items-start gap-2 text-gray-500 dark:text-gray-500 italic text-xs">
                                          <BookOpen className="h-3.5 w-3.5 mr-2 text-blue-400 shrink-0 mt-0.5" />
                                          <div className="space-y-1">
                                            {article.affiliation.split('\n').map((aff, idx) => (
                                              aff.trim() && (
                                                <div key={idx}>{aff.trim()}</div>
                                              )
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-3 border-t border-gray-50 dark:border-gray-800">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mr-1">Pages</span>
                                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{article.pages}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <ExternalLink className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mr-1">DOI</span>
                                        {article.doi ? (
                                          <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all">{article.doi}</a>
                                        ) : (
                                          <span className="text-xs font-semibold text-gray-500 italic">In progress</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3 ml-auto">
                                        <Button asChild variant="ghost" className="h-8 text-xs font-bold text-blue-700 hover:text-blue-800 hover:bg-blue-50 px-3 border border-transparent hover:border-blue-100">
                                          <Link href={`/article/${article.articleId}`}>
                                            <Search className="h-3.5 w-3.5 mr-2" /> Abstract
                                          </Link>
                                        </Button>
                                        <Button asChild variant="ghost" className="h-8 text-xs font-bold text-blue-900 hover:text-blue-800 hover:bg-blue-50 px-3 border border-transparent hover:border-blue-100">
                                          <a href={`/downloads/${article.articleId}.pdf`} target="_blank" rel="noopener noreferrer">
                                            <FileText className="h-3.5 w-3.5 mr-2" /> Full PDF
                                          </a>
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                          <Calendar className="h-16 w-16 text-blue-300 dark:text-blue-700 mx-auto mb-4" />
                          <h3 className="text-xl font-serif font-bold text-[#213361] dark:text-blue-300 mb-2">No articles published in this issue yet</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Scheduled for {currentIssueData.period}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }

                return null;
              })()}
            </div>
          </TabsContent>

          <TabsContent value="reviewers">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardHeader className="bg-[#213361] border-0">
                <CardTitle className="text-2xl font-serif text-white">Editor / Reviewer Application</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {!showReviewerForm ? (
                  <div className="space-y-12">
                    {/* Become a Reviewer CTA */}
                    <div className="bg-[#213361]/5 dark:bg-[#213361]/20 p-8 rounded-lg border border-[#213361]/20 text-center">
                      <h3 className="text-2xl font-serif font-bold text-[#213361] dark:text-blue-300 mb-2">Become a Reviewer / Editor</h3>
                      <p className="text-[#213361] dark:text-blue-400 font-bold mb-4">Join our distinguished panel of expert reviewers</p>
                      <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto text-lg italic">
                        "Share your expertise and contribute to advancing scholarly research"
                      </p>
                      <Button 
                        onClick={() => setShowReviewerForm(true)} 
                        className="bg-[#213361] hover:bg-[#2a4078] text-white px-10 h-12 text-lg font-bold"
                      >
                        Apply Now
                      </Button>
                    </div>

                    {/* Portals & Tracking */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-blue-100 dark:border-blue-900 hover-elevate cursor-pointer overflow-hidden group">
                        <Link href="/reviewer-login">
                          <CardContent className="p-0">
                            <div className="bg-blue-900 p-4 flex items-center justify-between text-white">
                              <h4 className="font-serif font-bold text-lg">Reviewer Portal</h4>
                              <Users className="h-6 w-6 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Access your dashboard, assigned manuscripts, and submit reviews.</p>
                              <div className="mt-4 flex items-center text-blue-900 dark:text-blue-300 text-sm font-bold uppercase tracking-wider">
                                Login Portal <ExternalLink className="h-4 w-4 ml-1" />
                              </div>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>

                      <Card className="border-blue-100 dark:border-blue-900 hover-elevate cursor-pointer overflow-hidden group">
                        <Link href="/reviewer-search">
                          <CardContent className="p-0">
                            <div className="bg-blue-700 p-4 flex items-center justify-between text-white">
                              <h4 className="font-serif font-bold text-lg">Track Your Status</h4>
                              <Database className="h-6 w-6 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400">View your reviewer/editor profile and application status.</p>
                              <div className="mt-4 flex items-center text-blue-700 dark:text-blue-300 text-sm font-bold uppercase tracking-wider">
                                Track Status <ExternalLink className="h-4 w-4 ml-1" />
                              </div>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    </div>

                    {/* Role Description */}
                    <div className="space-y-4 max-w-4xl">
                      <h4 className="text-2xl font-serif font-bold text-blue-900 dark:text-blue-300">The Role of a Reviewer</h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        Peer reviewers are the backbone of academic publishing, playing a critical role in ensuring the quality, validity, and integrity of research. Your expert evaluation helps authors refine their work, maintains our journal's academic standards, and contributes to the advancement of knowledge in your field. Through constructive feedback and rigorous assessment, you ensure that only high-quality, original research reaches the global academic community.
                      </p>
                    </div>

                    {/* Benefits & Requirements */}
                    <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <h4 className="text-xl font-serif font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2 underline decoration-blue-200 underline-offset-8">
                          Why Review for Us?
                        </h4>
                        <div className="grid gap-6">
                          <div className="flex gap-4 items-start">
                            <div className="h-8 w-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">Certificate of Appreciation</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Official certificate for every review you complete</p>
                            </div>
                          </div>
                          <div className="flex gap-4 items-start">
                            <div className="h-8 w-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">Professional Recognition</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Enhance your academic profile and reputation</p>
                            </div>
                          </div>
                          <div className="flex gap-4 items-start">
                            <div className="h-8 w-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">Early Access to Research</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Review cutting-edge research before publication</p>
                            </div>
                          </div>
                          <div className="flex gap-4 items-start">
                            <div className="h-8 w-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">Networking & Skills Development</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Connect globally and sharpen analytical abilities</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-xl font-serif font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2 underline decoration-blue-200 underline-offset-8">
                          Requirements
                        </h4>
                        <ul className="space-y-4">
                          <li className="flex gap-3 text-gray-700 dark:text-gray-300 items-center">
                            <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0"></div>
                            <span className="text-lg">PhD or equivalent degree</span>
                          </li>
                          <li className="flex gap-3 text-gray-700 dark:text-gray-300 items-center">
                            <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0"></div>
                            <span className="text-lg">Active researcher with publications</span>
                          </li>
                          <li className="flex gap-3 text-gray-700 dark:text-gray-300 items-center">
                            <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0"></div>
                            <span className="text-lg">ORCID & Google Scholar (mandatory)</span>
                          </li>
                          <li className="flex gap-3 text-gray-700 dark:text-gray-300 items-center">
                            <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0"></div>
                            <span className="text-lg">Expertise in relevant research areas</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Key Responsibilities */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-serif font-bold text-blue-900 dark:text-blue-300 underline decoration-blue-200 underline-offset-8">Key Responsibilities</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-3 items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                          <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">Provide constructive, timely feedback</span>
                        </div>
                        <div className="flex gap-3 items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">Maintain confidentiality of materials</span>
                        </div>
                        <div className="flex gap-3 items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                          <Award className="h-5 w-5 text-blue-600 shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">Follow ethical peer review guidelines</span>
                        </div>
                        <div className="flex gap-3 items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                          <Users className="h-5 w-5 text-blue-600 shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">Declare any conflicts of interest</span>
                        </div>
                      </div>
                    </div>

                    {/* Review Process */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-xl border border-gray-100 dark:border-gray-800">
                      <h4 className="text-2xl font-serif font-bold text-blue-900 dark:text-blue-300 mb-6">Manuscript Review Process</h4>
                      <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                        We follow a rigorous and transparent peer review process to ensure the highest standards of academic quality, originality, and integrity. Our double-blind peer review system protects reviewer and author anonymity while maintaining editorial oversight.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {[
                          { step: 1, title: "Manuscript Submission", desc: "Authors submit manuscripts through our online portal with all required documents." },
                          { step: 2, title: "Initial Screening (3-5 days)", desc: "Our editorial team performs a desk review to verify scope, quality, and formatting." },
                          { step: 3, title: "Double-Blind Peer Review (15-20 days)", desc: "Assigned to 2-3 expert peer reviewers for objective and anonymous assessment." },
                          { step: 4, title: "Editorial Decision (5-7 days)", desc: "Editor-in-Chief reviews feedback and makes final decision: Accept, Revise, or Reject." },
                          { step: 5, title: "Revision & Resubmission", desc: "Authors address comments and resubmit with a detailed response letter." },
                          { step: 6, title: "Publication", desc: "Accepted manuscripts undergo copyediting and typesetting for immediate publication." }
                        ].map((item) => (
                          <div key={item.step} className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm relative pt-10 group hover:border-blue-400 transition-colors">
                            <div className="absolute top-0 left-6 -translate-y-1/2 h-10 w-10 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-xl border-4 border-white dark:border-gray-900 group-hover:scale-110 transition-transform">{item.step}</div>
                            <h5 className="font-bold text-blue-900 dark:text-blue-300 mb-2">{item.title}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                          </div>
                        ))}
                      </div>

                      {/* Reviewer Guidelines */}
                      <div className="space-y-6 mb-12">
                        <h4 className="text-xl font-serif font-bold text-blue-900 dark:text-blue-300 border-b pb-2">Reviewer Guidelines</h4>
                        <ul className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                          <li className="flex gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                            <span>Reviewers should follow the review guidelines and decide on the articles with special reference to originality and novelty.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                            <span>Reviewers should understand that the peer review process is confidential and the information should not be used for personal advantage.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                            <span>Reviewers should clearly understand that the review process should be unbiased and the authors deserve full credit for their work. There shall be no personal criticism of the author.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                            <span>Reviewers should not review manuscripts in which they have conflicts of interest resulting from competitive, collaborative, or other relationships or connections with any of the authors, companies, or institutions connected to the papers.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                            <span>Reviewers should submit a comprehensive and substantial peer review report in a timely manner. If there is any delay, it should be communicated to the editor.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                            <span>Reviewers should also bring to the editorial committee's attention any substantial similarity or overlap between the article under consideration and any other published work of which they have personal knowledge.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                            <span>Reviewers should have a look at the assigned manuscript and arrive at a decision regarding whether the paper fits within the stated scope of the journal or not. They should evaluate the manuscript within the provided timeline in order to facilitate timely completion of the review process.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                            <span>Confidential remarks to be done and the reviewer can advise the editor for acceptance, rejection, or modification. Their comments and reviews must never be influenced by race, religion, nationality, ethnicity, language, origin, gender, or any political agencies.</span>
                          </li>
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-blue-50 dark:border-gray-800">
                          <p className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-300">15-20</p>
                          <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-1">Days Peer Review</p>
                        </div>
                        <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-blue-50 dark:border-gray-800">
                          <p className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-300">2-3</p>
                          <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-1">Expert Reviewers</p>
                        </div>
                        <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-blue-50 dark:border-gray-800">
                          <p className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-300">Double</p>
                          <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-1">Blind Review</p>
                        </div>
                        <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-blue-50 dark:border-gray-800">
                          <p className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-300">~30</p>
                          <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-1">Days Total Process</p>
                        </div>
                      </div>
                    </div>

                    {/* Directory Info */}
                  </div>
                ) : (
                  <div>
                    <Button variant="outline" onClick={() => setShowReviewerForm(false)} className="mb-6 border-blue-900 text-blue-900">
                      ← Back to Reviewer Information
                    </Button>
                    <ReviewerApplicationForm journalTitle={title} onCancel={() => setShowReviewerForm(false)} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submit">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardHeader className="bg-[#213361] border-0">
                <CardTitle className="text-2xl font-serif text-white">Submit Manuscript</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <GeneralManuscriptSubmissionForm journalTitle={title} subject={subject} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guidelines">
            <div className="space-y-6">
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
                <CardHeader className="bg-[#213361] border-0">
                  <CardTitle className="text-2xl font-serif flex items-center text-white">
                    <Edit className="h-6 w-6 mr-2 text-yellow-400" /> Author Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  {/* General Policies */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300">General Policies</h3>
                    <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                      <p>Authors should not submit the same manuscript in the same language simultaneously to more than one journal. Preparing or manipulating of data and results, intellectual property theft, and plagiarism are highly unacceptable. Information obtained from various media can be provided in the manuscript only with prior permission from the owner of the source of information or data.</p>
                      <p>Authors and coauthors are requested to review and ensure the accuracy and validity of all the results prior to submission. Any potential conflict of interest should be informed to the editor well in advance.</p>
                      <p>All authors are requested to submit the Author Declaration Form while submitting the manuscript and the Licence to Publish Agreement without failure once they receive the acceptance of their research paper for publication.</p>
                    </div>
                  </div>

                  {/* AI Policy */}
                  <div className="space-y-4 bg-blue-50/50 dark:bg-blue-950/20 p-6 rounded-lg border border-blue-100 dark:border-blue-900">
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300">AI & LLM Policy</h3>
                    <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                      <li className="flex gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                        <span>An AI tool cannot be listed as an author of a paper.</span>
                      </li>
                      <li className="flex gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                        <span>Disclosure of AI use in Methods or Acknowledgments is mandatory.</span>
                      </li>
                      <li className="flex gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                        <span>Authors are fully responsible for all content, including parts produced by AI tools.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Publication Ethics */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300">Publication Ethics & Integrity</h3>
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                      <p>All published articles are rigorously double-blind peer-reviewed and screened with plagiarism detection tools (Turnitin); content match of less than 20% is considered acceptable.</p>
                      <p>This is an open access journal. There is no article processing fee charged to the authors and all articles are immediately available on the journal website once published.</p>
                    </div>
                  </div>

                  {/* Article Structure */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300">Manuscript Structure</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>Title & Short Title</li>
                        <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>Author Names & Email Addresses</li>
                        <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>Abstract (Max 200 words)</li>
                        <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>Keywords (Up to 6)</li>
                      </ul>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>Introduction</li>
                        <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>Methods</li>
                        <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>Results & Discussion</li>
                        <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>Conclusions & References</li>
                      </ul>
                    </div>
                  </div>

                  {/* Reference Style */}
                  <div className="space-y-4 p-6 border border-gray-100 dark:border-gray-800 rounded-lg">
                    {referenceStyle === "APA_MLA" ? (
                      <>
                        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300">Reference Style (APA, Harvard, MLA & Chicago)</h3>
                        <div className="space-y-8">
                          {/* APA Section */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-bold text-blue-800 dark:text-blue-400 border-b pb-2">APA Style (7th Edition)</h4>
                            <div className="space-y-2">
                              <p className="font-bold text-gray-900 dark:text-white">In-Text Citations:</p>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                <li>One author: (Field, 2005)</li>
                                <li>Two authors: (Gass & Varonis, 1984)</li>
                                <li>Three or more authors: (Munoz et al., 2006)</li>
                              </ul>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs md:text-sm">
                              <p className="text-blue-600 dark:text-blue-400 mb-1 font-bold">// Journal Article</p>
                              Grady, J. S., Her, M., Moreno, G., Perez, C., & Yelinek, J. (2019). Emotions in storybooks. Psychology of Popular Media Culture, 8(3), 207–217.
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs md:text-sm">
                              <p className="text-blue-600 dark:text-blue-400 mb-1 font-bold">// Conference Paper</p>
                              Author, A. A. (Year, Month). Title of the paper. Paper presented at Conference Name, Location.
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs md:text-sm">
                              <p className="text-blue-600 dark:text-blue-400 mb-1 font-bold">// Book / Book Chapter</p>
                              Author, A. A. (Year). Title of the book. Publisher.
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs md:text-sm">
                              <p className="text-blue-600 dark:text-blue-400 mb-1 font-bold">// Thesis</p>
                              Author, A. A. (Year). Title of the thesis [Unpublished doctoral dissertation]. University Name.
                            </div>
                          </div>

                          {/* MLA Section */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-bold text-blue-800 dark:text-blue-400 border-b pb-2">MLA Style (9th Edition)</h4>
                            <div className="space-y-2">
                              <p className="font-bold text-gray-900 dark:text-white">In-Text Citations:</p>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                <li>Author and page: (Jones 12)</li>
                                <li>Two authors: (Thomson and Jones 45)</li>
                                <li>Three+ authors: (Smith et al. 89)</li>
                                <li>If author is named in sentence: Jones states... (12)</li>
                              </ul>
                            </div>
                            <div className="space-y-4">
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs md:text-sm">
                                <p className="text-blue-600 dark:text-blue-400 mb-1 font-bold">// Journal Article</p>
                                Author, First Name, and Second Author. "Article Title." Journal Title, vol. 2, no. 2, 2019, pp. 121-127.
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs md:text-sm">
                                <p className="text-blue-600 dark:text-blue-400 mb-1 font-bold">// Conference Paper</p>
                                Author, First Name. "Title of the Paper." Conference Name, Date, Location. Conference Presentation.
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs md:text-sm">
                                <p className="text-blue-600 dark:text-blue-400 mb-1 font-bold">// Book / Book Chapter</p>
                                Author, First Name. Title of the Book. Publisher, Year.
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs md:text-sm">
                                <p className="text-blue-600 dark:text-blue-400 mb-1 font-bold">// Thesis</p>
                                Author, First Name. "Title of the Thesis." Degree, University Name, Year.
                              </div>
                            </div>
                          </div>

                          {/* Harvard Section */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-bold text-blue-800 dark:text-blue-400 border-b pb-2">Harvard Style</h4>
                            <div className="space-y-2">
                              <p className="font-bold text-gray-900 dark:text-white">In-Text Citations:</p>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                <li>One author: (Smith, 2008, p. 23)</li>
                                <li>Two authors: (Smith & Jones, 2008, p. 23)</li>
                                <li>Three or more authors: (Smith et al., 2008, p. 23)</li>
                              </ul>
                            </div>
                            <div className="space-y-4">
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs md:text-sm">
                                <p className="text-blue-600 dark:text-blue-400 mb-1 font-bold">// Journal Article</p>
                                Smith, J., Jones, M. and Brown, A., 2019. Article title. Journal Title, 12(3), pp. 45-67.
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs md:text-sm">
                                <p className="text-blue-600 dark:text-blue-400 mb-1 font-bold">// Book</p>
                                Smith, J., 2020. Book Title. 2nd edn. Publisher Name.
                              </div>
                            </div>
                          </div>

                          {/* Chicago Section */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-bold text-blue-800 dark:text-blue-400 border-b pb-2">Chicago Style (Author-Date)</h4>
                            <div className="space-y-2">
                              <p className="font-bold text-gray-900 dark:text-white">In-Text Citations:</p>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                <li>One author: (Smith 2008)</li>
                                <li>Two authors: (Smith and Jones 2008)</li>
                                <li>Three or more authors: (Smith et al. 2008)</li>
                              </ul>
                            </div>
                            <div className="space-y-4">
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs md:text-sm">
                                <p className="text-blue-600 dark:text-blue-400 mb-1 font-bold">// Journal Article</p>
                                Smith, John, Mary Jones, and Alice Brown. "Article Title." Journal Title 12, no. 3 (2019): 45-67.
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs md:text-sm">
                                <p className="text-blue-600 dark:text-blue-400 mb-1 font-bold">// Book</p>
                                Smith, John. Book Title. 2nd ed. Publisher Name, 2020.
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300">Reference Style (APA)</h3>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <p className="font-bold text-gray-900 dark:text-white">Citations in Text:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                              <li>Use author and year: (Jones, 2019)</li>
                              <li>Two authors: (Thomson & Jones, 2020)</li>
                              <li>Three or more authors: (Smith et al., 2021)</li>
                              <li>If author is named in sentence: Jones (2019) states...</li>
                            </ul>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs md:text-sm">
                              <p className="text-blue-600 dark:text-blue-400 mb-1 font-bold">// Journal Article</p>
                              Author, A. A., & Author, B. B. (Year). Title of the article. Journal Title, volume(issue), pp-pp.
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs md:text-sm">
                              <p className="text-blue-600 dark:text-blue-400 mb-1 font-bold">// Conference Paper</p>
                              Author, A. A. (Year, Month). Title of the paper. Paper presented at Conference Name, Location.
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs md:text-sm">
                              <p className="text-blue-600 dark:text-blue-400 mb-1 font-bold">// Book / Book Chapter</p>
                              Author, A. A. (Year). Title of the book. Publisher.
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs md:text-sm">
                              <p className="text-blue-600 dark:text-blue-400 mb-1 font-bold">// Thesis</p>
                              Author, A. A. (Year). Title of the thesis [Unpublished doctoral dissertation]. University Name.
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Ethical Statements */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                      <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Author Contributions</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Identify each author’s contribution using CRediT taxonomy (e.g., Conceptualization, Methodology, Writing - Original Draft, etc.). The corresponding author is responsible for accuracy.</p>
                    </div>
                    <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                      <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Conflict of Interest</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">All financial or personal affiliations that could influence the work must be disclosed. If none exist, state: "The authors have no conflict of interest to report."</p>
                    </div>
                  </div>

                  {/* Correction & Retraction */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300">Correction, Retraction & Removal</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="font-bold text-sm">Correction</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Published if the scholarly record is seriously affected (accuracy, meaning, reproducibility).</p>
                      </div>
                      <div className="space-y-2">
                        <p className="font-bold text-sm">Retraction</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Reserved for cases where conclusions are undermined or ethical codes are breached.</p>
                      </div>
                      <div className="space-y-2">
                        <p className="font-bold text-sm">Removal</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Only in extreme cases (defamatory content, legal infringement, or court orders).</p>
                      </div>
                    </div>
                  </div>

                  {/* Diversity & Inclusivity */}
                  <div className="p-6 bg-blue-50/30 dark:bg-blue-950/10 rounded-lg border border-blue-100 dark:border-blue-900">
                    <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3">Diversity & Inclusivity (Use of Inclusive Language)</h4>
                    <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      <p>Incorporating inclusive language in manuscripts recognizes the array of differences among individuals, demonstrates respect for all individuals, displays sensitivity to varying perspectives, and fosters equal prospects.</p>
                      <p>Articles should steer clear of any insinuation of one person's superiority over another based on factors like age, gender, race, ethnicity, culture, sexual orientation, disability, or health status. Utilizing inclusive language consistently throughout is of paramount importance. Authors must ensure their writing is void of partiality, clichés, slang, and allusions that assume a dominant culture or cultural presumptions.</p>
                      <p>To attain gender neutrality, it's recommended authors employ plural nouns ("clinicians, patients/clients") as the default whenever feasible, rather than resorting to gender-specific pronouns ("he," "she," or "he/she"). Descriptors tied to personal characteristics should only be included if they hold relevance and validity.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="indexing">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardHeader className="bg-[#213361] border-0">
                <CardTitle className="text-2xl font-serif text-white">Indexing & Abstracting</CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover-elevate transition-all">
                    <Database className="h-12 w-12 text-blue-600 mb-2" />
                    <span className="text-sm font-bold text-blue-900 dark:text-blue-300">Crossref</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">DOI Partner</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover-elevate transition-all">
                    <Users className="h-12 w-12 text-blue-600 mb-2" />
                    <span className="text-sm font-bold text-blue-900 dark:text-blue-300">ResearchGate</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Academic Network</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover-elevate transition-all">
                    <BookOpen className="h-12 w-12 text-blue-600 mb-2" />
                    <span className="text-sm font-bold text-blue-900 dark:text-blue-300">Academia.edu</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Repository</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
