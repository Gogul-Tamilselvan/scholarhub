import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Download, Eye, BookMarked, Users, Building2, Hash, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import StructuredData, { createOrganizationData } from "@/components/StructuredData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BOOK_ID = "fintech-book-2025";
const BOOK_TITLE = "Future Trends and Innovations in FinTech";
const PDF_PATH = "/downloads/fintech-book.pdf";

const chapters = [
  { no: 1, title: "AI-Governance and Ethical Finance Technologies", author: "Dr. Vinmalar J", pages: "1–28" },
  { no: 2, title: "Financial Risk Management in the Age of Crypto Currencies", author: "Dr. P. Murali", pages: "29–43" },
  { no: 3, title: "Autonomous Financial System: Automated Investing", author: "Dr. X. Maria Muthu Shanthini & Dr. J. Jani Mercybai", pages: "44–56" },
  { no: 4, title: "Green Digital Bonds in the Era of Sustainable and Smart Financial Technologies", author: "Dr. J. Jani Mercybai & Dr. X. Maria Muthu Shanthini", pages: "57–68" },
  { no: 5, title: "Future Trends and Innovations in FinTech for Achieving Sustainable Development Goals", author: "Dr. N. Saromi", pages: "69–82" },
  { no: 6, title: "Sustainable Development Through FinTech Solutions", author: "Dr. Samuel J", pages: "83–94" },
];

