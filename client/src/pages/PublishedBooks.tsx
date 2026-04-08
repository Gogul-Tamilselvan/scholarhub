import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Download, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Book {
  id: string;
  title: string;
  subtitle?: string;
  type: "Edited Volume" | "Authored Book";
  contributors: string;
  contributorLabel: string;
  isbn: string;
  year: string;
  pages: string;
  pdfPath: string;
  subjects: string[];
  description: string;
}

const books: Book[] = [
  {
    id: "fintech-book-2025",
    title: "Future Trends and Innovations in FinTech",
    type: "Edited Volume",
    contributors: "Dr. J. Samuel · Dr. Hesil Jerda George",
    contributorLabel: "Editors",
    isbn: "978-81-994331-6-8",
    year: "2025",
    pages: "94",
    pdfPath: "/downloads/fintech-book.pdf",
    subjects: ["FinTech", "AI & Finance", "Blockchain", "Sustainable Finance"],
    description:
      "An edited volume exploring AI governance, crypto-asset risk, autonomous investing, green digital bonds, and FinTech-driven sustainable development across six scholarly chapters.",
  },
  {
    id: "management-accounting-book",
    title: "Management Accounting",
    type: "Authored Book",
    contributors:
      "Dr. R. Ramki · Dr. Dhandapani · G. Saranya · Kalaiarasan C",
    contributorLabel: "Authors",
    isbn: "978-81-994331-5-1",
    year: "2026",
    pages: "",
    pdfPath: "/downloads/management-accounting-book.pdf",
    subjects: ["Accounting", "Commerce", "Management", "Finance"],
    description:
      "A comprehensive academic text on Management Accounting, authored by faculty from Hindustan Institute of Technology & Science and Loyola College, Chennai. Covers core concepts for undergraduate and postgraduate students.",
  },
];

function DownloadCount({ bookId }: { bookId: string }) {
  const { data } = useQuery<{ downloads: number }>({
    queryKey: ["/api/book-downloads", bookId],
    queryFn: async () => {
      const res = await fetch(`/api/book-downloads/${bookId}`);
      return res.json();
    },
    refetchInterval: 15000,
  });
  const count = data?.downloads ?? 0;
  return (
    <span className="text-xs text-muted-foreground flex items-center gap-1">
      <Download className="w-3 h-3" />
      {count.toLocaleString()} downloads
    </span>
  );
}

function BookCard({ book, onView }: { book: Book; onView: (b: Book) => void }) {
  const queryClient = useQueryClient();

  const increment = useMutation({
    mutationFn: async () => {
      await fetch(`/api/book-downloads/${book.id}/increment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookTitle: book.title }),
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["/api/book-downloads", book.id],
      }),
  });

  const handleDownload = () => {
    increment.mutate();
    const a = document.createElement("a");
    a.href = book.pdfPath;
    a.download = `${book.title.replace(/\s+/g, "-")}.pdf`;
    a.click();
  };

  return (
    <div className="flex gap-5 p-5 rounded-lg border border-gray-200 dark:border-gray-700 bg-card hover:shadow-md transition-shadow">
      {/* Cover placeholder */}
      <div className="shrink-0 w-24 h-32 bg-gradient-to-br from-[#213361] to-[#1a2a52] rounded flex flex-col items-center justify-center border border-[#213361]/30 shadow-sm">
        <BookOpen className="w-8 h-8 text-yellow-400 mb-1" />
        <p className="text-[8px] text-blue-200 text-center px-1 leading-tight font-medium">
          Scholar India Publishers
        </p>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap gap-1.5 items-center">
          <Badge className="bg-[#213361]/10 text-[#213361] dark:bg-[#213361]/30 dark:text-blue-300 text-[10px]">
            {book.type}
          </Badge>
          {book.subjects.map((s) => (
            <Badge
              key={s}
              variant="outline"
              className="text-[10px] text-muted-foreground"
            >
              {s}
            </Badge>
          ))}
        </div>

        <h2 className="font-bold text-base text-gray-900 dark:text-gray-100 leading-snug">
          {book.title}
        </h2>

        <p className="text-xs text-muted-foreground">
          <span className="font-medium">{book.contributorLabel}:</span>{" "}
          {book.contributors}
        </p>

        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
          {book.description}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            <span className="font-medium">ISBN:</span> {book.isbn}
          </span>
          <span>
            <span className="font-medium">Year:</span> {book.year}
          </span>
          {book.pages && (
            <span>
              <span className="font-medium">Pages:</span> {book.pages}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            size="sm"
            className="bg-[#213361] hover:bg-[#2a4078] text-white gap-1.5 h-8"
            onClick={handleDownload}
            data-testid={`button-download-${book.id}`}
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-8 border-[#213361] text-[#213361] dark:border-blue-400 dark:text-blue-400"
            onClick={() => onView(book)}
            data-testid={`button-view-${book.id}`}
          >
            <Eye className="w-3.5 h-3.5" />
            View PDF
          </Button>
          <DownloadCount bookId={book.id} />
        </div>
      </div>
    </div>
  );
}

function PdfViewer({ book, onClose }: { book: Book; onClose: () => void }) {
  const queryClient = useQueryClient();

  const increment = useMutation({
    mutationFn: async () => {
      await fetch(`/api/book-downloads/${book.id}/increment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookTitle: book.title }),
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["/api/book-downloads", book.id],
      }),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="bg-[#213361] px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
        <p className="text-white text-sm font-semibold truncate">{book.title}</p>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={book.pdfPath}
            download
            onClick={() => increment.mutate()}
          >
            <Button size="sm" className="bg-yellow-400 text-[#213361] hover:bg-yellow-300 h-7 text-xs gap-1">
              <Download className="w-3 h-3" /> Download
            </Button>
          </a>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10 h-7"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <iframe
        src={`${book.pdfPath}#toolbar=1`}
        title={book.title}
        className="w-full"
        style={{ height: "82vh", border: "none" }}
        data-testid="iframe-pdf-viewer"
      />
    </motion.div>
  );
}

export default function PublishedBooks() {
  const [viewingBook, setViewingBook] = useState<Book | null>(null);

  const handleView = (book: Book) => {
    setViewingBook((prev) => (prev?.id === book.id ? null : book));
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Published Academic Books | Scholar India Publishers"
        description="Browse academic books published by Scholar India Publishers — FinTech, Management Accounting, and more. All books available for free download."
        canonical="https://scholarindiapub.com/published-books"
      />
      <Header />

      {/* Hero */}
      <div className="bg-[#213361] py-14 px-4 text-center">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Published Books
        </h1>
        <p className="text-blue-200 text-base">
          Academic books published by Scholar India Publishers
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        {/* Book count */}
        <p className="text-sm text-muted-foreground">
          Showing {books.length} book{books.length !== 1 ? "s" : ""}
        </p>

        {books.map((book) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BookCard book={book} onView={handleView} />
            {viewingBook?.id === book.id && (
              <div className="mt-3">
                <PdfViewer book={viewingBook} onClose={() => setViewingBook(null)} />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
