import { motion } from "framer-motion";
import { BookPlus, Lightbulb, Users, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import StructuredData, { createServiceData } from "@/components/StructuredData";
import BookPublicationForm from "@/components/BookPublicationForm";

export default function CallForBooks() {
  const benefits = [
    {
      icon: CheckCircle,
      title: "DOI & ISBN",
      description: "Every book receives DOI and ISBN registration for global recognition"
    },
    {
      icon: Lightbulb,
      title: "Expert Review",
      description: "Rigorous peer review process by domain experts"
    },
    {
      icon: Users,
      title: "Global Reach",
      description: "Wide distribution and visibility in academic community"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Call for Book Proposals & Chapter Contributions - Scholar India Publishers"
        description="Submit your book proposal or contribute chapters to edited volumes. We welcome research monographs, edited books, and academic contributions in commerce, management, humanities, and social sciences."
        keywords="book proposal submission, call for book chapters, academic book submission, research book proposal, edited volume contribution, book chapter submission, academic publishing call, scholarly book proposal, research monograph submission, PhD thesis book, conference proceedings publication"
      />
      <StructuredData 
        type="Service" 
        data={createServiceData(
          "Call for Book Proposals and Chapters",
          "Submit your book proposals and chapter contributions for peer-reviewed academic publication with DOI and ISBN registration.",
          "Academic Publishing"
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
          <BookPlus className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Call for Book Proposals & Chapters
          </h1>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto">
            Share your research with the academic world through our publication platform
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
                We Invite Book Proposals and Chapter Contributions
              </h2>
              <p className="text-lg mb-4 leading-relaxed text-gray-900 dark:text-gray-200">
                Scholar India Publishers welcomes book proposals and chapter contributions from researchers, 
                academicians, and scholars across the globe. We are committed to publishing high-quality 
                academic work that advances knowledge and contributes to scholarly discourse.
              </p>
              <p className="text-lg mb-4 leading-relaxed text-gray-900 dark:text-gray-200">
                <strong>Types of Publications We Accept:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 text-lg text-gray-900 dark:text-gray-200 ml-4">
                <li>Research Monographs</li>
                <li>Edited Volumes</li>
                <li>Conference Proceedings</li>
                <li>PhD Thesis Publications</li>
                <li>Textbooks and Reference Books</li>
                <li>Individual Book Chapters for Edited Collections</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {benefits.map((benefit, index) => (
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
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
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

        {/* Submission Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 mb-12 overflow-hidden">
            <CardHeader className="bg-[#213361] text-white">
              <CardTitle className="text-2xl text-white">
                Submission Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 text-gray-900 dark:text-gray-200">
                <p className="text-lg">
                  <strong>For Book Proposals:</strong> Submit a detailed proposal including title, abstract, 
                  table of contents, target audience, and author credentials.
                </p>
                <p className="text-lg">
                  <strong>For Chapter Contributions:</strong> Submit your chapter title, abstract (250-300 words), 
                  keywords, and a brief author bio.
                </p>
                <p className="text-lg">
                  <strong>Manuscript Format:</strong> Manuscripts should be submitted in MS Word format (.doc or .docx), 
                  properly formatted with references following a standard citation style (APA, or Chicago).
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Book Publication Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <BookPublicationForm />
        </motion.div>
      </div>
    <Footer />
    </div>
  );
}
