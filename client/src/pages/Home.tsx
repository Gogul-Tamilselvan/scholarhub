import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import StructuredData, { createOrganizationData } from "@/components/StructuredData";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  BookOpen, ShieldCheck, Award, Clock, FileCheck,
  RefreshCw, Send, Languages, ArrowRight,
  Unlock, Hash, BookMarked, Scale, Link2, Fingerprint,
  Megaphone, Sparkles, Edit3, Share2, Users, MessageSquare, Bookmark,
  ChevronRight
} from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] },
  viewport: { once: true, margin: "-50px" },
});

export default function Home() {
  const [, setLocation] = useLocation();
  const ogImage =
    typeof window !== "undefined" ? `${window.location.origin}/og-image.jpg` : "/og-image.jpg";

  const features = [
    { icon: ShieldCheck, label: "Double-Blind Peer Review" },
    { icon: Clock, label: "Review in 10–15 Days" },
    { icon: Award, label: "DOI & ISSN Certified" },
    { icon: FileCheck, label: "Open Access Publishing" },
  ];

  const stats = [
    { value: "2", label: "Active Journals" },
    { value: "100+", label: "Published Articles" },
    { value: "15+", label: "Countries Reached" },
    { value: "10–15", label: "Days to Review" },
  ];

  const journals = [
    {
      short: "SJCM",
      full: "Scholar Journal of Commerce and Management",
      issn: "ISSN (Online): xxxx",
      desc: "International peer-reviewed journal for commerce, management, accounting, finance, marketing, business law, economics, entrepreneurship, HRM, and digital transformation research.",
      href: "/commerce-management",
      color: "from-blue-600 to-indigo-600"
    },
    {
      short: "SJHSS",
      full: "Scholar Journal of Humanities and Social Sciences",
      issn: "ISSN (Online): xxxx",
      desc: "Leading international journal for humanities and social sciences research including literature, philosophy, history, sociology, psychology, political science, education, and public policy.",
      href: "/humanities",
      color: "from-emerald-600 to-teal-600"
    },
  ];

  const services = [
    { icon: BookMarked, title: "Journal Publication", desc: "Peer review & DOI" },
    { icon: Bookmark, title: "Book Publication", desc: "ISBN & DOI" },
    { icon: Users, title: "Conference Support", desc: "Special issues" },
    { icon: Edit3, title: "Academic Editing", desc: "Professional support" },
    { icon: MessageSquare, title: "Plagiarism Check", desc: "Quality assurance" },
    { icon: Share2, title: "Collaboration", desc: "Research partnerships" },
  ];

  const pubInfo = [
    { icon: RefreshCw, title: "Journal Frequency", value: "Quarterly" },
    { icon: Send, title: "Submission", value: "Ongoing" },
    { icon: Languages, title: "Accepted Language", value: "English" },
  ];

  const news = [
    { title: "Call for Book Chapters", description: "Publish your research with DOI and ISBN", link: "https://scholarindiapub.com/call-for-books", isNew: true },
    { title: "Submit Your Manuscript", description: "Peer review in 10–15 days", link: "https://scholarindiapub.com/submit", isNew: true },
    { title: "Join as Editor", description: "Apply to join our editorial team", link: "https://scholarindiapub.com/join-reviewer", isNew: false },
    { title: "Join as Reviewer", description: "Join our distinguished review panel", link: "https://scholarindiapub.com/join-reviewer", isNew: false },
    { title: "Submit Book Proposal", description: "Share your book idea for publication review", link: "https://scholarindiapub.com/call-for-books", isNew: true },
  ];

  const partners = [
    { name: "Open Access", icon: Unlock },
    { name: "ISSN", icon: Hash },
    { name: "ISBN", icon: BookMarked },
    { name: "Creative Commons", icon: Fingerprint },
    { name: "No Plagiarism", icon: ShieldCheck },
    { name: "DOI CrossRef", icon: Link2 },
    { name: "COPE", icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background selection:bg-amber-400/30 overflow-x-hidden">
      <SEO
        title="Scholar India Publishers | International Peer-Reviewed Academic Journals"
        description="Scholar India Publishers - International peer-reviewed academic journals in Commerce, Management, Humanities & Social Sciences. DOI, double-blind review, ISSN certified."
        keywords="scholar india publishers, academic journal publisher India, peer-reviewed journal India, commerce journal India, management journal, humanities journal India"
        ogImage={ogImage}
        canonical="https://scholarindiapub.com/"
      />
      <StructuredData type="Organization" data={createOrganizationData()} />
      <Header />

      {/* HERO SECTION */}
      <section
        className="relative w-full overflow-hidden"
        style={{ background: "linear-gradient(135deg, #152240 0%, #1e3368 50%, #131e3a 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[70%] rounded-full bg-amber-500/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-blue-500/10 blur-[100px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          {/* Accent lines */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 via-amber-400/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-12 md:pt-28 md:pb-16 text-center flex flex-col items-center">
          <motion.div
            className="inline-flex items-center gap-2.5 mb-8 px-5 py-2 rounded-full border border-amber-400/20 bg-white/5 backdrop-blur-md text-amber-300 text-xs font-semibold tracking-wide uppercase shadow-[0_0_15px_rgba(251,191,36,0.1)] hover:bg-white/10 transition-colors cursor-default"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7, ease: "easeOut" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            International Peer-Reviewed Academic & Book Publishing Since 2022
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-[4.5rem] font-black text-white leading-[1.1] mb-6 tracking-tight drop-shadow-sm"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
          >
            Publish Your Research <br className="hidden md:block" />
            <span className="relative inline-block mt-2">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">With Global Impact</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-amber-500/20 -z-10 rounded-full blur-sm"></span>
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-blue-100/80 leading-relaxed max-w-3xl mx-auto mb-10 font-medium"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
          >
            Scholar India Publishers offers internationally peer-reviewed journals in Commerce,
            Management, Humanities & Social Sciences — with DOI assignment, ISSN certification,
            and a rigorous double-blind review process.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3 justify-center mb-14"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45, duration: 0.6 }}
          >
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="group inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-amber-400/30 text-white shadow-lg px-4 py-2 rounded-full transition-all duration-300">
                <Icon className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" /> 
                <span className="text-sm font-semibold tracking-wide text-white/90">{label}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="w-full max-w-4xl bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 grid grid-cols-2 md:grid-cols-4 overflow-hidden shadow-2xl relative"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] translate-x-[-150%] animate-[shimmer_8s_infinite]" />
            {stats.map(({ value, label }, i) => (
              <div key={label} className={`py-8 px-4 flex flex-col items-center justify-center relative ${i < stats.length - 1 ? "md:border-r border-white/10" : ""}`}>
                {i === 1 && <div className="absolute right-0 bottom-0 top-0 w-px bg-white/10 md:hidden" />}
                {i > 1 && <div className="absolute top-0 left-0 right-0 h-px bg-white/10 md:hidden" />}
                <div className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-md">{value}</div>
                <div className="text-xs text-amber-400/90 uppercase tracking-[0.2em] font-bold">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* JOURNALS SECTION */}
      <section className="w-full py-20 lg:py-28 relative">
        {/* Subtle background blurs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 dark:bg-blue-900/10 blur-[100px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] rounded-full bg-purple-100/50 dark:bg-purple-900/10 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Explore
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#213361] dark:text-white tracking-tight">Our Elite Journals</h2>
            <div className="mt-6 mx-auto w-20 h-1.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-sm" />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
            {journals.map(({ short, full, issn, desc, href, color }, i) => (
              <motion.div key={short} {...fadeUp(i * 0.15)}
                className="group relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden flex flex-col h-full"
              >
                {/* Decorative background gradient */}
                <div className={`absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-gradient-to-br ${color} rounded-full opacity-[0.03] blur-3xl group-hover:opacity-[0.08] transition-opacity duration-500`} />
                
                <div className="relative z-10 flex-grow">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="shadow-md bg-gradient-to-br from-[#213361] to-[#152240] p-3.5 rounded-2xl shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                        <BookOpen className="h-6 w-6 text-amber-400" />
                      </div>
                      <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-800 tracking-tighter drop-shadow-sm">{short}</div>
                    </div>
                    <Badge className="bg-amber-100/50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold shadow-sm">{issn}</Badge>
                  </div>
                  <h3 className="font-extrabold text-[#213361] dark:text-white text-xl md:text-2xl leading-tight mb-4 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    {full}
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {desc}
                  </p>
                </div>
                
                <div className="relative z-10 mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <Link href={href}>
                    <button className="flex items-center gap-2 text-[#213361] dark:text-amber-400 font-bold text-sm uppercase tracking-wide group/btn outline-none">
                      Explore Journal 
                      <div className="bg-gray-100 dark:bg-gray-800 group-hover/btn:bg-[#213361] dark:group-hover/btn:bg-amber-400 group-hover/btn:text-white dark:group-hover/btn:text-[#213361] rounded-full p-1.5 transition-colors duration-300">
                        <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="w-full py-20 lg:py-28 bg-[#182548] text-white relative border-t border-[rgba(255,255,255,0.05)]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-50 blur-3xl transform rotate-12" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-widest mb-4 border border-white/10 shadow-sm">
              What We Offer
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">Our Premium Services</h2>
            <div className="mt-6 mx-auto w-20 h-1.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} {...fadeUp(i * 0.1)} 
                className="group relative bg-[#213361]/40 hover:bg-[#213361]/80 backdrop-blur-md border border-white/10 hover:border-amber-400/30 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-400/5 hover:-translate-y-1 cursor-default"
              >
                <div className="flex flex-col gap-5">
                  <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-500/5 border border-amber-400/20 w-fit group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <Icon className="h-7 w-7 text-amber-400 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white tracking-tight mb-2 group-hover:text-amber-300 transition-colors drop-shadow-sm">{title}</h3>
                    <p className="text-[15px] text-blue-100/70 font-medium leading-relaxed">{desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NOTICE BOARD & PUB INFO SECTION */}
      <section className="w-full py-20 lg:py-28 bg-white dark:bg-background relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-start">

            {/* Notice Board */}
            <motion.div {...fadeUp()} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden h-full flex flex-col">
              <div className="bg-gradient-to-r from-[#1a2a52] to-[#213361] px-6 py-5 flex items-center justify-between border-b border-white/10 m-2 rounded-2xl opacity-90 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-amber-400/20 rounded-md">
                    <Megaphone className="h-5 w-5 text-amber-400 drop-shadow-sm" />
                  </div>
                  <span className="text-white font-extrabold text-sm uppercase tracking-[0.15em] drop-shadow-sm">Notice Board</span>
                </div>
                <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  </span>
                  <span className="text-red-400 text-[10px] font-bold uppercase tracking-widest">Live Updates</span>
                </div>
              </div>

              <div
                className="relative flex-grow bg-white dark:bg-gray-900 overflow-hidden"
                style={{ height: "340px" }}
              >
                {/* Fade edges */}
                <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
                
                <style>{`
                  @keyframes noticeScroll {
                    0%   { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                  }
                  .notice-scroll {
                    animation: noticeScroll 20s linear infinite;
                  }
                  .notice-scroll:hover {
                    animation-play-state: paused;
                  }
                `}</style>
                <div className="notice-scroll px-4 pt-2">
                  {[...news, ...news].map(({ title, description, link, isNew }, i) => (
                    <a
                      key={`${title}-${i}`}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-start gap-4 p-4 mb-2 rounded-xl border border-transparent hover:border-amber-100 dark:hover:border-amber-900/30 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all duration-300"
                    >
                      <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#213361] to-blue-500 shrink-0 shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-bold text-[#213361] dark:text-white leading-tight group-hover:text-blue-700 dark:group-hover:text-amber-400 transition-colors">{title}</span>
                          {isNew && (
                            <span className="text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-0.5 rounded shadow-sm">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed truncate">{description}</p>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full group-hover:bg-[#213361] group-hover:text-white transition-colors duration-300 shrink-0 mt-2">
                         <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Publication Info */}
            <motion.div {...fadeUp(0.1)} className="flex flex-col justify-center h-full">
              <div className="mb-10">
                 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                  Information
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-[#213361] dark:text-white tracking-tight">At a Glance</h2>
              </div>
              <div className="space-y-5">
                {pubInfo.map(({ icon: Icon, title, value }, i) => (
                  <motion.div key={title} {...fadeUp(i * 0.1)}
                    className="group flex items-center gap-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
                  >
                    <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 group-hover:bg-[#213361] transition-colors duration-300">
                      <Icon className="h-7 w-7 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300 stroke-[1.5]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-1">{title}</div>
                      <div className="text-xl font-black text-[#213361] dark:text-gray-100 tracking-tight">{value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PARTNERS SECTION */}
      <section className="w-full py-20 bg-slate-50 dark:bg-slate-900/30 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div {...fadeUp()} className="mb-12">
            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Trusted By & Indexed In</h2>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {partners.map(({ name, icon: Icon }, i) => (
              <motion.div key={name} {...fadeUp(i * 0.05)} 
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-5 flex flex-col items-center gap-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-w-[140px] cursor-default"
              >
                <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-amber-400/10 transition-colors">
                  <Icon className="h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:text-amber-500 transition-colors" />
                </div>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
