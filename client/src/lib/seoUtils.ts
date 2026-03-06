// SEO Utility Functions for optimizing website visibility

export const SEO_KEYWORDS = {
  journal: "academic journal, peer-reviewed journal, research journal, scholarly articles, journal publication, international journal",
  commerce: "commerce journal, management journal, business research, accounting, finance, entrepreneurship, supply chain, digital marketing",
  humanities: "humanities journal, literature journal, philosophy journal, cultural studies, linguistics, history research",
  socialSciences: "social sciences journal, sociology, psychology, political science, anthropology, economics, social research",
  publisher: "academic publisher, journal publisher, research publication, scholarly publishing, academic publishing, DOI assignment",
  services: "book publication, conference proceedings, manuscript editing, plagiarism checking, translation services",
  submission: "submit manuscript, article submission, call for papers, manuscript guidelines, peer review process",
  author: "publish research, author guidelines, editorial board, editor-in-chief, reviewer guidelines",
};

export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": typeof window !== 'undefined' ? `${window.location.origin}${item.url}` : item.url
  }))
});

export const generateArticleSchema = (article: {
  title: string;
  abstract: string;
  authors: string[];
  publicationDate: string;
  doi: string;
  journal: string;
  pages?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  "headline": article.title,
  "description": article.abstract,
  "author": article.authors.map(author => ({
    "@type": "Person",
    "name": author
  })),
  "datePublished": article.publicationDate,
  "identifier": {
    "@type": "PropertyValue",
    "propertyID": "doi",
    "value": article.doi
  },
  "isPartOf": {
    "@type": "Periodical",
    "name": article.journal
  },
  "pageEnd": article.pages?.split('-')[1],
  "pageStart": article.pages?.split('-')[0]
});

export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const generateOrganizationContactSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Scholar India Publishers",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Editorial Office",
    "email": "editor@scholarindiapub.com",
    "availableLanguage": ["English", "Tamil"]
  }
});

export const getCanonicalUrl = (path: string) => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  return path;
};

// Optimize keyword distribution in content
export const optimizeKeywords = (keywords: string[]): string => {
  return keywords
    .filter(k => k.length > 2)
    .join(", ")
    .substring(0, 160);
};
