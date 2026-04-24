import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, Upload, FileText, Plus, X } from "lucide-react";
import { MAIL_SERVER_URL, MAIL_API_KEY } from "@/lib/config";

interface ManuscriptSubmissionFormProps {
  journalName?: string;
}

interface Author {
  name: string;
  designation: string;
  department: string;
  organisation: string;
  email: string;
  mobile: string;
  orcid: string;
}

export default function ManuscriptSubmissionForm({ journalName }: ManuscriptSubmissionFormProps) {
  const [authors, setAuthors] = useState<Author[]>([
    { name: "", designation: "", department: "", organisation: "", email: "", mobile: "", orcid: "" }
  ]);
  const [formData, setFormData] = useState({
    journal: journalName || "",
    manuscriptTitle: "",
    manuscript: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manuscriptId, setManuscriptId] = useState<string | null>(null);
  const { toast } = useToast();

  const [journals, setJournals] = useState<string[]>([]);
  
  useEffect(() => {
    async function fetchJournals() {
      const { data, error } = await supabase.from('journals').select('title');
        setJournals(data.map(j => j.title));
      } else {
        setJournals([
          "Scholar Journal of Commerce and Management",
          "Scholar Journal of Humanities and Social Sciences"
        ]);
      }
    }
    fetchJournals();
  }, []);

  const designations = [
    "Asst. Professor",
    "Asso. Professor", 
    "Professor",
    "Lecturer",
    "Research Scholar",
    "Student"
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
    setIsSubmitting(true);

    try {
      if (!formData.manuscript) {
        throw new Error("Please upload a manuscript file");
      }

      // 1. Generate Smart Manuscript ID
      const generateManuscriptId = () => {
        const targetJournal = formData.journal || journalName || "";
        
        // Dynamic Journal Code Generation
        const getJournalCode = (name: string) => {
          if (!name) return "SJ";
          if (name.includes("Commerce")) return "SJCM";
          if (name.includes("Humanities")) return "SJHSS";
          if (name.toLowerCase() === 'test') return 'StSS'; // User requested for test journal
          
          const ignored = ["of", "and", "the", "in", "a", "an", "for", "with"];
          return name
            .split(/\s+/)
            .filter(w => w.length > 0 && !ignored.includes(w.toLowerCase()))
            .map(w => w[0].toUpperCase())
            .join('') || "SJ";
        };

        const journalPrefix = getJournalCode(targetJournal);
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const randomChars = Array.from({ length: 4 }, () => 
          'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.floor(Math.random() * 36))
        ).join('');
        return `MAN${journalPrefix}${year}${month}${randomChars}`;
      };
      
      const uniqueId = generateManuscriptId();
      const fileExtension = formData.manuscript.name.split('.').pop() || 'docx';
      const s3FileName = `manuscripts/${uniqueId}.${fileExtension}`;

      // 2. Get Pre-signed URL from Secure Edge Function
      const { data: presignData, error: presignError } = await supabase.functions.invoke('s3-presign', {
        body: {
          fileName: s3FileName,
          fileType: formData.manuscript.type || 'application/octet-stream',
        }
      });

      if (presignError) {
        throw new Error("Failed to authenticate upload with server. Edge function failed.");
      }

      const { signedUrl, publicUrl: s3Url } = presignData;

      // 3. Upload actual file directly to AWS S3 using the signed URL
      const arrayBuffer = await formData.manuscript.arrayBuffer();
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": formData.manuscript.type || 'application/octet-stream',
        },
        body: new Uint8Array(arrayBuffer),
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload the document to S3 storage.");
      }

      console.log("Uploaded successfully to S3 at:", s3Url);

      // 4. Submit to Supabase Database
      const firstAuthor = authors[0];
      const authorNames = authors.map(a => a.name).join(", ");
      
      const { data, error } = await supabase
        .from('manuscripts')
        .insert([{
          id: uniqueId,
          author_name: firstAuthor.name,
          designation: firstAuthor.designation,
          department: firstAuthor.department,
          affiliation: firstAuthor.organisation,
          email: firstAuthor.email,
          mobile: firstAuthor.mobile,
          journal: formData.journal || journalName || "",
          manuscript_title: formData.manuscriptTitle,
          author_count: authors.length,
          author_names: authorNames,
          file_url: s3Url,
          status: 'submitted'
        }])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      const id = uniqueId;
      setManuscriptId(id);
      
      toast({
        title: "Submission successful!",
        description: `Your manuscript has been submitted successfully. Manuscript ID: ${id}. You will receive a confirmation email shortly.`,
      });

      // ── Trigger Confirmation Email ──────────────────────────────────────────

      try {
        const payload = {
          name: firstAuthor.name,
          email: firstAuthor.email,
          manuscriptId: id,
          title: formData.manuscriptTitle,
          journal: formData.journal || journalName
        };
        console.log("📤 Sending Manuscript Payload:", payload);

        const mailRes = await fetch(`${MAIL_SERVER_URL}/send/manuscript-submitted`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'x-api-key': MAIL_API_KEY },
           body: JSON.stringify(payload)
        });
        
        if (!mailRes.ok) {
          const errorData = await mailRes.json();
          console.error("Mail server returned error:", errorData);
        } else {
          console.log("Confirmation email sent successfully.");
        }
      } catch (mailErr) {
        console.error("Manuscript confirmation email fetch failed:", mailErr);
      }

      // Scroll to top to show the success message with Manuscript ID
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Reset form
      setAuthors([{ name: "", designation: "", department: "", organisation: "", email: "", mobile: "", orcid: "" }]);
      setFormData({
        journal: journalName || "",
        manuscriptTitle: "",
        manuscript: null
      });
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

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
    <Card className="bg-card text-card-foreground max-w-2xl mx-auto border-card-border">
      <CardHeader className="bg-[#213361] text-white border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-2xl font-serif flex items-center text-white">
          <FileText className="h-6 w-6 mr-2 text-yellow-400" />
          {journalName ? `Submit Manuscript - ${journalName}` : "Submit Manuscript"}
        </CardTitle>
        <p className="text-sm text-blue-100 mt-2">
          Please fill out all required fields and upload your manuscript in Word format (.doc or .docx)
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        {manuscriptId && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200 font-semibold text-lg">✓ Submission Successful!</p>
            <p className="text-green-700 dark:text-green-300 mt-2">Your Manuscript ID: <span className="font-mono font-bold text-lg">{manuscriptId}</span></p>
            <p className="text-green-700 dark:text-green-300 text-sm mt-2">Please save this ID for tracking your manuscript status.</p>
            <div className="mt-4 pt-3 border-t border-green-200 dark:border-green-700">
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
          {!journalName && (
            <div className="space-y-2">
              <Label htmlFor="journal">Select Journal *</Label>
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
          )}

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
              <div key={index} className="border border-card-border rounded-md p-4 space-y-4 bg-card-foreground/5">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-card-foreground">
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
                    <Input
                      id={`author-name-${index}`}
                      type="text"
                      value={author.name}
                      onChange={(e) => updateAuthor(index, 'name', e.target.value)}
                      required
                      data-testid={`input-author-name-${index}`}
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`author-designation-${index}`}>Designation *</Label>
                    <Select 
                      value={author.designation} 
                      onValueChange={(value) => updateAuthor(index, 'designation', value)}
                      required
                    >
                      <SelectTrigger data-testid={`select-designation-${index}`}>
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`author-department-${index}`}>Department *</Label>
                    <Input
                      id={`author-department-${index}`}
                      type="text"
                      value={author.department}
                      onChange={(e) => updateAuthor(index, 'department', e.target.value)}
                      required
                      data-testid={`input-author-department-${index}`}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`author-organisation-${index}`}>Organisation (Address) *</Label>
                    <Input
                      id={`author-organisation-${index}`}
                      type="text"
                      value={author.organisation}
                      onChange={(e) => updateAuthor(index, 'organisation', e.target.value)}
                      required
                      data-testid={`input-author-organisation-${index}`}
                      placeholder="University/Institution Name, City, Country"
                    />
                  </div>
                </div>

                {index === 0 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`author-email-${index}`}>Email Address *</Label>
                      <Input
                        id={`author-email-${index}`}
                        type="email"
                        value={author.email}
                        onChange={(e) => updateAuthor(index, 'email', e.target.value)}
                        required
                        data-testid={`input-author-email-${index}`}
                        placeholder="email@example.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`author-mobile-${index}`}>Mobile Number *</Label>
                      <Input
                        id={`author-mobile-${index}`}
                        type="tel"
                        value={author.mobile}
                        onChange={(e) => updateAuthor(index, 'mobile', e.target.value)}
                        required
                        data-testid={`input-author-mobile-${index}`}
                        placeholder="+91 9876543210"
                      />
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
                  <p className="text-xs text-muted-foreground">
                    ORCID provides a persistent digital identifier for researchers
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="manuscriptTitle">Manuscript Title *</Label>
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
            <Label htmlFor="manuscript">Upload Manuscript *</Label>
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
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            {formData.manuscript && (
              <p className="text-sm text-green-600">
                Selected: {formData.manuscript.name}
              </p>
            )}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mt-2">
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-1">Important Instructions:</p>
              <ul className="text-xs text-yellow-800 dark:text-yellow-300 space-y-1 list-disc list-inside">
                <li>The manuscript file should NOT contain author details</li>
                <li>Include only the title and main content (abstract, keywords, introduction, methodology, results, conclusion, references)</li>
                <li>Only Word documents (.doc or .docx) are accepted</li>
                <li>Maximum file size: 10MB</li>
              </ul>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-md">
            <h4 className="font-semibold mb-2">Submission Guidelines:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Ensure your manuscript follows the journal's formatting guidelines</li>
              <li>• Include abstract, keywords, and references in APA format</li>
              <li>• Maximum word count: 8,000 words including references</li>
              <li>• All submissions undergo double-blind peer review</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full bg-[hsl(223.13,49.23%,25.49%)] hover:bg-[hsl(223.13,49.23%,30%)] text-foreground border-0"
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