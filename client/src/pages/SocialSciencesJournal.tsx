import Header from "@/components/Header";
import TabbedJournalPage from "@/components/TabbedJournalPage";
import SEO from "@/components/SEO";
import StructuredData, { createPeriodicalData } from "@/components/StructuredData";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2 } from "lucide-react";

export default function SocialSciencesJournal() {
  return (
    <>
      <SEO
        title="Scholar Journal of Social Sciences - International Sociology, Psychology & Policy Research"
        description="Leading international social sciences journal publishing research on sociology, psychology, political science, anthropology, economics, education, social work, public policy. Submit social science research. UGC CARE aspirant from India."
        keywords="scholar journal social sciences, social sciences journal India, sociology journal, psychology journal, political science journal, anthropology journal, economics journal, education journal, social work journal, international social science journal, social research journal, public policy journal, criminology journal, demography journal, social justice research, migration studies, environmental sociology, health sociology, education research, social development journal India"
        type="website"
      />
      <StructuredData 
        type="Periodical" 
        data={createPeriodicalData(
          "Scholar Journal of Social Sciences",
          "Leading international journal for social science research on sociology, psychology, political science, anthropology, economics, education, and public policy."
        )} 
      />
      <Header />
      <section className="w-full py-20 bg-[#213361] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-blue-400 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl">
                <BookOpen className="w-16 h-16 md:w-24 h-24 text-yellow-400" />
              </div>
              <div className="text-center md:text-left">
                <Badge className="bg-yellow-500 text-blue-900 font-bold mb-4 px-4 py-1 text-sm uppercase tracking-wider">
                  International Peer-Reviewed
                </Badge>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight leading-tight">
                  Scholar Journal of <br className="hidden md:block" />
                  <span className="text-yellow-400">Social Sciences</span>
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-blue-100 text-sm md:text-base font-medium">
                  <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-green-400" /> Fast-track Publication
                  </span>
                  <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-green-400" /> Peer-Reviewed Excellence
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <TabbedJournalPage
        title="Scholar Journal of Social Sciences"
        aim="The Scholar Journal of Social Sciences serves as a leading international forum for advancing understanding of society, human behavior, and social institutions. The journal is dedicated to promoting rigorous empirical research and theoretical innovation that addresses contemporary social challenges and contributes to evidence-based policy development."
        scope="The journal encompasses the full range of social science disciplines including sociology, psychology, political science, anthropology, economics, education, social work, criminology, demography, geography, international relations, public administration, and interdisciplinary social research."
        publicationTypes="The journal publishes original empirical research, theoretical articles, methodological contributions, comparative studies, policy analyses, systematic reviews, and critical examinations of social phenomena and institutions."
        researchFocus="Priority is given to research that addresses pressing social issues such as inequality and social justice, migration and globalization, technology and social change, environmental sociology, health and wellbeing, education and social mobility, political participation and governance, and cross-cultural social dynamics within both national and international contexts."
        targetAudience="The journal serves social scientists, policy researchers, practitioners in social services, educators, graduate students, and professionals working in government, NGOs, and international organizations focused on social development and policy implementation."
        subject="Social Sciences"
      />
    </>
  );
}