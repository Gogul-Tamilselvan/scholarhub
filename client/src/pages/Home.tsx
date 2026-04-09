import Header from "@/components/Header";
import AboutSection from "@/components/AboutSection";
import StatisticsSection from "@/components/StatisticsSection";
import PartnerLogos from "@/components/PartnerLogos";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import StructuredData, { createOrganizationData } from "@/components/StructuredData";
import { motion } from "framer-motion";

export default function Home() {
  // Use absolute URL for og-image (required for WhatsApp, Facebook sharing)
  const ogImage = typeof window !== 'undefined' ? `${window.location.origin}/og-image.jpg` : '/og-image.jpg';
  
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Scholar India Publishers | International Peer-Reviewed Academic Journals"
        description="Scholar India Publishers - International peer-reviewed academic journals in Commerce, Management, Humanities & Social Sciences. Fast DOI, double-blind review, ISSN certified. Submit your manuscript online from India or abroad."
        keywords="scholar india publishers, academic journal publisher India, peer-reviewed journal India, commerce journal India, management journal, humanities journal India, social sciences journal, academic publishing Chennai, research publication India, journal submission 2025, DOI assignment, ISSN journal India, international academic journal, open access journal India"
        ogImage={ogImage}
        canonical="https://scholarindiapub.com/"
      />
      <StructuredData type="Organization" data={createOrganizationData()} />
      <Header />
      {/* Publisher Title Section */}
      <section className="w-full py-8 md:py-12 bg-[#213361] relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute top-[-10%] left-[-5%] w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-yellow-500 blur-3xl" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-3 tracking-tight drop-shadow-md">
              Scholar India Publishers
            </h1>
            
            <div className="flex flex-col items-center gap-3">
              <motion.div 
                className="inline-block bg-yellow-500 px-5 py-1.5 rounded-full shadow-lg border-2 border-white/20"
                whileHover={{ scale: 1.05, rotate: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <p className="text-xl md:text-2xl font-black text-blue-900 tracking-wider">
                  SIP
                </p>
              </motion.div>
              
              <div className="max-w-4xl">
                <p className="text-base md:text-lg font-medium text-blue-50 leading-relaxed drop-shadow-sm whitespace-nowrap">
                  International Peer-Reviewed Academic Journals and Book Publishing Excellence Since 2022
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-3">
                  <div className="h-1 w-12 bg-yellow-500 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <AboutSection />
      <StatisticsSection />
      <PartnerLogos />
      <Footer />
    </div>
  );
}