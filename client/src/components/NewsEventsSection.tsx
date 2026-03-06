import { motion } from "framer-motion";
import { Megaphone, BookOpen, FileText, UserCheck, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NewsEventsSection() {
  const newsItems = [
    {
      icon: BookOpen,
      title: "Call for Book Chapters",
      description: "Publish your research as a book chapter with DOI and ISBN registration",
      link: "/book-publication",
      gradient: "from-purple-600 to-blue-600"
    },
    {
      icon: FileText,
      title: "Submit Your Manuscript",
      description: "Fast-track peer review with 10-15 day turnaround time",
      link: "/submit",
      gradient: "from-blue-600 to-indigo-600"
    },
    {
      icon: UserCheck,
      title: "Join as a Reviewer",
      description: "Become part of our distinguished panel of peer reviewers",
      link: "/join-reviewer",
      gradient: "from-indigo-600 to-purple-600"
    }
  ];

  return (
    <section className="w-full py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Megaphone className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h2 className="text-4xl font-serif font-bold text-gray-900 dark:text-white">
              News & Upcoming Events
            </h2>
            <Sparkles className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Stay updated with our latest opportunities and announcements
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {newsItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all hover:shadow-xl group">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                    {item.description}
                  </p>
                  
                  <Link href={item.link}>
                    <Button 
                      className={`w-full bg-gradient-to-r ${item.gradient} hover:opacity-90 text-white font-semibold shadow-lg`}
                      data-testid={`button-news-${index}`}
                    >
                      Learn More →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
