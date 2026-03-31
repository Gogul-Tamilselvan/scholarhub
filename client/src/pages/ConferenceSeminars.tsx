import { motion } from "framer-motion";
import { Users, BookOpenCheck, Calendar, Award, Video, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import StructuredData, { createServiceData } from "@/components/StructuredData";

export default function ConferenceSeminars() {
  const benefits = [
    {
      icon: Calendar,
      title: "Timely Publication",
      description: "Fast-track publication process for conference proceedings and special issues."
    },
    {
      icon: Users,
      title: "Collaborative Platform",
      description: "Bring together researchers and scholars from your conference or seminar."
    },
    {
      icon: Award,
      title: "Peer-Reviewed",
      description: "All papers undergo rigorous double-blind peer review process."
    },
    {
      icon: BookOpenCheck,
      title: "DOI & Indexing",
      description: "Every article receives DOI and is indexed in major academic databases."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Publish Conference Proceedings & Special Issues | Scholar India Publishers"
        description="Publish your conference proceedings and special issues with fast-track peer review and DOI for all papers. Support for international conferences, national seminars, workshops, and symposiums. Based in Chennai, India."
        keywords="conference proceedings publication India, special issue journal India, seminar proceedings publishing, academic conference publication, conference paper DOI India, fast-track peer review conference, indexed conference proceedings, international conference publication India, national seminar proceedings, workshop publication India"
        canonical="https://scholarindiapub.com/conference-seminars"
      />
      <StructuredData 
        type="Service" 
        data={createServiceData(
          "Conference Proceedings & Special Issue Publication",
          "Fast-track publication of conference proceedings and special issues with peer review, DOI assignment, and academic database indexing. Includes research methodology and academic writing workshops.",
          "Academic Conference Publication"
        )} 
      />
      <Header />
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#213361] py-16 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <Users className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Conference & Seminar Proceedings
          </h1>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto">
            Special issue publication services for academic conferences and seminars
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Introduction Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-blue-900 dark:text-blue-300">
                Special Issues for Conferences & Seminars
              </h2>
              <p className="text-lg mb-4 leading-relaxed text-gray-900 dark:text-gray-200">
                Scholar India Publishers offers <strong>special issue publication services</strong> for academic 
                conferences, seminars, workshops, and symposiums. We provide a dedicated platform for publishing 
                selected high-quality papers from your academic events.
              </p>
              <p className="text-lg mb-4 leading-relaxed">
                Our special issues undergo the same rigorous peer-review process as our regular publications, 
                ensuring the highest academic standards. Each published article receives a <strong>DOI (Digital 
                Object Identifier)</strong> and is indexed in major academic databases for maximum visibility 
                and citation potential.
              </p>
              <p className="text-lg leading-relaxed">
                Whether you're organizing a national conference, international seminar, or specialized workshop, 
                we provide comprehensive publishing support from submission to final publication.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
            >
              <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 h-full hover-elevate overflow-hidden shadow-sm">
                <div className="h-1 w-full bg-[#213361]" />
                <CardContent className="p-5">
                  <div className="p-2.5 rounded-lg bg-[#213361] inline-flex mb-3">
                    <benefit.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Services Offered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-12"
        >
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 overflow-hidden">
            <CardHeader className="bg-[#213361] text-white">
              <CardTitle className="text-2xl text-white">
                What We Offer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-lg text-blue-900 dark:text-blue-300">For Conference Organizers</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2 text-gray-800 dark:text-gray-300">
                      <span className="font-bold text-blue-900 dark:text-blue-300">•</span>
                      Dedicated special issue for your conference
                    </li>
                    <li className="flex gap-2 text-gray-800 dark:text-gray-300">
                      <span className="font-bold text-blue-900 dark:text-blue-300">•</span>
                      Customized submission and review portal
                    </li>
                    <li className="flex gap-2 text-gray-800 dark:text-gray-300">
                      <span className="font-bold text-blue-900 dark:text-blue-300">•</span>
                      Guest editor support and coordination
                    </li>
                    <li className="flex gap-2 text-gray-800 dark:text-gray-300">
                      <span className="font-bold text-blue-900 dark:text-blue-300">•</span>
                      Promotional support for your event
                    </li>
                    <li className="flex gap-2 text-gray-800 dark:text-gray-300">
                      <span className="font-bold text-blue-900 dark:text-blue-300">•</span>
                      Post-conference publication timeline
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-lg text-blue-900 dark:text-blue-300">For Authors</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2 text-gray-800 dark:text-gray-300">
                      <span className="font-bold text-blue-900 dark:text-blue-300">•</span>
                      Fast-track peer review process
                    </li>
                    <li className="flex gap-2 text-gray-800 dark:text-gray-300">
                      <span className="font-bold text-blue-900 dark:text-blue-300">•</span>
                      DOI assignment for every article
                    </li>
                    <li className="flex gap-2 text-gray-800 dark:text-gray-300">
                      <span className="font-bold text-blue-900 dark:text-blue-300">•</span>
                      Open access publication option
                    </li>
                    <li className="flex gap-2 text-gray-800 dark:text-gray-300">
                      <span className="font-bold text-blue-900 dark:text-blue-300">•</span>
                      Global indexing and visibility
                    </li>
                    <li className="flex gap-2 text-gray-800 dark:text-gray-300">
                      <span className="font-bold text-blue-900 dark:text-blue-300">•</span>
                      Professional publication certificates
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Publication Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mb-12"
        >
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 overflow-hidden">
            <CardHeader className="bg-[#213361] text-white">
              <CardTitle className="text-2xl text-white">
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-600 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-blue-900 dark:text-blue-300">Contact & Proposal</h3>
                    <p className="text-gray-700 dark:text-gray-300">Reach out to us with your conference/seminar details and publication requirements</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-600 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-blue-900 dark:text-blue-300">Agreement & Setup</h3>
                    <p className="text-gray-700 dark:text-gray-300">Finalize terms and set up dedicated submission portal for your event</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-600 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-blue-900 dark:text-blue-300">Paper Submission</h3>
                    <p className="text-gray-700 dark:text-gray-300">Authors submit their conference papers for review</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-600 text-white flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-blue-900 dark:text-blue-300">Peer Review & Revision</h3>
                    <p className="text-gray-700 dark:text-gray-300">Rigorous double-blind peer review and author revisions</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-600 text-white flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-blue-900 dark:text-blue-300">Publication</h3>
                    <p className="text-gray-700 dark:text-gray-300">Final publication with DOI assignment and indexing</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Workshops & Webinars Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mb-12"
        >
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 overflow-hidden">
            <CardHeader className="bg-[#213361] text-white">
              <div className="flex items-center gap-3 mb-2">
                <Video className="w-8 h-8 text-yellow-400" />
                <CardTitle className="text-2xl text-white">
                  Workshops & Webinars
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-6 leading-relaxed text-gray-900 dark:text-gray-200">
                Scholar India Publishers organizes <strong>academic workshops and webinars</strong> designed to 
                enhance research skills and promote scholarly excellence. Our expert-led sessions cover essential 
                topics in academic research and publication.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <GraduationCap className="w-6 h-6 text-blue-900 dark:text-blue-300 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-blue-900 dark:text-blue-300">Research Methodology</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Comprehensive training on quantitative and qualitative research methods, 
                        research design, sampling techniques, and data collection strategies.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <GraduationCap className="w-6 h-6 text-blue-900 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Academic Writing Skills</h3>
                      <p className="text-sm text-muted-foreground">
                        Learn effective academic writing techniques, manuscript preparation, 
                        citation management, and how to structure research papers for publication.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <GraduationCap className="w-6 h-6 text-blue-900 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Statistical Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Hands-on training in statistical tools and software like SPSS, R, and Excel 
                        for data analysis, hypothesis testing, and result interpretation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <GraduationCap className="w-6 h-6 text-blue-900 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Publication Ethics</h3>
                      <p className="text-sm text-muted-foreground">
                        Understanding plagiarism, authorship guidelines, research ethics, 
                        peer review process, and maintaining academic integrity.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <GraduationCap className="w-6 h-6 text-blue-900 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Literature Review Techniques</h3>
                      <p className="text-sm text-muted-foreground">
                        Master the art of conducting systematic literature reviews, 
                        identifying research gaps, and synthesizing scholarly work.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <GraduationCap className="w-6 h-6 text-blue-900 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Journal Selection & Submission</h3>
                      <p className="text-sm text-muted-foreground">
                        Guidance on selecting appropriate journals, understanding impact factors, 
                        and navigating the submission and revision process.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Workshop & Webinar Features:</h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex gap-2 items-start">
                    <span className="font-bold text-blue-900">✓</span>
                    <span className="text-sm">Expert faculty from renowned institutions</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="font-bold text-blue-900">✓</span>
                    <span className="text-sm">Interactive live sessions with Q&A</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="font-bold text-blue-900">✓</span>
                    <span className="text-sm">Practical hands-on exercises and case studies</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="font-bold text-blue-900">✓</span>
                    <span className="text-sm">Certificates of participation</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="font-bold text-blue-900">✓</span>
                    <span className="text-sm">Access to recorded sessions and materials</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="font-bold text-blue-900">✓</span>
                    <span className="text-sm">Networking opportunities with researchers</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="mt-12 text-center"
        >
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-300">
                Plan a Special Issue or Collaborate With Us?
              </h3>
              <p className="text-lg mb-6 text-gray-900 dark:text-gray-200">
                Contact us to discuss special issue publication or collaboration opportunities for your upcoming conferences, seminars, webinars, or workshops.
              </p>
              <a
                href="/contact"
                data-testid="link-contact-conference"
                className="inline-block bg-[#213361] text-yellow-400 px-8 py-3 rounded-lg font-semibold hover:bg-[#2a4078] active:bg-[#1a2850] transition-all"
              >
                Get in Touch
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    <Footer />
    </div>
  );
}
