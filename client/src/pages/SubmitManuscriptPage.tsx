import Header from "@/components/Header";
import GeneralManuscriptSubmissionForm from "@/components/GeneralManuscriptSubmissionForm";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function SubmitManuscriptPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Submit Manuscript - Scholar India Publishers"
        description="Submit your research manuscript to Scholar India Publishers. Fast double-blind peer review process with 10-15 day turnaround. Choose from commerce, humanities, or social sciences journals."
        keywords="submit manuscript, research paper submission, academic paper submission, peer review submission, journal submission"
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