import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string; // Can be relative or absolute URL
  canonical?: string;
  type?: "website" | "article";
  author?: string;
  publishDate?: string;
}

export default function SEO({
  title,
  description,
  keywords = "academic journal, peer review, research publication, scholarly articles",
  ogImage = "/og-image.jpg",
  canonical,
  type = "website",
  author = "Scholar India Publishers",
  publishDate
}: SEOProps) {
  useEffect(() => {
    // Set page title - ensure it's SEO optimized (50-60 chars ideal)
    const optimizedTitle = title.length > 70 ? title.substring(0, 67) + "..." : title;
    document.title = optimizedTitle;

    // Convert relative URLs to absolute URLs (required for WhatsApp, Facebook, etc.)
    const getAbsoluteUrl = (url: string): string => {
      if (url.startsWith('http')) return url;
      if (url.startsWith('data:')) return url;
      const baseUrl = window.location.origin;
      return `${baseUrl}${url}`;
    };

    // Optimize description length (150-160 chars ideal for search results)
    const optimizedDescription = description.length > 160 ? description.substring(0, 157) + "..." : description;
    
    const absoluteOgImage = getAbsoluteUrl(ogImage);
    const canonicalUrl = canonical || window.location.href;

    // Helper function to set or update meta tags
    const setMetaTag = (name: string, content: string, attribute: string = "name") => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Basic meta tags (optimized for search engines)
    setMetaTag("description", optimizedDescription);
    setMetaTag("keywords", keywords.substring(0, 150)); // Max 150 chars
    setMetaTag("author", author);
    setMetaTag("robots", "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    setMetaTag("googlebot", "index, follow, max-image-preview:large");
    setMetaTag("google", "nopagereadaloud");
    setMetaTag("bingbot", "index, follow, max-image-preview:large");
    setMetaTag("slurp", "index, follow");
    
    // Language, locale, and geographical metadata
    setMetaTag("language", "English");
    setMetaTag("content-language", "en-US");
    setMetaTag("geo.region", "IN-TN");
    setMetaTag("geo.placename", "Chennai");
    setMetaTag("geo.position", "13.0827;80.2707");
    setMetaTag("ICBM", "13.0827, 80.2707");
    
    // Additional search engine optimization
    setMetaTag("revisit-after", "7 days");
    setMetaTag("rating", "general");
    setMetaTag("audience", "all");

    // Open Graph tags (use absolute URLs for social media compatibility)
    setMetaTag("og:title", optimizedTitle, "property");
    setMetaTag("og:description", optimizedDescription, "property");
    setMetaTag("og:type", type, "property");
    setMetaTag("og:image", absoluteOgImage, "property");
    setMetaTag("og:image:width", "1200", "property");
    setMetaTag("og:image:height", "630", "property");
    setMetaTag("og:image:type", "image/jpeg", "property");
    setMetaTag("og:site_name", "Scholar India Publishers", "property");
    setMetaTag("og:locale", "en_US", "property");
    setMetaTag("og:locale:alternate", "ta_IN", "property");
    
    // Twitter Card tags (use absolute URLs)
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", optimizedTitle);
    setMetaTag("twitter:description", optimizedDescription);
    setMetaTag("twitter:image", absoluteOgImage);
    setMetaTag("twitter:site", "@scholarindia");
    setMetaTag("twitter:creator", "@scholarindia");
    setMetaTag("twitter:domain", window.location.hostname);
    
    // Article specific tags
    if (type === "article" && publishDate) {
      setMetaTag("article:published_time", publishDate, "property");
      setMetaTag("article:publisher", "Scholar India Publishers", "property");
      setMetaTag("article:author", author, "property");
    }
    
    // Academic search engines
    setMetaTag("citation_publisher", "Scholar India Publishers");
    setMetaTag("citation_language", "en");

    // Canonical URL - always set to current URL if not explicitly provided
    let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!linkElement) {
      linkElement = document.createElement("link");
      linkElement.setAttribute("rel", "canonical");
      document.head.appendChild(linkElement);
    }
    linkElement.setAttribute("href", canonicalUrl);

    // Set og:url based on current URL
    setMetaTag("og:url", window.location.href, "property");
  }, [title, description, keywords, ogImage, canonical, type]);

  return null;
}
