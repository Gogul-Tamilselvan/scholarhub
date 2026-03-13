import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, ArrowLeft, BookOpen, Eye, Download as DownloadIcon } from "lucide-react";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { useEffect } from "react";
import { useJournalStats, useTrackVisitor } from "@/hooks/useJournalStats";

interface Article {
  id: number;
  articleId: string;
  title: string;
  authors: string;
  affiliation: string;
  pages: string;
  doi?: string;
}

interface IssueData {
  issueId: string;
  journal: string;
  volume: string;
  issue: string;
  period: string;
  year: string;
  articles: Article[];
}

const issuesData: Record<string, IssueData> = {
  "sjcm-v1i1": {
    issueId: "sjcm-v1i1",
    journal: "Scholar Journal of Commerce and Management",
    volume: "1",
    issue: "1",
    period: "October - December",
    year: "2025",
    articles: [
      {
        id: 1,
        articleId: "sjcm-v1i1-001",
        title: "THE IMPACT OF GOVERNMENT POLICIES ON THE GROWTH OF M-COMMERCE IN DEVELOPING ECONOMIES: AN INDIAN PERSPECTIVE",
        authors: "Bhuriya Jignesh Subhashbhai, Chanduji Popatji Thakor*",
        affiliation: "Assistant Professor of Commerce and Management, Shri Govind Guru University, Vinzol-Godhra, Gujarat, India",
        pages: "1-10",
        doi: "10.65219/sjcm.20250101001"
      },
      {
        id: 2,
        articleId: "sjcm-v1i1-002",
        title: "CONSUMER PERCEPTION TOWARDS DIGITAL PAYMENT MODE IN BANKING SECTOR",
        authors: "A.Vini Infanta",
        affiliation: "Assistant Professor of Professional Accounting and Finance, School of Commerce, Accounting and Finance, Kristu Jayanti Deemed to be University, Bengaluru, India",
        pages: "11-18",
        doi: "10.65219/sjcm.20250101002"
      },
      {
        id: 3,
        articleId: "sjcm-v1i1-003",
        title: "IMPACT OF SOCIAL MEDIA MARKETING ON BRAND LOYALTY WITH MEDIATING ROLE OF PURCHASE INTENTION AMONG GEN Z - AN EMPIRICAL STUDY",
        authors: "M. Suganya",
        affiliation: "Assistant Professor, BBA Department, DDGD Vaishnav College, Arumbakkam, Chennai, India",
        pages: "19-25",
        doi: "10.65219/sjcm.20250101003"
      },
      {
        id: 4,
        articleId: "sjcm-v1i1-004",
        title: "STUDY ON FINANCIAL LITERACY AND AWARENESS AMONG WORKING WOMEN: A SURVEY BASED APPROACH IN PANCHMAHAL DISTRICT",
        authors: "Chanduji Popatji Thakor",
        affiliation: "Assistant Professor of Commerce and Management, Shri Govind Guru University, Vinzol-Godhra, Gujarat, India",
        pages: "26-30",
        doi: "10.65219/sjcm.20250101004"
      },
      {
        id: 5,
        articleId: "sjcm-v1i1-005",
        title: "EFFECTIVENESS OF SOCIAL MEDIA ADVERTISING ON BRAND LOYALTY",
        authors: "R.Ramki*, R.M.Uma",
        affiliation: "Assistant Professor, Department of Commerce, Hindustan Institute of Technology & Science, Padur, Chennai, India",
        pages: "31-35",
        doi: "10.65219/sjcm.20250101005"
      }
    ]
  }
};

export default function IssueLanding() {
  const [, params] = useRoute("/article/:id");
  const issueId = params?.id || "";
  const issueData = issuesData[issueId];
  
  // Extract journal ID from issue ID (e.g., "sjcm-v1i1" -> "sjcm")
  const journalId = issueId.split('-')[0] || "sjcm";
  
  const { data: stats } = useJournalStats(journalId);
  const trackVisitorMutation = useTrackVisitor(journalId);
  
  // Track visitor on mount
  useEffect(() => {
    if (issueId) {
      trackVisitorMutation.mutate();
    }
  }, [issueId, trackVisitorMutation]);

  if (!issueData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Card className="bg-white dark:bg-gray-900">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-20 w-20 text-blue-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-300 mb-4">
                Issue Not Found
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                The requested journal issue could not be found.
              </p>
              <Link href="/">
                <Button className="bg-[#213361] hover:bg-[#2a4078] text-white" data-testid="button-back-home">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${issueData.journal} - Vol. ${issueData.volume}, Issue ${issueData.issue} (${issueData.year})`}
        description={`Browse all ${issueData.articles.length} published articles in ${issueData.journal} Volume ${issueData.volume}, Issue ${issueData.issue} (${issueData.period} ${issueData.year}). International peer-reviewed academic journal.`}
        keywords={`${issueData.journal}, volume ${issueData.volume}, issue ${issueData.issue}, research articles, academic journal, peer-reviewed, ${issueData.year}`}
      />
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="mb-4" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="bg-white dark:bg-gray-900 overflow-hidden">
          <CardHeader className="bg-[#213361] border-0">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-blue-100">
                <Calendar className="h-4 w-4 text-yellow-400" />
                <span>{issueData.period} {issueData.year}</span>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-serif text-white">
                {issueData.journal}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold text-blue-100">
                  Volume {issueData.volume}, Issue {issueData.issue}
                </span>
                <span className="text-blue-200">
                  {issueData.articles.length} Published {issueData.articles.length === 1 ? 'Article' : 'Articles'}
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 bg-white dark:bg-gray-900">
            <div className="space-y-4">
              {issueData.articles.map((article) => (
                <Card 
                  key={article.id} 
                  className="border-l-4 border-blue-200 shadow-sm hover-elevate transition-all bg-white dark:bg-gray-900"
                  data-testid={`article-card-${article.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-base font-bold text-blue-900 dark:text-blue-300">
                            {article.id}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <Link
                          href={`/article/${article.articleId}`}
                          className="block group"
                          data-testid={`link-article-${article.id}`}
                        >
                          <h3 className="text-base md:text-lg font-bold text-blue-900 dark:text-blue-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug cursor-pointer">
                            {article.title}
                          </h3>
                        </Link>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1.5">
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 min-w-[70px]">Author(s):</span>
                              <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{article.authors}</span>
                            </div>
                            {article.affiliation && (
                              <div className="flex items-start gap-2">
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 min-w-[70px]">Affiliation:</span>
                                <span className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                                  {article.affiliation}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 min-w-[70px]">Pages:</span>
                              <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{article.pages}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 min-w-[70px]">DOI:</span>
                              {article.doi ? (
                                <a 
                                  href={`https://doi.org/${article.doi}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                  {article.doi}
                                </a>
                              ) : (
                                <span className="text-sm text-gray-700 dark:text-gray-300 italic">To be assigned</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <Button 
                            asChild 
                            variant="default" 
                            size="sm"
                            className="text-sm bg-[#213361] hover:bg-[#2a4078] text-white"
                            data-testid={`button-read-article-${article.id}`}
                          >
                            <Link href={`/article/${article.articleId}`}>
                              <FileText className="h-4 w-4 mr-2" />
                              Read Abstract
                            </Link>
                          </Button>
                          <Button 
                            asChild 
                            variant="default" 
                            size="sm"
                            className="text-sm bg-[#213361] hover:bg-[#2a4078] text-white"
                            data-testid={`button-download-pdf-${article.id}`}
                          >
                            <a href={`/downloads/${article.articleId}.pdf`} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4 mr-2" />
                              Download PDF
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
