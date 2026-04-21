import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, BookOpen } from "lucide-react";

export default function BookPublicationForm() {
  const [formData, setFormData] = useState({
    publicationType: "",
    publicationFormat: "",
    name: "",
    email: "",
    mobile: "",
    designation: "",
    institution: "",
    bookTitle: "",
    subject: "",
    numberOfPages: "",
    abstract: "",
    coAuthors: "",
    manuscript: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const designations = [
    "Asst. Professor",
    "Asso. Professor", 
    "Professor",
    "Lecturer",
    "Research Scholar",
    "Student",
    "Independent Researcher"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf" || 
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
          file.type === "application/msword") {
        setFormData(prev => ({ ...prev, manuscript: file }));
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload PDF or Word documents (.pdf, .doc, .docx)",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Prepare data for Supabase
      const uniqueId = `BRN${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;

      // Upload file to S3 if exists
      let s3Url = null;
      if (formData.manuscript) {
          const fileExt = formData.manuscript.name.split('.').pop() || 'pdf';
          const s3FileName = `proposals/${uniqueId}.${fileExt}`;
          
          const { data: presignData, error: presignError } = await supabase.functions.invoke('s3-presign', {
            body: {
              fileName: s3FileName,
              fileType: formData.manuscript.type || 'application/pdf',
            }
          });

          if (!presignError && presignData?.signedUrl) {
              const arrayBuffer = await formData.manuscript.arrayBuffer();
              const uploadResponse = await fetch(presignData.signedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': formData.manuscript.type || 'application/pdf' },
                body: new Uint8Array(arrayBuffer),
              });
              if (uploadResponse.ok) s3Url = presignData.publicUrl;
          }
      }

      // 2. Insert into Supabase
      const { data, error } = await supabase
        .from('books')
        .insert([{
          id: uniqueId,
          book_title: formData.bookTitle,
          publication_type: formData.publicationType,
          publication_format: formData.publicationFormat,
          author_name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          institution: formData.institution,
          designation: formData.designation,
          subject_area: formData.subject,
          expected_pages: formData.numberOfPages,
          abstract: formData.abstract,
          co_authors_details: formData.coAuthors,
          proposal_link: s3Url,
          status: 'Submitted'
        }]);

      if (error) throw error;

      toast({
        title: "Submission successful!",
        description: "Your book publication proposal has been submitted successfully.",
        duration: 5000,
      });

      // 3. Trigger Confirmation Email
      const MAIL_SERVER_URL = "https://scholar-hub-server-seven.vercel.app";
      const MAIL_API_KEY = "scholar_india_mail_secret_2026";

      fetch(`${MAIL_SERVER_URL}/send/book-submission-received`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'x-api-key': MAIL_API_KEY },
         body: JSON.stringify({
           name: formData.name,
           email: formData.email,
           details: {
             bID: uniqueId,
             title: formData.bookTitle,
             type: formData.publicationType
           }
         })
      }).catch(e => console.error("Book confirmation email failed:", e));

      // Reset form
      setFormData({
        publicationType: "",
        publicationFormat: "",
        name: "",
        email: "",
        mobile: "",
        designation: "",
        institution: "",
        bookTitle: "",
        subject: "",
        numberOfPages: "",
        abstract: "",
        coAuthors: "",
        manuscript: null
      });
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "There was an error submitting your proposal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 max-w-3xl mx-auto border-gray-200 dark:border-gray-700 overflow-hidden">
      <CardHeader className="bg-[#213361] text-white border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-2xl font-serif flex items-center text-white">
          <BookOpen className="h-6 w-6 mr-2 text-white" />
          Book & Book Chapter Publication
        </CardTitle>
        <p className="text-sm text-blue-100 mt-2">
          Submit your proposal for book publication or book chapter contribution
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="publicationType">Publication Type *</Label>
            <Select 
              value={formData.publicationType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, publicationType: value }))}
              required
            >
              <SelectTrigger data-testid="select-publication-type">
                <SelectValue placeholder="Select publication type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Book Publication">Book Publication</SelectItem>
                <SelectItem value="Book Chapter">Book Chapter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="publicationFormat">Publication Format *</Label>
            <Select 
              value={formData.publicationFormat} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, publicationFormat: value }))}
              required
            >
              <SelectTrigger data-testid="select-publication-format">
                <SelectValue placeholder="Select publication format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Online with DOI">Online with DOI</SelectItem>
                <SelectItem value="Offline (Print)">Offline (Print)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-blue-600 dark:text-blue-400" htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                data-testid="input-name"
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-blue-600 dark:text-blue-400" htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                data-testid="input-email"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-blue-600 dark:text-blue-400" htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                required
                data-testid="input-mobile"
                placeholder="+91 9876543210"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-blue-600 dark:text-blue-400" htmlFor="designation">Designation *</Label>
              <Select 
                value={formData.designation} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, designation: value }))}
                required
              >
                <SelectTrigger data-testid="select-designation">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {designations.map((designation) => (
                    <SelectItem key={designation} value={designation}>
                      {designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="institution">Institution/University *</Label>
            <Input
              id="institution"
              type="text"
              value={formData.institution}
              onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
              required
              data-testid="input-institution"
              placeholder="University Name, City, Country"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="bookTitle">Book/Chapter Title *</Label>
            <Input
              id="bookTitle"
              type="text"
              value={formData.bookTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, bookTitle: e.target.value }))}
              required
              data-testid="input-book-title"
              placeholder="Enter the title"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-blue-600 dark:text-blue-400" htmlFor="subject">Subject Area *</Label>
              <Input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                required
                data-testid="input-subject"
                placeholder="e.g., Economics, Management"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-blue-600 dark:text-blue-400" htmlFor="numberOfPages">Expected Number of Pages *</Label>
              <Input
                id="numberOfPages"
                type="number"
                value={formData.numberOfPages}
                onChange={(e) => setFormData(prev => ({ ...prev, numberOfPages: e.target.value }))}
                required
                data-testid="input-pages"
                placeholder="e.g., 200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="abstract">Abstract/Summary *</Label>
            <Textarea
              id="abstract"
              value={formData.abstract}
              onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
              required
              data-testid="input-abstract"
              placeholder="Provide a brief abstract or summary of your work (200-500 words)"
              className="min-h-32"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="coAuthors">Co-Authors (if any)</Label>
            <Textarea
              id="coAuthors"
              value={formData.coAuthors}
              onChange={(e) => setFormData(prev => ({ ...prev, coAuthors: e.target.value }))}
              data-testid="input-coauthors"
              placeholder="List co-authors with their affiliations"
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="manuscript">Upload Manuscript/Proposal</Label>
            <Input
              id="manuscript"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              data-testid="input-manuscript"
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {formData.manuscript && (
              <p className="text-sm text-green-600">
                Selected: {formData.manuscript.name}
              </p>
            )}
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Optional: Upload your manuscript or detailed proposal (PDF or Word document, max 20MB)
            </p>
          </div>

          <div className="bg-muted/30 p-4 rounded-md">
            <h4 className="font-semibold mb-2">Note:</h4>
            <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
              <li>• All submissions will be reviewed by our editorial board</li>
              <li>• You will receive a response within 15 working days</li>
              <li>• Published books will receive ISBN and DOI registration</li>
              <li>• We accept proposals in English language only</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full bg-[hsl(223.13,49.23%,25.49%)] hover:bg-[hsl(223.13,49.23%,30%)] text-white border-0"
            disabled={isSubmitting}
            data-testid="button-submit-book"
          >
            {isSubmitting ? (
              <>Submitting...</>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Submit Proposal
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
