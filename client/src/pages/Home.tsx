import Header from "@/components/Header";
import StatisticsSection from "@/components/StatisticsSection";
import PartnerLogos from "@/components/PartnerLogos";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import StructuredData, { createOrganizationData } from "@/components/StructuredData";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, BookOpen, Globe, ShieldCheck, Award } from "lucide-react";

export default function Home() {
  const ogImage = typeof window !== 'undefined' ? `${window.location.origin}/og-image.jpg` : '/og-image.jpg';

  const badges = [
    { icon: ShieldCheck, label: "Double-Blind Peer Review" },
    { icon: Globe, label: "International Journals" },
    { icon: Award, label: "DOI & ISSN Certified" },
    { icon: BookOpen, label: "Open Access" },
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

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-[#0d1b3e]">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large soft glows */}
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-amber-400/5 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl" />
          {/* Diagonal grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Gold accent bar on left */}
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-amber-400/80 via-amber-400/30 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-14 md:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Left: Text content */}
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Pre-headline badge */}
              <motion.div
                className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                International Peer-Reviewed Academic Journals and Book Publishing Excellence Since 2022
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold text-white leading-tight mb-5 tracking-tight">
                Publish Your Research<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
                  With Global Impact
                </span>
              </h1>

              <p className="text-base md:text-lg text-white/65 leading-relaxed max-w-xl mb-8 mx-auto lg:mx-0">
                Scholar India Publishers offers internationally peer-reviewed journals in Commerce,
                Management, Humanities & Social Sciences — with DOI assignment, ISSN certification,
                and a rigorous double-blind review process.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link href="/submit">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 bg-amber-400 text-[#0d1b3e] font-bold text-sm px-6 py-3 rounded-md shadow-lg hover:bg-amber-300 transition-colors"
                  >
                    Submit Manuscript <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </Link>
                <Link href="/commerce-management">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 bg-white/10 border border-white/25 text-white font-semibold text-sm px-6 py-3 rounded-md hover:bg-white/20 transition-colors"
                  >
                    <BookOpen className="h-4 w-4" /> Browse Journals
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Right: Feature cards */}
            <motion.div
              className="flex-shrink-0 w-full lg:w-auto grid grid-cols-2 gap-3 lg:grid-cols-1 lg:w-64"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              {badges.map(({ icon: Icon, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-md px-4 py-3 backdrop-blur-sm"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-md bg-amber-400/20 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-amber-400" />
                  </div>
                  <span className="text-sm font-medium text-white/80">{label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Bottom divider stat strip */}
          <motion.div
            className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {[
              { value: "2", label: "Active Journals" },
              { value: "100+", label: "Published Articles" },
              { value: "15+", label: "Countries Reached" },
              { value: "10-15 Days", label: "Review Process" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl md:text-3xl font-extrabold text-amber-400 mb-0.5">{value}</div>
                <div className="text-xs text-white/50 uppercase tracking-widest font-medium">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <StatisticsSection />
      <PartnerLogos />
      <Footer />
    </div>
  );
}
