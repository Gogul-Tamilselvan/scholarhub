import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function Disclaimer() {
  const sitemapLinks = {
    journals: [
      { label: "Commerce & Management", href: "/commerce-management" },
      { label: "Humanities & Social Sciences", href: "/humanities" }
    ],
    publications: [
      { label: "Submit Manuscript", href: "/submit" },
      { label: "Track Manuscript", href: "/manuscript-track" },
      { label: "Call for Books", href: "/call-for-books" },
      { label: "Published Books", href: "/published-books" },
      { label: "Join as Reviewer / Editor", href: "/join-reviewer" },
      { label: "Editor & Reviewer Track Portal", href: "/reviewer-search" }
    ],
    services: [
      { label: "Book Publication Info", href: "/book-publication-info" },
      { label: "Conference & Seminars", href: "/conference-seminars" },
      { label: "Other Services", href: "/other-services" }
    ],
    about: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Payment & APC", href: "/payment" }
    ]
  };

  return (
    <section className="w-full py-12 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      {/* Disclaimer Card - Full Width */}
      <Card className="w-full mx-0 mb-6 bg-gradient-to-br from-blue-900/5 to-blue-800/5 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-900/20 dark:border-blue-700 shadow-sm rounded-none">
        <CardContent className="p-8 px-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <AlertCircle className="h-6 w-6 text-blue-900 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-serif font-semibold text-blue-900 dark:text-blue-300 mb-2 inline">
                Disclaimer
              </h3>
              <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-300 text-justify inline ml-4">
                Articles published in Scholar India Publishers (Journals) have been reviewed and authenticated by the authors before submission for publication. The Journal, Editor, and the editorial board are not entitled to justify or accept responsibility for any inaccurate and misleading data, if any. The sole responsibility for the accuracy and authenticity of the content lies with the Author(s) concerned.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="max-w-7xl mx-auto px-4">
        {/* Sitemap Section */}
        <div className="mb-8 py-8 border-b border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Journals */}
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-4">Journals</h4>
            <ul className="space-y-2">
              {sitemapLinks.journals.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-gray-700 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Publications */}
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-4">Publications</h4>
            <ul className="space-y-2">
              {sitemapLinks.publications.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-gray-700 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-4">Services</h4>
            <ul className="space-y-2">
              {sitemapLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-gray-700 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-4">About</h4>
            <ul className="space-y-2">
              {sitemapLinks.about.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-gray-700 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </div>

        {/* Footer Section */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
            © 2025 Scholar India Publishers
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Chennai - 631402, Tamilnadu, India
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 flex flex-wrap items-center justify-center gap-2">
            <span>All Rights Reserved</span>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <a href="mailto:editor@scholarindiapub.com" className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors font-medium" data-testid="link-footer-email">
              editor@scholarindiapub.com
            </a>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <span>Designed and Developed by Mr. Kalaiarasan C</span>
          </p>
        </div>
      </div>
    </section>
  );
}