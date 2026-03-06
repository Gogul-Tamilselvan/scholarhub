import { motion } from "framer-motion";
import { UserCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import ReviewerApplicationForm from "@/components/ReviewerApplicationForm";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function ReviewerApplication() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Become a Peer Reviewer - Join Scholar India Publishers Review Panel | Apply Online"
        description="Join our international peer review panel. Review manuscripts in commerce, management, humanities, or social sciences. ORCID required. Certificate for every review completed. Apply online to become a reviewer for Scholar India Publishers journals."
        keywords="become peer reviewer India, journal reviewer application, academic reviewer, manuscript reviewer, peer review panel, research reviewer, ORCID reviewer, journal review opportunity, scholarly reviewer application, academic peer reviewer, commerce reviewer, management reviewer, humanities reviewer, social sciences reviewer, international journal reviewer, reviewer certificate, peer review India"
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
          <UserCheck className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Join Us as a Reviewer
          </h1>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto">
            We invite scholars and researchers to join our peer review panel. 
            Help maintain academic excellence by reviewing manuscripts in your area of expertise.
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        {/* Benefits and Responsibilities Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-card text-card-foreground overflow-hidden border-2 border-[#213361]/20">
            <CardHeader className="bg-[#213361] text-white">
              <CardTitle className="text-2xl font-serif text-white">Why Become a Reviewer?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-300">Benefits of Being a Reviewer</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200">Certificate of Appreciation</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Receive an official certificate for every review you complete, recognizing your valuable contribution to academic research.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200">Professional Recognition</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Enhance your academic profile and build your reputation as an expert in your field.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200">Early Access to Research</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Stay at the forefront of your field by reviewing cutting-edge research before publication.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200">Networking Opportunities</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Connect with researchers and scholars from around the world.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Roles and Responsibilities Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Peer Reviewer Role */}
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-700 overflow-hidden">
            <CardHeader className="bg-[#213361] text-white">
              <CardTitle className="text-xl text-white">Peer Reviewer Role</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Responsibilities:</h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>Evaluate scholarly merit, originality, and significance of submitted manuscripts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>Assess research methodology, validity, and accuracy of findings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>Provide constructive and timely peer review feedback within 15-20 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>Maintain confidentiality of the review process</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>Recommend acceptance, rejection, or revisions based on quality assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>Contribute to maintaining academic integrity and publishing standards</span>
                  </li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Typical Commitment:</strong> 2-3 manuscripts per year, 15-20 days review turnaround
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Editorial Board Member Role */}
          <Card className="bg-white dark:bg-gray-900 border-emerald-200 dark:border-emerald-700 overflow-hidden">
            <CardHeader className="bg-[#213361] text-white">
              <CardTitle className="text-xl text-white">Editorial Board Member</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Responsibilities:</h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span>Guide journal editorial direction and publishing policy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span>Identify and recruit quality manuscripts and expert reviewers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span>Conduct thorough peer reviews of assigned manuscripts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span>Provide editorial recommendations to Editor-in-Chief</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span>Attend editorial board meetings and strategic planning sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span>Ensure alignment with journal's mission and academic standards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span>Support journal visibility and impact in the academic community</span>
                  </li>
                </ul>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950 p-4 rounded-md">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Typical Commitment:</strong> Board member position (2-3 year term), 4-6 manuscripts annually
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Application Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ReviewerApplicationForm />
        </motion.div>
      </div>
      
    <Footer />
    </div>
  );
}
