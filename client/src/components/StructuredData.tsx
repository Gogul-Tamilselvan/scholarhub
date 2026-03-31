import { useEffect } from "react";

interface StructuredDataProps {
  type: "Organization" | "Periodical" | "WebPage" | "Service";
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    // Create or update script tag with structured data
    const scriptId = `structured-data-${type.toLowerCase()}`;
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    
    script.textContent = JSON.stringify(data);
    
    return () => {
      // Cleanup on unmount
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [type, data]);
  
  return null;
}

// Helper function to create Organization structured data
export function createOrganizationData() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "Publisher"],
    "name": "Scholar India Publishers",
    "alternateName": ["Scholar India Publishers Journals", "SIP Journals", "Scholar India"],
    "url": typeof window !== 'undefined' ? window.location.origin : "",
    "logo": typeof window !== 'undefined' ? `${window.location.origin}/og-image.jpg` : "",
    "description": "Scholar India Publishers is an MSME registered international peer-reviewed academic journal publisher based in Chennai, Tamil Nadu, India. We publish three distinguished journals: Scholar Journal of Commerce and Management, Scholar Journal of Humanities, and Scholar Journal of Social Sciences. Providing fast publication, DOI assignment, and rigorous double-blind peer review since 2022.",
    "foundingDate": "2022",
    "founder": {
      "@type": "Person",
      "name": "Dr. Kalaiarasan C"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "2/477, Perumal Koil Street, Mappedu, Tiruvallur",
      "addressLocality": "Chennai",
      "addressRegion": "Tamilnadu",
      "postalCode": "631402",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "13.0827",
      "longitude": "80.2707"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Worldwide"
    },
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Editorial Office",
      "availableLanguage": ["English", "Tamil"],
      "email": "editor@scholarindiapub.com"
    },
    "publishingPrinciples": "Double-blind peer review with 10-15 day turnaround for initial decision. Commitment to academic excellence, research integrity, and ethical publishing practices.",
    "keywords": "academic journal publisher, peer-reviewed journals, commerce journal, management journal, humanities journal, social sciences journal, research publication, scholarly publishing, international journals, DOI assignment, Chennai publisher, India journals",
    "knowsAbout": [
      "Academic Publishing",
      "Peer Review",
      "Scholarly Communication",
      "Research Dissemination",
      "Commerce and Management Research",
      "Humanities Research",
      "Social Sciences Research"
    ],
    "makesOffer": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Journal Publication Services",
          "description": "Peer-reviewed academic journal publication with DOI assignment"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Book Publication with DOI and ISBN",
          "description": "Academic book publishing with international identifiers"
        }
      }
    ]
  };
}

// Helper function to create Periodical structured data for journals
export function createPeriodicalData(journalName: string, description: string, issn?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Periodical",
    "name": journalName,
    "publisher": {
      "@type": "Organization",
      "name": "Scholar India Publishers",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Chennai",
        "addressRegion": "Tamil Nadu",
        "addressCountry": "IN"
      }
    },
    "issn": issn || "To be assigned",
    "description": description,
    "inLanguage": "en",
    "isAccessibleForFree": false,
    "keywords": "peer-reviewed, double-blind review, academic journal, research publication"
  };
}

// Helper function for WebPage structured data
export function createWebPageData(name: string, description: string, url?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": name,
    "description": description,
    "url": url || (typeof window !== 'undefined' ? window.location.href : ""),
    "publisher": {
      "@type": "Organization",
      "name": "Scholar India Publishers"
    },
    "inLanguage": "en"
  };
}

// Helper function for Service structured data
export function createServiceData(name: string, description: string, serviceType: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "serviceType": serviceType,
    "provider": {
      "@type": "Organization",
      "name": "Scholar India Publishers",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Chennai",
        "addressRegion": "Tamil Nadu",
        "addressCountry": "IN"
      }
    },
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": typeof window !== 'undefined' ? window.location.href : ""
    }
  };
}
