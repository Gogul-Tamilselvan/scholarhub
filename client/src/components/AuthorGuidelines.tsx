import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Send, ExternalLink } from "lucide-react";

export default function AuthorGuidelines() {
  const handleSubmit = () => {
    // todo: remove mock functionality - open submission form
    window.open('https://forms.gle/1ZJZRqiMkPMXK94P8', '_blank');
    console.log('Opening submission form');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
            Author Guidelines
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete guidelines for manuscript preparation and submission
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">1. Manuscript Preparation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1.1</h4>
                <p>Manuscripts must be written in clear, concise English and should be free from grammatical errors.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">1.2</h4>
                <p>Use Times New Roman, font size 12, 1.5 line spacing.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">1.3</h4>
                <p>All margins should be 1 inch (2.54 cm).</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">1.4</h4>
                <p>The paper should not exceed 8,000 words including references, tables, and figures.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">2. Structure of the Paper</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">2.1</h4>
                <p><strong>Title Page:</strong> Include the paper title, author(s) name(s), affiliation(s), and contact details.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2.2</h4>
                <p><strong>Abstract:</strong> 150–250 words summarizing objectives, methods, results, and conclusions.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2.3</h4>
                <p><strong>Keywords:</strong> 4–6 keywords.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2.4</h4>
                <p><strong>Main Text:</strong> Should include the following sections:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Introduction</li>
                  <li>Literature Review</li>
                  <li>Methodology</li>
                  <li>Results and Discussion</li>
                  <li>Conclusion and Recommendations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2.5</h4>
                <p><strong>References:</strong> Follow APA 7th edition style.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2.6</h4>
                <p><strong>Tables and Figures:</strong> Number sequentially and provide descriptive titles.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">3. Submission Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">3.1</h4>
                <p>Manuscripts should be submitted electronically in MS Word format to the official journal email.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3.2</h4>
                <p>Each submission must be accompanied by a cover letter stating the originality of the work and that it has not been published or is under consideration elsewhere.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3.3</h4>
                <p>The journal follows a double-blind peer review process.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">4. Ethical Considerations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">4.1</h4>
                <p>Plagiarism is strictly prohibited. Submissions will be checked using plagiarism detection software.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4.2</h4>
                <p>All sources must be properly cited.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4.3</h4>
                <p>Any potential conflicts of interest must be disclosed.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">5. Review and Publication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">5.1</h4>
                <p>The editorial team will conduct an initial screening.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">5.2</h4>
                <p>Manuscripts passing the screening will be sent for double-blind peer review.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">5.3</h4>
                <p>Authors may be asked to revise and resubmit based on reviewer comments.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">5.4</h4>
                <p>Accepted papers will be published in the next available issue.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Publication Charges</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-lg">Coming soon</p>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl font-serif flex items-center">
                <FileText className="h-6 w-6 mr-2" />
                Submit Your Research Paper
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p>Please submit your paper in <strong>Word Document (.doc or .docx)</strong> format only.</p>
              <p>Click the button below to open our official submission form.</p>
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground"
                onClick={handleSubmit}
                data-testid="button-submit-now"
              >
                <Send className="h-5 w-5 mr-2" />
                📤 Submit Now
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}