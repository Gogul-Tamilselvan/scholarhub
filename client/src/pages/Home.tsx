import Header from "@/components/Header";
import AboutSection from "@/components/AboutSection";
import StatisticsSection from "@/components/StatisticsSection";
import PartnerLogos from "@/components/PartnerLogos";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import StructuredData, { createOrganizationData } from "@/components/StructuredData";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  BookOpen,
  ShieldCheck,
  Award,
  Clock,
  FileCheck,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const ogImage =
    typeof window !== "undefined"
      ? `${window.location.origin}/og-image.jpg`
      : "/og-image.jpg";

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
      color: "from-blue-600 to-blue-800",
      iconColor: "bg-blue-500",
      href: "/commerce-management",
    },
    {
      short: "SJHSS",
      full: "Scholar Journal of Humanities and Social Sciences",
      color: "from-indigo-600 to-indigo-800",
      iconColor: "bg-indigo-500",
      href: "/humanities",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Scholar India Publishers | International Peer-Reviewed Academic Journals"
        description="Scholar India Publishers - International peer-reviewed academic journals in Commerce, Management, Humanities & Social Sciences. DOI, double-blind review, ISSN certified. Submit your manuscript online from India or abroad."
        keywords="scholar india publishers, academic journal publisher India, peer-reviewed journal India, commerce journal India, management journal, humanities journal India, social sciences journal, academic publishing Chennai, research publication India, journal submission 2025, DOI assignment, ISSN journal India, international academic journal, open access journal India"
        ogImage={ogImage}
        canonical="https://scholarindiapub.com/"
      />
      <StructuredData type="Organization" data={createOrganizationData()} />
      <Header />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden" style={{ background: "linear-gradient(135deg, #213361 0%, #1a2a52 55%, #152240 100%)" }}>

        {/* Decorative background shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top-right large gold circle */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-amber-400/10 opacity-60" />
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full border border-amber-400/15" />
          {/* Bottom-left subtle glow */}
          <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-blue-400/5 blur-3xl" />
          {/* Dot-grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Diagonal gold accent — top left */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 via-amber-400/40 to-transparent" />
          {/* Horizontal gold line near bottom of hero */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-14 pb-0 md:pt-20">
          <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-16">

            {/* ── LEFT: Headline + CTAs ── */}
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
            >
              {/* Eyebrow badge */}
              <motion.div
                className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-amber-400/35 bg-amber-400/10 text-amber-300 text-[11px] font-semibold tracking-wider uppercase"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                International Peer-Reviewed Academic Journals &amp; Book Publishing Excellence Since 2022
              </motion.div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-[3.2rem] font-extrabold text-white leading-[1.12] mb-5 tracking-tight">
                Publish Your Research<br />
                <span className="text-amber-400">With Global Impact</span>
              </h1>

              {/* Sub-text */}
              <p className="text-base md:text-[17px] text-white/60 leading-relaxed max-w-lg mb-8 mx-auto lg:mx-0">
                Scholar India Publishers offers internationally peer-reviewed journals in Commerce,
                Management, Humanities &amp; Social Sciences — with DOI assignment, ISSN certification,
                and a rigorous double-blind review process.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {features.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/70 text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    <Icon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── RIGHT: Journal Cards ── */}
            <motion.div
              className="flex-shrink-0 w-full lg:w-72 flex flex-col gap-4 lg:pt-2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1 text-center lg:text-left">
                Our Journals
              </p>
              {journals.map(({ short, full, href }, i) => (
                <motion.div
                  key={short}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
                >
                  <Link href={href}>
                    <div className="group flex items-center gap-4 bg-white/8 border border-white/12 rounded-lg px-4 py-4 hover:bg-white/14 hover:border-amber-400/40 transition-all cursor-pointer">
                      <div className="flex-shrink-0 w-12 h-12 rounded-md bg-amber-400/20 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-0.5">{short}</div>
                        <div className="text-sm font-semibold text-white/85 leading-snug line-clamp-2">{full}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-amber-400 transition-colors shrink-0" />
                    </div>
                  </Link>
                </motion.div>
              ))}

              {/* Quick-access card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.56, duration: 0.5 }}
                className="bg-amber-400/10 border border-amber-400/25 rounded-lg px-4 py-4 text-center"
              >
                <p className="text-xs text-amber-300/80 mb-2 font-medium">Ready to publish?</p>
                <Link href="/submit">
                  <button className="w-full text-xs font-bold text-[#213361] bg-amber-400 hover:bg-amber-300 py-2 rounded-md transition-colors">
                    Start Submission →
                  </button>
                </Link>
              </motion.div>
            </motion.div>

          </div>

          {/* ── STATS BAR ── */}
          <motion.div
            className="mt-12 border-t border-white/10 grid grid-cols-2 md:grid-cols-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            {stats.map(({ value, label }, i) => (
              <div
                key={label}
                className={`py-5 text-center ${i < stats.length - 1 ? "border-r border-white/10" : ""}`}
              >
                <div className="text-2xl md:text-3xl font-extrabold text-amber-400 leading-none mb-1">
                  {value}
                </div>
                <div className="text-[11px] text-white/45 uppercase tracking-widest font-medium">
                  {label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* ── END HERO ─────────────────────────────────────────── */}

      <AboutSection />
      <StatisticsSection />
      <PartnerLogos />
      <Footer />
    </div>
  );
}
