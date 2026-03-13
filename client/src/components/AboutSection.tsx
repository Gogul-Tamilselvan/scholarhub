import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, BookOpen, ArrowRight, CheckCircle2, Megaphone, Sparkles, BookMarked, Bookmark, Users, MessageSquare, Edit3, Share2 } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "wouter";

export default function AboutSection() {
  const [isHoveringNews, setIsHoveringNews] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <section className="w-full py-4 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}>
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 overflow-hidden">
            <CardHeader className="flex flex-col space-y-1 p-4 text-center bg-[#213361] text-white">
              <div>
                <CardTitle className="text-2xl font-serif text-white mb-2">
                  About Us
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-6">
                <p 
                  className="text-base leading-relaxed mb-4 text-gray-900 dark:text-gray-200 text-justify"
                >
                  Scholar India Publishers (SIP) is an International Peer-Reviewed Academic Journals and Book Publishing Excellence Since 2022. 
                  We are an MSME Registered Publisher in Chennai, Tamil Nadu. We publish two distinguished international journals: 
                  Scholar Journal of Commerce and Management and Scholar Journal of Humanities and Social Sciences. 
                  Bringing together academic voices from across the globe with fast publication, DOI assignment, and rigorous double-blind peer review. 
                  We are also engaged in book publication and conference support, providing comprehensive academic publishing solutions to researchers worldwide.
                </p>

                <div 
                  className="grid md:grid-cols-3 gap-4 mb-8"
                >
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-900 dark:text-blue-300 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-800 dark:text-gray-300">Tiruvallur, Chennai - 631402, Tamilnadu, India</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-blue-900 dark:text-blue-300 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-800 dark:text-gray-300">International Reach</span>
                  </div>
                  
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-blue-900 dark:text-blue-300 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-800 dark:text-gray-300">Peer-Reviewed Excellence</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-serif font-semibold mb-6 text-blue-900 dark:text-blue-300">
                    Our Journals
                  </h3>
                  
                  <div className="space-y-5">
                    {/* Commerce and Management Journal */}
                    <motion.div 
                      className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-5 rounded-lg border-2 border-blue-300 dark:border-blue-700 shadow-sm hover:shadow-md transition-all"
                      data-testid="card-journal-commerce"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-md">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-blue-900 dark:text-blue-200 text-base leading-tight">
                            Scholar Journal of Commerce and Management
                          </h4>
                          <Badge className="mt-1.5 bg-blue-600 dark:bg-blue-700 text-white text-xs" data-testid="badge-issn-commerce">
                            ISSN (Online): xxxx
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed text-justify">
                        International peer-reviewed journal for commerce, management, accounting, finance, marketing, business law, economics, entrepreneurship, HRM, and digital transformation research.
                      </p>
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                          <span>Double-blind peer review</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                          <span>Quarterly publication</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                          <span>DOI for all articles</span>
                        </div>
                      </div>
                      <Link href="/commerce-management">
                        <Button 
                          className="w-full bg-[#213361] hover:bg-[#2a4078] dark:bg-blue-700 dark:hover:bg-blue-600 text-white group"
                          size="sm"
                          data-testid="button-view-commerce"
                        >
                          More Info
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </motion.div>
                    
                    {/* Humanities and Social Sciences Journal */}
                    <motion.div 
                      className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-5 rounded-lg border-2 border-blue-300 dark:border-blue-700 shadow-sm hover:shadow-md transition-all"
                      data-testid="card-journal-humanities"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-md">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-blue-900 dark:text-blue-200 text-base leading-tight">
                            Scholar Journal of Humanities and Social Sciences
                          </h4>
                          <Badge className="mt-1.5 bg-blue-600 dark:bg-blue-700 text-white text-xs" data-testid="badge-issn-humanities">
                            ISSN (Online): xxxx
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed text-justify">
                        Leading international journal for humanities research in literature, philosophy, history, linguistics, cultural studies, art history, religious studies, and interdisciplinary humanities. Premier social sciences journal publishing research in sociology, psychology, political science, anthropology, economics, education, social work, and public policy studies.
                      </p>
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                          <span>Double-blind peer review</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                          <span>Quarterly publication</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                          <span>DOI for all articles</span>
                        </div>
                      </div>
                      <Link href="/humanities">
                        <Button 
                          className="w-full bg-[#213361] hover:bg-[#2a4078] dark:bg-blue-700 dark:hover:bg-blue-600 text-white group"
                          size="sm"
                          data-testid="button-view-humanities"
                        >
                          More Info
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-serif font-semibold mb-6 text-blue-900 dark:text-blue-300">
                    Our Services
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: BookMarked, title: "Journal Publication", desc: "Peer review & DOI" },
                      { icon: Bookmark, title: "Book Publication", desc: "ISBN & DOI" },
                      { icon: Users, title: "Conference Support", desc: "Special issues" },
                      { icon: Edit3, title: "Academic Editing", desc: "Professional support" },
                      { icon: MessageSquare, title: "Plagiarism Check", desc: "Quality assurance" },
                      { icon: Share2, title: "Collaboration", desc: "Research partnerships" }
                    ].map((service, idx) => {
                      const IconComponent = service.icon;
                      return (
                        <motion.div 
                          key={idx}
                          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 hover:shadow-md transition-all"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          viewport={{ once: true }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <div className="bg-blue-600 dark:bg-blue-500 p-1.5 rounded-md flex-shrink-0">
                              <IconComponent className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 leading-tight">
                                {service.title}
                              </h4>
                              <p className="text-xs text-gray-700 dark:text-gray-400 mt-0.5">
                                {service.desc}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* News & Upcoming Events - Auto-Scrolling Section */}
                  <motion.div 
                    className="mt-8 pt-6 border-t-2 border-blue-200 dark:border-blue-800"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-serif font-semibold text-blue-900 dark:text-blue-300">
                        News & Events
                      </h3>
                      <Sparkles className="w-4 h-4 text-yellow-500 dark:text-yellow-400 animate-pulse" />
                    </div>
                    
                    <div 
                      className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-700 p-4"
                    >
                      <div className="space-y-3">
                        {[
                          {
                            title: "Call for Book Chapters",
                            description: "Publish your research with DOI and ISBN",
                            link: "/book-publication"
                          },
                          {
                            title: "Submit Your Manuscript",
                            description: "Fast-track peer review in 10-15 days",
                            link: "/submit"
                          },
                          {
                            title: "Join as a Reviewer",
                            description: "Join our distinguished review panel",
                            link: "/join-reviewer"
                          }
                        ].map((item, index) => (
                          <motion.div 
                            key={index} 
                            className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-blue-200 dark:border-blue-700 min-h-fit relative overflow-hidden"
                            whileHover={{ scale: 1.01 }}
                          >
                            <motion.div
                              className="absolute inset-0 bg-blue-50/50 dark:bg-blue-400/5 pointer-events-none"
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ 
                                duration: 3, 
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: index * 1
                              }}
                            />
                            <div className="relative z-10">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-[#213361] animate-pulse" />
                                <h4 className="font-bold text-sm text-blue-900 dark:text-blue-200">
                                  {item.title}
                                </h4>
                              </div>
                              <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                                {item.description}
                              </p>
                              <Button 
                                size="sm"
                                variant="outline"
                                className="border-blue-200 hover:bg-blue-50 text-blue-900 dark:text-blue-200 text-xs h-7 cursor-pointer"
                                data-testid={`button-news-professional-${index}`}
                                onClick={() => setLocation(item.link)}
                              >
                                Learn More →
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
