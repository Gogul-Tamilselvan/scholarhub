import { motion } from "framer-motion";
import { BookOpen, Award, FileCheck, ArrowRight, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import StructuredData, { createServiceData } from "@/components/StructuredData";

export default function BookPublicationInfo() {
  const features = [
    {
      icon: BookOpen,
      title: "Quality Publishing",
      description: "We publish high-quality academic and research books across various disciplines with rigorous peer review process."
    },
    {
      icon: Award,
      title: "DOI Assignment",
      description: "All published books receive Digital Object Identifier (DOI) numbers for permanent identification and citation tracking."
    },
    {
      icon: FileCheck,
      title: "ISBN Registration",
      description: "Every publication is registered with ISBN for global recognition and distribution."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Publish Your Academic Book with DOI & ISBN | Scholar India Publishers"
        description="Publish academic and research books with DOI and ISBN through Scholar India Publishers. Research monographs, edited volumes, conference proceedings in Commerce, Management, Humanities & Social Sciences. Chennai-based publisher with global reach."
        keywords="academic book publication India, book publishing with DOI India, ISBN book registration India, research book publisher Chennai, scholarly book publishing, PhD thesis publication India, edited volume publication, conference proceedings book India, commerce book publisher, humanities book publisher, book publication services academic"
        canonical="https://scholarindiapub.com/book-publication-info"
      />
      <StructuredData 
        type="Service" 
        data={createServiceData(
          "Academic Book Publication Services",
          "Professional book publishing services with DOI assignment and ISBN registration for academic and research books across various disciplines.",
          "Book Publishing"
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
          <BookOpen className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Book Publication Services
          </h1>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto">
            Publish your research and academic books with DOI registration
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
                Professional Academic Book Publishing
              </h2>
              <p className="text-lg mb-4 leading-relaxed text-gray-900 dark:text-gray-200">
                Scholar India Publishers offers comprehensive book publication services for researchers, 
                academicians, and scholars. We specialize in publishing academic and research-oriented books 
                across various disciplines including commerce, management, humanities, and social sciences.
              </p>
              <p className="text-lg mb-4 leading-relaxed text-gray-900 dark:text-gray-200">
                <strong>All our published books are assigned Digital Object Identifier (DOI) numbers,</strong> ensuring 
                permanent identification, citation tracking, and global recognition in the academic community. 
                This makes your research easily discoverable and citable by scholars worldwide.
              </p>
              <p className="text-lg leading-relaxed text-gray-900 dark:text-gray-200">
                We handle the entire publishing process from manuscript review to final publication, including 
                ISBN registration, DOI assignment, copyright management, and global distribution.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 h-full hover-elevate overflow-hidden shadow-sm">
                <div className="h-1 w-full bg-[#213361]" />
                <CardContent className="p-6">
                  <div className="p-3 rounded-lg bg-[#213361] inline-flex mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Publication Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 overflow-hidden">
            <CardHeader className="bg-[#213361] text-white">
              <CardTitle className="text-2xl text-white">
                Publication Process
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-600 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-blue-900 dark:text-blue-300">Manuscript Submission</h3>
                    <p className="text-gray-700 dark:text-gray-300">Submit your complete manuscript for initial review</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-600 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-blue-900 dark:text-blue-300">Peer Review</h3>
                    <p className="text-gray-700 dark:text-gray-300">Expert evaluation and feedback on your work</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-600 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-blue-900 dark:text-blue-300">Editing & Formatting</h3>
                    <p className="text-gray-700 dark:text-gray-300">Professional editing and layout design</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-600 text-white flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-blue-900 dark:text-blue-300">ISBN & DOI Registration</h3>
                    <p className="text-gray-700 dark:text-gray-300">Assignment of ISBN and DOI for your publication</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-600 text-white flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-blue-900 dark:text-blue-300">Publication & Distribution</h3>
                    <p className="text-gray-700 dark:text-gray-300">Final publication and global distribution</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action - Submit Book Proposal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/30 dark:via-gray-900 dark:to-blue-950/30 border-2 border-blue-300 dark:border-blue-700 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                    <Send className="w-8 h-8 text-blue-900 dark:text-blue-300" />
                    <h3 className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-300">
                      Ready to Publish Your Book?
                    </h3>
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                    Submit your book proposal or chapter contribution today
                  </p>
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    Join our growing community of published authors worldwide
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Link href="/call-for-books">
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-6 text-lg font-semibold group"
                      data-testid="button-submit-proposal"
                    >
                      Submit Book Proposal
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    <Footer />
    </div>
  );
}
