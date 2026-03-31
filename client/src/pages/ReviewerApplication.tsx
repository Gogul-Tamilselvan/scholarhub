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
        title="Join as Peer Reviewer | Scholar India Publishers - Apply Online"
        description="Apply to become a peer reviewer for Scholar India Publishers. Review manuscripts in commerce, management, humanities, or social sciences. Earn reviewer certificates. ORCID preferred. Join our international review panel today."
        keywords="become peer reviewer India, journal reviewer apply online, academic peer reviewer India, manuscript reviewer application, peer review panel India, ORCID reviewer, reviewer certificate journal, commerce management reviewer, humanities social sciences reviewer, peer review opportunity India 2025"
        canonical="https://scholarindiapub.com/join-reviewer"
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
              <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Benefits of Being a Reviewer</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Certificate of Appreciation</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Receive an official certificate for every review you complete, recognizing your valuable contribution to academic research.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Professional Recognition</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Enhance your academic profile and build your reputation as an expert in your field.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Early Access to Research</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Stay at the forefront of your field by reviewing cutting-edge research before publication.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Networking Opportunities</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
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
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
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
