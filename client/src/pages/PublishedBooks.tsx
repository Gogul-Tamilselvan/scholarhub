import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Download, Eye, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

interface Book {
  id: string;
  title: string;
  type: string;
  contributors: string;
  contributor_label: string;
  isbn: string;
  year: string;
  pages: string;
  pdf_url: string;
  cover_image_url: string;
  subjects: string;
  description: string;
}

function BookCard({
  book,
  isViewing,
  onView,
}: {
  book: Book;
  isViewing: boolean;
  onView: () => void;
}) {

  const handleView = () => { onView(); };
  const subjects = book.subjects ? book.subjects.split(',').map(s => s.trim()) : [];

  return (
    <div className="flex gap-5 p-5 rounded-lg border border-gray-200 dark:border-gray-700 bg-card hover:shadow-md transition-shadow">
      <div className="shrink-0 w-24 h-32 rounded overflow-hidden border border-gray-300 dark:border-gray-600 shadow-sm bg-slate-50 flex items-center justify-center">
        {book.cover_image_url ? (
          <img
            src={book.cover_image_url}
            alt={`${book.title} cover`}
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
        ) : (
          <BookOpen className="w-8 h-8 text-slate-300" />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap gap-1.5 items-center">
          <Badge className="bg-[#213361]/10 text-[#213361] dark:bg-[#213361]/30 dark:text-blue-300 text-[10px] border-none">
            {book.type || 'Book'}
          </Badge>
          {subjects.map((s) => (
            <Badge key={s} variant="outline" className="text-[10px] text-muted-foreground border-slate-200">
              {s}
            </Badge>
          ))}
        </div>

        <h2 className="font-bold text-base text-gray-900 dark:text-gray-100 leading-snug">
          {book.title}
        </h2>

        <p className="text-xs text-muted-foreground">
          <span className="font-medium">{book.contributor_label || 'Authors'}:</span> {book.contributors}
        </p>

        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
          {book.description}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            <span className="font-medium">ISBN:</span> {book.isbn || 'N/A'}
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
            className={`gap-1.5 h-8 font-bold text-xs ${
              isViewing
                ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                : "bg-[#213361] text-white hover:bg-[#2a4078]"
            }`}
            onClick={handleView}
          >
            {isViewing ? (
              <>
                <X className="w-3.5 h-3.5" />
                Close PDF
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                View PDF
              </>
            )}
          </Button>
          {book.pdf_url && (
            <a href={book.pdf_url} download target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-1.5 h-8 font-bold text-xs border-slate-300">
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PublishedBooks() {
  const [viewingBookId, setViewingBookId] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const { data, error } = await supabase
          .from('published_books')
          .select('*')
          .order('year', { ascending: false });
        
        if (error) throw error;
        setBooks(data || []);
      } catch (err) {
        console.error("Failed to fetch published books", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, []);

  const handleView = (bookId: string) => {
    setViewingBookId((prev) => (prev === bookId ? null : bookId));
  };

  const viewingBook = books.find(b => b.id === viewingBookId);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Published Academic Books | Scholar India Publishers"
        description="Browse academic books published by Scholar India Publishers — FinTech, Management Accounting, and more."
        canonical="https://scholarindiapub.com/published-books"
      />
      <Header />

      <div className="bg-[#213361] py-14 px-4 text-center">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Published Books</h1>
        <p className="text-blue-200 text-base">Academic books published by Scholar India Publishers</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#213361]" />
            <p className="text-slate-500 font-medium">Loading Published Books...</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Showing {books.length} book{books.length !== 1 ? "s" : ""}
            </p>

            {books.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400">No published books found.</p>
              </div>
            ) : (
              books.map((book) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <BookCard
                    book={book}
                    isViewing={viewingBookId === book.id}
                    onView={() => handleView(book.id)}
                  />
                  {viewingBookId === book.id && viewingBook && (
                    <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">
                      <div className="bg-[#213361] px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-white text-sm font-semibold truncate">{viewingBook.title}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          {viewingBook.pdf_url && (
                            <a href={viewingBook.pdf_url} download target="_blank" rel="noopener noreferrer">
                              <Button size="sm" className="bg-yellow-400 text-[#213361] hover:bg-yellow-300 h-7 text-xs font-bold gap-1 shadow-sm border-none">
                                <Download className="w-3 h-3" /> Download
                              </Button>
                            </a>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/10 h-7 text-xs font-bold shrink-0"
                            onClick={() => setViewingBookId(null)}
                          >
                            <X className="w-4 h-4 mr-1" /> Close
                          </Button>
                        </div>
                      </div>
                      {viewingBook.pdf_url ? (
                        <iframe
                          src={`${viewingBook.pdf_url}#toolbar=1`}
                          title={viewingBook.title}
                          className="w-full"
                          style={{ height: "82vh", border: "none" }}
                        />
                      ) : (
                        <div className="h-64 bg-slate-50 flex items-center justify-center">
                          <p className="text-slate-400 font-medium italic">PDF file preview not available for this book.</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
