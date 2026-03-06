import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Upload, CheckCircle, Loader2, AlertCircle } from "lucide-react";

const commerceTemplate = "/downloads/template-sjcm.docx";
const hssTemplate = "/downloads/template-sjhss.docx";

const finalPaperSchema = z.object({
  publicationType: z.string().min(1, "Please select a publication type"),
  manuscriptId: z.string().min(1, "Manuscript ID is required"),
  articleTitle: z.string().min(1, "Article title is required"),
  correspondingAuthorName: z.string().min(1, "Corresponding author name is required"),
  correspondingEmail: z.string().email("Valid email is required"),
  correspondingPhone: z.string().min(10, "Valid phone number is required"),
  revisionNotes: z.string().optional(),
});

type FinalPaperFormData = z.infer<typeof finalPaperSchema>;

export default function FinalPaperForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [authors, setAuthors] = useState([{ name: "", designation: "", affiliation: "", email: "" }]);

  const addAuthor = () => setAuthors([...authors, { name: "", designation: "", affiliation: "", email: "" }]);
  const removeAuthor = (index: number) => setAuthors(authors.filter((_, i) => i !== index));
  const updateAuthor = (index: number, field: string, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setAuthors(newAuthors);
  };

  const fetchManuscript = async () => {
    const id = form.getValues("manuscriptId");
    if (!id) {
      toast({
        title: "ID Required",
        description: "Please enter a Manuscript ID first.",
        variant: "destructive",
      });
      return;
    }

    setIsFetching(true);
    try {
      const response = await fetch(`/api/manuscripts/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch manuscript");
      }

      form.setValue("articleTitle", data.title || "");
      form.setValue("correspondingAuthorName", data.correspondingAuthor || "");
      form.setValue("correspondingEmail", data.email || "");
      form.setValue("correspondingPhone", data.phone || "");
      
      const journalType = data.journal?.toLowerCase();
      if (journalType?.includes("commerce")) form.setValue("publicationType", "sjcm");
      else if (journalType?.includes("humanities")) form.setValue("publicationType", "sjhss");

      toast({
        title: "Details Fetched",
        description: "Manuscript details have been automatically filled.",
      });
    } catch (error: any) {
      toast({
        title: "Fetch Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const form = useForm<FinalPaperFormData>({
    resolver: zodResolver(finalPaperSchema),
    defaultValues: {
      publicationType: "",
      manuscriptId: "",
      articleTitle: "",
      correspondingAuthorName: "",
      correspondingEmail: "",
      correspondingPhone: "",
      revisionNotes: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FinalPaperFormData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      formData.append("authors", JSON.stringify(authors));
      if (paperFile) {
        formData.append("finalPaper", paperFile);
      }
      const response = await fetch("/api/final-paper", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit form");
      }
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      setShowConfirmDialog(false);
      toast({
        title: "Final Paper Submitted",
        description: "Your final paper has been successfully submitted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FinalPaperFormData) => {
    if (!paperFile) {
      toast({
        title: "Missing File",
        description: "Please upload your final paper.",
        variant: "destructive",
      });
      return;
    }
    // Check if authors are filled
    if (authors.some(a => !a.name || !a.designation || !a.affiliation || !a.email)) {
      toast({
        title: "Author Details Required",
        description: "Please fill in all author details including designation.",
        variant: "destructive",
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  const watchPublicationType = form.watch("publicationType");

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="pt-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                Final Paper Submitted Successfully
              </h2>
              <p className="text-muted-foreground">
                Thank you for submitting your final paper. Our editorial team will process it for publication.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">
            Final Paper Submission
          </h1>
          <p className="text-muted-foreground">
            Scholar India Publishers
          </p>
        </div>

        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300">Important Instructions</p>
                <ul className="text-sm text-amber-700 dark:text-amber-400 mt-2 space-y-1 list-disc list-inside">
                  <li>Download the appropriate journal template below</li>
                  <li>Format your revised paper according to the template guidelines</li>
                  <li>Ensure all reviewer comments have been addressed</li>
                  <li>Upload the final formatted paper in DOC/DOCX format</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download Journal Templates
            </CardTitle>
            <CardDescription>
              Format your final paper using the appropriate template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <a
                href={commerceTemplate}
                download="SJCM_Article_Template.docx"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
              >
                <FileText className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Commerce & Management Template</p>
                  <p className="text-xs text-muted-foreground">For SJCM articles (APA style)</p>
                </div>
              </a>
              <a
                href={hssTemplate}
                download="SJHSS_Article_Template.docx"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
              >
                <FileText className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">Humanities & Social Sciences Template</p>
                  <p className="text-xs text-muted-foreground">For SJHSS articles (APA/MLA style)</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {showConfirmDialog && (
            <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
              <Card className="max-w-md w-full shadow-2xl">
                <CardHeader className="bg-amber-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Final Check Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border-2 border-red-200 dark:border-red-800 mb-6">
                    <p className="text-red-900 dark:text-red-200 font-bold text-center mb-2">
                      <AlertCircle className="w-5 h-5 inline-block mr-2" />
                      CRITICAL REQUIREMENT
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-300 font-medium text-center">
                      Make sure you have submitted the signed copyright form before this submission. Otherwise your paper may not go to the production/publication department.
                    </p>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 font-medium text-center">
                    Manuscript is updated in template of the journal, otherwise it will be rejected.
                  </p>
                  <p className="text-sm text-muted-foreground mb-6 text-center">
                    Have you updated the paper in the template of the journal and submitted the signed copyright form?
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => setShowConfirmDialog(false)}
                      disabled={submitMutation.isPending}
                    >
                      Wait, Let me check
                    </Button>
                      <Button 
                        type="button"
                        className="flex-1 bg-green-600 hover:bg-green-700" 
                        onClick={() => {
                          const values = form.getValues();
                          submitMutation.mutate(values);
                        }}
                        disabled={submitMutation.isPending}
                      >
                      {submitMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Yes, I have done it"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Journal/Publication Type *</Label>
                <Select
                  value={form.watch("publicationType")}
                  onValueChange={(value) => form.setValue("publicationType", value)}
                >
                  <SelectTrigger data-testid="select-publication-type">
                    <SelectValue placeholder="Select journal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sjcm">Scholar Journal of Commerce and Management</SelectItem>
                    <SelectItem value="sjhss">Scholar Journal of Humanities and Social Sciences</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.publicationType && (
                  <p className="text-sm text-red-500">{form.formState.errors.publicationType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manuscriptId">Manuscript ID *</Label>
                <div className="flex gap-2">
                  <Input
                    id="manuscriptId"
                    data-testid="input-manuscript-id"
                    placeholder="e.g., MANSJCM251200AB"
                    className="flex-1"
                    {...form.register("manuscriptId")}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={fetchManuscript}
                    disabled={isFetching}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200"
                  >
                    {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch Details"}
                  </Button>
                </div>
                {form.formState.errors.manuscriptId && (
                  <p className="text-sm text-red-500">{form.formState.errors.manuscriptId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="articleTitle">Article Title *</Label>
                <Input
                  id="articleTitle"
                  data-testid="input-article-title"
                  placeholder="Enter the full article title"
                  {...form.register("articleTitle")}
                />
                {form.formState.errors.articleTitle && (
                  <p className="text-sm text-red-500">{form.formState.errors.articleTitle.message}</p>
                )}
              </div>

              <div className="space-y-4">
                <Label>Author Details *</Label>
                {authors.map((author, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4 relative bg-gray-50/50 dark:bg-gray-800/50">
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        onClick={() => removeAuthor(index)}
                      >
                        Remove
                      </Button>
                    )}
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Author {index + 1}</p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Full Name</Label>
                        <Input
                          placeholder="Dr. John Doe"
                          value={author.name}
                          onChange={(e) => updateAuthor(index, "name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Designation</Label>
                        <Input
                          placeholder="Professor / Researcher"
                          value={author.designation}
                          onChange={(e) => updateAuthor(index, "designation", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Affiliation/Institution</Label>
                        <Input
                          placeholder="University Name"
                          value={author.affiliation}
                          onChange={(e) => updateAuthor(index, "affiliation", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Email Address</Label>
                        <Input
                          type="email"
                          placeholder="author@univ.edu"
                          value={author.email}
                          onChange={(e) => updateAuthor(index, "email", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAuthor}
                  className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  + Add Another Author
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="correspondingAuthorName">Corresponding Author Name *</Label>
                  <Input
                    id="correspondingAuthorName"
                    data-testid="input-author-name"
                    placeholder="Dr. John Doe"
                    {...form.register("correspondingAuthorName")}
                  />
                  {form.formState.errors.correspondingAuthorName && (
                    <p className="text-sm text-red-500">{form.formState.errors.correspondingAuthorName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correspondingEmail">Corresponding Email *</Label>
                  <Input
                    id="correspondingEmail"
                    type="email"
                    data-testid="input-email"
                    placeholder="author@university.edu"
                    {...form.register("correspondingEmail")}
                  />
                  {form.formState.errors.correspondingEmail && (
                    <p className="text-sm text-red-500">{form.formState.errors.correspondingEmail.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="correspondingPhone">Contact Number *</Label>
                <Input
                  id="correspondingPhone"
                  data-testid="input-phone"
                  placeholder="+91 98765 43210"
                  {...form.register("correspondingPhone")}
                />
                {form.formState.errors.correspondingPhone && (
                  <p className="text-sm text-red-500">{form.formState.errors.correspondingPhone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="revisionNotes">Revision Notes (Optional)</Label>
                <Textarea
                  id="revisionNotes"
                  data-testid="input-revision-notes"
                  placeholder="Describe the changes made in response to reviewer comments..."
                  {...form.register("revisionNotes")}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Final Paper
              </CardTitle>
              <CardDescription>
                Upload your revised and formatted final paper
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
                <Input
                  type="file"
                  accept=".doc,.docx"
                  onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="paper-file"
                  data-testid="input-paper-file"
                />
                <label htmlFor="paper-file" className="cursor-pointer">
                  <Upload className="w-10 h-10 mx-auto text-blue-500 mb-3" />
                  <p className="text-sm font-medium">
                    {paperFile ? paperFile.name : "Click to upload your final paper"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    DOC, DOCX only (Max 10MB)
                  </p>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Button
              type="submit"
              className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
              disabled={submitMutation.isPending}
              data-testid="button-submit-final-paper"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Final Paper"
              )}
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-muted-foreground pb-8">
          <p>All rights are reserved @ www.scholarindiapub.com</p>
        </div>
      </div>
    </div>
  );
}
