import Header from "@/components/Header";
import TabbedJournalPage from "@/components/TabbedJournalPage";
import SEO from "@/components/SEO";
import StructuredData, { createPeriodicalData } from "@/components/StructuredData";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2 } from "lucide-react";

export default function CommerceJournal() {
  // Editorial board data - unique to Commerce journal
  const editorInChief = {
    name: "Dr. Samuel J",
    designation: "Assistant Professor of Accounting and Finance",
    institution: "Loyola College (Autonomous)",
    location: "Chennai - 600 034",
    email: "jsamuel@loyolacollege.edu"
  };

  const boardMembers = [
    {
      name: "Dr. Edna Saavedra Galvez",
      designation: "Assistant Professor",
      institution: "Economics & Business Studies Department, Mazoon College",
      location: "Muscat, Oman - 123456",
      email: "edna.galvez@mazcol.edu.om"
    },
    {
      name: "Dr. S. Sivakumar",
      designation: "Associate Professor",
      institution: "School of Governance and Development Management, Hawassa University",
      location: "Hawassa, Ethiopia",
      email: "s.siva@hu.edu.et"
    },
    {
      name: "Dr. R. Suresh",
      designation: "Assistant Professor & Head i/c",
      institution: "Department of Economics and Rural Development, Alagappa University",
      location: "Karaikudi - 630003",
      email: "sureshr@alagappauniversity.ac.in"
    },
    {
      name: "Dr. A. Vini Infanta",
      designation: "Assistant Professor of Professional Accounting and Finance",
      institution: "School of Commerce, Accounting and Finance, Kristu Jayanti Deemed to be University",
      location: "Bengaluru - 560077",
      email: "viniinfanta@kristujayanti.com"
    },
    {
      name: "Dr. Chanduji Popatji Thakor",
      designation: "Assistant Professor of Commerce and Management",
      institution: "Shri Govind Guru University",
      location: "Gujarat - 388713",
      email: "cpthakor@sggu.ac.in"
    },
    {
      name: "Dr. Thenmozhi S",
      designation: "Assistant Professor of B.Com Corporate Secretaryship",
      institution: "Patrician College of Arts and Science",
      location: "Adyar, Tamilnadu",
      email: "thenmozhi@patriciancollege.ac.in"
    },
    {
      name: "Dr. Jenifer Angelen Sudhakar",
      designation: "Assistant Professor of PG Department of Commerce",
      institution: "Women's Christian College",
      location: "Nungambakkam, Chennai",
      email: "jeniferangelen@wcc.edu.in"
    },
    {
      name: "Dr. M. Suganya",
      designation: "Assistant Professor of BBA",
      institution: "DDGD Vaishnav College",
      location: "Chennai",
      email: "suganyabba@dgvaishnavcollege.edu.in"
    },
    {
      name: "Dr. K. Myilswamy",
      designation: "Assistant Professor of Commerce",
      institution: "Kongunadu Arts and Science College",
      location: "Coimbatore, Tamilnadu - 641017",
      email: "myilswamyk_pa@kongunaducollege.ac.in"
    },
    {
      name: "Dr. S. Sriranjani Mokshagundam",
      designation: "Professor of Management, Department of Management",
      institution: "BGS B-School",
      location: "Bangalore - 560060, Karnataka",
      email: "sriranjani@sjbcms.edu.in / sriranjani@isec.ac.in"
    },
    {
      name: "Dr. Ramki R",
      designation: "Assistant Professor, Department of Commerce",
      institution: "Hindustan Institute of Technology & Science",
      location: "Padur, Chennai",
      email: "ramkir@hindustanuniv.ac.in"
    },
    {
      name: "Dr. USHA C",
      designation: "Assistant Professor",
      institution: "Department of Studies and Research in Commerce, Karnataka State Open University",
      location: "Mukthagangotri, Mysuru - 570006",
      email: "dr.ushac@ksoumysuru.ac.in"
    },
    {
      name: "Dr. VAISHALI SINGH",
      designation: "Assistant Professor of Commerce",
      institution: "CHRIST (Deemed to be University)",
      location: "Karnataka",
      email: "vaishali.singh@christuniversity.in"
    }
  ];

  // Archived articles (Vol 1, Issue 1) - moved from current issue to archives
  // Archived articles - Volume 1 Issue 1 + Volume 2 Issue 1
  const archivedArticles = [
    // Volume 1, Issue 1 (October - December 2025)
    {
      id: 1,
      articleId: "sjcm-v1i1-001",
      title: "THE IMPACT OF GOVERNMENT POLICIES ON THE GROWTH OF M-COMMERCE IN DEVELOPING ECONOMIES: AN INDIAN PERSPECTIVE",
      authors: "Bhuriya Jignesh Subhashbhai¹, Chanduji Popatji Thakor²",
      affiliation: "1. Assistant Professor of Commerce and Management, Shri Govind Guru University, Vinzol-Godhra, Gujarat, India\n2. Assistant Professor of Commerce and Management, Shri Govind Guru University, Vinzol-Godhra, Gujarat, India",
      pages: "1-10",
      doi: "10.65219/sjcm.20250101001"
    },
    {
      id: 2,
      articleId: "sjcm-v1i1-002",
      title: "CONSUMER PERCEPTION TOWARDS DIGITAL PAYMENT MODE IN BANKING SECTOR",
      authors: "A. Vini Infanta¹",
      affiliation: "1. Assistant Professor of Professional Accounting and Finance, School of Commerce, Accounting and Finance, Kristu Jayanti Deemed to be University, Bengaluru, India",
      pages: "11-18",
      doi: "10.65219/sjcm.20250101002"
    },
    {
      id: 3,
      articleId: "sjcm-v1i1-003",
      title: "IMPACT OF SOCIAL MEDIA MARKETING ON BRAND LOYALTY WITH MEDIATING ROLE OF PURCHASE INTENTION AMONG GEN Z - AN EMPIRICAL STUDY",
      authors: "M. Suganya¹",
      affiliation: "1. Assistant Professor, BBA Department, DDGD Vaishnav College, Arumbakkam, Chennai, India",
      pages: "19-25",
      doi: "10.65219/sjcm.20250101003"
    },
    {
      id: 4,
      articleId: "sjcm-v1i1-004",
      title: "STUDY ON FINANCIAL LITERACY AND AWARENESS AMONG WORKING WOMEN: A SURVEY BASED APPROACH IN PANCHMAHAL DISTRICT",
      authors: "Chanduji Popatji Thakor¹",
      affiliation: "1. Assistant Professor of Commerce and Management, Shri Govind Guru University, Vinzol-Godhra, Gujarat, India",
      pages: "26-30",
      doi: "10.65219/sjcm.20250101004"
    },
    {
      id: 5,
      articleId: "sjcm-v1i1-005",
      title: "EFFECTIVENESS OF SOCIAL MEDIA ADVERTISING ON BRAND LOYALTY",
      authors: "R. Ramki¹, R. M. Uma²",
      affiliation: "1. Assistant Professor, Department of Commerce, Hindustan Institute of Technology & Science, Padur, Chennai, India\n2. Assistant Professor, Department of Commerce, Hindustan Institute of Technology & Science, Padur, Chennai, India",
      pages: "31-35",
      doi: "10.65219/sjcm.20250101005"
    },
    // Volume 2, Issue 1 (January - March 2026)
    {
      id: 6,
      articleId: "sjcm-v2i1-001",
      title: "SOCIO ECONOMIC STATUS OF REGISTERED CONSTRUCTION WORKERS IN TIRUNELVELI DISTRICT",
      authors: "Samuel Jayaraman¹",
      affiliation: "1. Assistant Professor, Department of B.Com (Accounting & Finance), Loyola College (Autonomous), Chennai, India",
      pages: "1-5",
      doi: "10.65219/sjcm.20260201001"
    },
    {
      id: 7,
      articleId: "sjcm-v2i1-002",
      title: "EXPLORING THE RELATIONSHIP BETWEEN CREATIVITY AND CURIOSITY AMONG HIGHER SECONDARY STUDENTS IN TIRUVALLUR DISTRICT",
      authors: "N. Purusothaman¹, Nirmala²",
      affiliation: "1. Assistant Professor & Research Supervisor, Department of Commerce, Patrician College of Arts and Science, Chennai, India\n2. Student, Department of Commerce, Patrician College of Arts and Science, Chennai, India",
      pages: "06–13",
      doi: "10.65219/sjcm.20260201002"
    },
    {
      id: 8,
      articleId: "sjcm-v2i1-003",
      title: "MARKETING OF JASMINE IN SATHYAMANGALAM BLOCK OF ERODE DISTRICT",
      authors: "P. Shanmugam¹, T. Praveena²",
      affiliation: "1. Associate Professor, Department of Economics, Bharathiar University\n2. Ph.D. Research Scholar, Department of Economics, Bharathiar University, Tamil Nadu, India",
      pages: "14 - 21",
      doi: "10.65219/sjcm.20260201003"
    },
    {
      id: 9,
      articleId: "sjcm-v2i1-004",
      title: "BRIDGING THE AWARENESS – ACTION GAP IN FINANCIAL LITERACY AMONG CHENNAI COLLEGE STUDENTS",
      authors: "Kalaiarasan C¹, Kamalesh G², Kovid Raghav R², Ishit Agarwal², Shanmugapriyan J², Joi Levis A²",
      affiliation: "1. Assistant Professor, Department of B.Com Computer Applications, Loyola College (Autonomous), Chennai, India\n2. Student, Department of B.Com Computer Applications, Loyola College (Autonomous), Chennai, India",
      pages: "22 - 28",
      doi: "10.65219/sjcm.20260201004"
    },
    {
      id: 10,
      articleId: "sjcm-v2i1-005",
      title: "IMPACT OF INFRASTRUCTURE TRANSPARENCY ON TRUST IN BANKING CHATBOTS",
      authors: "S. Shilpa¹, N. Purusothaman²",
      affiliation: "1. Research Scholar of Commerce, Patrician College of Arts and Science, Chennai, India\n2. Assistant Professor and Research Supervisor, Patrician College of Arts and Science, Chennai, India",
      pages: "29 - 37",
      doi: "10.65219/sjcm.20260201005"
    },
    {
      id: 11,
      articleId: "sjcm-v2i1-006",
      title: "SOCIAL MEDIA INFLUENCE AND FINANCIAL LITERACY AS MEDIATORS BETWEEN FINTECH ADOPTION AND BEHAVIOURAL INTENTION AMONG COLLEGE YOUTH",
      authors: "R Indumathi¹, C. Revathy²",
      affiliation: "1. Research Scholar, PG & Research Department of Commerce, Guru Nanak College, Chennai, India\n2. Assistant Professor of PG & Research Department of Commerce, Guru Nanak College, Chennai, India",
      pages: "38 - 44",
      doi: "10.65219/sjcm.20260201006"
    }
  ];

  // Current issue articles - Volume 2, Issue 2 (April - June 2026) - Under Production
  const articles: typeof archivedArticles = [];

  const managingEditor = {
    name: "Dr. C. Kalaiarasan",
    designation: "Assistant Professor of B.Com Computer Applications",
    institution: "Loyola College (Autonomous), University of Madras",
    location: "Chennai - 600 034",
    email: "editor@scholarindiapub.com / kalaiarasan@loyolacollege.edu"
  };

  return (
    <>
      <SEO
        title="Scholar Journal of Commerce and Management (SJCM) | Peer-Reviewed Business Journal India"
        description="SJCM is an international peer-reviewed journal publishing research in Commerce, Management, Accounting, Finance, Marketing, HRM & Business. Submit your manuscript online. DOI for all papers. Fast review."
        keywords="scholar journal commerce management, SJCM journal, commerce journal India, management research journal, accounting journal India, finance journal, business research journal, international commerce journal, marketing research journal, HRM journal India, peer-reviewed business journal, UGC CARE aspirant journal, submit paper commerce India, research journal Chennai, business journal India 2025"
        type="website"
        canonical="https://scholarindiapub.com/commerce-management"
        ogImage="/og-image.jpg"
      />
      <StructuredData 
        type="Periodical" 
        data={createPeriodicalData(
          "Scholar Journal of Commerce and Management",
          "International peer-reviewed journal for commerce and management research covering accounting, finance, marketing, business law, economics, entrepreneurship, and digital transformation."
        )} 
      />
      <Header />
      <section className="w-full py-6 md:py-8 bg-[#213361] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-yellow-500 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="flex items-start gap-4 md:gap-6">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/20 shadow-xl shrink-0 mt-1">
                <BookOpen className="w-10 h-10 md:w-12 h-12 text-yellow-400" />
              </div>
              <div className="flex-1">
                <Badge className="bg-yellow-500 text-blue-900 font-bold mb-2 px-3 py-0.5 text-[10px] uppercase tracking-wider border-none rounded-full">
                  International Peer-Reviewed
                </Badge>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white mb-3 tracking-tight leading-tight">
                  Scholar Journal of <br />
                  <span className="text-yellow-400">Commerce and Management</span>
                </h1>
                <div className="flex flex-wrap gap-3 text-blue-100">
                  <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[11px] md:text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> ISSN (Online): xxxx
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[11px] md:text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Quarterly Publication
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <TabbedJournalPage
        title="Scholar Journal of Commerce and Management"
        aim="The Scholar Journal of Commerce and Management (SJCM) serves as a premier international platform for disseminating cutting-edge research and scholarly discourse in commerce and management disciplines. The journal is committed to advancing theoretical knowledge and evidence-based practices while fostering interdisciplinary dialogue among academics, practitioners, and policymakers across Business Management, Commerce, Finance, Human Resource Management, Marketing, Information Technology, Operations Management, and emerging paradigms in the field."
        scope="SJCM welcomes original research contributions across diverse domains of commerce and management including Business Management, Commerce, Finance, General Management, Human Resource Management, Marketing, Information Technology, Operations Management, and Emerging Paradigms in Commerce and Management. The journal also covers related areas such as accounting, auditing, banking, business law, economics, entrepreneurship, corporate strategy, organizational behavior, supply chain management, international business, business analytics, digital transformation, fintech, business ethics, corporate social responsibility, and sustainability."
        publicationTypes="The journal publishes original empirical research, theoretical and conceptual papers, systematic reviews, case studies, policy analyses, and critical examinations of contemporary business practices."
        researchFocus="The journal prioritizes empirical and theoretical research that advances evidence-based practices in commerce and management. Special emphasis is placed on contemporary issues including digital transformation and fintech innovations, sustainable business practices and corporate social responsibility, entrepreneurial ecosystems and innovation management, global business strategies and emerging markets, and interdisciplinary approaches that bridge traditional commerce and management domains with technology, ethics, and sustainability challenges in the evolving global business landscape."
        targetAudience="The journal serves academics, research scholars, industry professionals, business leaders, policymakers, and graduate students engaged in commerce and management research and practice."
        subject="Business Management"
        subjectCovers={[
          "Business Management",
          "Commerce",
          "Finance",
          "General Management",
          "Human Resource Management",
          "Marketing",
          "Information Technology",
          "Operations Management",
          "Emerging Paradigms in Commerce and Management"
        ]}
        editorInChief={editorInChief}
        managingEditor={managingEditor}
        boardMembers={boardMembers}
        articles={articles}
        archivedArticles={archivedArticles}
        currentVolume="2"
        currentIssue="2"
        referenceStyle="APA"
      />
    </>
  );
}