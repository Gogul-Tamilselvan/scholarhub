import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, FileText } from "lucide-react";
import { Link } from "wouter";
import ArticleSEO from "@/components/ArticleSEO";

interface Article {
  id: string;
  title: string;
  authors: string;
  affiliation: string;
  pages: string;
  volume: string;
  issue: string;
  year: string;
  journal: string;
  pdfUrl: string;
  abstract?: string;
  keywords?: string[];
  doi?: string;
}

const articles: Record<string, Article> = {
  "sjcm-v1i1-001": {
    id: "sjcm-v1i1-001",
    title:
      "THE IMPACT OF GOVERNMENT POLICIES ON THE GROWTH OF M-COMMERCE IN DEVELOPING ECONOMIES: AN INDIAN PERSPECTIVE",
    authors: "Bhuriya Jignesh Subhashbhai¹, Chanduji Popatji Thakor²",
    affiliation:
      "1. Assistant Professor of Commerce and Management, Shri Govind Guru University, Vinzol-Godhra, Gujarat, India\n2. Assistant Professor of Commerce and Management, Shri Govind Guru University, Vinzol-Godhra, Gujarat, India",
    pages: "1-10",
    volume: "1",
    issue: "1",
    year: "2025",
    journal: "Scholar Journal of Commerce and Management",
    pdfUrl: "/downloads/sjcm-v1i1-001.pdf",
    abstract:
      "Mobile commerce (M-commerce) has emerged as a pivotal driver of digital transformation and inclusive economic growth in developing economies. It enables consumers and enterprises to conduct financial and commercial transactions through mobile devices, creating new pathways for entrepreneurship, trade, and financial access. The expansion of M-commerce, however, largely depends on the effectiveness of government-led initiatives aimed at enhancing digital infrastructure, improving financial inclusion, and ensuring regulatory security. This study examines the critical role of government policies and programs in fostering M-commerce development across developing nations. By analyzing initiatives such as India's Digital India Mission and Unified Payments Interface (UPI), Kenya's M-Pesa framework, and Nigeria's National Digital Economy Policy and Strategy (NDEPS), the paper explores how strategic government interventions contribute to technological adoption and economic participation. The research further identifies persistent barriers, including cybersecurity risks, uneven connectivity, and low digital literacy, that hinder large-scale adoption. The findings indicate that sustained policy innovation, robust public-private partnerships, and investment in digital education are essential to achieving equitable and long-term growth in M-commerce.",
    keywords: [
      "M-Commerce",
      "Developing Economies",
      "Government Initiatives",
      "Digital Infrastructure",
      "Financial Inclusion",
      "Mobile Payments",
      "E-Governance",
      "Public–Private Partnerships",
      "Digital Literacy",
      "Economic Growth",
      "Digital Transformation",
    ],
    doi: "10.65219/sjcm.20250101001",
  },
  "sjcm-v1i1-002": {
    id: "sjcm-v1i1-002",
    title: "CONSUMER PERCEPTION TOWARDS DIGITAL PAYMENT MODE IN BANKING SECTOR",
    authors: "A. Vini Infanta¹",
    affiliation:
      "1. Assistant Professor of Professional Accounting and Finance, School of Commerce, Accounting and Finance, Kristu Jayanti Deemed to be University, Bengaluru, India",
    pages: "11-18",
    volume: "1",
    issue: "1",
    year: "2025",
    journal: "Scholar Journal of Commerce and Management",
    pdfUrl: "/pdfs/sjcm-v1i1-002.pdf",
    abstract:
      "Digital platforms have significantly altered the manner in which consumers interact with financial services. The present study examines consumer perception of digital payment modes in the banking sector, with particular emphasis on usage patterns and satisfaction levels associated with specific digital payment facilities. The research employs a quantitative approach using primary data collected through a structured questionnaire administered to respondents in Coimbatore city. Statistical techniques such as percentage analysis and the chi-square test were applied to analyze the data. The findings reveal that convenience, ease of use, and time efficiency are the primary drivers of digital payment adoption, while concerns related to security and internet connectivity continue to act as barriers. The study provides insights that may assist banks and policymakers in strengthening digital payment infrastructure and improving customer confidence in cashless transactions.",
    keywords: [
      "Consumer Perception",
      "Digital Payment",
      "Cashless Economy",
      "Banking Services",
    ],
    doi: "10.65219/sjcm.20250101002",
  },
  "sjcm-v1i1-003": {
    id: "sjcm-v1i1-003",
    title:
      "IMPACT OF SOCIAL MEDIA MARKETING ON BRAND LOYALTY WITH MEDIATING ROLE OF PURCHASE INTENTION AMONG GEN Z - AN EMPIRICAL STUDY",
    authors: "M. Suganya¹",
    affiliation:
      "1. Assistant Professor, BBA Department, DDGD Vaishnav College, Arumbakkam, Chennai, India",
    pages: "19-25",
    volume: "1",
    issue: "1",
    year: "2025",
    journal: "Scholar Journal of Commerce and Management",
    pdfUrl: "/downloads/sjcm-v1i1-003.pdf",
    abstract:
      "Social media marketing is helpful for business people in different ways. Social media helps to connect the people to share their opinion about the products and services. The firms can also target the audience to build their Purchase Intention and Brand Loyalty. This research study is quantitative in nature. Data are collected using a structured questionnaire from 86 respondents of Chennai by adopting a convenient sampling method. T-test, Anova, Correlation, and Regression are done using SPSS 23.0. The results show that social media activities have a significant impact on brand loyalty and purchase intention. E-WoM and Online Communities are having a positive impact on purchase intention and brand loyalty among Gen Z. This research is limited to Chennai city. This study provides theoretical and practical implications to the marketers in understanding how effectively they can provide products/services to the consumers and implement the advertisements on social media.",
    keywords: [
      "E-WoM",
      "Social Media",
      "Marketing",
      "Purchase Intention",
      "Brand Loyalty",
      "Online Communities",
      "Online Advertisement",
      "Gen Z",
    ],
    doi: "10.65219/sjcm.20250101003",
  },
  "sjcm-v1i1-004": {
    id: "sjcm-v1i1-004",
    title:
      "STUDY ON FINANCIAL LITERACY AND AWARENESS AMONG WORKING WOMEN: A SURVEY BASED APPROACH IN PANCHMAHAL DISTRICT",
    authors: "Chanduji Popatji Thakor¹",
    affiliation:
      "1. Assistant Professor of Commerce and Management, Shri Govind Guru University, Vinzol-Godhra, Gujarat, India",
    pages: "26-30",
    volume: "1",
    issue: "1",
    year: "2025",
    journal: "Scholar Journal of Commerce and Management",
    pdfUrl: "/downloads/sjcm-v1i1-004.pdf",
    abstract:
      "The term financial literacy indicates the way to know, to understand how the money works. Good financial literacy throws light on one's awareness on various avenues, skills and investment decision. Investment is done for the benefit of mere future, either for short term or long term. This study aims to investigate the financial literacy, awareness of working women on investment avenues, preferred avenues and factors influencing on their investment decision. The result reflects that women are less aware on various avenues. Along with the demographic factors like marital status, income, certain specific factors namely liquidity, safety, risk and return associated with avenues influence in their investment decision.",
    keywords: ["Financial Literacy", "Investment Decision", "Working Women"],
    doi: "10.65219/sjcm.20250101004",
  },
  "sjcm-v1i1-005": {
    id: "sjcm-v1i1-005",
    title: "EFFECTIVENESS OF SOCIAL MEDIA ADVERTISING ON BRAND LOYALTY",
    authors: "R. Ramki¹, R. M. Uma²",
    affiliation:
      "1. Assistant Professor, Department of Commerce, Hindustan Institute of Technology & Science, Padur, Chennai, India\n2. Assistant Professor, Department of Commerce, Hindustan Institute of Technology & Science, Padur, Chennai, India",
    pages: "31-35",
    volume: "1",
    issue: "1",
    year: "2025",
    journal: "Scholar Journal of Commerce and Management",
    pdfUrl: "/downloads/sjcm-v1i1-005.pdf",
    abstract:
      "Social media has transformed the advertising industry, impacting customer behaviour in new ways. This study investigates the effects of Social Interaction in important consumer actions: brand recognition, trust, loyalty, and purchasing intent. The study investigates how different demographic factors influence consumer engagement with social media marketing using quantitative analysis, including correlation and Chi-Square testing. The findings show that personalized and interactive advertising methods improve brand-consumer interactions, promoting more trust and loyalty. Furthermore, social media consumer purchasing decisions are greatly affected by the presence of advertising by improving brand visibility and engagement. The study offers significant data for firms looking to optimize their digital marketing strategy and increase the effectiveness of their online advertising.",
    keywords: [
      "Social Media Advertising",
      "Consumer Behaviour",
      "Brand Awareness",
      "Trust",
      "Loyalty",
      "Purchasing Intent",
      "Digital Marketing",
      "Online Engagement",
      "Personalized Advertising",
    ],
    doi: "10.65219/sjcm.20250101005",
  },
  "sjcm-v2i1-001": {
    id: "sjcm-v2i1-001",
    title:
      "SOCIO ECONOMIC STATUS OF REGISTERED CONSTRUCTION WORKERS IN TIRUNELVELI DISTRICT",
    authors: "Samuel Jayaraman¹",
    affiliation:
      "1. Assistant Professor, Department of B.Com (Accounting & Finance), Loyola College (Autonomous), Chennai, India",
    pages: "1-5",
    volume: "2",
    issue: "1",
    year: "2026",
    journal: "Scholar Journal of Commerce and Management",
    pdfUrl: "/downloads/sjcm-v2i1-001.pdf",
    abstract:
      "The construction sector is a key driver of economic growth in India and a major source of employment, particularly within the unorganised segment. Despite the availability of several welfare schemes, construction workers continue to experience economic and social insecurity. This study assesses the socio-economic conditions and quality of work life of registered construction workers in the Tirunelveli district of Tamil Nadu. Primary data were collected from 592 registered workers through a structured interview schedule. The analysis focuses on demographic characteristics and core dimensions such as general well-being, working conditions, job satisfaction, social security, and grievance redressal mechanisms. The results indicate persistent issues related to employment instability, insufficient health protection, and limited access to effective social security benefits. The findings suggest that worker registration alone is not sufficient to ensure better living or working conditions. The study emphasizes the need to strengthen policy implementation, improve workplace safety, and enhance welfare delivery systems to promote sustainable development and worker well-being in the construction sector.",
    keywords: [
      "Construction Workers",
      "Social Security",
      "Socio-Economic Status",
      "Quality of Work Life",
      "Unorganized Sector",
    ],
    doi: "10.65219/sjcm.20260201001",
  },
  "sjcm-v2i1-002": {
    id: "sjcm-v2i1-002",
    title:
      "EXPLORING THE RELATIONSHIP BETWEEN CREATIVITY AND CURIOSITY AMONG HIGHER SECONDARY STUDENTS IN TIRUVALLUR DISTRICT",
    authors: "N. Purusothaman¹, Nirmala²",
    affiliation:
      "1. Assistant Professor & Research Supervisor, Department of Commerce, Patrician College of Arts and Science, Chennai, India\n2. Student, Department of Commerce, Patrician College of Arts and Science, Chennai, India",
    pages: "06–13",
    volume: "2",
    issue: "1",
    year: "2026",
    journal: "Scholar Journal of Commerce and Management",
    pdfUrl: "/downloads/sjcm-v2i1-002.pdf",
    abstract:
      "Creativity and curiosity are fundamental psychological characteristics that play a vital role in students’ intellectual growth and meaningful learning experiences. In recent years, educational systems have increasingly emphasized the development of these attributes, particularly at the higher secondary level, where students undergo significant cognitive and emotional changes. The present study examines the relationship between creativity and curiosity among higher secondary school students in Tiruvallur District, Tamil Nadu. A normative survey method was employed, and data were collected from a stratified random sample of higher secondary students to ensure adequate representation of demographic variables. Standardised tools were administered to measure students’ levels of creativity and curiosity. The findings reveal that students demonstrate moderate levels of creativity and curiosity, and a statistically significant positive relationship exists between the two variables. The study highlights the importance of fostering curiosity-driven learning environments to enhance creative thinking among higher secondary students.",
    keywords: [
      "Creativity",
      "Curiosity",
      "Higher Secondary Students",
      "Cognitive Development",
      "Tiruvallur District",
    ],
    doi: "10.65219/sjcm.20260201002",
  },
  "sjhss-v1i1-001": {
    id: "sjhss-v1i1-001",
    title:
      "LIBRARIES AS CATALYSTS OF CHANGE: A STUDY ON THE DEVELOPMENT OF RURAL LIBRARIES AND STUDENT EMPOWERMENT IN IDAPPADI, SALEM DISTRICT",
    authors: "Ganesan V¹",
    affiliation:
      "1. Centre of Online and Distance Education (CDOE), Bharathidasan University, Tiruchirappalli, India",
    pages: "01 - 05",
    volume: "1",
    issue: "1",
    year: "2026",
    journal: "Scholar Journal of Humanities and Social Sciences",
    pdfUrl: "/downloads/sjhss-v1i1-001.pdf",
    abstract:
      "This study examines the role of rural libraries in empowering students in Idappadi, a block in Salem District, Tamil Nadu. Rural libraries serve as community knowledge hubs that provide access to books, digital resources, and educational programs. Using a descriptive survey design, data were collected from 100 students, 10 teachers, and 5 librarians through questionnaires and interviews. The findings indicate that the majority of students rely heavily on libraries for textbooks and reference materials (about 85%), while less than half use digital/internet resources (40%). Over half of the students utilize libraries for career and exam-preparation materials. Qualitative feedback showed that libraries boost student confidence and reduce dependence on private coaching. However, infrastructural gaps (outdated collections, limited internet) constrain their impact. Consistent with UNESCO’s vision, public libraries in Idappadi provide a “gateway to knowledge” and contribute to educational equity. Strengthening infrastructure, ICT access, and partnerships with schools and NGOs is recommended to maximize their role as catalysts for positive change.",
    keywords: [
      "Rural Libraries",
      "Student Empowerment",
      "Educational Development",
      "Community Learning",
    ],
    doi: "10.65219/sjhss.20260101001",
  },
  "sjhss-v1i1-002": {
    id: "sjhss-v1i1-002",
    title:
      "REWRITING MASCULINITY THROUGH FATHERS IN IAN MCEWAN’S THE CHILD IN TIME AND KHALED HOSSEINI’S THE KITE RUNNER",
    authors: "P. Rajini¹, Ariharan S²",
    affiliation:
      "1. Assistant Professor of English, Government Arts and Science College, Idappadi, India\n2. Ph.D. Research Scholar, School of Liberal Arts and Humanities, Woxsen University, Hyderabad",
    pages: "06 – 11",
    volume: "1",
    issue: "1",
    year: "2026",
    journal: "Scholar Journal of Humanities and Social Sciences",
    pdfUrl: "/downloads/sjhss-v1i1-002.pdf",
    abstract:
      "Fatherhood fiction provides the prism through which the malleability and moral aspects of masculinity can be questioned. Stephen Lewis of The Child in Time by Ian McEwan represents a grieved masculinity: “he could not talk, could not even breathe correctly; his sorrow had made a wall around him” (McEwan 87). His emotional detachment and ritualistic habits - like his obsessive organization of the toys of his dead daughter - show that “trauma exaggerates the socialization of stoic manhood, turning care into silent incarceration” (McEwan 112). The Kite Runner by Khaled Hosseini offers the concept of fatherhood as a place of moral and emotional bargaining. The authoritative figure of Baba is mixed with caring behaviors, Rahim Khan is a great example of a mentor, As Amir grows up to be a caring father to Sohrab, he says, “To you, a thousand times over”, (Hosseini 152). These representations broaden masculinity to include vulnerability, moral bravery and amenable love. In comparison of these two texts, we get the idea of masculinity as a continuum: the stoicism of Stephen, who is devastated by the loss of loved ones, and the proactive approach to care, responsibility, and ethical behavior of Baba and Amir. Fatherhood in these novels is not just a social role, but a transformational power, which is modulate in terms of moral, emotional, and relationship aspects of the male identity. The paper sheds light on the way literature subverts conventional gender conventions and that grief, kindness and moral accountability are constituent parts of true manhood.",
    keywords: [
      "Masculinity",
      "Fatherhood",
      "Emotional Vulnerability",
      "Ethical Responsibility",
      "The Child in Time",
      "The Kite Runner",
    ],
    doi: "10.65219/sjhss.20260101002",
  },
  "sjhss-v1i1-003": {
    id: "sjhss-v1i1-003",
    title:
      "MOTHERHOOD AS THE LAST SHELTER AND THE PRACTICE OF CARE BEYOND BORDERS IN BAPSI SIDHWA CRACKING INDIA AND JHUMPA LAHIRI THE NAMESAKE",
    authors: "Ariharan S¹, P. Rajini²",
    affiliation:
      "1. Ph.D. Research Scholar, School of Liberal Arts and Humanities, Woxsen University, Hyderabad, India\n2. Assistant Professor of English, Government Arts and Science College, Idappadi, India",
    pages: "12 – 18",
    volume: "1",
    issue: "1",
    year: "2026",
    journal: "Scholar Journal of Humanities and Social Sciences",
    pdfUrl: "/downloads/sjhss-v1i1-003.pdf",
    abstract:
      "Nations collapse. Homes vanish. Mothers endure. Mothers care is the final refuge in Bapsi Sidhwa Cracking India and Jhumpa Lahiri The Namesake, to the extent that displacement has become survival, rupture continuity and domestic space turned into ethical refuge. The dividing border causes the breakage of families, though the motherly looks develop security: “However, the women had already shut the doors with their children, and no one was able to open it (Sidhwa 95). Diasporic exile comes with less obvious pressures, but this requires emotional work, cultural translation, and silent endurance: “Ashima had not yet learned how to make friends here, and each morning she woke with little panic of her own, the children, and Ashoke (Lahiri 45). Motherhood becomes a radical, ethical practice, which spans past biological or social roles. The exile and its voluntary variant intersect in maternal tactics that hold the memory, maintain the identity and withstand the process of fragmentation. In these writings, care stops being a personal affair but a place of action and repetition. Mothers are the builders of stability, culture memory and carriers of resilience, redefining the territories of home, nation and belonging. This work has a place in the South Asian diaspora and feminist literary studies in terms of focusing maternal labor as a political, emotional, and ethical power, uncovering motherhood as a decisive factor in creating the narratives about survival, memory, and cross-generational identity.",
    keywords: [
      "Diaspora",
      "Exile",
      "Motherhood",
      "Maternal Care",
      "Partition",
      "South Asian Literature",
      "Ethical Resistance",
    ],
    doi: "10.65219/sjhss.20260101003",
  },
  "sjhss-v1i1-004": {
    id: "sjhss-v1i1-004",
    title:
      "IMPACT OF LAUGHTER THERAPY ON CAREGIVER BURDEN AND RESILIENCE AMONG ADHDCAREGIVERS",
    authors: "R. Salman¹, S. Srikumaran², K. Nagalakshmi³",
    affiliation:
      "1. Ph.D. Research Scholar, Department of Psychology, Annamalai University\n2. Ph.D. Research Scholar, Department of Psychology, Annamalai University\n3. Associate Professor, Department of Psychology, Annamalai University, Annamalai Nagar, Cuddalore",
    pages: "19 – 25",
    volume: "1",
    issue: "1",
    year: "2026",
    journal: "Scholar Journal of Humanities and Social Sciences",
    pdfUrl: "/downloads/sjhss-v1i1-004.pdf",
    abstract:
      "Caregivers of children diagnosed with Attention-Deficit/Hyperactivity Disorder (ADHD) frequently experience high levels of psychological burden and reduced resilience due to persistent caregiving responsibilities. The present study examined the effectiveness of laughter therapy as a non-pharmacological intervention for reducing caregiver burden and enhancing resilience. A quasi-experimental pre-test and post-test design was employed with a purposive sample of 30 primary caregivers of children with ADHD. Standardized measures of caregiver burden and resilience were administered before and after a structured laughter therapy program. Paired sample t-test results revealed a statistically significant reduction in caregiver burden and a significant improvement in resilience following the intervention. The findings indicate that laughter therapy serves as an effective, low-cost psychological intervention for promoting caregiver well-being. The study highlights the importance of incorporating caregiver-focused emotional interventions into clinical and community support programs.",
    keywords: [
      "Laughter Therapy",
      "Caregiver Burden",
      "Resilience",
      "ADHD Caregivers",
    ],
    doi: "10.65219/sjhss.20260101004",
  },
  "sjhss-v1i1-005": {
    id: "sjhss-v1i1-005",
    title: "AI AND THE FUTURE OF SCHOLARLY PUBLISHING IN ENGLISH STUDIES",
    authors: "Devi K¹, Ariharan S², P. Rajini³",
    affiliation:
      "1. B.Ed. Student, Avinashilingam Institute for Home Science & Higher Education for Women, Coimbatore, India\n2. Ph.D. Research Scholar, School of Liberal Arts and Humanities, Woxsen University, Hyderabad, India\n3. Assistant Professor of English, Government Arts and Science College, Idappadi, India",
    pages: "26 – 34",
    volume: "1",
    issue: "1",
    year: "2026",
    journal: "Scholar Journal of Humanities and Social Sciences",
    pdfUrl: "/downloads/sjhss-v1i1-005.pdf",
    abstract:
      'Artificial Intelligence (AI) and Machine Learning (ML) technologies are rapidly transforming scholarly publishing, with far-reaching implications for English Studies. AI tools now assist at every stage of research-from literature discovery and writing to citation analysis and editorial selection. For example, AI-powered assistants like Elicit and Scholarcy streamline literature reviews by summarizing large volumes of texts, while grammar and editing tools (e.g. Grammarly, Wordvice AI) help non-native English researchers refine their writing. Publishers and platforms similarly harness AI: Elsevier\'s Journal Finder matches manuscripts to "over 2,500 peer-reviewed" journals, and bibliometric tools like scite.ai classify citation contexts automatically. Large-scale text-mining methods (topic modeling, stylometry, distant reading) enable English scholars to analyze entire literary corpora and even predict emerging trends in fields such as eco-criticism or digital humanities. At the same time, AI raises serious ethical questions. Committee on Publication Ethics (COPE) guidelines emphasize that AI cannot be listed as an author, since AI "has no legal standing" to take responsibility, and authors must disclose AI use and remain accountable for all content. Critics also warn that AI tends to produce homogeneous output. Conversely, AI offers opportunities: neural translation and editing tools promise a future where "everyone can use their own language to write, assess and read science". In sum, English Studies stands at a crossroads. If adopted judiciously, AI can democratize research and enable novel digital humanities methods, but unchecked reliance risks eroding creativity, interpretative plurality, and scholarly integrity. This paper surveys existing literature and emerging practice to chart AI\'s benefits and pitfalls for the future of publishing in English Studies.',
    keywords: [
      "Artificial Intelligence",
      "Machine Learning",
      "English Studies",
      "Scholarly Publishing",
      "Digital Humanities",
      "Research Ethics",
    ],
    doi: "10.65219/sjhss.20260101005",
  },
  "sjhss-v1i1-006": {
    id: "sjhss-v1i1-006",
    title:
      "HARAWAY AND BRAIDOTTI CYBORG SUBJECTIVITIES AND POSTGENDER FUTURES: A COMPARATIVE STUDY",
    authors: "Karthika G¹, Ariharan S²",
    affiliation:
      "1. Assistant Professor of English, Kailash Women's College, Nangavalli, India\n2. Ph.D. Research Scholar, School of Liberal Arts and Humanities, Woxsen University, Hyderabad, India",
    pages: "35 – 41",
    volume: "1",
    issue: "1",
    year: "2026",
    journal: "Scholar Journal of Humanities and Social Sciences",
    pdfUrl: "/downloads/sjhss-v1i1-006.pdf",
    abstract:
      "Posthuman feminism combines both decry of anthropocentric humanism and new glimpses of non-binary gender. The paper presents the ideas of the posthuman, feminist theory, and the postgender discourse and frames the analysis in the context of the posthuman feminist thinking. It prefigures the Cyborg Manifesto by Donna Haraway and the Posthuman by Rosi Braidotti as some of the most significant works that redefine subjectivity and gender in a techno-ecological world. The paper explores the concept of cyborg subjectivities as a model of conceptualizing postgender futures with a particular focus on how their transgressive models of boundaries disrupt fixed identities. The theories of Haraway and Braidotti are compared by means of critical-textual approach, and it is important to note that they are similar in their themes, such as hybridity, relationality, and criticism of Enlightenment Humanism. The discussion concludes that the theorists view postgender futures as emergent, relational, multiplied process of ethical becoming: the cyborg of Haraway transcends gender binarism, and nomadic subjectivity of Braidotti breaks the human-centeredness. Such frameworks indicate new perspectives of new feminist theory and posthuman studies, incorporating technological embodiment and ecological ethics. The importance is in the expression of a postgender praxis, in which gender hierarchies are broken, attempting to suggest a political-ethical transformation toward interspecies solidarity and new-materialist ethics.",
    keywords: [
      "Cyborg Subjectivities",
      "Postgender Futures",
      "Donna Haraway",
      "Rosi Braidotti",
      "Posthuman Feminism",
      "New Materialism",
    ],
    doi: "10.65219/sjhss.20260101006",
  },
  "sjcm-v2i1-003": {
    id: "sjcm-v2i1-003",
    title: "MARKETING OF JASMINE IN SATHYAMANGALAM BLOCK OF ERODE DISTRICT",
    authors: "P. Shanmugam¹, T. Praveena²",
    affiliation:
      "1. Associate Professor, Department of Economics, Bharathiar University\n2. Ph.D. Research Scholar, Department of Economics, Bharathiar University, Tamil Nadu, India",
    pages: "14 - 21",
    volume: "2",
    issue: "1",
    year: "2025",
    journal: "Scholar Journal of Commerce and Management",
    pdfUrl: "/downloads/sjcm-v2i1-003.pdf",
    abstract:
      "In India, particularly in Tamil Nadu, jasmine is a floral crop with cultural and commercial significance. A beautiful flower, jasmine is valued in religious and cultural activities by people of many backgrounds. In India, jasmine cultivation is seen as a new and quickly growing industry. Only small farmers are interested in growing the jasmine crop because it takes a lot of labor to harvest and perform other tasks. Due to their extreme perishability, jasmine flowers must be sold right away after harvesting in order to preserve their freshness. As a result, an effort has been made to determine the issues and future possibilities of this industry as well as the primary determinant of jasmine prices. Based on primary data gathered by simple random sampling, the study employs a descriptive and analytical technique to identify price fluctuations and ineffective marketing as the main restraints. The price of jasmine is highly influenced by the number of members engaged in agriculture, according to regression study. This puts the marketing of jasmine flowers at serious risk. The main conclusion of the study was that those working in agriculture were the main factor influencing the price of jasmine.",
    keywords: ["Jasmine", "Marketing Constraints", "Primary Data"],
    doi: "10.65219/sjcm.20260201003",
  },
  "sjcm-v2i1-004": {
    id: "sjcm-v2i1-004",
    title:
      "BRIDGING THE AWARENESS – ACTION GAP IN FINANCIAL LITERACY AMONG CHENNAI COLLEGE STUDENTS",
    authors:
      "Kalaiarasan C¹, Kamalesh G², Kovid Raghav R², Ishit Agarwal², Shanmugapriyan J² & Joi Levis A²",
    affiliation:
      "1. Assistant Professor, Department of B.Com Computer Applications, Loyola College (Autonomous), Chennai, India\n2. Student, Department of B.Com Computer Applications, Loyola College (Autonomous), Chennai, India",
    pages: "22 - 28",
    volume: "2",
    issue: "1",
    year: "2026",
    journal: "Scholar Journal of Commerce and Management",
    pdfUrl: "/downloads/sjcm-v2i1-004.pdf",
    abstract:
      "Financial literacy has become an essential life skill in an increasingly digital and complex financial environment. With expanding access to online banking, fintech services, and investment platforms, young individuals must develop the knowledge and practical competence required for informed financial decision-making. This study examines the level of financial literacy, investment behaviour, and readiness for financial independence among college students. Using primary data collected from 105 respondents through a structured questionnaire, the research applies descriptive statistics and ANOVA to evaluate learning outcomes across different financial education formats. The findings reveal that while more than half of the students participate in some form of investment, financial engagement is constrained primarily by structural and educational barriers such as lack of income and limited financial knowledge. The study also shows strong student support for formal financial education and high willingness to participate in financial literacy programs. ANOVA results indicate that the format of financial education significantly influences knowledge acquisition and behavioural outcomes, with structured academic courses and online learning resources demonstrating higher effectiveness. However, statistical testing shows that perceived barriers alone do not significantly determine investment participation, suggesting that financial behaviour is shaped by multiple interacting factors. Overall, the study highlights a clear gap between financial awareness and financial action, emphasizing the need for structured, practical, and accessible financial education initiatives to strengthen financial capability among youth.",
    keywords: [
      "Financial literacy",
      "Investment behaviour",
      "Financial education formats",
      "College students",
      "Financial decision-making",
    ],
    doi: "10.65219/sjcm.20260201004",
  },
  "sjcm-v2i1-005": {
    id: "sjcm-v2i1-005",
    title: "IMPACT OF INFRASTRUCTURE TRANSPARENCY ON TRUST IN BANKING CHATBOTS",
    authors: "S. Shilpa¹, N. Purusothaman²",
    affiliation:
      "1. Research Scholar of Commerce, Patrician College of Arts and Science, Chennai, India\n2. Assistant Professor and Research Supervisor, Patrician College of Arts and Science, Chennai, India",
    pages: "29 - 37",
    volume: "2",
    issue: "1",
    year: "2026",
    journal: "Scholar Journal of Commerce and Management",
    pdfUrl: "/downloads/sjcm-v2i1-005.pdf",
    abstract:
      "The increasing adoption of AI-based chatbots in the banking sector has reshaped customer service by enabling automated, efficient, and accessible digital interactions. Despite these benefits, user trust remains a crucial factor influencing the acceptance and continued use of banking chatbots. This study investigates how awareness of banking chatbot infrastructure and perceived infrastructure transparency affect user trust, perceived system reliability and security, and usage intention. Using a structured questionnaire, the study examines users' understanding of chatbot operations, the extent to which banks communicate chatbot roles, limitations, and data processing practices, and how such transparency influences confidence and trust. The research further explores the relationship between system reliability, security perceptions, and trust in chatbot-supported banking services. By analyzing user perceptions across multiple dimensions, the study highlights the role of transparent digital infrastructure in reducing uncertainty and enhancing trust in AI-driven banking systems. The findings aim to provide empirical insights into how infrastructure transparency can strengthen customer confidence, encourage usage, and improve overall satisfaction with banking chatbots. This research contributes to the literature on trustworthy AI and digital banking by emphasizing the importance of awareness and transparency as key drivers of trust and adoption in financial chatbot services.",
    keywords: [
      "Banking Chatbots",
      "Infrastructure Transparency",
      "Trust in Digital Banking",
      "System Reliability",
      "AI-driven Banking Systems",
      "User Adoption",
    ],
    doi: "10.65219/sjcm.20260201005",
  },
  "sjcm-v2i1-006": {
    id: "sjcm-v2i1-006",
    title: "SOCIAL MEDIA INFLUENCE AND FINANCIAL LITERACY AS MEDIATORS BETWEEN FINTECH ADOPTION AND BEHAVIOURAL INTENTION AMONG COLLEGE YOUTH",
    authors: "R Indumathi¹, C. Revathy²",
    affiliation:
      "1. Research Scholar, PG & Research Department of Commerce, Guru Nanak College, Chennai, India\n2. Assistant Professor of PG & Research Department of Commerce, Guru Nanak College, Chennai, India",
    pages: "38 - 44",
    volume: "2",
    issue: "1",
    year: "2026",
    journal: "Scholar Journal of Commerce and Management",
    pdfUrl: "/downloads/sjcm-v2i1-006.pdf",
    abstract:
      "The rapid expansion of financial technology (FinTech) applications has transformed the way young people manage payments, savings, and investments. College youth, in particular, represent one of the most active user groups of digital financial platforms. However, their intention to adopt and continue using FinTech services depends not only on technological convenience but also on social influence and financial understanding. This study examines the role of social media influence and financial literacy as mediators in the relationship between FinTech adoption and behavioural intention among college youth. A descriptive and analytical research design was adopted, and data were collected from 300 college students in Chennai using a structured questionnaire. Statistical techniques including reliability analysis, correlation, regression, and Structural Equation Modelling (SEM) were employed. The results indicate that FinTech adoption significantly influences behavioural intention both directly and indirectly through social media influence and financial literacy. The study concludes that increasing digital engagement and financial awareness can significantly enhance FinTech usage among young consumers.",
    keywords: [
      "FinTech Adoption",
      "Social Media Influence",
      "Financial Literacy",
      "Behavioural Intention",
      "College Youth",
      "Digital Financial Services",
      "Consumer Behavior",
      "SEM Analysis",
    ],
    doi: "10.65219/sjcm.20260201006",
  },
  "sjhss-v1i1-007": {
    id: "sjhss-v1i1-007",
    title:
      "IMPACT OF DIGITAL STRESS ON EMOTIONAL DEPENDENCY AND MENTAL HEALTH AMONG INTIMATE COUPLES",
    authors: "S. Srikumaran¹, K. Nagalakshmi²",
    affiliation:
      "1. Ph.D. Research Scholar, Department of Psychology, Annamalai University\n2. Associate Professor, Department of Psychology, Annamalai University, Annamalai Nagar, Cuddalore",
    pages: "42 – 47",
    volume: "1",
    issue: "1",
    year: "2026",
    journal: "Scholar Journal of Humanities and Social Sciences",
    pdfUrl: "/downloads/sjhss-v1i1-007.pdf",
    abstract:
      "The present study examined the relationship between digital stress, emotional dependency and mental health among individuals involved in intimate relationships. A quantitative, cross-sectional correlational research design was employed. The sample consisted of 100 individuals aged between 20 and 28 years who were in intimate relationships, selected using a non-probability sampling method. Data were collected through an online survey using standardized self-report measures assessing digital stress, emotional dependency and positive mental health. Pearson’s product–moment correlation coefficient and simple linear regression analyses were conducted using IBM SPSS Statistics (Version 23). The results indicated a significant positive correlation between digital stress and emotional dependency and a significant negative correlation between digital stress and mental health. Regression analysis further revealed that digital stress significantly predicted emotional dependency and negatively predicted mental health among intimate couples. The findings suggest that increased digital stress may intensify emotional reliance within relationships while simultaneously undermining psychological well-being. The study highlights the importance of promoting digital well-being and balanced technology use to enhance mental health and relationship functioning among intimate couples.",
    keywords: [
      "Digital Stress",
      "Emotional Dependency",
      "Mental Health",
      "Intimate Couples",
    ],
    doi: "10.65219/sjhss.20260101007",
  },
  "sjhss-v1i1-008": {
    id: "sjhss-v1i1-008",
    title:
      "IMPACT OF DOOMSCROLLING ON EMOTIONAL REGULATION IN WORKING EMPLOYEES: THE MEDIATING ROLE OF PSYCHOLOGICAL DISTRESS",
    authors: "S. Vasanth¹, S. Srikumaran², K. Nagalakshmi³",
    affiliation:
      "1. M.Sc. Applied Psychology, Department of Psychology, Annamalai University\n2. Ph.D. Research Scholar, Department of Psychology, Annamalai University\n3. Associate Professor, Department of Psychology, Annamalai University, Annamalai Nagar, Cuddalore",
    pages: "48 – 58",
    volume: "1",
    issue: "1",
    year: "2026",
    journal: "Scholar Journal of Humanities and Social Sciences",
    pdfUrl: "/downloads/sjhss-v1i1-008.pdf",
    abstract:
      "The increasing dependence on digital media has intensified individuals’ exposure to emotionally disturbing online content, leading to a behavioural pattern commonly referred to as doomscrolling. Doomscrolling involves repeated engagement with negative news and social media information, which can adversely affect emotional and psychological functioning. The present study investigates the effect of doomscrolling on emotional regulation among working employees, with psychological distress acting as a mediating variable. A quantitative correlational design was employed, and data were collected using standardized instruments assessing doomscrolling behaviour, psychological distress, and emotional regulation. Statistical analyses including correlation and mediation testing were performed. The findings indicated that higher levels of doomscrolling were significantly associated with increased psychological distress and reduced emotional regulation. Furthermore, psychological distress partially mediated the relationship between doomscrolling and emotional regulation. The study highlights the psychological risks of maladaptive digital consumption and emphasizes the need for workplace interventions that encourage healthy media habits and emotional resilience among employees.",
    keywords: [
      "Doomscrolling",
      "Emotional Regulation",
      "Psychological Distress",
      "Working Employees",
    ],
    doi: "10.65219/sjhss.20260101008",
  },
  "sjhss-v1i1-009": {
    id: "sjhss-v1i1-009",
    title:
      "INFLUENCE OF PARTNER’S PHUBBING ON RELATIONSHIP SATISFACTION AND MENTAL HEALTH AMONG MARRIED COUPLES",
    authors: "S. Srikumaran¹, K. Nagalakshmi²",
    affiliation:
      "1. Ph.D. Research Scholar, Department of Psychology, Annamalai University\n2. Associate Professor, Department of Psychology, Annamalai University, Annamalai Nagar, Cuddalore",
    pages: "59 – 65",
    volume: "1",
    issue: "1",
    year: "2026",
    journal: "Scholar Journal of Humanities and Social Sciences",
    pdfUrl: "/downloads/sjhss-v1i1-009.pdf",
    abstract:
      "Beyond the realm of academics, phubbing is the common behavior possessed by many individuals from adolescence and continuing throughout their marital life, which in turn influences mental health. This study adds to the growing body of research on the effects of digital devices on contemporary interpersonal dynamics by clarifying the intricate interactions among phubbing, relationship satisfaction and mental health. To achieve this, the study will contain strategies to enhance relationship satisfaction and mental health. Partner’s Phubbing Scale, Relationship Assessment Scale (RAS) and Positive Mental Health Questionnaire (PMH) were administered to collect data through a Google Form for 100 samples of married couples using simple random sampling techniques by descriptive research design. The major findings are that there is a significant influence of a partner's phubbing behavior on relationship satisfaction and mental health. There is a significant negative correlation between a partner's phubbing behavior, relationship satisfaction and mental health.",
    keywords: [
      "Phubbing Behaviour",
      "Relationship Satisfaction",
      "Mental Health",
      "Married Couples",
    ],
    doi: "10.65219/sjhss.20260101009",
  },
};

