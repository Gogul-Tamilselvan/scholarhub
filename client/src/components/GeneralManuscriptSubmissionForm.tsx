import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, Upload, FileText, Plus, X, CheckCircle, AlertCircle } from "lucide-react";

// Validation functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const isValidMobile = (mobile: string): boolean => {
  // Remove spaces, dashes, and + prefix, then check for exactly 10 digits
  const digitsOnly = mobile.replace(/[\s\-\+]/g, '');
  // Allow country code (like 91) + 10 digits OR just 10 digits
  return /^\d{10}$/.test(digitsOnly) || /^91\d{10}$/.test(digitsOnly);
};

const isValidName = (name: string): boolean => {
  return name.trim().length >= 2;
};

const isValidDepartment = (dept: string): boolean => {
  return dept.trim().length >= 2;
};

const isValidOrganisation = (org: string): boolean => {
  return org.trim().length >= 3;
};

interface Author {
  name: string;
  designation: string;
  department: string;
  organisation: string;
  email: string;
  mobile: string;
  orcid: string;
}

interface GeneralManuscriptSubmissionFormProps {
  journalTitle?: string;
  subject?: string;
}

export default function GeneralManuscriptSubmissionForm({ journalTitle, subject }: GeneralManuscriptSubmissionFormProps) {
  const [authors, setAuthors] = useState<Author[]>([
    { name: "", designation: "", department: "", organisation: "", email: "", mobile: "", orcid: "" }
  ]);
  const [formData, setFormData] = useState({
    journal: journalTitle || "",
    manuscriptTitle: "",
    researchField: subject || "",
    manuscript: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manuscriptId, setManuscriptId] = useState<string | null>(null);
  const { toast } = useToast();

  const designations = [
    "Asst. Professor",
    "Asso. Professor", 
    "Professor",
    "Lecturer",
    "Research Scholar",
    "Student"
  ];

  const journals = [
    "Scholar Journal of Commerce and Management",
    "Scholar Journal of Humanities and Social Sciences"
  ];

  const addAuthor = () => {
    if (authors.length < 6) {
      setAuthors([...authors, { name: "", designation: "", department: "", organisation: "", email: "", mobile: "", orcid: "" }]);
    }
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, i) => i !== index));
    }
  };

  const updateAuthor = (index: number, field: keyof Author, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
          file.type === "application/msword") {
        setFormData(prev => ({ ...prev, manuscript: file }));
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload only Word documents (.doc or .docx)",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate journal selection
    if (!formData.journal) {
      toast({
        title: "Journal selection required",
        description: "Please select a journal before submitting your manuscript.",
        variant: "destructive"
      });
      return;
    }

    // Validate first author's required fields
    const firstAuthor = authors[0];
    if (!isValidName(firstAuthor.name)) {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid name (at least 2 characters).",
        variant: "destructive"
      });
      return;
    }

    if (!firstAuthor.designation) {
      toast({
        title: "Designation Required",
        description: "Please select your designation.",
        variant: "destructive"
      });
      return;
    }

    if (!isValidDepartment(firstAuthor.department)) {
      toast({
        title: "Invalid Department",
        description: "Please enter a valid department name.",
        variant: "destructive"
      });
      return;
    }

    if (!isValidOrganisation(firstAuthor.organisation)) {
      toast({
        title: "Invalid Organisation",
        description: "Please enter a valid organisation/institution name.",
        variant: "destructive"
      });
      return;
    }

    if (!isValidEmail(firstAuthor.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address (e.g., name@domain.com).",
        variant: "destructive"
      });
      return;
    }

    if (!isValidMobile(firstAuthor.mobile)) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.manuscriptTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter your manuscript title.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.manuscript) {
      toast({
        title: "Manuscript Required",
        description: "Please upload your manuscript file.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Prepare form data for submission
      const submissionData = new FormData();
      
      // Add authors data
      submissionData.append("authors", JSON.stringify(authors));
      
      // Add first author's details for primary contact
      submissionData.append("email", authors[0].email);
      submissionData.append("mobile", authors[0].mobile);
      submissionData.append("name", authors[0].name);
      submissionData.append("designation", authors[0].designation);
      submissionData.append("department", authors[0].department);
      submissionData.append("organisation", authors[0].organisation);
      submissionData.append("orcid", authors[0].orcid || "");
      submissionData.append("journal", formData.journal);
      submissionData.append("manuscriptTitle", formData.manuscriptTitle);
      submissionData.append("researchField", formData.researchField || "");
      
      if (formData.manuscript) {
        submissionData.append("manuscript", formData.manuscript);
      }

      // Submit to backend API
      const response = await fetch('/api/submit-manuscript', {
        method: 'POST',
        body: submissionData,
      });

      console.log('Response status:', response.status, response.ok);
      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok && result.success) {
        const id = result.manuscriptId;
        setManuscriptId(id);
        
        // Show success toast with manuscript ID
        toast({
          title: "Submission successful!",
          description: `Your manuscript has been submitted successfully. Manuscript ID: ${id}. You will receive a confirmation email shortly.`,
          duration: 8000,
        });

        // Scroll to top to show the success message with Manuscript ID
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Reset form
        setAuthors([{ name: "", designation: "", department: "", organisation: "", email: "", mobile: "", orcid: "" }]);
        setFormData({
          journal: "",
          manuscriptTitle: "",
          researchField: "",
          manuscript: null
        });
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

      } else {
        throw new Error(result.error || result.message || 'Submission failed');
      }

    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "There was an error submitting your manuscript. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 max-w-2xl mx-auto border-gray-200 dark:border-gray-700">
      <CardHeader className="bg-blue-50 dark:bg-blue-950 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-2xl font-serif flex items-center text-blue-900 dark:text-blue-300">
          <FileText className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
          Submit Manuscript
        </CardTitle>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
          Please fill out all required fields and upload your manuscript in Word format (.doc or .docx)
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        {manuscriptId && (
          <div className="mb-6 p-5 bg-green-50 dark:bg-green-950 border-2 border-green-400 dark:border-green-600 rounded-lg shadow-md">
            <p className="text-green-800 dark:text-green-200 font-bold text-xl">✓ Submission Successful!</p>
            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-green-300 dark:border-green-700">
              <p className="text-gray-700 dark:text-gray-300">Your Manuscript ID:</p>
              <p className="font-mono font-bold text-2xl text-blue-600 dark:text-blue-400 mt-1">{manuscriptId}</p>
            </div>
            <p className="text-green-700 dark:text-green-300 text-sm mt-3">Please save this ID for tracking your manuscript status.</p>
            <div className="mt-4 pt-3 border-t border-green-300 dark:border-green-700">
              <p className="text-green-700 dark:text-green-300 text-sm">
                Track your submission status anytime by visiting our{" "}
                <a 
                  href="/manuscript-track" 
                  className="text-blue-600 dark:text-blue-400 underline font-semibold hover:text-blue-800 dark:hover:text-blue-300"
                  data-testid="link-track-manuscript"
                >
                  Track Manuscript
                </a>
                {" "}page and entering your Manuscript ID.
              </p>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="journal">Select Journal *</Label>
            <Select 
              value={formData.journal} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, journal: value }))}
              required
            >
              <SelectTrigger data-testid="select-journal">
                <SelectValue placeholder="Choose the journal for submission" />
              </SelectTrigger>
              <SelectContent>
                {journals.map((journal) => (
                  <SelectItem key={journal} value={journal}>
                    {journal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Authors Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Authors Details</Label>
              {authors.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAuthor}
                  data-testid="button-add-author"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Author
                </Button>
              )}
            </div>

            {authors.map((author, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md p-4 space-y-4 bg-blue-50 dark:bg-blue-950">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {index === 0 ? '1st Author' : 
                     index === 1 ? '2nd Author' : 
                     index === 2 ? '3rd Author' : 
                     `${index + 1}th Author`}
                     {index === 0 && ' (Corresponding Author)'}
                  </h4>
                  {authors.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAuthor(index)}
                      data-testid={`button-remove-author-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`author-name-${index}`}>Full Name *</Label>
                    <div className="relative">
                      <Input
                        id={`author-name-${index}`}
                        type="text"
                        value={author.name}
                        onChange={(e) => updateAuthor(index, 'name', e.target.value)}
                        required
                        data-testid={`input-author-name-${index}`}
                        placeholder="Enter full name"
                        className={author.name && isValidName(author.name) ? "border-green-500 pr-10" : author.name ? "border-red-400" : ""}
                      />
                      {author.name && isValidName(author.name) && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                      {author.name && !isValidName(author.name) && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`author-designation-${index}`}>Designation *</Label>
                    <div className="relative">
                      <Select 
                        value={author.designation} 
                        onValueChange={(value) => updateAuthor(index, 'designation', value)}
                        required
                      >
                        <SelectTrigger data-testid={`select-designation-${index}`} className={author.designation ? "border-green-500" : ""}>
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
                      {author.designation && (
                        <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`author-department-${index}`}>Department *</Label>
                    <div className="relative">
                      <Input
                        id={`author-department-${index}`}
                        type="text"
                        value={author.department}
                        onChange={(e) => updateAuthor(index, 'department', e.target.value)}
                        required
                        data-testid={`input-author-department-${index}`}
                        placeholder="e.g., Computer Science"
                        className={author.department && isValidDepartment(author.department) ? "border-green-500 pr-10" : author.department ? "border-red-400" : ""}
                      />
                      {author.department && isValidDepartment(author.department) && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`author-organisation-${index}`}>Organisation (Address) *</Label>
                    <div className="relative">
                      <Input
                        id={`author-organisation-${index}`}
                        type="text"
                        value={author.organisation}
                        onChange={(e) => updateAuthor(index, 'organisation', e.target.value)}
                        required
                        data-testid={`input-author-organisation-${index}`}
                        placeholder="University/Institution Name, City, Country"
                        className={author.organisation && isValidOrganisation(author.organisation) ? "border-green-500 pr-10" : author.organisation ? "border-red-400" : ""}
                      />
                      {author.organisation && isValidOrganisation(author.organisation) && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>

                {index === 0 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`author-email-${index}`}>Email Address *</Label>
                      <div className="relative">
                        <Input
                          id={`author-email-${index}`}
                          type="email"
                          value={author.email}
                          onChange={(e) => updateAuthor(index, 'email', e.target.value)}
                          required
                          data-testid={`input-author-email-${index}`}
                          placeholder="email@example.com"
                          className={author.email && isValidEmail(author.email) ? "border-green-500 pr-10" : author.email ? "border-red-400" : ""}
                        />
                        {author.email && isValidEmail(author.email) && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                        {author.email && !isValidEmail(author.email) && (
                          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                        )}
                      </div>
                      {author.email && !isValidEmail(author.email) && (
                        <p className="text-xs text-red-500">Please enter a valid email (e.g., name@domain.com)</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`author-mobile-${index}`}>Mobile Number *</Label>
                      <div className="relative">
                        <Input
                          id={`author-mobile-${index}`}
                          type="tel"
                          value={author.mobile}
                          onChange={(e) => updateAuthor(index, 'mobile', e.target.value)}
                          required
                          data-testid={`input-author-mobile-${index}`}
                          placeholder="9876543210"
                          className={author.mobile && isValidMobile(author.mobile) ? "border-green-500 pr-10" : author.mobile ? "border-red-400" : ""}
                        />
                        {author.mobile && isValidMobile(author.mobile) && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                        {author.mobile && !isValidMobile(author.mobile) && (
                          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                        )}
                      </div>
                      {author.mobile && !isValidMobile(author.mobile) && (
                        <p className="text-xs text-red-500">Please enter a valid 10-digit mobile number</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor={`author-orcid-${index}`}>ORCID (Optional)</Label>
                  <Input
                    id={`author-orcid-${index}`}
                    type="text"
                    value={author.orcid}
                    onChange={(e) => updateAuthor(index, 'orcid', e.target.value)}
                    data-testid={`input-author-orcid-${index}`}
                    placeholder="https://orcid.org/0000-0000-0000-0000"
                  />
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    ORCID provides a persistent digital identifier for researchers
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="manuscriptTitle">Manuscript Title *</Label>
            <Input
              id="manuscriptTitle"
              type="text"
              value={formData.manuscriptTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, manuscriptTitle: e.target.value }))}
              required
              data-testid="input-manuscript-title"
              placeholder="Enter the title of your manuscript"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="researchField">Research Field / Keywords (Optional)</Label>
            <Input
              id="researchField"
              type="text"
              value={formData.researchField}
              onChange={(e) => setFormData(prev => ({ ...prev, researchField: e.target.value }))}
              data-testid="input-research-field"
              placeholder="e.g., Machine Learning, Climate Change, Supply Chain Management"
            />
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Enter the research field or keywords that describe your manuscript topic
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="manuscript">Upload Manuscript without Author Details *</Label>
            <div className="flex items-center gap-4">
              <Input
                id="manuscript"
                type="file"
                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                required
                data-testid="input-manuscript"
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <Upload className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </div>
            {formData.manuscript && (
              <p className="text-sm text-green-600">
                Selected: {formData.manuscript.name}
              </p>
            )}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mt-2">
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-1">Important Instructions:</p>
              <ul className="text-xs text-yellow-800 dark:text-yellow-300 space-y-1 list-disc list-inside">
                <li>The manuscript file should NOT contain author details or their affiliations</li>
                <li>Include only the title and main content (abstract, keywords, introduction, methodology, results, conclusion, references)</li>
                <li>Only Word documents (.doc or .docx) are accepted</li>
                <li>Maximum file size: 10MB</li>
              </ul>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-md">
            <h4 className="font-semibold mb-2">Submission Guidelines:</h4>
            <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
              <li>• Ensure your manuscript follows the journal's formatting guidelines</li>
              <li>• Include abstract, keywords, and references in APA format</li>
              <li>• Maximum word count: 8,000 words including references</li>
              <li>• All submissions undergo double-blind peer review</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full bg-[#213361] hover:bg-[#2a4078] text-white border-0"
            disabled={isSubmitting}
            data-testid="button-submit-manuscript"
          >
            {isSubmitting ? (
              <>Submitting...</>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Submit Manuscript
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
