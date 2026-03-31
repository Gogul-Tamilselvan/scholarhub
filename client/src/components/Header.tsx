import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, BookOpen, BookMarked, Briefcase, LogIn, FileText } from "lucide-react";
import { useState } from "react";
import logoImage from "@assets/Untitled design (1)_1760793768867.png";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [journalsOpen, setJournalsOpen] = useState(false);
  const [booksOpen, setBooksOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Logo Section */}
          <Link href="/" data-testid="link-home" onClick={() => setMobileMenuOpen(false)}>
            <div className="flex items-center space-x-3 shrink-0">
              <img 
                src={logoImage} 
                alt="Scholar India Publishers Logo" 
                className="h-12 w-auto object-contain"
              />
              <div className="hidden sm:block leading-snug">
                <h1 className="text-base font-sans font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                  Scholar India
                </h1>
                <p className="text-base font-sans font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                  Publishers
                </p>
              </div>
            </div>
          </Link>
          
          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center space-x-0.5 flex-1 justify-center">
            <Button variant="ghost" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-3 py-2 rounded-md transition-colors" asChild>
              <Link href="/" data-testid="link-nav-home" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
            </Button>
            
            {/* Journals Dropdown */}
            <div className="relative group">
              <Button variant="ghost" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-3 py-2 rounded-md flex items-center gap-1 transition-colors group-hover:text-slate-900 dark:group-hover:text-slate-100">
                Journals
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
              </Button>
              <div className="absolute top-full left-0 hidden group-hover:block pt-1 z-50">
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md shadow-lg p-1 space-y-0.5 min-w-60">
                  <Link href="/commerce-management" data-testid="link-commerce-journal">
                    <div className="px-3.5 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Commerce & Management</div>
                    </div>
                  </Link>
                  <Link href="/humanities" data-testid="link-humanities-journal">
                    <div className="px-3.5 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Humanities & Social Sciences</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Books Dropdown */}
            <div className="relative group">
              <Button variant="ghost" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-3 py-2 rounded-md flex items-center gap-1 transition-colors group-hover:text-slate-900 dark:group-hover:text-slate-100">
                Books
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
              </Button>
              <div className="absolute top-full left-0 hidden group-hover:block pt-1 z-50">
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md shadow-lg p-1 space-y-0.5 min-w-60">
                  <Link href="/book-publication-info" data-testid="link-book-info">
                    <div className="px-3.5 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Publication Information</div>
                    </div>
                  </Link>
                  <Link href="/call-for-books" data-testid="link-call-for-books">
                    <div className="px-3.5 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Call for Books & Chapters</div>
                    </div>
                  </Link>
                  <Link href="/published-books" data-testid="link-published-books">
                    <div className="px-3.5 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Published Books</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Services Dropdown */}
            <div className="relative group">
              <Button variant="ghost" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-3 py-2 rounded-md flex items-center gap-1 transition-colors group-hover:text-slate-900 dark:group-hover:text-slate-100">
                Services
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
              </Button>
              <div className="absolute top-full left-0 hidden group-hover:block pt-1 z-50">
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md shadow-lg p-1 space-y-0.5 min-w-56">
                  <Link href="/conference-seminars" data-testid="link-conference-seminars">
                    <div className="px-3.5 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Conference & Seminars</div>
                    </div>
                  </Link>
                  <Link href="/other-services" data-testid="link-other-services">
                    <div className="px-3.5 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Other Services</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            
            <Button variant="ghost" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-3 py-2 rounded-md transition-colors" asChild>
              <Link href="/contact" data-testid="link-nav-contact">
                Contact
              </Link>
            </Button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop Login Dropdown */}
            <div className="relative group hidden md:block">
              <Button className="text-sm font-medium bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 px-4 py-1.5 rounded-md flex items-center gap-1.5 shadow-none hover:shadow-none transition-colors" data-testid="button-login">
                Login
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
              </Button>
              <div className="absolute top-full right-0 hidden group-hover:block pt-1 z-50">
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md shadow-lg p-1 space-y-0.5 min-w-56">
                  <Link href="/admin/login" data-testid="link-admin-login">
                    <div className="px-3.5 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Admin</div>
                    </div>
                  </Link>
                  <Link href="/reviewer-login" data-testid="link-reviewer-login">
                    <div className="px-3.5 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Reviewer / Editor</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Desktop Submit Dropdown */}
            <div className="relative group hidden md:block">
              <Button className="text-sm font-medium bg-amber-600 dark:bg-amber-700 text-white hover:bg-amber-700 dark:hover:bg-amber-600 px-4 py-1.5 rounded-md flex items-center gap-1.5 shadow-none hover:shadow-none transition-colors" data-testid="button-submit">
                Submit
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
              </Button>
              <div className="absolute top-full right-0 hidden group-hover:block pt-1 z-50">
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md shadow-lg p-1 space-y-0.5 min-w-56">
                  <Link href="/call-for-books" data-testid="link-submit-book">
                    <div className="px-3.5 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Book</div>
                    </div>
                  </Link>
                  <Link href="/submit" data-testid="link-submit-manuscript">
                    <div className="px-3.5 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Manuscript</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-3 pb-3 border-t border-gray-200 dark:border-slate-800 pt-3 space-y-1" data-testid="mobile-menu">
            <Button variant="ghost" className="w-full justify-start text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors px-3 py-2" asChild>
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
            </Button>
            
            {/* Mobile Journals Dropdown */}
            <div>
              <Button
                variant="ghost"
                className="w-full justify-between text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors px-3 py-2"
                onClick={() => setJournalsOpen(!journalsOpen)}
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Journals
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${journalsOpen ? 'rotate-180' : ''}`} />
              </Button>
              {journalsOpen && (
                <div className="pl-3 space-y-0.5 mt-1">
                  <Link href="/commerce-management" onClick={() => setMobileMenuOpen(false)} data-testid="link-commerce-journal">
                    <div className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Commerce & Management</div>
                    </div>
                  </Link>
                  <Link href="/humanities" onClick={() => setMobileMenuOpen(false)} data-testid="link-humanities-journal">
                    <div className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Humanities & Social Sciences</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Books Dropdown */}
            <div>
              <Button
                variant="ghost"
                className="w-full justify-between text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors px-3 py-2"
                onClick={() => setBooksOpen(!booksOpen)}
              >
                <span className="flex items-center gap-2">
                  <BookMarked className="h-4 w-4" />
                  Books
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${booksOpen ? 'rotate-180' : ''}`} />
              </Button>
              {booksOpen && (
                <div className="pl-3 space-y-0.5 mt-1">
                  <Link href="/book-publication-info" onClick={() => setMobileMenuOpen(false)} data-testid="link-book-info">
                    <div className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Publication Information</div>
                    </div>
                  </Link>
                  <Link href="/call-for-books" onClick={() => setMobileMenuOpen(false)} data-testid="link-call-for-books">
                    <div className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Call for Books</div>
                    </div>
                  </Link>
                  <Link href="/published-books" onClick={() => setMobileMenuOpen(false)} data-testid="link-published-books">
                    <div className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Published Books</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Services Dropdown */}
            <div>
              <Button
                variant="ghost"
                className="w-full justify-between text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors px-3 py-2"
                onClick={() => setServicesOpen(!servicesOpen)}
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Services
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </Button>
              {servicesOpen && (
                <div className="pl-3 space-y-0.5 mt-1">
                  <Link href="/conference-seminars" onClick={() => setMobileMenuOpen(false)} data-testid="link-conference-seminars">
                    <div className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Conference & Seminars</div>
                    </div>
                  </Link>
                  <Link href="/other-services" onClick={() => setMobileMenuOpen(false)} data-testid="link-other-services">
                    <div className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Other Services</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Contact */}
            <Button variant="ghost" className="w-full justify-start text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors px-3 py-2" asChild>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} data-testid="link-nav-contact-mobile">
                Contact
              </Link>
            </Button>

            {/* Mobile Login */}
            <div>
              <Button
                className="w-full justify-between text-sm font-medium bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 rounded-md px-3 py-2 transition-colors"
                onClick={() => setLoginOpen(!loginOpen)}
              >
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${loginOpen ? 'rotate-180' : ''}`} />
              </Button>
              {loginOpen && (
                <div className="pl-3 space-y-0.5 mt-1">
                  <Link href="/admin/login" onClick={() => { setMobileMenuOpen(false); setLoginOpen(false); }} data-testid="link-admin-login-mobile">
                    <div className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Admin</div>
                    </div>
                  </Link>
                  <Link href="/reviewer-login" onClick={() => { setMobileMenuOpen(false); setLoginOpen(false); }} data-testid="link-reviewer-login-mobile">
                    <div className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Reviewer / Editor</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Submit */}
            <div>
              <Button
                className="w-full justify-between text-sm font-medium bg-amber-600 dark:bg-amber-700 text-white hover:bg-amber-700 dark:hover:bg-amber-600 rounded-md px-3 py-2 transition-colors"
                onClick={() => setSubmitOpen(!submitOpen)}
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Submit
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${submitOpen ? 'rotate-180' : ''}`} />
              </Button>
              {submitOpen && (
                <div className="pl-3 space-y-0.5 mt-1">
                  <Link href="/call-for-books" onClick={() => { setMobileMenuOpen(false); setSubmitOpen(false); }} data-testid="link-submit-book-mobile">
                    <div className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Book</div>
                    </div>
                  </Link>
                  <Link href="/submit" onClick={() => { setMobileMenuOpen(false); setSubmitOpen(false); }} data-testid="link-submit-manuscript-mobile">
                    <div className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Manuscript</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
