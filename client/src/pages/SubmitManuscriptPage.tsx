import Header from "@/components/Header";
import GeneralManuscriptSubmissionForm from "@/components/GeneralManuscriptSubmissionForm";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function SubmitManuscriptPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Submit Your Research Manuscript | Scholar India Publishers"
        description="Submit your research paper to Scholar India Publishers. Double-blind peer review with 10-15 day decision. Open to all topics in commerce, management, humanities, and social sciences. Free to submit. DOI assigned on publication."
        keywords="submit manuscript online, submit research paper India, journal paper submission, academic manuscript submission, peer review journal India, free manuscript submission, commerce journal submission, humanities journal submission, social sciences submission, research paper India 2025"
        canonical="https://scholarindiapub.com/submit"
      />
      <Header />
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
              Submit Your Manuscript
            </h1>
            <p className="text-lg text-muted-foreground">
              Submit your research paper to one of our international peer-reviewed journals
            </p>
          </div>
          <GeneralManuscriptSubmissionForm />
        </div>
      </section>
    <Footer />
    </div>
  );
}