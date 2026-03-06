import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  FileText,
  Link as LinkIcon,
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";

export default function EditorProfile() {
  const [, params] = useRoute("/editor-profile/:name");
  const editorName = params?.name === "samuel-j" ? "Dr. Samuel J" : "Editor";

  const education = [
    {
      degree: "Ph.D",
      field: "Commerce",
      institution: "Manonmaniam Sundaranar University",
      year: "2019-2021",
      status: "Highly Commended",
    },
    {
      degree: "M.Phil",
      field: "Commerce",
      institution: "St. Joseph's College (Autonomous), Tiruchirappalli",
      year: "2016-2017",
      percentage: "80.36%",
    },
    {
      degree: "MBA",
      field: "Financial Management",
      institution: "Periyar University, Salem",
      year: "2016-2018",
      percentage: "62%",
    },
    {
      degree: "M.Com",
      field: "Commerce",
      institution: "St. Joseph's College (Autonomous), Tiruchirappalli",
      year: "2014-2016",
      percentage: "74.69%",
    },
    {
      degree: "B.Com",
      field: "Commerce",
      institution: "St. Joseph's College (Autonomous), Tiruchirappalli",
      year: "2011-2014",
      percentage: "72.68%",
    },
  ];

  const experience = [
    {
      position: "Assistant Professor (Accounting & Finance)",
      institution: "Loyola College (Autonomous), Chennai",
      period: "August 2022 – Present",
    },
    {
      position: "Assistant Professor",
      institution: "Bishop Heber College (Autonomous), Kodaikanal",
      period: "August 2021 – July 2022",
    },
    {
      position: "Assistant Professor (B.Com & BBA)",
      institution: "Kodaikanal Christian College (Autonomous), Kodaikanal",
      period: "June 2017 – December 2018",
    },
  ];

  const specializations = [
    "Accounting",
    "Human Resource Management",
    "Financial Management",
    "Entrepreneurship Management",
  ];

  const publications = [
    {
      title: "Coping with workplace bullying and emotional exhaustion: Role of work engagement, loyalty, promotional opportunities and perceived social support",
      journal: "International Journal of Conflict Management",
      doi: "DOI 10.1108/IJCMA-02-2025-0044",
      year: 2025,
    },
    {
      title: "Antecedents of entrepreneurial intention: Entrepreneurship education as a moderator and entrepreneurial self-efficacy as a mediator",
      journal: "Journal of Entrepreneurship and Innovation in Emerging Economies",
      doi: "DOI: 10.1177/2393957525134528",
      year: 2025,
    },
    {
      title: "Quality of Work life as a Precursor to Work–Life Balance: Collegiality and Job Security as Moderator",
      journal: "Sustainability",
      doi: "https://doi.org/10.3390/su15139936",
      year: 2023,
    },
    {
      title: "A study on Financial Performance of Adani Transmissions Limited",
      journal: "Mukt Shabd Journal",
      issn: "ISSN: 2347-3150",
      year: 2023,
    },
    {
      title: "Innovation in Technology for the Investment Market: A Study of Indian Technology Market",
      journal: "Journal of Liaoning Technical University",
      issn: "ISSN: 1008-0562",
      year: 2023,
    },
    {
      title: "Knowledge Management Framework Study for A University Library",
      journal: "Journal of Liaoning Technical University",
      issn: "ISSN: 1008-0562",
      year: 2023,
    },
    {
      title: "A Comparative Study on Flipkart & Amazon: Specifying on Smartphone Purchase Behaviour with Special Reference to Dindigul Corporation of Tamil Nadu",
      journal: "Journal of Xi'an Shiyou University",
      issn: "ISSN: 1973-064X, IF: 5.6, Scopus & UGC-Care Approved",
      year: 2022,
    },
    {
      title: "Relationship of demographic profile and Quality of Work Life of Registered Construction Workers in Tirunelveli District",
      journal: "Journal of Xi'an Shiyou University",
      issn: "ISSN: 1973-064X, IF: 5.6, Scopus & UGC-Care Approved",
      year: 2021,
    },
    {
      title: "A study on factors influencing unorganised migrant construction workers in Tirunelveli city",
      journal: "Studies in Indian Place Names",
      issn: "ISSN: 2394-3114, UGC Care List – IF: 6.3",
      year: 2020,
    },
    {
      title: "Problems and challenges faced by women micro entrepreneurs in India",
      journal: "Studies in Indian Place Names",
      issn: "ISSN: 2394-3114, UGC Care List – IF: 6.3",
      year: 2020,
    },
    {
      title: "Socio Economic Conditions of Unorganised Women Construction Workers in Tirunelveli City",
      journal: "Think India (Quarterly Journal)",
      issn: "ISSN: 0971-1260, UGC Care List – Group D",
      year: 2019,
    },
    {
      title: "Components of Quality of Work Life – A Literature Study",
      journal: "An International Multidisciplinary Quarterly Research Journal",
      issn: "ISSN: 2277-5730, UGC Approved, IF: 5.5",
      year: 2019,
    },
  ];

  const achievements = [
    "Secured 200/200 in Accountancy in 12th State Board Exams (Tamil Nadu Government)",
    "Awarded certificate of merit and medals for securing second place overall in 12th standard",
    "Awarded certificate of merit and medals for securing first place in Business Statistics and Corporate Accounting (UG)",
    "Authored TWO books with ISBN numbers",
    "Contributed THREE edited book chapters with ISBN numbers",
    "Published ONE licensed patent and ONE designed patent for augmented device",
    "Served as Assistant Director at Loyola Men's Hostel (Oct 2022 - June 2024)",
    "Department Association President (Academic Year 2025-2026)",
    "Question paper setter for Thiruvalluvar University and SMVEC autonomous college",
    "Co-convener for two-day National Conference at Bishop Heber College",
    "Research grants awarded: Rs. 20,000/- (2024-2025) and Rs. 15,000/- (2025-2026) by Loyola Research Park",
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Dr. J. Samuel - Editor-in-Chief | Scholar India Publishers"
        description="Dr. Samuel J - Editor-in-Chief at Scholar India Publishers. Assistant Professor of Accounting and Finance at Loyola College, Ph.D Commerce, expertise in HRM, Financial Management, and Entrepreneurship."
        keywords="Dr Samuel J, editor-in-chief, scholar india publishers, accounting professor, financial management expert, commerce researcher"
      />
      <Header />

      {/* Hero Section */}
      <div className="relative bg-[#213361] py-16 px-4 overflow-hidden border-b-4 border-yellow-400">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/commerce-management#editorial-board">
            <Button
              variant="outline"
              className="mb-6 text-white border-white hover:bg-white/10"
              data-testid="button-back-to-editorial"
            >
              ← Back to Editorial Board
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Dr. J. Samuel
            </h1>
            <p className="text-xl md:text-2xl text-yellow-400 font-semibold mb-6">
              Editor-in-Chief
            </p>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl">
              Assistant Professor of Accounting and Finance, Loyola College (Autonomous), Chennai
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-yellow-400" />
                  <p className="text-yellow-400 text-sm font-semibold">Email</p>
                </div>
                <p className="text-white font-medium">sarcsamj@gmail.com</p>
              </div>

              <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="w-5 h-5 text-yellow-400" />
                  <p className="text-yellow-400 text-sm font-semibold">Phone</p>
                </div>
                <p className="text-white font-medium">9677854979</p>
              </div>

              <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="w-5 h-5 text-yellow-400" />
                  <p className="text-yellow-400 text-sm font-semibold">Experience</p>
                </div>
                <p className="text-white font-medium">6+ Years Teaching</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-4 gap-4 mb-16"
        >
          <Card data-testid="card-publications">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground">12+</div>
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
          <Card data-testid="card-books">
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground">2</div>
              <div className="text-sm text-muted-foreground">Books Authored</div>
            </CardContent>
          </Card>
          <Card data-testid="card-patents">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground">2</div>
              <div className="text-sm text-muted-foreground">Patents</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Specializations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-6 text-foreground">Areas of Specialization</h2>
          <div className="flex flex-wrap gap-3">
            {specializations.map((spec, index) => (
              <Badge
                key={index}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                data-testid={`badge-specialization-${index}`}
              >
                {spec}
              </Badge>
            ))}
          </div>
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
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {edu.degree}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold mb-1">
                        {edu.field}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        {edu.institution}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">{edu.year}</p>
                      {edu.status && (
                        <Badge variant="secondary">{edu.status}</Badge>
                      )}
                      {edu.percentage && (
                        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          {edu.percentage}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Experience */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Professional Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp, index) => (
              <Card
                key={index}
                className="border-l-4 border-l-green-600 dark:border-l-green-400"
                data-testid={`card-experience-${index}`}
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {exp.position}
                  </h3>
                  <p className="text-green-600 dark:text-green-400 font-semibold mb-2">
                    {exp.institution}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {exp.period}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Publications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Research Publications ({publications.length})
          </h2>
          <div className="space-y-4">
            {publications.map((pub, index) => (
              <Card
                key={index}
                className="border-l-4 border-l-purple-600 dark:border-l-purple-400 hover-elevate transition-all"
                data-testid={`card-publication-${index}`}
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2 leading-snug">
                    {pub.title}
                  </h3>
                  <div className="space-y-2">
                    <p className="text-purple-600 dark:text-purple-400 font-semibold">
                      {pub.journal}
                    </p>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>{pub.doi || pub.issn}</span>
                        <Badge variant="outline">{pub.year}</Badge>
                      </div>
                    </div>
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
            <Award className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Achievements & Contributions
          </h2>
          <Card className="border-2 border-blue-200 dark:border-blue-800" data-testid="card-achievements">
            <CardContent className="p-6">
              <ul className="space-y-3">
                {achievements.map((achievement, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3"
                    data-testid={`achievement-${index}`}
                  >
                    <Trophy className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{achievement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