export default function PublishedBooks() {
  const [pdfOpen, setPdfOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: downloadData } = useQuery<{ bookId: string; downloads: number }>({
    queryKey: ["/api/book-downloads", BOOK_ID],
    queryFn: async () => {
      const res = await fetch(`/api/book-downloads/${BOOK_ID}`);
      return res.json();
    },
    refetchInterval: 10000,
  });

  const incrementMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/book-downloads/${BOOK_ID}/increment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookTitle: BOOK_TITLE }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/book-downloads", BOOK_ID] });
    },
  });

  const handleDownload = async () => {
    await incrementMutation.mutateAsync();
    const link = document.createElement("a");
    link.href = PDF_PATH;
    link.download = "Future-Trends-Innovations-FinTech-Scholar-India-Publishers.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCount = downloadData?.downloads ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Published Academic Books | Scholar India Publishers - DOI & ISBN"
        description="Explore published academic books by Scholar India Publishers. Future Trends and Innovations in FinTech — an edited volume on AI governance, blockchain, crypto risk, sustainable finance, and FinTech innovations."
        keywords="published academic books India, fintech book, AI governance finance, blockchain book India, research books scholar india, DOI books India, ISBN academic books"
        canonical="https://scholarindiapub.com/published-books"
      />
      <StructuredData type="Organization" data={createOrganizationData()} />
      <Header />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#213361] py-16 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Published Books</h1>
          <p className="text-blue-200 text-lg">Academic volumes and edited collections by Scholar India Publishers</p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">

        {/* Book Detail Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-[#213361] text-white">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-yellow-400 text-[#213361] font-bold text-xs">Edited Volume</Badge>
                <Badge className="bg-white/20 text-white text-xs">FinTech</Badge>
                <Badge className="bg-white/20 text-white text-xs">Finance</Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl text-white mt-2 leading-tight">
                Future Trends and Innovations in FinTech
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 gap-0">

                {/* Left — Book Cover Placeholder */}
                <div className="bg-gradient-to-br from-[#213361] to-[#1a2a52] flex flex-col items-center justify-center p-10 min-h-[300px]">
                  <div className="w-40 border-4 border-yellow-400 rounded-lg bg-[#1a2a52] flex flex-col items-center justify-center p-4 shadow-xl min-h-[200px] text-center">
                    <BookMarked className="w-12 h-12 text-yellow-400 mb-3" />
                    <p className="text-yellow-400 font-bold text-xs leading-tight mb-2">FUTURE TRENDS AND INNOVATIONS IN FINTECH</p>
                    <p className="text-blue-300 text-[10px]">Scholar India Publishers</p>
                  </div>
                  <Badge className="mt-4 bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-xs">
                    ISBN: 978-81-994331-6-8
                  </Badge>
                </div>

                {/* Middle — Book Details */}
                <div className="md:col-span-2 p-6 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-[#213361] dark:text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Editors</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dr. J. Samuel</p>
                        <p className="text-xs text-muted-foreground">Asst. Prof., B.Com (A&F), Loyola College, Chennai</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">Dr. Hesil Jerda George</p>
                        <p className="text-xs text-muted-foreground">Asst. Prof., Commerce, Holy Cross College, Nagercoil</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-[#213361] dark:text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Publisher</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Scholar India Publishers</p>
                        <p className="text-xs text-muted-foreground">Chennai, Tamil Nadu, India</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Hash className="w-5 h-5 text-[#213361] dark:text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">ISBN</p>
                        <p className="text-sm font-medium font-mono text-gray-900 dark:text-gray-100">978-81-994331-6-8</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-[#213361] dark:text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Details</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">6 Chapters &bull; 94 pages</p>
                        <p className="text-xs text-muted-foreground">©Authors &bull; Printed @ SIGA Press</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
                    This edited volume explores the evolving landscape of Financial Technology — covering AI governance, blockchain, crypto-asset risk management, autonomous investing, green digital bonds, and FinTech-driven sustainable development. A scholarly resource for students, researchers, educators, and policy makers.
                  </p>

                  {/* Action buttons and download count */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button
                      onClick={handleDownload}
                      disabled={incrementMutation.isPending}
                      className="bg-[#213361] hover:bg-[#2a4078] text-white gap-2"
                      data-testid="button-download-book"
                    >
                      <Download className="w-4 h-4" />
                      {incrementMutation.isPending ? "Downloading..." : "Download PDF"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setPdfOpen((v) => !v)}
                      className="gap-2 border-[#213361] text-[#213361] dark:border-blue-400 dark:text-blue-400"
                      data-testid="button-view-pdf"
                    >
                      <Eye className="w-4 h-4" />
                      {pdfOpen ? "Hide Viewer" : "View in Browser"}
                    </Button>

                    <a
                      href={PDF_PATH}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="link-open-pdf-new-tab"
                    >
                      <Button variant="ghost" className="gap-2 text-muted-foreground">
                        <ExternalLink className="w-4 h-4" />
                        Open in New Tab
                      </Button>
                    </a>

                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground ml-auto">
                      <Download className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{downloadCount.toLocaleString()}</span>
                      <span>downloads</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
            <button
              className="w-full text-left"
              onClick={() => setTocOpen((v) => !v)}
              data-testid="button-toggle-toc"
            >
              <CardHeader className="bg-[#213361] text-white cursor-pointer">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-yellow-400" />
                    Table of Contents
                  </CardTitle>
                  {tocOpen ? <ChevronUp className="w-5 h-5 text-yellow-400" /> : <ChevronDown className="w-5 h-5 text-yellow-400" />}
                </div>
              </CardHeader>
            </button>
            {tocOpen && (
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {chapters.map((ch) => (
                    <div key={ch.no} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <span className="shrink-0 w-8 h-8 rounded-full bg-[#213361]/10 dark:bg-[#213361]/30 text-[#213361] dark:text-blue-300 font-bold text-sm flex items-center justify-center">
                        {ch.no}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-snug">{ch.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{ch.author}</p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground font-mono mt-0.5">pp. {ch.pages}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* Inline PDF Viewer */}
        {pdfOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-[#213361] text-white">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5 text-yellow-400" />
                    PDF Viewer — Future Trends and Innovations in FinTech
                  </CardTitle>
                  <div className="flex gap-2">
                    <a href={PDF_PATH} download="Future-Trends-Innovations-FinTech.pdf" onClick={() => incrementMutation.mutate()}>
                      <Button size="sm" className="bg-yellow-400 text-[#213361] hover:bg-yellow-300 gap-1 font-semibold">
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                    </a>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => setPdfOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <iframe
                  src={`${PDF_PATH}#toolbar=1&navpanes=1&scrollbar=1`}
                  title="Future Trends and Innovations in FinTech — PDF Viewer"
                  className="w-full"
                  style={{ height: "85vh", border: "none" }}
                  data-testid="iframe-pdf-viewer"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
      <Footer />
    </div>
  );
}
