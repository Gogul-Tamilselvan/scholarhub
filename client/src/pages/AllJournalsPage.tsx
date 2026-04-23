import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, ChevronRight, Loader2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] },
  viewport: { once: true, margin: "-50px" },
});

export default function AllJournalsPage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    async function loadJournals() {
      try {
        const hardcoded = [
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

        const { data } = await supabase.from('journals').select('*').order('created_at', { ascending: true });
        
        let dynamicJournals: any[] = [];
        if (data) {
          const colors = [
            "from-purple-600 to-fuchsia-600",
            "from-amber-500 to-orange-600",
            "from-rose-600 to-red-600",
            "from-cyan-600 to-blue-600"
          ];
          dynamicJournals = data.map((j, i) => {
            const shortName = j.title.split(' ').map((w: string) => w[0]).join('').substring(0, 5).toUpperCase();
            return {
              short: shortName,
              full: j.title,
              issn: j.issn ? `ISSN: ${j.issn}` : "ISSN: Pending",
              desc: j.subject_covers || j.aim || "Peer-reviewed international academic journal.",
              href: `/journal/${j.slug}`,
              color: colors[i % colors.length]
            };
          });
        }

        // Avoid duplicating hardcoded journals if they somehow got into DB
        const dynamicFiltered = dynamicJournals.filter(dj => 
          !hardcoded.some(hc => hc.full.toLowerCase() === dj.full.toLowerCase())
        );

        setJournals([...hardcoded, ...dynamicFiltered]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadJournals();
  }, []);

  const visibleJournals = journals.slice(0, visibleCount);
  const hasMore = visibleCount < journals.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background selection:bg-amber-400/30 overflow-x-hidden flex flex-col">
      <SEO
        title="All Journals | Scholar India Publishers"
        description="Browse all internationally peer-reviewed academic journals published by Scholar India Publishers."
      />
      <Header />

      <main className="flex-grow w-full py-16 lg:py-24 relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 dark:bg-blue-900/10 blur-[100px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] rounded-full bg-purple-100/50 dark:bg-purple-900/10 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Directory
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#213361] dark:text-white tracking-tight">Our Academic Journals</h1>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto font-medium">Browse our comprehensive collection of peer-reviewed journals across various disciplines.</p>
            <div className="mt-6 mx-auto w-20 h-1.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-sm" />
          </motion.div>

          {loading ? (
            <div className="flex justify-center p-20">
              <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {visibleJournals.map(({ short, full, issn, desc, href }, i) => (
                  <motion.div key={short + i} {...fadeUp((i % 6) * 0.1)}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700 p-5 hover:shadow-xl transition-all group flex flex-col h-full"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-[#213361] p-2 rounded-lg shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#213361] dark:text-blue-200 text-base md:text-[17px] leading-snug mb-1 line-clamp-2">
                          {full.startsWith("Scholar Journal of ") ? (
                            <>
                              <span className="text-[13px] md:text-[14px]">Scholar Journal of </span><br />
                              <span className="text-amber-600 dark:text-amber-400">{full.substring("Scholar Journal of ".length)}</span>
                            </>
                          ) : (
                            full
                          )}
                        </h3>
                        <Badge className="bg-[#213361] text-white text-[9px] font-bold border-none px-2 py-0.5">{issn}</Badge>
                      </div>
                    </div>
                    
                    <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed mb-5 font-medium line-clamp-3 flex-grow">
                      {desc}
                    </p>
                    
                    <div className="mt-auto">
                      <Link href={href}>
                        <button className="inline-flex items-center gap-2 bg-[#213361] text-white text-[13px] font-bold px-4 py-2 rounded-md hover:opacity-90 hover:translate-x-1 transition-all shadow-md">
                          More Info <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              {hasMore && (
                <div className="mt-16 flex justify-center">
                  <Button 
                    onClick={() => setVisibleCount(prev => prev + 6)} 
                    className="bg-white border-2 border-[#213361]/20 text-[#213361] hover:bg-slate-50 hover:border-[#213361] px-8 h-12 rounded-full font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Load More Journals
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
