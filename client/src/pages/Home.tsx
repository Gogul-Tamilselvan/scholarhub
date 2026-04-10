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
  CheckCircle2,
} from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay },
  viewport: { once: true },
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
    },
    {
      short: "SJHSS",
      full: "Scholar Journal of Humanities and Social Sciences",
      issn: "ISSN (Online): xxxx",
      desc: "Leading international journal for humanities and social sciences research including literature, philosophy, history, sociology, psychology, political science, education, and public policy.",
      href: "/humanities",
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
    <div className="min-h-screen bg-background">
      <SEO
        title="Scholar India Publishers | International Peer-Reviewed Academic Journals"
        description="Scholar India Publishers - International peer-reviewed academic journals in Commerce, Management, Humanities & Social Sciences. DOI, double-blind review, ISSN certified."
        keywords="scholar india publishers, academic journal publisher India, peer-reviewed journal India, commerce journal India, management journal, humanities journal India"
        ogImage={ogImage}
        canonical="https://scholarindiapub.com/"
      />
      <StructuredData type="Organization" data={createOrganizationData()} />
      <Header />

      <section
        className="relative w-full overflow-hidden"
        style={{ background: "linear-gradient(135deg, #213361 0%, #1a2a52 55%, #152240 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-amber-400/10" />
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full border border-amber-400/15" />
          <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-blue-400/5 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 via-amber-400/40 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-0 md:pt-20 text-center">
          <motion.div
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-amber-400/35 bg-amber-400/10 text-amber-300 text-[11px] font-semibold tracking-wider uppercase"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            International Peer-Reviewed Academic Journals &amp; Book Publishing Excellence Since 2022
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-[3.3rem] font-extrabold text-white leading-[1.12] mb-5 tracking-tight"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          >
            Publish Your Research<br />
            <span className="text-amber-400">With Global Impact</span>
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
          >
            Scholar India Publishers offers internationally peer-reviewed journals in Commerce,
            Management, Humanities &amp; Social Sciences — with DOI assignment, ISSN certification,
            and a rigorous double-blind review process.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-2 justify-center mb-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.5 }}
          >
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/70 text-xs font-medium px-3 py-1.5 rounded-full">
                <Icon className="h-3.5 w-3.5 text-amber-400 shrink-0" /> {label}
              </div>
            ))}
          </motion.div>

          <motion.div
            className="border-t border-white/10 grid grid-cols-2 md:grid-cols-4"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }}
          >
            {stats.map(({ value, label }, i) => (
              <div key={label} className={`py-5 ${i < stats.length - 1 ? "border-r border-white/10" : ""}`}>
                <div className="text-2xl md:text-3xl font-extrabold text-amber-400 leading-none mb-1">{value}</div>
                <div className="text-[11px] text-white/45 uppercase tracking-widest font-medium">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="w-full py-14 bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">Explore</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#213361] dark:text-white">Our Journals</h2>
            <div className="mt-3 mx-auto w-16 h-0.5 bg-amber-400 rounded-full" />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {journals.map(({ short, full, issn, desc, href }, i) => (
              <motion.div key={short} {...fadeUp(i * 0.1)}
                className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700 p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-[#213361] p-2.5 rounded-md shrink-0">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#213361] dark:text-blue-200 text-base leading-snug mb-1">{full}</h3>
                    <Badge className="bg-[#213361] text-white text-[10px] font-semibold">{issn}</Badge>
                  </div>
                  <div className="text-2xl font-black text-blue-200 dark:text-blue-900/40 leading-none">{short}</div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-5">{desc}</p>
                <Link href={href}>
                  <button className="inline-flex items-center gap-2 bg-[#213361] text-white text-sm font-semibold px-4 py-2.5 rounded-md hover:opacity-95 transition-opacity">
                    More Info <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-14 bg-[#213361] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-300 mb-2">What We Offer</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Our Services</h2>
            <div className="mt-3 mx-auto w-16 h-0.5 bg-amber-400 rounded-full" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} {...fadeUp(i * 0.06)} className="bg-white/6 border border-white/10 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-amber-400/15 border border-amber-400/20">
                    <Icon className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="text-sm text-white/70 mt-1">{desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-14 bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10">

            <motion.div {...fadeUp()}>
              <div className="rounded-t-lg bg-[#213361] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-amber-400" />
                  <span className="text-white font-bold text-sm uppercase tracking-widest">Notice Board</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  <span className="text-red-300 text-[10px] font-bold uppercase tracking-widest">Live</span>
                </div>
              </div>

              <div
                className="border border-t-0 border-[#213361]/30 rounded-b-lg overflow-hidden bg-white dark:bg-gray-900"
                style={{ height: "272px" }}
              >
                <style>{`
                  @keyframes noticeScroll {
                    0%   { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                  }
                  .notice-scroll {
                    animation: noticeScroll 18s linear infinite;
                  }
                  .notice-scroll:hover {
                    animation-play-state: paused;
                  }
                `}</style>
                <div className="notice-scroll">
                  {[...news, ...news].map(({ title, description, link, isNew }, i) => (
                    <a
                      key={`${title}-${i}`}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
                    >
                      <span className="mt-0.5 h-2 w-2 rounded-full bg-[#213361] shrink-0 animate-pulse" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-[#213361] dark:text-white leading-tight">{title}</span>
                          {isNew && (
                            <span className="text-[9px] font-black uppercase tracking-widest bg-red-500 text-white px-1.5 py-0.5 rounded animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{description}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-[#213361]/40 shrink-0 mt-1" />
                    </a>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-gray-400 mt-2 text-right">Hover to pause scroll</p>
            </motion.div>

            <motion.div {...fadeUp(0.1)}>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-serif font-bold text-[#213361] dark:text-white">Publication Information</h2>
              </div>
              <div className="space-y-4">
                {pubInfo.map(({ icon: Icon, title, value }, i) => (
                  <motion.div key={title} {...fadeUp(i * 0.08)}
                    className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-5 py-4"
                  >
                    <div className="w-10 h-10 rounded-md bg-[#213361]/10 dark:bg-[#213361]/20 border border-[#213361]/20 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-[#213361] dark:text-blue-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 bg-slate-50 dark:bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div {...fadeUp()} className="mb-8">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">Trusted By</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#213361] dark:text-white">Certifications &amp; Partners</h2>
            <div className="mt-3 mx-auto w-16 h-0.5 bg-amber-400 rounded-full" />
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {partners.map(({ name, icon: Icon }, i) => (
              <motion.div key={name} {...fadeUp(i * 0.04)} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-md bg-[#213361]/10 dark:bg-[#213361]/20 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-[#213361] dark:text-amber-400" />
                </div>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">{name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
