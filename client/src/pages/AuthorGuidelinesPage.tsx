import Header from "@/components/Header";
import AuthorGuidelines from "@/components/AuthorGuidelines";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function AuthorGuidelinesPage() {
  return (
    <>
      <SEO
        title="Author Guidelines - How to Submit a Manuscript | Scholar India Publishers"
        description="Complete author guidelines for submitting manuscripts to Scholar India Publishers. Formatting requirements, submission process, peer review policy, APC details, and publication ethics for SJCM and SJHSS journals."
        keywords="author guidelines, manuscript submission, how to submit research paper, journal submission guidelines, APC, publication fees, peer review process, research paper format, double blind peer review, India academic journal submission"
        canonical="https://scholarindiapub.com/submit"
      />
      <Header />
      <AuthorGuidelines />
      <Footer />
    </>
  );
}
