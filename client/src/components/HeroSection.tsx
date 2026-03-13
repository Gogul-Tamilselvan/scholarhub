import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, GraduationCap, Globe } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const journals = [
  {
    icon: BookOpen,
    iconBg: "bg-[#213361]",
    accentBorder: "border-blue-400",
    accentBar: "bg-[#213361]",
    btnClass: "bg-[#213361] hover:bg-[#2a4078] text-white",
    title: "Scholar Journal of Commerce and Management",
    description:
      "International peer-reviewed journal for commerce, management, accounting, finance, marketing, business law, economics, entrepreneurship, HRM, and digital transformation research.",
    href: "/commerce-management",
    testId: "button-journal-commerce",
    cardTestId: "card-journal-commerce",
  },
  {
    icon: GraduationCap,
    iconBg: "bg-indigo-700",
    accentBorder: "border-indigo-400",
    accentBar: "bg-indigo-700",
    btnClass: "bg-indigo-700 hover:bg-indigo-800 text-white",
    title: "Scholar Journal of Humanities",
    description:
      "Leading international journal for humanities research in literature, philosophy, history, linguistics, cultural studies, art history, religious studies, and interdisciplinary humanities.",
    href: "/humanities",
    testId: "button-journal-humanities",
    cardTestId: "card-journal-humanities",
  },
  {
    icon: Globe,
    iconBg: "bg-teal-700",
    accentBorder: "border-teal-400",
    accentBar: "bg-teal-700",
    btnClass: "bg-teal-700 hover:bg-teal-800 text-white",
    title: "Scholar Journal of Social Sciences",
    description:
      "Premier social sciences journal publishing research in sociology, psychology, political science, anthropology, economics, education, social work, and public policy studies.",
    href: "/social-sciences",
    testId: "button-journal-social",
    cardTestId: "card-journal-social",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  hover: {
    y: -8,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

export default function HeroSection() {
  return (
    <section className="w-full py-14 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-4xl md:text-5xl font-serif font-bold text-blue-900 dark:text-blue-200 mb-3"
            variants={itemVariants}
          >
            Scholar India Publishers
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-300"
            variants={itemVariants}
          >
            International Peer-Reviewed Academic Journals
          </motion.p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {journals.map((journal, idx) => {
            const Icon = journal.icon;
            return (
              <motion.div key={idx} variants={cardVariants} whileHover="hover">
                <Card
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 h-full overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  data-testid={journal.cardTestId}
                >
                  {/* Accent top bar */}
                  <div className={`h-1.5 w-full ${journal.accentBar}`} />
                  <CardContent className="p-6 flex flex-col h-[calc(100%-6px)]">
                    <div className={`inline-flex p-3 rounded-lg ${journal.iconBg} mb-4 self-start`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-serif font-semibold mb-3 text-gray-900 dark:text-gray-100 leading-snug">
                      {journal.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed flex-1">
                      {journal.description}
                    </p>
                    <Link href={journal.href}>
                      <Button
                        size="sm"
                        className={`w-full ${journal.btnClass}`}
                        data-testid={journal.testId}
                      >
                        More Info
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
