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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Upload, CheckCircle, Loader2, AlertCircle, CreditCard } from "lucide-react";

const commerceTemplate = "/downloads/template-sjcm.docx";
const hssTemplate = "/downloads/template-sjhss.docx";
const copyrightFormTemplate = "/downloads/copyright-form.pdf";

const unifiedFormSchema = z.object({
  // Submission Details
  publicationType: z.string().min(1, "Please select a publication type"),
  manuscriptId: z.string().min(1, "Manuscript ID is required"),
  articleTitle: z.string().min(1, "Article title is required"),
  correspondingAuthorName: z.string().min(1, "Corresponding author name is required"),
  correspondingEmail: z.string().email("Valid email is required"),
  correspondingPhone: z.string().min(10, "Valid phone number is required"),
  correspondingAuthorAddress: z.string().min(1, "Address with Pin/Zip code is required"),
  correspondingAuthorAffiliation: z.string().min(1, "Affiliation is required"),
  revisionNotes: z.string().optional(),
  supportingAuthors: z.string().optional(),
  // Copyright Form Details
  conflictOfInterest: z.string().min(1, "Please indicate conflict of interest status"),
  conflictDetails: z.string().optional(),
  fundingSupport: z.string().min(1, "Please indicate funding support status"),
  fundingDetails: z.string().optional(),
  agreementAccepted: z.boolean().refine(val => val === true, "You must accept the license agreement"),
  // Payment Details
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional(),
  paymentNotes: z.string().optional(),
});

type UnifiedFormData = z.infer<typeof unifiedFormSchema>;

