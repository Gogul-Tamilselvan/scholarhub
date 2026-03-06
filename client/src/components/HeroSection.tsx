import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="w-full py-12 bg-blue-50 dark:bg-blue-950/20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div 
          className="mb-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-serif font-bold text-blue-900 dark:text-blue-300 mb-3"
            variants={itemVariants}
          >
            Scholar India Publishers
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-700 dark:text-gray-300 mb-12"
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
          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 h-full" data-testid="card-journal-commerce">
              <CardContent className="p-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <BookOpen className="h-12 w-12 text-blue-900 dark:text-blue-300 mb-4 mx-auto" />
                </motion.div>
                <h3 className="text-xl font-serif font-semibold mb-3 text-blue-900 dark:text-blue-300">
                  Scholar Journal of Commerce and Management
                </h3>
                <p className="text-sm mb-4 text-gray-900 dark:text-gray-200">
                  International peer-reviewed journal for commerce, management, accounting, 
                  finance, marketing, business law, economics, entrepreneurship, HRM, and 
                  digital transformation research.
                </p>
                <Link href="/commerce-management">
                  <Button variant="outline" size="sm" data-testid="button-journal-commerce">
                    More Info
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 h-full" data-testid="card-journal-humanities">
              <CardContent className="p-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 0.5 }}
                >
                  <BookOpen className="h-12 w-12 text-blue-900 dark:text-blue-300 mb-4 mx-auto" />
                </motion.div>
                <h3 className="text-xl font-serif font-semibold mb-3 text-blue-900 dark:text-blue-300">
                  Scholar Journal of Humanities
                </h3>
                <p className="text-sm mb-4 text-gray-900 dark:text-gray-200">
                  Leading international journal for humanities research in literature, philosophy, 
                  history, linguistics, cultural studies, art history, religious studies, and 
                  interdisciplinary humanities.
                </p>
                <Link href="/humanities">
                  <Button variant="outline" size="sm" data-testid="button-journal-humanities">
                    More Info
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 h-full" data-testid="card-journal-social">
              <CardContent className="p-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 1 }}
                >
                  <BookOpen className="h-12 w-12 text-blue-900 dark:text-blue-300 mb-4 mx-auto" />
                </motion.div>
                <h3 className="text-xl font-serif font-semibold mb-3 text-blue-900 dark:text-blue-300">
                  Scholar Journal of Social Sciences
                </h3>
                <p className="text-sm mb-4 text-gray-900 dark:text-gray-200">
                  Premier social sciences journal publishing research in sociology, psychology, 
                  political science, anthropology, economics, education, social work, and 
                  public policy studies.
                </p>
                <Link href="/social-sciences">
                  <Button variant="outline" size="sm" data-testid="button-journal-social">
                    More Info
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}