import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

interface ArticleSEOProps {
  title: string;
  authors: string;
  journal: string;
  volume: string;
  issue: string;
  firstPage: string;
  lastPage: string;
  year: string;
  pdfUrl: string;
  abstract?: string;
  keywords?: string[];
  doi?: string;
  articleUrl: string;
  ogImage?: string;
}

export default function ArticleSEO({
  title,
  authors,
  journal,
  volume,
  issue,
  firstPage,
  lastPage,
  year,
  pdfUrl,
  abstract,
  keywords,
  doi,
  articleUrl,
  ogImage = "/og-image.jpg",
}: ArticleSEOProps) {
  // Parse authors into array
  const authorsList = authors
    .split(',')
    .map(a => a.trim().replace(/\*/g, ''))
    .filter(a => a.length > 0);

  // Full URL for PDF
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://scholarindiapub.com';
  const fullPdfUrl = pdfUrl.startsWith('http') ? pdfUrl : `${baseUrl}${pdfUrl}`;
  const fullArticleUrl = `${baseUrl}${articleUrl}`;
  
  // Full URL for OG image
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

  // Publication date (year/01/01 format for Google Scholar)
  const publicationDate = `${year}/01/01`;

  return (
    <Helmet title={`${title} | ${journal || 'Scholar India Publishers'}`}>
      <meta name="description" content={abstract || `Research article: ${title} published in ${journal}`} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullArticleUrl} />

      {/* Google Scholar Meta Tags - CRITICAL FOR INDEXING */}
      <meta name="citation_title" content={title} />
      
      {/* Authors - one tag per author */}
      {authorsList.map((author, index) => (
        <meta key={`author-${index}`} name="citation_author" content={author} />
      ))}
      
      <meta name="citation_publication_date" content={publicationDate} />
      <meta name="citation_journal_title" content={journal} />
      <meta name="citation_volume" content={volume} />
      <meta name="citation_issue" content={issue} />
      <meta name="citation_firstpage" content={firstPage} />
      <meta name="citation_lastpage" content={lastPage} />
      <meta name="citation_pdf_url" content={fullPdfUrl} />
      <meta name="citation_publisher" content="Scholar India Publishers" />
      <meta name="citation_language" content="en" />
      
      {/* DOI if available */}
      {doi && <meta name="citation_doi" content={doi} />}
      
      {/* Abstract */}
      {abstract && <meta name="citation_abstract" content={abstract} />}
      
      {/* Keywords */}
      {keywords && keywords.length > 0 && (
        <meta name="citation_keywords" content={keywords.join('; ')} />
      )}

      {/* Open Graph for Social Media - CRITICAL FOR WHATSAPP/FACEBOOK PREVIEW */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={abstract || `Peer-reviewed research article in ${journal} | International Academic Publication`} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={fullArticleUrl} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:site_name" content="Scholar India Publishers" />
      <meta property="article:published_time" content={publicationDate} />
      <meta property="article:author" content={authorsList.join(', ')} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={abstract || `Peer-reviewed research article in ${journal} | International Academic Publication`} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* Additional Academic Search Engine Tags */}
      <meta name="DC.title" content={title} />
      <meta name="DC.creator" content={authorsList.join('; ')} />
      <meta name="DC.publisher" content="Scholar India Publishers" />
      <meta name="DC.date" content={year} />
      <meta name="DC.type" content="Text.Serial.Journal" />
      <meta name="DC.format" content="application/pdf" />
      <meta name="DC.language" content="en" />
      
      {/* Robots - allow indexing */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
    </Helmet>
  );
}
