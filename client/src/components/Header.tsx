import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, BookOpen, BookMarked, Briefcase, Mail, LogIn, FileText } from "lucide-react";
import { useState } from "react";
import logoImage from "@assets/Untitled design (1)_1760793768867.png";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [journalsOpen, setJournalsOpen] = useState(false);
  const [booksOpen, setBooksOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-white to-blue-50 dark:from-slate-950 dark:to-blue-950/20 border-b-2 border-blue-200 dark:border-blue-900 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center space-x-2 md:space-x-3">
              <img 
                src={logoImage} 
                alt="Scholar India Publishers Logo" 
                className="h-10 w-auto md:h-14 object-contain"
              />
              <div className="leading-tight">
                <h1 className="text-lg md:text-2xl font-serif font-bold text-blue-900 dark:text-blue-100">
                  Scholar India
                </h1>
                <p className="text-lg md:text-2xl font-serif font-bold text-blue-900 dark:text-blue-100">
                  Publishers
                </p>
              </div>
            </div>
          </Link>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-blue-900 dark:text-blue-100 bg-blue-100 dark:bg-blue-950/30 rounded-md shadow-md hover:bg-blue-200 dark:hover:bg-blue-900/50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2 ml-12">
            <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-100 transition-all duration-200 shadow-none hover:shadow-none" asChild>
              <Link href="/" data-testid="link-nav-home">
                Home
              </Link>
            </Button>
            
            {/* Journals Dropdown */}
            <div className="relative group">
              <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-100 flex items-center gap-1 transition-all duration-200 group-hover:text-blue-900 dark:group-hover:text-blue-100 shadow-none hover:shadow-none">
                Journals
                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
              </Button>
              <div className="absolute top-full left-0 hidden group-hover:block pt-2 z-50">
                <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-lg shadow-xl p-2 space-y-1 min-w-64 backdrop-blur-sm">
                  <Link href="/commerce-management" data-testid="link-commerce-journal">
                    <div className="px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200 cursor-pointer">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Commerce & Management</div>
                    </div>
                  </Link>
                  <Link href="/humanities" data-testid="link-humanities-journal">
                    <div className="px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200 cursor-pointer">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Humanities & Social Sciences</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Books Dropdown */}
            <div className="relative group">
              <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-100 flex items-center gap-1 transition-all duration-200 group-hover:text-blue-900 dark:group-hover:text-blue-100 shadow-none hover:shadow-none">
                Books
                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
              </Button>
              <div className="absolute top-full left-0 hidden group-hover:block pt-2 z-50">
                <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-lg shadow-xl p-2 space-y-1 min-w-64 backdrop-blur-sm">
                  <Link href="/book-publication-info" data-testid="link-book-info">
                    <div className="px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200 cursor-pointer">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Publication Information</div>
                    </div>
                  </Link>
                  <Link href="/call-for-books" data-testid="link-call-for-books">
                    <div className="px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200 cursor-pointer">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Call for Books & Chapters</div>
                    </div>
                  </Link>
                  <Link href="/published-books" data-testid="link-published-books">
                    <div className="px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200 cursor-pointer">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Published Books</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Services Dropdown */}
            <div className="relative group">
              <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-100 flex items-center gap-1 transition-all duration-200 group-hover:text-blue-900 dark:group-hover:text-blue-100 shadow-none hover:shadow-none">
                Services
                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
              </Button>
              <div className="absolute top-full left-0 hidden group-hover:block pt-2 z-50">
                <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-lg shadow-xl p-2 space-y-1 min-w-56 backdrop-blur-sm">
                  <Link href="/conference-seminars" data-testid="link-conference-seminars">
                    <div className="px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200 cursor-pointer">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Conference & Seminars</div>
                    </div>
                  </Link>
                  <Link href="/other-services" data-testid="link-other-services">
                    <div className="px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200 cursor-pointer">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Other Services</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            
            <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-100 flex items-center gap-1 transition-all duration-200 shadow-none hover:shadow-none" asChild>
              <Link href="/contact" data-testid="link-nav-contact">
                Contact
              </Link>
            </Button>
            
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-blue-200 dark:border-blue-800">
              <Button className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white hover:from-green-600 hover:to-green-700 font-semibold transition-all duration-200 shadow-none hover:shadow-none" data-testid="button-reviewer-login" asChild>
                <Link href="/reviewer-login" data-testid="link-nav-reviewer-login" className="flex items-center gap-1">
                  Reviewer Login
                </Link>
              </Button>
              <Button className="bg-[#213361] dark:bg-blue-800 text-white hover:bg-[#2a4078] font-semibold transition-all duration-200 shadow-none hover:shadow-none" data-testid="button-submit" asChild>
                <Link href="/submit" data-testid="link-nav-submit" className="flex items-center gap-1">
                  Submit Manuscript
                </Link>
              </Button>
            </div>
          </nav>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-blue-200 dark:border-blue-800 pt-4 space-y-2 bg-gradient-to-b from-white to-blue-50 dark:from-slate-950 dark:to-blue-950/10" data-testid="mobile-menu">
            <Button variant="ghost" className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors" asChild>
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
            </Button>
            
            {/* Journals Dropdown */}
            <div>
              <Button
                variant="ghost"
                className="w-full justify-between text-gray-700 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors"
                onClick={() => setJournalsOpen(!journalsOpen)}
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Journals
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${journalsOpen ? 'rotate-180' : ''}`} />
              </Button>
              {journalsOpen && (
                <div className="pl-4 space-y-1 mt-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-2">
                  <Link href="/commerce-management" onClick={() => setMobileMenuOpen(false)} data-testid="link-commerce-journal">
                    <div className="px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">Commerce & Management</div>
                    </div>
                  </Link>
                  <Link href="/humanities" onClick={() => setMobileMenuOpen(false)} data-testid="link-humanities-journal">
                    <div className="px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">Humanities & Social Sciences</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Books Dropdown */}
            <div>
              <Button
                variant="ghost"
                className="w-full justify-between text-gray-700 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors"
                onClick={() => setBooksOpen(!booksOpen)}
              >
                <span className="flex items-center gap-2">
                  <BookMarked className="h-4 w-4" />
                  Books
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${booksOpen ? 'rotate-180' : ''}`} />
              </Button>
              {booksOpen && (
                <div className="pl-4 space-y-1 mt-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-2">
                  <Link href="/book-publication-info" onClick={() => setMobileMenuOpen(false)} data-testid="link-book-info">
                    <div className="px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">Publication Information</div>
                    </div>
                  </Link>
                  <Link href="/call-for-books" onClick={() => setMobileMenuOpen(false)} data-testid="link-call-for-books">
                    <div className="px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">Call for Books</div>
                    </div>
                  </Link>
                  <Link href="/published-books" onClick={() => setMobileMenuOpen(false)} data-testid="link-published-books">
                    <div className="px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">Published Books</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Services Dropdown */}
            <div>
              <Button
                variant="ghost"
                className="w-full justify-between text-gray-700 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors"
                onClick={() => setServicesOpen(!servicesOpen)}
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Services
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </Button>
              {servicesOpen && (
                <div className="pl-4 space-y-1 mt-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-2">
                  <Link href="/conference-seminars" onClick={() => setMobileMenuOpen(false)} data-testid="link-conference-seminars">
                    <div className="px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">Conference & Seminars</div>
                    </div>
                  </Link>
                  <Link href="/other-services" onClick={() => setMobileMenuOpen(false)} data-testid="link-other-services">
                    <div className="px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">Other Services</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Button variant="ghost" className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors flex items-center gap-2" asChild>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                <Mail className="h-4 w-4" />
                Contact Us
              </Link>
            </Button>

            <div className="space-y-2 pt-2 border-t border-blue-200 dark:border-blue-800">
              <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2" asChild>
                <Link href="/reviewer-login" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="h-4 w-4" />
                  Reviewer Login
                </Link>
              </Button>

              <Button className="w-full bg-gradient-to-r from-blue-700 to-blue-900 dark:from-blue-800 dark:to-blue-950 text-white hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2" asChild>
                <Link href="/submit" onClick={() => setMobileMenuOpen(false)}>
                  <FileText className="h-4 w-4" />
                  Submit Manuscript
                </Link>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}