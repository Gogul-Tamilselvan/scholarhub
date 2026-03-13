import { motion } from "framer-motion";
import { BookOpen, Award, FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import StructuredData, { createServiceData } from "@/components/StructuredData";
import BookPublicationForm from "@/components/BookPublicationForm";
import { useState } from "react";

export default function BookPublication() {
  const [showForm, setShowForm] = useState(false);
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
        title="Academic Book Publication with DOI & ISBN - Scholar India Publishers | Chennai"
        description="Publish academic books with DOI and ISBN registration. Professional book publishing for research monographs, edited volumes, conference proceedings. Commerce, management, humanities, social sciences. Chennai, India based publisher with global reach."
        keywords="academic book publication India, book publishing with DOI, ISBN book registration, research book publisher, scholarly book publishing, academic publisher Chennai, book publication services India, research monograph publishing, edited volume publication, PhD thesis publication, conference proceedings book, commerce book publisher, management book publisher, humanities book publisher, social science book publisher, peer-reviewed book publishing, DOI registration India"
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
        {/* Book Publication Form Toggle Button - At Top */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 text-center"
        >
          <Button
            onClick={() => setShowForm(!showForm)}
            size="lg"
            data-testid="button-show-form"
            className="text-xl px-12 py-8 bg-[#213361] hover:bg-[#2a4078] text-white shadow-md transition-colors duration-200"
          >
            {showForm ? "✕ Hide Form" : "📝 Book Publication Submission Form"}
          </Button>
        </motion.div>

        {/* Book Publication Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <BookPublicationForm />
          </motion.div>
        )}

        {/* Introduction Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 mb-12 overflow-hidden">
            <CardHeader className="bg-[#213361] text-white">
              <CardTitle className="text-2xl md:text-3xl font-bold text-white text-center">
                Professional Academic Book Publishing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-lg mb-4 leading-relaxed text-gray-900 dark:text-gray-200">
                Scholar India Publishers offers comprehensive book publication services for researchers, 
                academicians, and scholars. We specialize in publishing academic and research-oriented books 
                across various disciplines including commerce, management, humanities, and social sciences.
              </p>
              <p className="text-lg mb-4 leading-relaxed">
                <strong>All our published books are assigned Digital Object Identifier (DOI) numbers,</strong> ensuring 
                permanent identification, citation tracking, and global recognition in the academic community. 
                This makes your research easily discoverable and citable by scholars worldwide.
              </p>
              <p className="text-lg leading-relaxed">
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
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
            >
              <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 h-full hover-elevate overflow-hidden">
                <div className="h-1 w-full bg-[#213361]" />
                <CardContent className="pt-6">
                  <div className="p-3 rounded-lg bg-[#213361] inline-flex mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{feature.title}</h3>
                  <p className="text-gray-900 dark:text-gray-200">
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
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 overflow-hidden">
            <CardHeader className="bg-[#213361] text-white">
              <CardTitle className="text-2xl text-white">
                Publication Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#213361] text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-blue-900 dark:text-blue-300">Manuscript Submission</h3>
                    <p className="text-gray-700 dark:text-gray-300">Submit your complete manuscript for initial review</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#213361] text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-blue-900 dark:text-blue-300">Peer Review</h3>
                    <p className="text-gray-700 dark:text-gray-300">Expert evaluation and feedback on your work</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#213361] text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-blue-900 dark:text-blue-300">Editing & Formatting</h3>
                    <p className="text-gray-700 dark:text-gray-300">Professional editing and layout design</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#213361] text-white flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-blue-900 dark:text-blue-300">ISBN & DOI Registration</h3>
                    <p className="text-gray-700 dark:text-gray-300">Assignment of ISBN and DOI for your publication</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#213361] text-white flex items-center justify-center font-bold">
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
      </div>
    <Footer />
    </div>
  );
}
