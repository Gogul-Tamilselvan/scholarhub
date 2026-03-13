import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Award, 
  BookOpen, 
  Target, 
  Globe, 
  CheckCircle2,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Zap,
  Heart
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function About() {
  const stats = [
    { label: "Founded", value: "2022", icon: Calendar },
    { label: "Journals", value: "2", icon: BookOpen },
    { label: "Countries", value: "Global", icon: Globe },
    { label: "Review Time", value: "10-15 Days", icon: Zap },
    { label: "ISBN Publications", value: "Growing", icon: Award }
  ];

  const values = [
    {
      icon: Shield,
      title: "Academic Integrity",
      description: "Double-blind peer review and plagiarism screening ensure the highest scholarly standards"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Open access publishing makes research freely available to readers worldwide"
    },
    {
      icon: Zap,
      title: "Fast Publishing",
      description: "Quick turnaround from submission to publication without compromising quality"
    },
    {
      icon: Heart,
      title: "Researcher-Focused",
      description: "Transparent pricing, professional support, and commitment to advancing knowledge"
    }
  ];

  const journals = [
    {
      title: "Commerce & Management",
      abbr: "SJCM",
      href: "/commerce-management",
      color: "blue",
      description: "Business, finance, marketing, economics, and digital transformation research"
    },
    {
      title: "Humanities and Social Sciences",
      abbr: "SJHSS",
      href: "/humanities",
      color: "purple",
      description: "Literature, philosophy, history, linguistics, cultural studies, sociology, psychology, political science, education, and social sciences research"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About Scholar India Publishers - MSME Registered Academic Publisher | Chennai"
        description="Learn about Scholar India Publishers, an MSME registered academic publisher (2022) founded by Mr. Kalaiarasan C. Publishing international peer-reviewed journals in commerce, humanities, and social sciences from Chennai, India."
        keywords="about scholar india publishers, MSME publisher India, academic publisher Chennai, Mr. Kalaiarasan C, international journal publisher, peer-reviewed journals India, research publisher Tamil Nadu"
      />
      <Header />
      {/* Hero Section */}
      <div className="relative bg-[#213361] py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-6">
              <div className="bg-yellow-400/10 border-2 border-yellow-400/30 rounded-full px-6 py-2">
                <p className="text-yellow-400 font-semibold text-sm tracking-wide">
                  MSME REGISTERED (UDYAM-TN-24-0029566) • EST. 2022
                </p>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Scholar India Publishers
            </h1>
            <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed">International Peer-Reviewed Academic Journals and Book Publishing Excellence Since 2022</p>
          </motion.div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16 -mt-24 relative z-10"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="bg-card border-2 border-blue-200 dark:border-blue-800 text-center">
              <CardContent className="p-6">
                <stat.icon className="h-8 w-8 text-blue-900 dark:text-blue-300 mx-auto mb-3" />
                <div className="text-3xl font-bold text-card-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Our Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Our Story
            </h2>
            <div className="w-20 h-1 bg-[#213361] mx-auto"></div>
          </div>

          <Card className="bg-card border-2 border-primary/20 overflow-hidden">
            <CardHeader className="bg-[#213361] text-white p-6">
              <CardTitle className="text-2xl text-white text-center">Democratizing Access to Research</CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-12">
              <div className="max-w-4xl mx-auto space-y-6 text-lg text-card-foreground leading-relaxed">
                <p className="text-justify">
                  <strong>Scholar India Publishers</strong> was founded in 2022 with a clear mission: to democratize access to quality academic research and provide a platform for scholars worldwide to share their groundbreaking work.
                </p>
                <p className="text-justify">
                  Officially registered as an <strong>MSME (Micro, Small and Medium Enterprises)</strong> with Registration ID <strong>UDYAM-TN-24-0029566</strong>, we are based in <strong>Chennai, Tamil Nadu, India</strong>, and proudly serve the international research community. Our commitment to academic excellence, transparency, and ethical publishing practices has quickly established us as a trusted partner for researchers across diverse disciplines.
                </p>
                <p className="text-justify">
                  Through our two peer-reviewed journals, we publish cutting-edge research in commerce, humanities, and social sciences—making scholarly knowledge freely accessible while maintaining the highest standards of academic rigor through double-blind peer review.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Our Journals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Our Journals
            </h2>
            <div className="w-20 h-1 bg-[#213361] mx-auto mb-4"></div>
            <p className="max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
              Two international peer-reviewed journals covering diverse academic disciplines
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {journals.map((journal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={journal.href}>
                  <Card className={`h-full bg-card border-2 border-${journal.color}-500/30 hover-elevate active-elevate-2 cursor-pointer group transition-all`}>
                    <CardContent className="p-8">
                      <div className="mb-4">
                        <BookOpen className={`h-12 w-12 text-${journal.color}-500 mb-4`} />
                        <div className="text-sm font-bold mb-2 text-blue-900 dark:text-blue-300">{journal.abbr}</div>
                        <h3 className="text-xl font-bold text-card-foreground mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                          Scholar Journal of {journal.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {journal.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Our Commitment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Our Commitment
            </h2>
            <div className="w-20 h-1 bg-[#213361] mx-auto mb-4"></div>
            <p className="max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
              Values that drive everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-card border-2 border-primary/20 h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="rounded-lg p-3 border border-yellow-400/30 bg-[#2923091a]">
                          <value.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-card-foreground mb-2">
                          {value.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <Card className="bg-card border-2 border-blue-200 dark:border-blue-800 overflow-hidden">
            <CardHeader className="bg-[#213361] text-white text-center py-8">
              <CardTitle className="text-2xl md:text-3xl font-bold text-white">Why Publish With Us?</CardTitle>
              <CardDescription className="text-blue-100">We combine academic rigor with efficiency and transparency</CardDescription>
            </CardHeader>
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Shield, label: "Rigorous peer review" },
                  { icon: Globe, label: "Global indexing" },
                  { icon: Zap, label: "10-15 day review" },
                  { icon: CheckCircle2, label: "DOI assignment" },
                  { icon: BookOpen, label: "Open access" },
                  { icon: Award, label: "Quality assurance" },
                  { icon: Target, label: "Transparent pricing" },
                  { icon: Heart, label: "Author support" }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center text-center p-4">
                    <div className="rounded-full p-4 mb-3 bg-[#213361]">
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-card-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mission & Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card border-2 border-[#213361]/30">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-[#213361]/10 rounded-lg p-3 border border-[#213361]/30">
                    <Target className="h-6 w-6 text-[#213361] dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground">Our Mission</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To provide an accessible platform for researchers worldwide to publish high-quality, peer-reviewed work that advances knowledge and addresses global challenges.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-2 border-purple-500/30">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
                    <Globe className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground">Our Vision</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To be a globally recognized publisher known for excellence, integrity, and innovation in scholarly communication, bridging research and real-world impact.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-[#213361] border-2 border-yellow-400/30 text-white">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Building2 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    Get In Touch
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold mb-1">Address</p>
                        <p className="text-white text-sm">
                          2/477, Perumal Kovil Street<br />
                          Mettuchery, Mappedu, Tiruvallur<br />
                          Chennai - 631402, Tamilnadu, India
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold mb-1">Email</p>
                        <a href="mailto:editor@scholarindiapub.com" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                          editor@scholarindiapub.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <p className="text-white mb-6 leading-relaxed">
                    Have questions about publishing with us? Our editorial team is here to help guide you through the submission process.
                  </p>
                  <Button 
                    asChild
                    className="bg-yellow-400 text-[rgb(33,51,97)] hover:bg-yellow-500 font-bold w-full md:w-auto"
                  >
                    <Link href="/contact">
                      Contact Us
                    </Link>
                  </Button>
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
