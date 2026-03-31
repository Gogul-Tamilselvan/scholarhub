import Header from "@/components/Header";
import TabbedJournalPage from "@/components/TabbedJournalPage";
import SEO from "@/components/SEO";
import StructuredData, { createPeriodicalData } from "@/components/StructuredData";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2 } from "lucide-react";

export default function HumanitiesJournal() {
  const boardMembers = [
    {
      name: "Dr. Ruksana Banu",
      designation: "Assistant Professor in Business and Accounting Department",
      institution: "Muscat College, Sultanate of Oman",
      location: "Muscat, Oman",
      email: "ruksana@muscatcollege.edu.om"
    },
    {
      name: "Dr. Bashir Sa'ad Ibrahim",
      designation: "Associate Professor of International Economic Relations, Cross Border Trade, Middle East Politics, Environmental Politics, Peace and Conflict Resolution",
      institution: "Federal University, Dutse",
      location: "Nigeria - 720001",
      email: "bashirsaad@fud.edu.ng"
    },
    {
      name: "Dr. S. Padma Annakamu",
      designation: "Assistant Professor of Economics",
      institution: "PSGR Krishnammal College for Women",
      location: "Coimbatore",
      email: "padma@psgrkcw.ac.in",
      profileUrl: "https://psgrkcw.ac.in/wp-content/uploads/2024/01/Dr.S.Padma-Annakkammu.pdf"
    },
    {
      name: "Dr. Sridevi T",
      designation: "Associate Professor of English",
      institution: "SRM Institute of Science and Technology, Ramapuram Campus",
      location: "Chennai - 600089",
      email: "sridevit1@srmist.edu.in",
      profileUrl: "https://fsh.srmrmp.edu.in/wp-content/uploads/2022/09/8.-Dr.T.Sridevi.pdf"
    },
    {
      name: "Dr. Suneesh K S",
      designation: "Department of Animation and Virtual Reality",
      institution: "JAIN (Deemed-to-be University)",
      location: "Karnataka, Bangalore - 560069",
      email: "suneesh.ks@jainuniversity.ac.in",
      profileUrl: "https://scsit.jainuniversity.ac.in/faculty"
    },
    {
      name: "Dr. Purushothaman",
      designation: "Asst. Professor of Commerce",
      institution: "Patrician College of Arts and Science",
      location: "Chennai - 20",
      email: "purusothaman@patriciancollege.ac.in",
      profileUrl: "https://www.patriciancollege.ac.in/b-com-commerce#"
    },
    {
      name: "Dr. M. Sandra Carmel Sophia",
      designation: "Professor of English",
      institution: "Koneru Lakshmaiah deemed to be University",
      location: "Vaddeswaram, Guntur",
      email: "sophia@kluniversity.in",
      profileUrl: "https://www.kluniversity.in/english/drc.aspx"
    },
    {
      name: "Dr. Harshita Sharma",
      designation: "Assistant Professor of Political Science",
      institution: "Vivekananda Global University",
      location: "Jaipur - 302019",
      email: "harshita.sharma@vgu.ac.in",
      profileUrl: "https://www.vgu.ac.in/bio/humanities/Dr_Harshita.php"
    },
    {
      name: "Dr. Bibin K",
      designation: "Assistant Professor",
      institution: "Vignan's Foundation for Science Technology and Research University (Deemed to be University)",
      location: "Vadlamudi, Guntur - 522213",
      email: "bk_english@vignan.ac.in",
      profileUrl: "https://vignan.ac.in/newvignan/people.php"
    }
  ];

  const editorInChief = {
    name: "Dr. John Jelestin",
    designation: "Assistant Professor of English",
    institution: "Loyola College (Autonomous)",
    location: "Chennai - 600 034",
    email: "jelestin@loyolacollege.edu",
    profileUrl: "https://www.loyolacollege.edu/profile/english/profile.html?file=DrJohnJelestin.pdf"
  };

  const managingEditor = {
    name: "Dr. C. Kalaiarasan",
    designation: "Assistant Professor of B.Com Computer Applications",
    institution: "Loyola College (Autonomous), University of Madras",
    location: "Chennai - 600 034",
    email: "kalaiarasan@loyolacollege.edu / editor@scholarindiapub.com",
    profileUrl: "https://loyolacollege.irins.org/profile/284065"
  };

  // Archived articles - Volume 1, Issue 1 (January - March 2026)
  const archivedArticles = [
    {
      id: 1,
      articleId: "sjhss-v1i1-001",
      title: "LIBRARIES AS CATALYSTS OF CHANGE: A STUDY ON THE DEVELOPMENT OF RURAL LIBRARIES AND STUDENT EMPOWERMENT IN IDAPPADI, SALEM DISTRICT",
      authors: "Ganesan V¹",
      affiliation: "1. Centre of Online and Distance Education (CDOE), Bharathidasan University, Tiruchirappalli, India",
      pages: "01 - 05",
      doi: "10.65219/sjhss.20260101001"
    },
    {
      id: 2,
      articleId: "sjhss-v1i1-002",
      title: "REWRITING MASCULINITY THROUGH FATHERS IN IAN MCEWAN’S THE CHILD IN TIME AND KHALED HOSSEINI’S THE KITE RUNNER",
      authors: "P. Rajini¹, Ariharan S²",
      affiliation: "1. Assistant Professor of English, Government Arts and Science College, Idappadi, India\n2. Ph.D. Research Scholar, School of Liberal Arts and Humanities, Woxsen University, Hyderabad",
      pages: "06 – 11",
      doi: "10.65219/sjhss.20260101002"
    },
    {
      id: 3,
      articleId: "sjhss-v1i1-003",
      title: "MOTHERHOOD AS THE LAST SHELTER AND THE PRACTICE OF CARE BEYOND BORDERS IN BAPSI SIDHWA CRACKING INDIA AND JHUMPA LAHIRI THE NAMESAKE",
      authors: "Ariharan S¹, P. Rajini²",
      affiliation: "1. Ph.D. Research Scholar, School of Liberal Arts and Humanities, Woxsen University, Hyderabad, India\n2. Assistant Professor of English, Government Arts and Science College, Idappadi, India",
      pages: "12 – 18",
      doi: "10.65219/sjhss.20260101003"
    },
    {
      id: 4,
      articleId: "sjhss-v1i1-004",
      title: "IMPACT OF LAUGHTER THERAPY ON CAREGIVER BURDEN AND RESILIENCE AMONG ADHDCAREGIVERS",
      authors: "R. Salman¹, S. Srikumaran¹, K. Nagalakshmi²",
      affiliation: "1. Ph.D. Research Scholar, Department of Psychology, Annamalai University\n2. Associate Professor, Department of Psychology, Annamalai University, Annamalai Nagar, Cuddalore",
      pages: "19 – 25",
      doi: "10.65219/sjhss.20260101004"
    },
    {
      id: 5,
      articleId: "sjhss-v1i1-005",
      title: "AI AND THE FUTURE OF SCHOLARLY PUBLISHING IN ENGLISH STUDIES",
      authors: "Devi K¹, Ariharan S², P. Rajini³",
      affiliation: "1. B.Ed. Student, Avinashilingam Institute for Home Science & Higher Education for Women, Coimbatore, India\n2. Ph.D. Research Scholar, School of Liberal Arts and Humanities, Woxsen University, Hyderabad, India\n3. Assistant Professor of English, Government Arts and Science College, Idappadi, India",
      pages: "26 – 34",
      doi: "10.65219/sjhss.20260101005"
    },
    {
      id: 6,
      articleId: "sjhss-v1i1-006",
      title: "HARAWAY AND BRAIDOTTI CYBORG SUBJECTIVITIES AND POSTGENDER FUTURES: A COMPARATIVE STUDY",
      authors: "Karthika G¹, Ariharan S²",
      affiliation: "1. Assistant Professor of English, Kailash Women's College, Nangavalli, India\n2. Ph.D. Research Scholar, School of Liberal Arts and Humanities, Woxsen University, Hyderabad, India",
      pages: "35 – 41",
      doi: "10.65219/sjhss.20260101006"
    },
    {
      id: 7,
      articleId: "sjhss-v1i1-007",
      title: "IMPACT OF DIGITAL STRESS ON EMOTIONAL DEPENDENCY AND MENTAL HEALTH AMONG INTIMATE COUPLES",
      authors: "S. Srikumaran¹, K. Nagalakshmi²",
      affiliation: "1. Ph.D. Research Scholar, Department of Psychology, Annamalai University\n2. Associate Professor, Department of Psychology, Annamalai University, Annamalai Nagar, Cuddalore",
      pages: "42 – 47",
      doi: "10.65219/sjhss.20260101007"
    },
    {
      id: 8,
      articleId: "sjhss-v1i1-008",
      title: "IMPACT OF DOOMSCROLLING ON EMOTIONAL REGULATION IN WORKING EMPLOYEES: THE MEDIATING ROLE OF PSYCHOLOGICAL DISTRESS",
      authors: "S. Vasanth¹, S. Srikumaran², K. Nagalakshmi³",
      affiliation: "1. M.Sc. Applied Psychology, Department of Psychology, Annamalai University\n2. Ph.D. Research Scholar, Department of Psychology, Annamalai University\n3. Associate Professor, Department of Psychology, Annamalai University, Annamalai Nagar, Cuddalore",
      pages: "48 – 58",
      doi: "10.65219/sjhss.20260101008"
    },
    {
      id: 9,
      articleId: "sjhss-v1i1-009",
      title: "INFLUENCE OF PARTNER’S PHUBBING ON RELATIONSHIP SATISFACTION AND MENTAL HEALTH AMONG MARRIED COUPLES",
      authors: "S. Srikumaran¹, K. Nagalakshmi²",
      affiliation: "1. Ph.D. Research Scholar, Department of Psychology, Annamalai University\n2. Associate Professor, Department of Psychology, Annamalai University, Annamalai Nagar, Cuddalore",
      pages: "59 – 65",
      doi: "10.65219/sjhss.20260101009"
    }
  ];

  // Current issue articles - Volume 1, Issue 2 (April - June 2026) - Under Production
  const articles: typeof archivedArticles = [
    // Empty - Under Production
  ];

  return (
    <>
      <SEO
        title="Scholar Journal of Humanities and Social Sciences (SJHSS) | Peer-Reviewed Journal India"
        description="SJHSS is an international peer-reviewed journal publishing research in Humanities, Literature, Philosophy, Sociology, Psychology & Social Sciences. Submit your manuscript online. DOI for all papers."
        keywords="scholar journal humanities social sciences, SJHSS journal, humanities journal India, social sciences journal India, literature research journal, philosophy journal, sociology journal India, psychology journal, political science journal, anthropology journal, history journal India, cultural studies journal, linguistics journal, peer-reviewed humanities journal, social science research India 2025, submit paper humanities India"
        type="website"
        canonical="https://scholarindiapub.com/humanities"
        ogImage="/og-image.jpg"
      />
      <StructuredData 
        type="Periodical" 
        data={createPeriodicalData(
          "Scholar Journal of Humanities and Social Sciences",
          "International peer-reviewed journal exploring humanities (literature, philosophy, history, linguistics, cultural studies) and social sciences (sociology, psychology, political science, anthropology, economics, education) through rigorous academic inquiry."
        )} 
      />
      <Header />
      <section className="w-full py-6 md:py-8 bg-[#213361] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-purple-500 blur-3xl" />
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
                  <span className="text-yellow-400">Humanities and Social Sciences</span>
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
        title="Scholar Journal of Humanities and Social Sciences"
        aim="The Scholar Journal of Humanities and Social Sciences serves as a premier international platform for disseminating cutting-edge research and scholarly discourse in humanities and social sciences disciplines. The journal is committed to advancing theoretical knowledge and evidence-based practices while fostering interdisciplinary dialogue among academics, researchers, and policymakers."
        scope="The Scholar Journal of Humanities and Social Sciences welcomes original research contributions across diverse areas including literature, philosophy, history, linguistics, cultural studies, religious studies, art history, classical studies, sociology, psychology, political science, anthropology, economics, education, social work, public policy, development studies, gender studies, urban studies, and emerging interdisciplinary domains that bridge humanities and social sciences with contemporary challenges in culture, society, and human behavior."
        publicationTypes="The journal publishes original research articles, empirical studies, theoretical contributions, critical essays, comparative studies, case studies, methodological papers, book reviews, and scholarly commentaries on significant works and movements in the humanities and social sciences."
        researchFocus="The journal prioritizes innovative research that advances theoretical knowledge and evidence-based understanding of human culture, thought, and social structures. Special emphasis is placed on interdisciplinary studies addressing contemporary challenges including cultural identity and diversity, social inequality and policy analysis, digital humanities and technological impact on society, behavioral research and psychological studies, urban development and community studies, and critical examinations that bridge humanities and social sciences with current social, cultural, and political transformations."
        targetAudience="The journal serves humanities scholars, social scientists, sociologists, psychologists, political scientists, cultural researchers, philosophers, historians, literary critics, economists, educators, graduate students, and researchers engaged in advancing knowledge within the broad spectrum of humanities and social sciences disciplines."
        subject="Social Sciences"
        subjectCovers={[
          "Agricultural Economics & Extension",
          "Anthropology",
          "Archaeology",
          "Area Studies",
          "Arts",
          "Business Administration & Business Marketing",
          "Communication Studies",
          "Criminology & Criminal Justice",
          "Cultural and Ethnic Studies",
          "Demography",
          "Economics Research & Behaviour",
          "Educational Sciences",
          "Environmental Science",
          "Exchange and Trade",
          "Finance",
          "Forestry",
          "Sexuality Studies",
          "Geography",
          "History",
          "Human Resource",
          "Humanities",
          "Laws",
          "Linguistics",
          "Management Studies & Business Studies",
          "Philosophy",
          "Political Science",
          "Project Management",
          "Psychology",
          "Role Of Media",
          "Role Of Ngo",
          "Social Sciences & Social Policy",
          "Sociology & Social Work",
          "Special Education",
          "Women and Gender Studies"
        ]}
        editorInChief={editorInChief}
        managingEditor={managingEditor}
        boardMembers={boardMembers}
        articles={articles}
        archivedArticles={archivedArticles}
        currentVolume="1"
        currentIssue="2"
        referenceStyle="APA_MLA"
      />
    </>
  );
}
