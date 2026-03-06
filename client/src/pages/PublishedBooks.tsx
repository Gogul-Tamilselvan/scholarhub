import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import StructuredData, { createOrganizationData } from "@/components/StructuredData";

export default function PublishedBooks() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Published Books - Scholar India Publishers"
        description="Browse our collection of published academic books in commerce, management, humanities, and social sciences. All books come with DOI and ISBN registration."
        keywords="published academic books, research books India, scholarly publications, academic books catalogue, published research monographs, DOI books, ISBN books, commerce books, management books, humanities books, social science books"
      />
      <StructuredData 
        type="Organization" 
        data={createOrganizationData()} 
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
            Published Books
          </h1>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 overflow-hidden">
            <CardHeader className="bg-[#213361] text-white text-center">
              <CardTitle className="text-2xl text-white">Catalogue of Academic Books</CardTitle>
            </CardHeader>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-20 h-20 mx-auto mb-6 text-blue-900 dark:text-blue-300" />
              <p className="text-xl leading-relaxed text-gray-900 dark:text-gray-200">
                We are currently building our collection of published academic books (both print and online).
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    <Footer />
    </div>
  );
}
