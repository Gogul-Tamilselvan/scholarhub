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

  const dropdownItemClass =
    "block px-4 py-2.5 text-sm text-slate-800 hover:bg-amber-400 hover:text-slate-900 transition-colors cursor-pointer";

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      {/* Gold accent line at top */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">

          {/* Logo + Brand */}
          <Link href="/" data-testid="link-home" onClick={() => setMobileMenuOpen(false)}>
            <div className="flex items-center gap-3 shrink-0 hover:opacity-90 transition-opacity">
              <img
                src={logoImage}
                alt="Scholar India Publishers Logo"
                className="h-14 w-auto object-contain"
              />
              <div className="hidden sm:flex flex-col justify-center gap-0.5">
                <span className="text-[17px] font-serif font-bold text-[#213361] leading-tight tracking-wide">
                  Scholar India <span className="text-amber-500">Publishers</span>
                </span>
                <div className="w-10 h-0.5 bg-amber-400 rounded-full mt-0.5" />
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-0 flex-1 justify-center px-6">
            <Button variant="ghost" className="text-sm font-medium text-[#213361] hover:text-[#213361] hover:bg-[#213361]/8 px-3.5 h-9 rounded" asChild>
              <Link href="/" data-testid="link-nav-home">Home</Link>
            </Button>

            {/* Journals */}
            <div className="relative group">
              <Button variant="ghost" className="text-sm font-medium text-[#213361] hover:text-[#213361] hover:bg-[#213361]/8 px-3.5 h-9 rounded flex items-center gap-1">
                Journals <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
              </Button>
              <div className="absolute top-full left-0 hidden group-hover:block pt-1 z-50">
                <div className="bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden min-w-56">
                  <div className="h-0.5 bg-gradient-to-r from-amber-400 to-yellow-300" />
                  <Link href="/commerce-management" data-testid="link-commerce-journal">
                    <div className={dropdownItemClass}>Commerce & Management</div>
                  </Link>
                  <Link href="/humanities" data-testid="link-humanities-journal">
                    <div className={dropdownItemClass}>Humanities & Social Sciences</div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Books */}
            <div className="relative group">
              <Button variant="ghost" className="text-sm font-medium text-[#213361] hover:text-[#213361] hover:bg-[#213361]/8 px-3.5 h-9 rounded flex items-center gap-1">
                Books <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
              </Button>
              <div className="absolute top-full left-0 hidden group-hover:block pt-1 z-50">
                <div className="bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden min-w-56">
                  <div className="h-0.5 bg-gradient-to-r from-amber-400 to-yellow-300" />
                  <Link href="/book-publication-info" data-testid="link-book-info">
                    <div className={dropdownItemClass}>Publication Information</div>
                  </Link>
                  <Link href="/call-for-books" data-testid="link-call-for-books">
                    <div className={dropdownItemClass}>Call for Books & Chapters</div>
                  </Link>
                  <Link href="/published-books" data-testid="link-published-books">
                    <div className={dropdownItemClass}>Published Books</div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="relative group">
              <Button variant="ghost" className="text-sm font-medium text-[#213361] hover:text-[#213361] hover:bg-[#213361]/8 px-3.5 h-9 rounded flex items-center gap-1">
                Services <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
              </Button>
              <div className="absolute top-full left-0 hidden group-hover:block pt-1 z-50">
                <div className="bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden min-w-56">
                  <div className="h-0.5 bg-gradient-to-r from-amber-400 to-yellow-300" />
                  <Link href="/conference-seminars" data-testid="link-conference-seminars">
                    <div className={dropdownItemClass}>Conference & Seminars</div>
                  </Link>
                  <Link href="/other-services" data-testid="link-other-services">
                    <div className={dropdownItemClass}>Other Services</div>
                  </Link>
                </div>
              </div>
            </div>

            <Button variant="ghost" className="text-sm font-medium text-[#213361] hover:text-[#213361] hover:bg-[#213361]/8 px-3.5 h-9 rounded" asChild>
              <Link href="/contact" data-testid="link-nav-contact">Contact</Link>
            </Button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sign In */}
            <div className="relative group hidden md:block">
              <Button className="h-8 text-xs font-semibold bg-transparent border border-[#213361]/40 text-[#213361] hover:bg-[#213361]/8 px-3.5 rounded flex items-center gap-1.5 shadow-none">
                Sign In <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
              </Button>
              <div className="absolute top-full right-0 hidden group-hover:block pt-1 z-50">
                <div className="bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden min-w-44">
                  <div className="h-0.5 bg-gradient-to-r from-amber-400 to-yellow-300" />
                  <a href="/erp/admin-login.html" data-testid="link-admin-login">
                    <div className={dropdownItemClass}>Admin</div>
                  </a>
                  <a href="/erp/member-login.html" data-testid="link-reviewer-login">
                    <div className={dropdownItemClass}>Reviewer / Editor</div>
                  </a>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="relative group hidden md:block">
              <Button className="h-8 text-xs font-bold bg-amber-400 text-[#213361] hover:bg-amber-300 px-4 rounded flex items-center gap-1.5 shadow-none border-0">
                Submit <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
              </Button>
              <div className="absolute top-full right-0 hidden group-hover:block pt-1 z-50">
                <div className="bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden min-w-44">
                  <div className="h-0.5 bg-gradient-to-r from-amber-400 to-yellow-300" />
                  <Link href="/call-for-books" data-testid="link-submit-book">
                    <div className={dropdownItemClass}>Book</div>
                  </Link>
                  <Link href="/submit" data-testid="link-submit-manuscript">
                    <div className={dropdownItemClass}>Manuscript</div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 text-[#213361] hover:bg-[#213361]/8 rounded transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-slate-200 pt-3 space-y-1" data-testid="mobile-menu">
            <Button variant="ghost" className="w-full justify-start text-sm text-[#213361] hover:bg-[#213361]/8 px-3 py-2" asChild>
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            </Button>

            <div>
              <Button variant="ghost" className="w-full justify-between text-sm text-[#213361] hover:bg-[#213361]/8 px-3 py-2"
                onClick={() => setJournalsOpen(!journalsOpen)}>
                <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" />Journals</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${journalsOpen ? "rotate-180" : ""}`} />
              </Button>
              {journalsOpen && (
                <div className="pl-4 mt-1 space-y-0.5">
                  <Link href="/commerce-management" onClick={() => setMobileMenuOpen(false)}>
                    <div className="px-3 py-2 text-sm text-[#213361] hover:bg-amber-400 hover:text-slate-900 rounded transition-colors">Commerce & Management</div>
                  </Link>
                  <Link href="/humanities" onClick={() => setMobileMenuOpen(false)}>
                    <div className="px-3 py-2 text-sm text-[#213361] hover:bg-amber-400 hover:text-slate-900 rounded transition-colors">Humanities & Social Sciences</div>
                  </Link>
                </div>
              )}
            </div>

            <div>
              <Button variant="ghost" className="w-full justify-between text-sm text-[#213361] hover:bg-[#213361]/8 px-3 py-2"
                onClick={() => setBooksOpen(!booksOpen)}>
                <span className="flex items-center gap-2"><BookMarked className="h-4 w-4" />Books</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${booksOpen ? "rotate-180" : ""}`} />
              </Button>
              {booksOpen && (
                <div className="pl-4 mt-1 space-y-0.5">
                  <Link href="/book-publication-info" onClick={() => setMobileMenuOpen(false)}>
                    <div className="px-3 py-2 text-sm text-[#213361] hover:bg-amber-400 hover:text-slate-900 rounded transition-colors">Publication Information</div>
                  </Link>
                  <Link href="/call-for-books" onClick={() => setMobileMenuOpen(false)}>
                    <div className="px-3 py-2 text-sm text-[#213361] hover:bg-amber-400 hover:text-slate-900 rounded transition-colors">Call for Books</div>
                  </Link>
                  <Link href="/published-books" onClick={() => setMobileMenuOpen(false)}>
                    <div className="px-3 py-2 text-sm text-[#213361] hover:bg-amber-400 hover:text-slate-900 rounded transition-colors">Published Books</div>
                  </Link>
                </div>
              )}
            </div>

            <div>
              <Button variant="ghost" className="w-full justify-between text-sm text-[#213361] hover:bg-[#213361]/8 px-3 py-2"
                onClick={() => setServicesOpen(!servicesOpen)}>
                <span className="flex items-center gap-2"><Briefcase className="h-4 w-4" />Services</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
              </Button>
              {servicesOpen && (
                <div className="pl-4 mt-1 space-y-0.5">
                  <Link href="/conference-seminars" onClick={() => setMobileMenuOpen(false)}>
                    <div className="px-3 py-2 text-sm text-[#213361] hover:bg-amber-400 hover:text-slate-900 rounded transition-colors">Conference & Seminars</div>
                  </Link>
                  <Link href="/other-services" onClick={() => setMobileMenuOpen(false)}>
                    <div className="px-3 py-2 text-sm text-[#213361] hover:bg-amber-400 hover:text-slate-900 rounded transition-colors">Other Services</div>
                  </Link>
                </div>
              )}
            </div>

            <Button variant="ghost" className="w-full justify-start text-sm text-[#213361] hover:bg-[#213361]/8 px-3 py-2" asChild>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            </Button>

            <div>
              <Button className="w-full justify-between text-xs font-semibold bg-transparent border border-[#213361]/40 text-[#213361] hover:bg-[#213361]/8 px-3 py-2 shadow-none"
                onClick={() => setLoginOpen(!loginOpen)}>
                <span className="flex items-center gap-2"><LogIn className="h-4 w-4" />Sign In</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${loginOpen ? "rotate-180" : ""}`} />
              </Button>
              {loginOpen && (
                <div className="pl-4 mt-1 space-y-0.5">
                  <a href="/erp/admin-login.html" onClick={() => { setMobileMenuOpen(false); setLoginOpen(false); }}>
                    <div className="px-3 py-2 text-sm text-[#213361] hover:bg-amber-400 hover:text-slate-900 rounded transition-colors">Admin</div>
                  </a>
                  <a href="/erp/member-login.html" onClick={() => { setMobileMenuOpen(false); setLoginOpen(false); }}>
                    <div className="px-3 py-2 text-sm text-[#213361] hover:bg-amber-400 hover:text-slate-900 rounded transition-colors">Reviewer / Editor</div>
                  </a>
                </div>
              )}
            </div>

            <div>
              <Button className="w-full justify-between text-xs font-bold bg-amber-400 text-[#213361] hover:bg-amber-300 px-3 py-2 shadow-none border-0"
                onClick={() => setSubmitOpen(!submitOpen)}>
                <span className="flex items-center gap-2"><FileText className="h-4 w-4" />Submit</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${submitOpen ? "rotate-180" : ""}`} />
              </Button>
              {submitOpen && (
                <div className="pl-4 mt-1 space-y-0.5">
                  <Link href="/call-for-books" onClick={() => { setMobileMenuOpen(false); setSubmitOpen(false); }}>
                    <div className="px-3 py-2 text-sm text-[#213361] hover:bg-amber-400 hover:text-slate-900 rounded transition-colors">Book</div>
                  </Link>
                  <Link href="/submit" onClick={() => { setMobileMenuOpen(false); setSubmitOpen(false); }}>
                    <div className="px-3 py-2 text-sm text-[#213361] hover:bg-amber-400 hover:text-slate-900 rounded transition-colors">Manuscript</div>
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
