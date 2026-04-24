import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, BookOpen, BookMarked, Briefcase, LogIn, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import logoImage from "@assets/Untitled design (1)_1760793768867.png";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [journalsOpen, setJournalsOpen] = useState(false);
  const [booksOpen, setBooksOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [dynamicJournals, setDynamicJournals] = useState<any[]>([]);

  useEffect(() => {
    async function loadDynamic() {
      try {
        const { data } = await supabase.from('journals').select('title, slug').order('created_at', { ascending: true });
        if (data) {
          const sorted = [...data].sort((a, b) => {
            if (a.slug === 'sjcm') return -1;
            if (b.slug === 'sjcm') return 1;
            if (a.slug === 'sjhss' && b.slug !== 'sjcm') return -1;
            if (b.slug === 'sjhss' && a.slug !== 'sjcm') return 1;
            return 0;
          });
          setDynamicJournals(sorted);
        }
      } catch (e) {
        // Silently ignore if table doesn't exist
      }
    }
    loadDynamic();
  }, []);

  const dropdownItemClass =
    "block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-amber-400 hover:text-slate-900 rounded-lg transition-all duration-200 cursor-pointer";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_25px_-10px_rgba(33,51,97,0.1)] transition-all duration-300">
      {/* Gold accent line at top */}
      <div className="h-[3px] w-full bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 relative shadow-[0_2px_10px_rgba(251,191,36,0.2)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">

          {/* Logo + Brand */}
          <Link href="/" data-testid="link-home" onClick={() => setMobileMenuOpen(false)}>
            <div className="flex items-center gap-3 shrink-0 hover:-translate-y-0.5 transition-transform duration-300 group cursor-pointer py-1">
              <img
                src={logoImage}
                alt="Scholar India Publishers Logo"
                className="h-14 w-auto object-contain group-hover:drop-shadow-md transition-all"
              />
              <div className="hidden sm:flex flex-col justify-center gap-0.5">
                <span className="text-[17px] font-black text-[#213361] leading-tight tracking-tight">
                  Scholar India <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-400">Publishers</span>
                </span>
                <div className="w-12 h-[3px] bg-amber-400 rounded-full mt-0.5 group-hover:w-full transition-all duration-500 ease-out" />
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center px-4 xl:px-6">
            <Button variant="ghost" className="text-sm font-extrabold text-[#213361] hover:text-[#213361] hover:bg-transparent px-4 h-9 rounded-full transition-colors duration-300" asChild>
              <Link href="/" data-testid="link-nav-home">Home</Link>
            </Button>

            {/* Journals */}
            <div className="relative group">
              <Button asChild variant="ghost" className="text-sm font-extrabold text-[#213361] hover:text-[#213361] hover:bg-transparent px-4 h-9 rounded-full flex items-center gap-1.5 transition-colors duration-300">
                <Link href="/journals" className="flex items-center gap-1.5 cursor-pointer">Journals <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform duration-300 group-hover:rotate-180" /></Link>
              </Button>
              <div className="absolute top-full left-0 hidden group-hover:block pt-3 z-[60]">
                <div className="bg-white/95 backdrop-blur-xl border border-slate-100 border-t-4 border-t-amber-400 p-1.5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden min-w-[260px]">
                  {/* Hardcoded primary journals — always Commerce first, Humanities second */}
                  <Link href="/commerce-management">
                    <div className={dropdownItemClass}>Commerce and Management</div>
                  </Link>
                  <Link href="/humanities">
                    <div className={dropdownItemClass}>Humanities and Social Sciences</div>
                  </Link>
                  {/* Any additional journals from the database */}
                  {dynamicJournals
                    .filter(j => j.slug !== 'sjcm' && j.slug !== 'sjhss')
                    .map(j => (
                      <Link key={j.slug} href={`/journal/${j.slug}`}>
                        <div className={dropdownItemClass}>{j.title.replace(/^Scholar Journal of\s+/i, '')}</div>
                      </Link>
                    ))
                  }
                </div>
              </div>
            </div>

            {/* Books */}
            <div className="relative group">
              <Button variant="ghost" className="text-sm font-extrabold text-[#213361] hover:text-[#213361] hover:bg-transparent px-4 h-9 rounded-full flex items-center gap-1.5 transition-colors duration-300">
                Books <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform duration-300 group-hover:rotate-180" />
              </Button>
              <div className="absolute top-full left-0 hidden group-hover:block pt-3 z-[60]">
                <div className="bg-white/95 backdrop-blur-xl border border-slate-100 border-t-4 border-t-amber-400 p-1.5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden min-w-[240px]">
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
              <Button variant="ghost" className="text-sm font-extrabold text-[#213361] hover:text-[#213361] hover:bg-transparent px-4 h-9 rounded-full flex items-center gap-1.5 transition-colors duration-300">
                Services <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform duration-300 group-hover:rotate-180" />
              </Button>
              <div className="absolute top-full left-0 hidden group-hover:block pt-3 z-[60]">
                <div className="bg-white/95 backdrop-blur-xl border border-slate-100 border-t-4 border-t-amber-400 p-1.5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden min-w-[240px]">
                  <Link href="/conference-seminars" data-testid="link-conference-seminars">
                    <div className={dropdownItemClass}>Conference & Seminars</div>
                  </Link>
                  <Link href="/other-services" data-testid="link-other-services">
                    <div className={dropdownItemClass}>Other Services</div>
                  </Link>
                </div>
              </div>
            </div>

            <Button variant="ghost" className="text-sm font-extrabold text-[#213361] hover:text-[#213361] hover:bg-transparent px-4 h-9 rounded-full transition-colors duration-300" asChild>
              <Link href="/contact" data-testid="link-nav-contact">Contact</Link>
            </Button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Sign In */}
            <div className="relative group hidden sm:block">
              <Button className="h-9 text-xs font-black bg-white hover:bg-slate-50 border-2 border-[#213361]/20 text-[#213361] px-4 xl:px-5 rounded-full flex items-center gap-1.5 shadow-sm transition-all duration-300 hover:border-[#213361] hover:shadow-md">
                Sign In <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform duration-300 group-hover:rotate-180" />
              </Button>
              <div className="absolute top-full right-0 hidden group-hover:block pt-3 z-[60]">
                <div className="bg-white/95 backdrop-blur-xl border border-slate-100 border-t-4 border-t-amber-400 p-1.5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden min-w-[200px]">
                  <Link href="/admin/login" data-testid="link-admin-login">
                    <div className={dropdownItemClass}>Admin Portal</div>
                  </Link>
                  <div className="h-px bg-slate-100 my-1"></div>
                  <Link href="/reviewer-login" data-testid="link-reviewer-login">
                    <div className={dropdownItemClass}>Reviewer / Editor</div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="relative group hidden sm:block">
              <Button className="h-9 text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-[#1a2540] hover:from-amber-300 hover:to-amber-400 px-4 xl:px-5 rounded-full flex items-center gap-1.5 shadow-sm transition-all duration-300 border-0 hover:shadow-md hover:shadow-amber-400/30 hover:-translate-y-0.5">
                Submit <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform duration-300 group-hover:rotate-180" />
              </Button>
              <div className="absolute top-full right-0 hidden group-hover:block pt-3 z-[60]">
                <div className="bg-white/95 backdrop-blur-xl border border-slate-100 border-t-4 border-t-amber-400 p-1.5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden min-w-[200px]">
                  <Link href="/call-for-books" data-testid="link-submit-book">
                    <div className={dropdownItemClass}>Book Chapter</div>
                  </Link>
                  <div className="h-px bg-slate-100 my-1"></div>
                  <Link href="/submit" data-testid="link-submit-manuscript">
                    <div className={dropdownItemClass}>Manuscript</div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile toggle */}
            <button
              className="lg:hidden p-2.5 text-[#213361] hover:bg-slate-100 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden pb-6 pt-2 space-y-1 bg-white border-t border-slate-100" data-testid="mobile-menu">
            <Button variant="ghost" className="w-full justify-start text-sm font-bold text-[#213361] hover:bg-slate-50 px-4 py-3 h-auto rounded-none" asChild>
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            </Button>

            <div>
              <Button variant="ghost" className="w-full justify-between text-sm font-bold text-[#213361] hover:bg-slate-50 px-4 py-3 h-auto rounded-none"
                onClick={() => setJournalsOpen(!journalsOpen)}>
                <span className="flex items-center gap-3"><BookOpen className="h-4 w-4 opacity-70" />Journals</span>
                <ChevronDown className={`h-4 w-4 opacity-60 transition-transform duration-300 ${journalsOpen ? "rotate-180" : ""}`} />
              </Button>
              <div className={`overflow-hidden transition-all duration-300 ${journalsOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="bg-slate-50/50 py-2">
                  <Link href="/journals" onClick={() => setMobileMenuOpen(false)}>
                    <div className="px-12 py-2.5 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors uppercase tracking-widest border-b border-slate-100 mb-1">View All Journals</div>
                  </Link>
                  {dynamicJournals.map(j => (
                    <Link key={j.slug} href={j.slug === 'sjcm' ? '/commerce-management' : j.slug === 'sjhss' ? '/humanities' : `/journal/${j.slug}`} onClick={() => setMobileMenuOpen(false)}>
                      <div className="px-12 py-2.5 text-sm font-medium text-slate-600 hover:text-[#213361] transition-colors">{j.title.replace(/^Scholar Journal of\s+/i, '')}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Button variant="ghost" className="w-full justify-between text-sm font-bold text-[#213361] hover:bg-slate-50 px-4 py-3 h-auto rounded-none"
                onClick={() => setBooksOpen(!booksOpen)}>
                <span className="flex items-center gap-3"><BookMarked className="h-4 w-4 opacity-70" />Books</span>
                <ChevronDown className={`h-4 w-4 opacity-60 transition-transform duration-300 ${booksOpen ? "rotate-180" : ""}`} />
              </Button>
              <div className={`overflow-hidden transition-all duration-300 ${booksOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="bg-slate-50/50 py-2">
                  <Link href="/book-publication-info" onClick={() => setMobileMenuOpen(false)}>
                    <div className="px-12 py-2.5 text-sm font-medium text-slate-600 hover:text-[#213361] transition-colors">Publication Information</div>
                  </Link>
                  <Link href="/call-for-books" onClick={() => setMobileMenuOpen(false)}>
                    <div className="px-12 py-2.5 text-sm font-medium text-slate-600 hover:text-[#213361] transition-colors">Call for Books</div>
                  </Link>
                  <Link href="/published-books" onClick={() => setMobileMenuOpen(false)}>
                    <div className="px-12 py-2.5 text-sm font-medium text-slate-600 hover:text-[#213361] transition-colors">Published Books</div>
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <Button variant="ghost" className="w-full justify-between text-sm font-bold text-[#213361] hover:bg-slate-50 px-4 py-3 h-auto rounded-none"
                onClick={() => setServicesOpen(!servicesOpen)}>
                <span className="flex items-center gap-3"><Briefcase className="h-4 w-4 opacity-70" />Services</span>
                <ChevronDown className={`h-4 w-4 opacity-60 transition-transform duration-300 ${servicesOpen ? "rotate-180" : ""}`} />
              </Button>
              <div className={`overflow-hidden transition-all duration-300 ${servicesOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="bg-slate-50/50 py-2">
                  <Link href="/conference-seminars" onClick={() => setMobileMenuOpen(false)}>
                    <div className="px-12 py-2.5 text-sm font-medium text-slate-600 hover:text-[#213361] transition-colors">Conference & Seminars</div>
                  </Link>
                  <Link href="/other-services" onClick={() => setMobileMenuOpen(false)}>
                    <div className="px-12 py-2.5 text-sm font-medium text-slate-600 hover:text-[#213361] transition-colors">Other Services</div>
                  </Link>
                </div>
              </div>
            </div>

            <Button variant="ghost" className="w-full justify-start text-sm font-bold text-[#213361] hover:bg-slate-50 px-4 py-3 h-auto rounded-none" asChild>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            </Button>

            <div className="px-4 pt-4 pb-2 space-y-3 sm:hidden">
              <div className="border border-slate-200 rounded-xl overflow-hidden p-1">
                <Button className="w-full justify-between text-xs font-black bg-slate-50 text-[#213361] hover:bg-slate-100 shadow-none border-0 h-10"
                  onClick={() => setLoginOpen(!loginOpen)}>
                  <span className="flex items-center gap-2.5"><LogIn className="h-4 w-4 text-[#213361]/60" />Sign In</span>
                  <ChevronDown className={`h-4 w-4 opacity-60 transition-transform duration-300 ${loginOpen ? "rotate-180" : ""}`} />
                </Button>
                <div className={`overflow-hidden transition-all duration-300 ${loginOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="py-1 px-1">
                    <Link href="/admin/login" onClick={() => { setMobileMenuOpen(false); setLoginOpen(false); }}>
                      <div className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-[#213361] rounded-lg transition-colors">Admin Portal</div>
                    </Link>
                    <Link href="/reviewer-login" onClick={() => { setMobileMenuOpen(false); setLoginOpen(false); }}>
                      <div className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-[#213361] rounded-lg transition-colors">Reviewer / Editor</div>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="border border-amber-300 rounded-xl overflow-hidden p-1 bg-amber-50/50">
                <Button className="w-full justify-between text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 shadow-none border-0 h-10 hover:opacity-90"
                  onClick={() => setSubmitOpen(!submitOpen)}>
                  <span className="flex items-center gap-2.5"><FileText className="h-4 w-4 opacity-70" />Submit Work</span>
                  <ChevronDown className={`h-4 w-4 opacity-60 transition-transform duration-300 ${submitOpen ? "rotate-180" : ""}`} />
                </Button>
                <div className={`overflow-hidden transition-all duration-300 ${submitOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="py-1 px-1">
                    <Link href="/call-for-books" onClick={() => { setMobileMenuOpen(false); setSubmitOpen(false); }}>
                      <div className="px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-amber-100 rounded-lg transition-colors">Book Chapter</div>
                    </Link>
                    <Link href="/submit" onClick={() => { setMobileMenuOpen(false); setSubmitOpen(false); }}>
                      <div className="px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-amber-100 rounded-lg transition-colors">Manuscript</div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