export default function FinalPaperForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [copyrightFile, setCopyrightFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [authors, setAuthors] = useState([{ name: "", designation: "", affiliation: "", email: "" }]);
  const [manuscriptStatus, setManuscriptStatus] = useState<string>("");

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

      // Store manuscript status
      const status = (data.status || "").toLowerCase();
      setManuscriptStatus(status);

      // Show message if complement status
      if (status.includes("complement")) {
        toast({
          title: "Details Fetched",
          description: "Manuscript status: Complement. Payment step will be optional.",
        });
      } else {
        toast({
          title: "Details Fetched",
          description: "Manuscript details have been automatically filled.",
        });
      }
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

  const form = useForm<UnifiedFormData>({
    resolver: zodResolver(unifiedFormSchema),
    defaultValues: {
      publicationType: "",
      manuscriptId: "",
      articleTitle: "",
      correspondingAuthorName: "",
      correspondingEmail: "",
      correspondingPhone: "",
      correspondingAuthorAddress: "",
      correspondingAuthorAffiliation: "",
      revisionNotes: "",
      supportingAuthors: "",
      conflictOfInterest: "",
      conflictDetails: "",
      fundingSupport: "",
      fundingDetails: "",
      agreementAccepted: false,
      paymentMethod: "",
      transactionId: "",
      paymentNotes: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: UnifiedFormData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      formData.append("authors", JSON.stringify(authors));
      formData.append("manuscriptStatus", manuscriptStatus);
      if (paperFile) {
        formData.append("finalPaper", paperFile);
      }
      if (copyrightFile) {
        formData.append("copyrightForm", copyrightFile);
      }

      // Submit to unified endpoint
      const response = await fetch("/api/final-paper-unified", {
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
        title: "All Documents Submitted Successfully",
        description: "Your final paper, copyright form, and payment details have been submitted.",
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

  const onSubmit = (data: UnifiedFormData) => {
    if (!paperFile) {
      toast({
        title: "Missing File",
        description: "Please upload your final paper.",
        variant: "destructive",
      });
      return;
    }
    if (!copyrightFile) {
      toast({
        title: "Missing File",
        description: "Please upload the signed copyright form.",
        variant: "destructive",
      });
      return;
    }
    if (authors.some(a => !a.name || !a.designation || !a.affiliation || !a.email)) {
      toast({
        title: "Author Details Required",
        description: "Please fill in all author details.",
        variant: "destructive",
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  const watchPublicationType = form.watch("publicationType");
  const watchConflict = form.watch("conflictOfInterest");
  const watchFunding = form.watch("fundingSupport");
  const isComplementStatus = manuscriptStatus.includes("complement");

  if (submitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="pt-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                All Documents Submitted Successfully
              </h2>
              <p className="text-muted-foreground mb-4">
                Your final paper, copyright form, and payment details have been successfully submitted.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our editorial team will process your submission and notify you of the next steps via email.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Final Submission
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your final paper, copyright, and payment submission in one form
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {[1, 2, ...(isComplementStatus ? [] : [3])].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep(step)}
                className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition-colors ${
                  currentStep >= step
                    ? "bg-[#213361] text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                {step}
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                {step === 1 && "Final Paper"}
                {step === 2 && "Copyright"}
                {step === 3 && "Payment"}
              </span>
            </div>
          ))}
        </div>
        {isComplementStatus && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg mb-4 text-sm text-blue-800 dark:text-blue-300">
            This manuscript has "Complement" status. Payment details are optional and will be skipped.
          </div>
        )}

        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-2xl">
              <CardHeader className="bg-[#213361] text-white">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Final Submission Check
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-6">
                  <p className="text-green-900 dark:text-green-200 font-bold mb-2">Ready to submit:</p>
                  <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                    <li>✓ Final Paper (formatted)</li>
                    <li>✓ Copyright Form (signed)</li>
                    <li>✓ Payment Details</li>
                  </ul>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 font-medium text-center">
                  Confirm submission of all three documents?
                </p>
                <div className="flex gap-3">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setShowConfirmDialog(false)}
                    disabled={submitMutation.isPending}
                  >
                    Review Again
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
                      "Confirm & Submit"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* STEP 1: FINAL PAPER */}
          {currentStep === 1 && (
            <div className="space-y-6">
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
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
                        className="bg-[#213361]/10 hover:bg-[#213361]/20 text-[#213361] border-[#213361]/30"
                      >
                        {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
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
                        <p className="text-sm font-semibold text-[#213361]">Author {index + 1}</p>
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
                      className="w-full border-dashed"
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

                  <div className="grid md:grid-cols-2 gap-4">
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
                      <Label htmlFor="correspondingAuthorAffiliation">Affiliation *</Label>
                      <Input
                        id="correspondingAuthorAffiliation"
                        data-testid="input-affiliation"
                        placeholder="University/Institution name"
                        {...form.register("correspondingAuthorAffiliation")}
                      />
                      {form.formState.errors.correspondingAuthorAffiliation && (
                        <p className="text-sm text-red-500">{form.formState.errors.correspondingAuthorAffiliation.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="correspondingAuthorAddress">Address with Pin/Zip Code *</Label>
                    <Textarea
                      id="correspondingAuthorAddress"
                      data-testid="input-address"
                      placeholder="Full address including city, state, country and pin/zip code"
                      {...form.register("correspondingAuthorAddress")}
                    />
                    {form.formState.errors.correspondingAuthorAddress && (
                      <p className="text-sm text-red-500">{form.formState.errors.correspondingAuthorAddress.message}</p>
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
                    Upload your revised and formatted final paper (DOC/DOCX)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Input
                      type="file"
                      accept=".doc,.docx"
                      onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="paper-file"
                      data-testid="input-paper-file"
                    />
                    <label htmlFor="paper-file" className="cursor-pointer">
                      <Upload className="w-10 h-10 mx-auto text-[#213361] mb-3" />
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

              <Button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full h-12 bg-[#213361] hover:bg-[#2a4078]"
                data-testid="button-next-step-1"
              >
                Continue to Copyright Form →
              </Button>
              {isComplementStatus && (
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
                  After copyright form, you'll complete the submission
                </p>
              )}
            </div>
          )}

          {/* STEP 2: COPYRIGHT FORM */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800 dark:text-amber-300">Copyright Form Instructions</p>
                      <ul className="text-sm text-amber-700 dark:text-amber-400 mt-2 space-y-1 list-disc list-inside">
                        <li>Download the copyright form template below</li>
                        <li>Fill it completely, sign it, and scan/photograph it</li>
                        <li>Upload the signed form (PDF or image)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Download Copyright Form
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={copyrightFormTemplate}
                    download="Scholar_India_Publishers_Copyright_Form.pdf"
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Copyright Form</p>
                      <p className="text-xs text-muted-foreground">Download, sign, and upload</p>
                    </div>
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Copyright & Declarations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="supportingAuthors">Supporting Author(s) Name(s)</Label>
                    <Textarea
                      id="supportingAuthors"
                      data-testid="input-supporting-authors"
                      placeholder="Enter names of co-authors (if any), separated by commas"
                      {...form.register("supportingAuthors")}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Conflict of Interest *</Label>
                    <RadioGroup
                      value={form.watch("conflictOfInterest")}
                      onValueChange={(value) => form.setValue("conflictOfInterest", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="conflict-none" />
                        <Label htmlFor="conflict-none" className="font-normal">
                          I/We have no conflict of interest to declare
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="conflict-yes" />
                        <Label htmlFor="conflict-yes" className="font-normal">
                          I/We have a conflict of interest to declare
                        </Label>
                      </div>
                    </RadioGroup>
                    {form.formState.errors.conflictOfInterest && (
                      <p className="text-sm text-red-500">{form.formState.errors.conflictOfInterest.message}</p>
                    )}
                    {watchConflict === "yes" && (
                      <div className="mt-2">
                        <Label htmlFor="conflictDetails">Please describe the conflict of interest</Label>
                        <Textarea
                          id="conflictDetails"
                          data-testid="input-conflict-details"
                          placeholder="Describe your conflict of interest..."
                          {...form.register("conflictDetails")}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>Funding Support *</Label>
                    <RadioGroup
                      value={form.watch("fundingSupport")}
                      onValueChange={(value) => form.setValue("fundingSupport", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="funding-none" />
                        <Label htmlFor="funding-none" className="font-normal">
                          This research received no specific funding
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="funding-yes" />
                        <Label htmlFor="funding-yes" className="font-normal">
                          This research received funding support
                        </Label>
                      </div>
                    </RadioGroup>
                    {form.formState.errors.fundingSupport && (
                      <p className="text-sm text-red-500">{form.formState.errors.fundingSupport.message}</p>
                    )}
                    {watchFunding === "yes" && (
                      <div className="mt-2">
                        <Label htmlFor="fundingDetails">Please provide funding details</Label>
                        <Textarea
                          id="fundingDetails"
                          data-testid="input-funding-details"
                          placeholder="Funding agency, grant number, etc."
                          {...form.register("fundingDetails")}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Signed Copyright Form
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setCopyrightFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="copyright-file"
                      data-testid="input-copyright-file"
                    />
                    <label htmlFor="copyright-file" className="cursor-pointer">
                      <Upload className="w-10 h-10 mx-auto text-[#213361] mb-3" />
                      <p className="text-sm font-medium">
                        {copyrightFile ? copyrightFile.name : "Click to upload signed copyright form"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                      </p>
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>License Agreement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto text-sm text-gray-700 dark:text-gray-300">
                    <p className="mb-3 font-semibold">Creative Commons Attribution 4.0 International License</p>
                    <p className="mb-2">
                      By submitting this work, you agree that it will be published under the Creative Commons Attribution 4.0 International License (CC BY 4.0). This license allows others to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 mb-2">
                      <li>Share (copy and redistribute the material)</li>
                      <li>Adapt (remix, transform, and build upon the material)</li>
                      <li>Attribute (give appropriate credit to the author)</li>
                    </ul>
                    <p>
                      You retain the copyright to your work while granting others the right to use it under these terms.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreement-accepted"
                      checked={form.watch("agreementAccepted")}
                      onCheckedChange={(checked) => form.setValue("agreementAccepted", checked as boolean)}
                      data-testid="checkbox-agreement"
                    />
                    <Label htmlFor="agreement-accepted" className="font-normal">
                      I agree to publish this work under the Creative Commons Attribution 4.0 International License *
                    </Label>
                  </div>
                  {form.formState.errors.agreementAccepted && (
                    <p className="text-sm text-red-500">{form.formState.errors.agreementAccepted.message}</p>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-back-step-2"
                >
                  ← Back to Final Paper
                </Button>
                {isComplementStatus ? (
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                    disabled={submitMutation.isPending}
                    data-testid="button-submit-complement"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit All Documents"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 bg-[#213361] hover:bg-[#2a4078]"
                    data-testid="button-next-step-2"
                  >
                    Continue to Payment →
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-800 dark:text-blue-300">Payment Information</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
                        Confirm your payment method and provide transaction details. Payment should be made according to the APC rates for your manuscript.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select
                      value={form.watch("paymentMethod")}
                      onValueChange={(value) => form.setValue("paymentMethod", value)}
                    >
                      <SelectTrigger data-testid="select-payment-method">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank Transfer (NEFT/IMPS/RTGS)</SelectItem>
                        <SelectItem value="upi">UPI Payment</SelectItem>
                        <SelectItem value="credit_card">Credit/Debit Card</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transactionId">Transaction ID / Reference Number</Label>
                    <Input
                      id="transactionId"
                      data-testid="input-transaction-id"
                      placeholder="Enter your transaction ID or reference number"
                      {...form.register("transactionId")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentNotes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="paymentNotes"
                      data-testid="input-payment-notes"
                      placeholder="Any additional information regarding your payment..."
                      {...form.register("paymentNotes")}
                    />
                  </div>

                  <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        For payment instructions and APC rates, please visit:
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open("/publication-payment", "_blank")}
                        data-testid="button-payment-page"
                      >
                        View Payment Details & Instructions
                      </Button>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <p className="font-semibold text-green-800 dark:text-green-300">Submission Summary:</p>
                    <ul className="text-sm text-green-700 dark:text-green-400 space-y-2">
                      <li>✓ Final Paper uploaded and formatted</li>
                      <li>✓ Copyright form signed and uploaded</li>
                      <li>✓ All declarations completed</li>
                      <li>✓ Payment information provided</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-back-step-3"
                >
                  ← Back to Copyright
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                  disabled={submitMutation.isPending}
                  data-testid="button-submit-all"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit All Documents"
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>

        <div className="text-center text-sm text-muted-foreground pb-8">
          <p>All rights are reserved @ www.scholarindiapub.com</p>
        </div>
      </div>
    </div>
  );
}