export default function ArticleLanding() {
  const [, params] = useRoute("/article/:id");
  const articleId = params?.id || "";
  const article = articles[articleId];

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The article you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Clean author names — strip *, †, ‡, superscript digits
  const cleanAuthors = (raw: string) =>
    raw
      .replace(/[*†‡§¶]/g, "")
      .replace(/\d+/g, "")
      .replace(/\s+,/g, ",")
      .replace(/\s{2,}/g, " ")
      .trim();

  // Convert ALL-CAPS title to Title Case
  const toTitleCase = (str: string) => {
    const minor = new Set(["a","an","the","and","but","or","for","nor","on","at","to","by","in","of","up","as","with","from","into","through","during","before","after","above","below","between","against"]);
    return str
      .toLowerCase()
      .split(" ")
      .map((w, i) => (i === 0 || !minor.has(w)) ? w.charAt(0).toUpperCase() + w.slice(1) : w)
      .join(" ");
  };

  // Convert ALL-CAPS title to Sentence case
  const toSentenceCase = (str: string) => {
    const lower = str.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const isHumanities = article.id.startsWith("sjhss");
  const isCommerce = article.id.startsWith("sjcm");

  // APA 7th Edition citation
  const generateAPA7Citation = () => {
    const authors = cleanAuthors(article.authors);
    const title = toSentenceCase(article.title);
    const doi = article.doi ? ` https://doi.org/${article.doi}` : "";
    return `${authors}. (${article.year}). ${title}. ${article.journal}, ${article.volume}(${article.issue}), ${article.pages}.${doi}`;
  };

  // Harvard citation
  const generateHarvardCitation = () => {
    const authors = cleanAuthors(article.authors);
    const title = toTitleCase(article.title);
    const doi = article.doi ? ` Available at: https://doi.org/${article.doi}` : "";
    return `${authors} ${article.year}, '${title}', ${article.journal}, ${article.volume}(${article.issue}), pp. ${article.pages}.${doi}`;
  };

  // MLA 9th Edition citation
  const generateMLACitation = () => {
    const authors = cleanAuthors(article.authors);
    const title = toTitleCase(article.title);
    const doi = article.doi ? ` doi:${article.doi}.` : "";
    return `${authors}. "${title}." ${article.journal}, vol. ${article.volume}, no. ${article.issue}, ${article.year}, pp. ${article.pages}.${doi}`;
  };

  // Chicago citation
  const generateChicagoCitation = () => {
    const authors = cleanAuthors(article.authors);
    const title = toTitleCase(article.title);
    const doi = article.doi ? `. https://doi.org/${article.doi}` : "";
    return `${authors}. "${title}." ${article.journal} ${article.volume}, no. ${article.issue} (${article.year}): ${article.pages}${doi}`;
  };

  // Split pages to get first and last page
  const [firstPage, lastPage] = article.pages.includes("-")
    ? article.pages.split("-").map((p) => p.trim())
    : [article.pages, article.pages];

  return (
    <>
      <ArticleSEO
        title={article.title}
        authors={article.authors}
        journal={article.journal}
        volume={article.volume}
        issue={article.issue}
        firstPage={firstPage}
        lastPage={lastPage}
        year={article.year}
        pdfUrl={article.pdfUrl}
        abstract={article.abstract}
        keywords={article.keywords}
        doi={article.doi}
        articleUrl={`/article/${article.id}`}
      />
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            className="mb-6 text-blue-600 hover:text-blue-900 dark:text-blue-400"
            data-testid="button-back"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="h-1 w-full bg-[#213361]" />
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 px-6 py-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#213361]/10 border border-[#213361]/20">
                  <span className="text-xs font-semibold text-[#213361] dark:text-blue-300 uppercase tracking-wide">
                    {article.journal}
                  </span>
                </div>
                <CardTitle className="text-xl md:text-2xl font-serif leading-relaxed text-gray-900 dark:text-gray-50 font-bold">
                  {article.title}
                </CardTitle>
                <div className="space-y-2 pt-1">
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    {cleanAuthors(article.authors)}
                  </p>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {article.affiliation.split('\n').map((aff, idx) => (
                      aff.trim() && (
                        <div key={idx} className="leading-relaxed">
                          {aff.trim()}
                        </div>
                      )
                    ))}
                  </div>
                  <div className="pt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-[#213361] dark:text-blue-400">DOI: </span>
                      {article.doi ? (
                        <a
                          href={`https://doi.org/${article.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#213361] dark:text-blue-400 hover:underline font-medium"
                        >
                          {article.doi}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">
                          (will be added later)
                        </span>
                      )}
                    </p>
                    <Button
                      size="sm"
                      className="bg-[#213361] hover:bg-[#2a4078] text-white font-semibold shadow-sm transition-all w-full md:w-auto"
                      onClick={() => {
                        window.open(article.pdfUrl, "_blank");
                      }}
                      data-testid="button-download-pdf"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Full Article PDF
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="mt-6 space-y-6">
              {article.abstract && (
                <div>
                  <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-gray-100 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-1">
                    Abstract
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                    {article.abstract}
                  </p>
                </div>
              )}

              {article.keywords && article.keywords.length > 0 && (
                <div>
                  <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-gray-100 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-1">
                    Keywords
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {article.keywords.join(" · ")}
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-base font-bold mb-3 text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  How to Cite
                </h3>
                <div className="space-y-3">
                  {isCommerce ? (
                    // Commerce Journal - APA 7 only
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#213361] text-white">
                        <span className="text-xs font-bold uppercase tracking-wider">
                          APA Citation (7th Edition)
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed px-4 py-3 font-mono">
                        {generateAPA7Citation()}
                      </p>
                    </div>
                  ) : (
                    // Humanities Journal - All 4 styles
                    <>
                      {/* APA 7 */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#213361] text-white">
                          <span className="text-xs font-bold uppercase tracking-wider">
                            APA (7th Edition)
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed px-4 py-3 font-mono">
                          {generateAPA7Citation()}
                        </p>
                      </div>

                      {/* Harvard */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#213361] text-white">
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Harvard
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed px-4 py-3 font-mono">
                          {generateHarvardCitation()}
                        </p>
                      </div>

                      {/* MLA */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#213361] text-white">
                          <span className="text-xs font-bold uppercase tracking-wider">
                            MLA (9th Edition)
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed px-4 py-3 font-mono">
                          {generateMLACitation()}
                        </p>
                      </div>

                      {/* Chicago */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#213361] text-white">
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Chicago
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed px-4 py-3 font-mono">
                          {generateChicagoCitation()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-4 sticky top-8">
                {/* Journal Info Card */}
                <Card className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="h-1 w-full bg-[#213361]" />
                  <CardHeader className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
                    <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      Journal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-3 space-y-3 text-xs">
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Journal</p>
                      <p className="text-gray-600 dark:text-gray-400">{article.journal}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Volume/Issue</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Vol. {article.volume}, No. {article.issue}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Publication Year</p>
                      <p className="text-gray-600 dark:text-gray-400">{article.year}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Pages</p>
                      <p className="text-gray-600 dark:text-gray-400">{article.pages}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Publisher</p>
                      <p className="text-gray-600 dark:text-gray-400">Scholar India Publishers</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Related Articles */}
                <Card className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="h-1 w-full bg-[#213361]" />
                  <CardHeader className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
                    <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      More from This Journal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-xs text-[#213361] dark:text-blue-400 hover:text-[#2a4078] dark:hover:text-blue-300"
                      onClick={() => {
                        const url = isCommerce 
                          ? 'https://scholarindiapub.com/commerce-management#current-issue'
                          : 'https://scholarindiapub.com/humanities#current-issue';
                        window.location.href = url;
                      }}
                    >
                      ← View Current Issue
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-xs text-[#213361] dark:text-blue-400 hover:text-[#2a4078] dark:hover:text-blue-300"
                      onClick={() => {
                        const url = isCommerce 
                          ? 'https://scholarindiapub.com/commerce-management#archives'
                          : 'https://scholarindiapub.com/humanities#archives';
                        window.location.href = url;
                      }}
                    >
                      ← View Archives
                    </Button>
                  </CardContent>
                </Card>

                {/* Journals */}
                <Card className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="h-1 w-full bg-[#213361]" />
                  <CardHeader className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
                    <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      Our Journals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-3 space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-xs text-[#213361] dark:text-blue-400 hover:text-[#2a4078] dark:hover:text-blue-300"
                      onClick={() => window.location.href = 'https://scholarindiapub.com/commerce-management'}
                    >
                      → Scholar Journal of Commerce & Management
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-xs text-[#213361] dark:text-blue-400 hover:text-[#2a4078] dark:hover:text-blue-300"
                      onClick={() => window.location.href = 'https://scholarindiapub.com/humanities'}
                    >
                      → Scholar Journal of Humanities & Social Sciences
                    </Button>
                  </CardContent>
                </Card>

                {/* Submit Manuscript */}
                <Card className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="h-1 w-full bg-[#213361]" />
                  <CardHeader className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
                    <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      Contribute
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-3">
                    <Button
                      className="w-full bg-[#213361] hover:bg-[#2a4078] text-white font-semibold text-sm"
                      onClick={() => window.location.href = 'https://scholarindiapub.com/submit'}
                    >
                      Submit Manuscript
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
