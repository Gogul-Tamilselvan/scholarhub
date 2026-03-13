import { motion } from "framer-motion";
import { FileText, Sparkles, Globe, Users2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import StructuredData, { createServiceData } from "@/components/StructuredData";

export default function OtherServices() {
  const services = [
    {
      icon: FileText,
      title: "Manuscript Editing & Proofreading",
      description: "Professional editing services to enhance the quality and clarity of your research manuscripts before submission."
    },
    {
      icon: Sparkles,
      title: "Plagiarism Check",
      description: "Comprehensive plagiarism detection and similarity check services to ensure originality of your work."
    },
    {
      icon: Globe,
      title: "Translation Services",
      description: "Academic translation services for research papers and manuscripts in multiple languages."
    },
    {
      icon: Users2,
      title: "Research Collaboration",
      description: "Platform to connect with researchers and collaborate on interdisciplinary research projects."
    }
  ];

  const additionalServices = [
    "Copyright registration and management",
    "Research consultation and guidance",
    "Citation and reference formatting",
    "Academic writing workshops",
    "Journal selection assistance",
    "Indexing and archiving support"
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Research Support Services - Editing, Plagiarism Check & Translation | Scholar India"
        description="Professional academic support services: manuscript editing, proofreading, plagiarism detection, academic translation, research collaboration, citation formatting, copyright registration. Expert support for researchers in India and globally."
        keywords="manuscript editing services India, academic proofreading, plagiarism check India, Turnitin similarity check, academic translation services, research paper editing, English language editing, thesis editing India, dissertation editing, journal article editing, research collaboration platform, citation formatting, reference management, copyright registration India, academic writing support, research consultation India, journal selection help, manuscript formatting services"
      />
      <StructuredData 
        type="Service" 
        data={createServiceData(
          "Academic Research Support Services",
          "Comprehensive research support including manuscript editing, plagiarism check, academic translation, and research collaboration for academics and researchers.",
          "Academic Support"
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
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Other Academic Services
          </h1>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto">
            Comprehensive support services for researchers and academicians
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
                Supporting Your Research Journey
              </h2>
              <p className="text-lg mb-4 leading-relaxed text-gray-900 dark:text-gray-200">
                Beyond journal and book publication, Scholar India Publishers offers a range of additional 
                services to support researchers, academicians, and scholars throughout their research journey.
              </p>
              <p className="text-lg leading-relaxed">
                Our comprehensive suite of services is designed to help you enhance the quality of your research, 
                ensure compliance with academic standards, and maximize the impact of your scholarly work.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Services Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
            >
              <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 h-full hover-elevate overflow-hidden shadow-sm">
                <div className="h-1 w-full bg-[#213361]" />
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[#213361] flex-shrink-0">
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
                        {service.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mb-12"
        >
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 overflow-hidden">
            <CardHeader className="bg-[#213361] text-white">
              <CardTitle className="text-2xl text-white">
                Additional Support Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {additionalServices.map((service, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-[#213361] dark:bg-blue-400 mt-2 flex-shrink-0" />
                    <p className="text-gray-800 dark:text-gray-300">{service}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mb-12"
        >
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 overflow-hidden">
            <CardHeader className="bg-[#213361] text-white">
              <CardTitle className="text-2xl text-white">
                Why Choose Our Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Expert Team</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Our team consists of experienced editors, researchers, and academic professionals
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Quality Assurance</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    We maintain the highest standards of quality and academic integrity in all our services
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Timely Delivery</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    We understand the importance of deadlines and ensure prompt delivery of all services
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="text-center"
        >
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-300">
                Need Assistance with Your Research?
              </h3>
              <p className="text-lg mb-6 text-gray-900 dark:text-gray-200">
                Contact us to learn more about our services and how we can help you achieve your academic goals.
              </p>
              <a
                href="/contact"
                data-testid="link-contact-services"
                className="inline-block bg-[#213361] text-yellow-400 px-8 py-3 rounded-lg font-semibold hover:bg-[#2a4078] active:bg-[#1a2850] transition-all"
              >
                Contact Us
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    <Footer />
    </div>
  );
}
