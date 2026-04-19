import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Newspaper,
  Trophy,
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import kalaiPicPath from "@assets/kalaiPic_1763906403778.JPG";

export default function FounderProfile() {
  const education = [
    {
      degree: "Ph.D – Commerce (Full Time)",
      institution: "University of Madras, Chennai",
      note: "Waiting for Viva",
    },
    {
      degree: "MBA HR",
      institution: "IDE, University of Madras, Chennai",
      year: "2016-2018",
    },
    {
      degree: "M.Phil – Commerce",
      institution: "Loyola College (Autonomous), University of Madras",
      year: "2015-2016",
    },
    {
      degree: "M.Com – Commerce",
      institution: "Loyola College (Autonomous), University of Madras",
      year: "2013-2015",
    },
    {
      degree: "B.Com Corporate Secretaryship",
      institution: "Loyola College (Autonomous), University of Madras",
      year: "2009-2012",
    },
  ];

  const experience = [
    {
      position: "Assistant Professor",
      institution: "Loyola College (Autonomous)",
      department: "B.Com Computer Applications",
      period: "2025 – till date",
    },
    {
      position: "Assistant Professor",
      institution: "Patrician College of Arts & Science, Adyar",
      department: "Commerce",
      period: "2019 – 2022",
    },
    {
      position: "Assistant Professor",
      institution: "Mar Gregorious College of Arts & Science, Chennai",
      department: "Corporate Secretaryship",
      period: "2018 - 2019",
    },
    {
      position: "CA – CPT Faculty",
      institution: "Edupertz Academy, Madurai & Kodaikanal",
      period: "2017 – 2018",
    },
    {
      position: "Assistant Professor",
      institution: "C. Kandaswami Naidu College For Men, Chennai",
      department: "Commerce",
      period: "2016 – 2017",
    },
  ];

  const certifications = [
    "UGC-NET - National Eligibility Test (Dec 2020 & June 2021) - JRF & SRF",
    "NPTEL Course – Principles of Human Resource Management",
    "NPTEL Course – Foundation of Digital Business (Aug-Oct 2025)",
    "UGC-sponsored short-term course on Research and Publication Ethics (Oct 2023)",
    "10-day Research Methodology Course at Annamalai University (Jan 2024)",
    "Annual Refresher Programme – Financial Market and Emerging Business Models",
    "Diploma in Taxation (DTX)",
    "State Level Eligibility Test – Commerce (SET)",
  ];

  const publications = [
    {
      title:
        "Predictive Modeling for Bank Loan Approval: From Data to Decisions",
      journal: "Procedia Computer Science",
      year: "2025",
      doi: "https://doi.org/10.1016/j.procs.2025.04.097",
      indexed: "Scopus",
    },
    {
      title:
        "AI-Enhanced Educational Platforms: Bridging Global Learning Divides with DistilBERT",
      conference: "IEEE GIEST 2024",
      year: "2024",
      doi: "https://doi.org/10.1109/GIEST62955.2024.10959765",
      indexed: "Scopus",
    },
    {
      title:
        "Impact of AI-Driven Automation on Job Displacement and Skill Development",
      conference: "IEEE SILCON 2024",
      year: "2024",
      doi: "https://doi.org/10.1109/SILCON63976.2024.10910660",
      indexed: "Scopus",
    },
    {
      title:
        "The Design of Future Corporate Hierarchies: Re-Thinking Management Structures Through AI",
      conference: "IEEE ICACITE 2024",
      year: "2024",
      doi: "https://doi.org/10.1109/ICACITE60783.2024.10616404",
      indexed: "Scopus",
    },
    {
      title:
        "Transformative Impacts of Tourism Advertising on Global Travel Industry",
      journal: "REST Journal on Banking, Accounting and Business",
      year: "2024",
      doi: "https://doi.org/10.46632/jbab/3/1/4",
    },
    {
      title:
        "Banking on Values: CSR, Customer Satisfaction, and Loyalty in Finance",
      journal:
        "International Journal of Scientific Research in Engineering and Management",
      year: "2024",
      doi: "https://doi.org/10.55041/IJSREM37130",
    },
  ];

  const achievements = [
    "RAJYA PURASKAR Award for Scouts by the Governor of Tamil Nadu (2007)",
    "Student Welfare Secretary of the Commerce Forum, Loyola College (2011-12)",
    "Published 14+ peer-reviewed articles in national and international journals",
    "Conference Book Editor - Industry 5.0 - Post Pandemic Transformation",
    "Peer Reviewer and Book Chapter Reviewer for IGI Global Publications",
    "Attended 120+ Conferences, Seminars, Webinars and Faculty Development Programs",
  ];

  const interestAreas = [
    "Income Tax",
    "Cost Accounting",
    "Company Law",
    "Human Resource Management",
    "Marketing",
    "Artificial Intelligence in Business",
    "Digital Transformation",
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Dr. Kalaiarasan C - Founder & Publisher | Scholar India Publishers"
        description="Dr. Kalaiarasan C is the founder of Scholar India Publishers. Ph.D in Commerce, UGC-NET qualified, published researcher with 6.5+ years of teaching experience. Based in Chennai, Tamil Nadu, India."
        keywords="Dr Kalaiarasan C, Kalaiarasan C founder, scholar india publishers founder, commerce researcher Tamil Nadu, academic publisher Chennai, PhD commerce researcher India, UGC NET qualified researcher"
        canonical="https://scholarindiapub.com/founder"
      />
      <Header />
      {/* Hero Section */}
      <div className="relative bg-[#213361] py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/about">
            <Button
              variant="outline"
              className="mb-6 text-white border-white hover:bg-white/10"
            >
              ← Back to About
            </Button>
          </Link>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center md:justify-start"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-blue-400/20 rounded-xl blur-xl"></div>
                <img
                  src={kalaiPicPath}
                  alt="Dr. Kalaiarasan C"
                  className="relative w-64 h-72 object-cover rounded-lg shadow-2xl border-4 border-white/20"
                  data-testid="img-founder-profile"
                />
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-2 text-white"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Dr. Kalaiarasan C
              </h1>
              <p className="text-xl md:text-2xl text-yellow-400 font-semibold mb-6">
                Founder & Academic Publisher
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-yellow-400" />
                  <span data-testid="text-founder-phone">+91 9688650939</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-yellow-400" />
                  <span data-testid="text-founder-email">
                    prof.klirsn@gmail.com
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-yellow-400 mt-1" />
                  <span data-testid="text-founder-address">
                    No.2/477, Perumal Kovil Street, Mettuchery, Mappedu,
                    Thiruvallur–631402
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                  <p className="text-yellow-400 text-sm font-semibold">Age</p>
                  <p
                    className="text-white font-bold"
                    data-testid="text-founder-age"
                  >
                    33 Years
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                  <p className="text-yellow-400 text-sm font-semibold">
                    Experience
                  </p>
                  <p
                    className="text-white font-bold"
                    data-testid="text-founder-experience"
                  >
                    6.5+ Years Teaching
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-4 gap-4 mt-12 mb-16"
        >
          <Card data-testid="card-publications">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground">14+</div>
              <div className="text-sm text-muted-foreground">Publications</div>
            </CardContent>
          </Card>
          <Card data-testid="card-degrees">
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground">5</div>
              <div className="text-sm text-muted-foreground">Degrees</div>
            </CardContent>
          </Card>
          <Card data-testid="card-experience">
            <CardContent className="p-6 text-center">
              <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground">6.5+</div>
              <div className="text-sm text-muted-foreground">
                Years Experience
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-events">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground">120+</div>
              <div className="text-sm text-muted-foreground">
                Events Attended
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Education */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Educational Credentials
          </h2>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <Card
                key={index}
                className="border-l-4 border-l-blue-600 dark:border-l-blue-400"
                data-testid={`card-education-${index}`}
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {edu.degree}
                  </h3>
                  <p className="text-muted-foreground mb-1">
                    {edu.institution}
                  </p>
                  {edu.year && (
                    <p className="text-sm text-muted-foreground">{edu.year}</p>
                  )}
                  {edu.note && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold">
                      {edu.note}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Teaching Experience */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Teaching Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp, index) => (
              <Card
                key={index}
                className="border-l-4 border-l-green-600 dark:border-l-green-400"
                data-testid={`card-experience-${index}`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-foreground">
                      {exp.position}
                    </h3>
                    <span className="text-sm bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 px-3 py-1 rounded-full font-medium">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-foreground font-semibold mb-1">
                    {exp.institution}
                  </p>
                  {exp.department && (
                    <p className="text-muted-foreground">
                      Department: {exp.department}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Professional Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
            <Award className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Professional Certifications & Training
          </h2>
          <Card data-testid="card-certifications">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-[#213361]/5 dark:bg-[#213361]/20 rounded-lg"
                  >
                    <Award className="w-5 h-5 text-[#213361] dark:text-blue-400 mt-1 flex-shrink-0" />
                    <span className="text-foreground">{cert}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Publications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Recent Publications
          </h2>
          <div className="space-y-4">
            {publications.map((pub, index) => (
              <Card
                key={index}
                className="border-l-4 border-l-purple-600 dark:border-l-purple-400"
                data-testid={`card-publication-${index}`}
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {pub.title}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {pub.journal || pub.conference} • {pub.year}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={pub.doi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      data-testid="link-publication-doi"
                    >
                      View DOI →
                    </a>
                    {pub.indexed && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full font-semibold">
                        {pub.indexed}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
            <Trophy className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Key Achievements
          </h2>
          <Card data-testid="card-achievements">
            <CardContent className="p-8">
              <ul className="space-y-3">
                {achievements.map((achievement, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-foreground"
                  >
                    <span className="text-yellow-500 text-xl flex-shrink-0">
                      ✓
                    </span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Areas of Interest */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Areas of Interest & Expertise
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {interestAreas.map((area, index) => (
              <Card
                key={index}
                className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                data-testid={`card-interest-${index}`}
              >
                <CardContent className="p-6 text-center">
                  <p className="text-foreground font-semibold text-lg">
                    {area}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Languages & Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <Card
            className="bg-white dark:bg-gray-900 overflow-hidden"
            data-testid="card-personal"
          >
            <CardHeader className="bg-[#213361] text-white">
              <CardTitle className="text-white">Personal Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">
                    Languages
                  </p>
                  <p className="text-foreground">Tamil, English</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">
                    Nationality
                  </p>
                  <p className="text-foreground">Indian</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">
                    Location
                  </p>
                  <p className="text-foreground">Chennai, Tamil Nadu, India</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Connect with Scholar India Publishers
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Interested in publishing your research or collaborating with us? Get
            in touch with our team.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button
                className="bg-[#213361] hover:bg-[#2a4078] text-white px-8"
                data-testid="button-contact"
              >
                Contact Us
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="outline"
                className="px-8"
                data-testid="button-back-about"
              >
                Back to About
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
