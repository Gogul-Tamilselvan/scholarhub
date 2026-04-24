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
import { FileText, Download, Upload, CheckCircle, Loader2, AlertCircle, CreditCard, Image as ImageIcon, QrCode, Check, Copy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MAIL_SERVER_URL, MAIL_API_KEY } from "@/lib/config";
import upiQrPath from "@assets/IMG-20260120-WA0001_1768957901426.jpg";

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

const triggerEmail = async (endpoint: string, payload: any) => {
  try {
    const res = await fetch(`${MAIL_SERVER_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": MAIL_API_KEY },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (e) {
    console.error("Mail trigger error:", e);
    return null;
  }
};

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
  const [paymentCompleted, setPaymentCompleted] = useState<"yes" | "no" | "complementary" | "">("yes");
  const [paymentNonReason, setPaymentNonReason] = useState<"complementary" | "waiver" | "other" | "">("");
  const [paymentOtherReason, setPaymentOtherReason] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [manuscriptDetails, setManuscriptDetails] = useState<any>({});
  const [showAlert, setShowAlert] = useState<{ type: "manuscript" | "copyright" | null, visible: boolean }>({ type: null, visible: false });

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
      const { data, error } = await supabase
        .from("manuscripts")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        throw new Error("Manuscript not found or failed to fetch. Please verify ID.");
      }

      form.setValue("articleTitle", data.title || "");
      form.setValue("correspondingAuthorName", data.author_name || "");
      form.setValue("correspondingEmail", data.email || "");
      form.setValue("correspondingPhone", data.mobile || "");
      form.setValue("correspondingAuthorAddress", data.department || "");
      form.setValue("correspondingAuthorAffiliation", data.affiliation || "");
      form.setValue("revisionNotes", data.research_field || "");
      form.setValue("supportingAuthors", data.author_names || "");
      
      // Auto-detect journal type from journal name or code
      const journalName = data.journal?.toLowerCase() || '';
      if (journalName.includes("commerce") || journalName === "sjcm") {
        form.setValue("publicationType", "sjcm");
      } else if (journalName.includes("humanities") || journalName.includes("social") || journalName === "sjhss") {
        form.setValue("publicationType", "sjhss");
      } else {
        // Fallback for cases like "SJHSS" or "SJCM" (sometimes uppercase in DB)
        if (id.startsWith("MANSJHS") || id.startsWith("MANSJHSS")) form.setValue("publicationType", "sjhss");
        else if (id.startsWith("MANSJCM") || id.startsWith("MSJCM")) form.setValue("publicationType", "sjcm");
      }

      // Store manuscript status and all details
      const status = (data.status || "").toLowerCase();
      setManuscriptStatus(status);
      setManuscriptDetails(data);

      if (status.includes("complement")) {
        toast({
          title: "Details Fetched ✓",
          description: "Manuscript status: Complement. All details loaded. You can edit any information below before proceeding.",
        });
      } else if (status.includes("accepted")) {
        toast({
          title: "Details Fetched ✓",
          description: "Manuscript status: Accepted. All details loaded. You can edit any information below before proceeding.",
        });
      } else {
        toast({
          title: "Details Fetched ✓",
          description: "Manuscript details have been automatically filled. You can edit any information below before proceeding.",
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
      // If it's not a complementary submission, verify payment upload
      if (paymentCompleted !== "complementary" && paymentCompleted !== "no") {
        if (!paymentScreenshot) throw new Error("Payment screenshot is required.");
        if (!data.transactionId) throw new Error("Transaction ID is required.");
        if (!data.paymentMethod) throw new Error("Payment method is required.");
      }

      // We need to upload `paperFile`, `copyrightFile`, and `paymentScreenshot` to Supabase S3 bucket securely using the edge function
      const uploadFile = async (file: File | null, prefix: string) => {
        if (!file) return null;
        const fileExtension = file.name.split('.').pop() || 'tmp';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = `${prefix}/${data.manuscriptId}_${uniqueSuffix}.${fileExtension}`;
        
        const { data: presignData, error: presignError } = await supabase.functions.invoke('s3-presign', {
          body: { fileName, fileType: file.type || 'application/octet-stream' }
        });
        if (presignError) throw new Error("Failed to authenticate upload for " + prefix);
        
        const uploadResponse = await fetch(presignData.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || 'application/octet-stream' },
          body: await file.arrayBuffer()
        });
        if (!uploadResponse.ok) throw new Error("Failed to upload " + prefix);
        
        return presignData.publicUrl;
      };

      const finalPaperUrl = await uploadFile(paperFile, 'final-papers');
      const copyrightUrl = await uploadFile(copyrightFile, 'copyrights');
      const paymentProofUrl = await uploadFile(paymentScreenshot, 'receipts');

      // 1. Insert into Payments Table if applicable
      if (paymentCompleted !== "complementary" && paymentCompleted !== "no") {
        const { error: paymentError } = await supabase.from('payments').insert([{
          manuscript_id: data.manuscriptId,
          email: data.correspondingEmail,
          author_name: data.correspondingAuthorName,
          manuscript_title: data.articleTitle,
          amount: data.publicationType === 'sjcm' ? '1500' : '1500', // adjust depending on logic
          payment_method: data.paymentMethod,
          transaction_number: data.transactionId,
          payment_proof_url: paymentProofUrl,
          submitted_at: new Date().toISOString(),
          date_of_payment: new Date().toISOString(), // Fallback for Excel components
          status: 'Pending'
        }]);
        if (paymentError) throw new Error("Failed to record payment: " + paymentError.message);
      }

      // 2. Insert into copyright_forms
      const { error: copyrightError } = await supabase.from('copyright_forms').insert([{
        manuscript_id: data.manuscriptId,
        journal: data.publicationType,
        title: data.articleTitle,
        author_names: data.correspondingAuthorName,
        institution: data.correspondingAuthorAffiliation,
        department: data.correspondingAuthorAddress,
        supporting_author: data.supportingAuthors,
        email: data.correspondingEmail,
        mobile: data.correspondingPhone,
        conflict_of_interest: data.conflictOfInterest,
        funding_support: data.fundingSupport,
        license_agreement: data.agreementAccepted ? 'yes' : 'no',
        file_url: copyrightUrl,
        submitted_at: new Date().toISOString(),
        status: 'Submitted'
      }]);
      if (copyrightError) throw new Error("Failed to record copyright form: " + copyrightError.message);

      // 3. Insert into final_papers
      const { error: paperError } = await supabase.from('final_papers').insert([{
        manuscript_id: data.manuscriptId,
        journal: data.publicationType,
        title: data.articleTitle,
        author_name: data.correspondingAuthorName,
        email: data.correspondingEmail,
        mobile: data.correspondingPhone,
        file_url: finalPaperUrl,
        publication_type: data.publicationType,
        article_title: data.articleTitle,
        submitted_at: new Date().toISOString(),
        status: 'Submitted'
      }]);
      if (paperError) throw new Error("Failed to record final paper: " + paperError.message);

      // 4. Update Manuscript with Final Paper and Copyright URLs (assuming custom column or keeping track somewhere, here updating status)
      const { error: msError } = await supabase.from('manuscripts')
        .update({ status: 'final-submitted' })
        .eq('id', data.manuscriptId);
        
      if (msError) console.error("Could not update manuscript status:", msError.message);
      
      return { success: true, data };
    },
    onSuccess: (result) => {
      const { data } = result;
      setSubmitted(true);
      setShowConfirmDialog(false);
      toast({
        title: "All Documents Submitted Successfully",
        description: "Your final paper, copyright form, and payment details have been submitted.",
      });

      // Trigger Confirmation Email
      triggerEmail('/send/status-update', {
        name: data.correspondingAuthorName,
        email: data.correspondingEmail,
        status: 'Final Submission Received',
        mID: data.manuscriptId,
        manuscriptTitle: data.articleTitle,
        journalName: data.publicationType === 'sjcm' ? 'Scholar Journal of Commerce & Management' : 'Scholar Journal of Humanities & Social Sciences'
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
    if (!paymentCompleted) {
      toast({
        title: "Payment Status Required",
        description: "Please indicate whether payment has been completed.",
        variant: "destructive",
      });
      return;
    }
    if (paymentCompleted === "yes" && !data.paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select your payment method.",
        variant: "destructive",
      });
      return;
    }
    if (paymentCompleted === "yes" && !data.transactionId) {
      toast({
        title: "Transaction ID Required",
        description: "Please enter your transaction ID or reference number.",
        variant: "destructive",
      });
      return;
    }
    if (paymentCompleted === "no" && !paymentNonReason) {
      toast({
        title: "Reason Required",
        description: "Please select the reason for non-payment.",
        variant: "destructive",
      });
      return;
    }
    if (paymentCompleted === "no" && paymentNonReason === "other" && !paymentOtherReason.trim()) {
      toast({
        title: "Reason Details Required",
        description: "Please describe the reason for non-payment.",
        variant: "destructive",
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  const watchConflict = form.watch("conflictOfInterest");
  const watchFunding = form.watch("fundingSupport");

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
        <div className="flex items-center gap-2 mb-8 overflow-x-auto">
          {[1, 2, 3].map((step, idx) => (
            <div key={step} className="flex items-center gap-2">
              <button
                type="button"
                className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition-colors flex-shrink-0 cursor-default ${
                  currentStep >= step
                    ? "bg-[#213361] text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                {currentStep > step ? "✓" : step}
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline whitespace-nowrap">
                {step === 1 && "Final Paper"}
                {step === 2 && "Copyright Form"}
                {step === 3 && "Payment"}
              </span>
              {idx < 2 && (
                <div className={`h-0.5 w-8 mx-1 rounded hidden sm:block ${currentStep > step ? "bg-[#213361]" : "bg-gray-200 dark:bg-gray-700"}`} />
              )}
            </div>
          ))}
        </div>

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
                    {paymentCompleted === "yes" && <li>✓ Payment Details Provided</li>}
                    {paymentCompleted === "no" && <li>⚡ Payment Pending — Reason: {paymentNonReason === "complementary" ? "Complementary" : paymentNonReason === "waiver" ? "Waiver" : "Other"}</li>}
                  </ul>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 font-medium text-center">
                  Confirm submission of all documents?
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

        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("Form Validation Errors:", errors);
          const firstError = Object.values(errors)[0];
          if (firstError) {
            toast({
              title: "Form Incomplete",
              description: String(firstError.message || "Please check all fields in all steps."),
              variant: "destructive",
            });
          }
        })}>
          {/* STEP 0: TEMPLATE DOWNLOAD & FETCH MANUSCRIPT - Shows before data is fetched */}
          {!manuscriptStatus && currentStep === 1 && (
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
                  <CardTitle>Fetch Your Manuscript Details</CardTitle>
                  <CardDescription>Enter your manuscript ID to load all submission information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        variant="default"
                        onClick={fetchManuscript}
                        disabled={isFetching || !form.watch("manuscriptId")}
                        className="bg-[#213361] hover:bg-[#2a4078]"
                      >
                        {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
                      </Button>
                    </div>
                    {form.formState.errors.manuscriptId && (
                      <p className="text-sm text-red-500">{form.formState.errors.manuscriptId.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 1: FINAL PAPER - Shows after data is fetched */}
          {manuscriptStatus && currentStep === 1 && (
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

              {/* Manuscript Details Summary */}
              <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                <CardHeader className="bg-[#213361] rounded-t-lg overflow-hidden">
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Manuscript Details Found
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Manuscript ID</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{form.getValues("manuscriptId")}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</p>
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400 mt-1 uppercase">{manuscriptStatus}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Manuscript Title</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{form.getValues("articleTitle")}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 border-t pt-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Journal</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{form.getValues("publicationType") === 'sjcm' ? 'Scholar Journal of Commerce & Management' : 'Scholar Journal of Humanities & Social Sciences'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Research Field</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{manuscriptDetails.researchField || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 border-t pt-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Author Name</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{form.getValues("correspondingAuthorName")}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Designation</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{manuscriptDetails.designation || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 border-t pt-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Department</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{form.getValues("correspondingAuthorAddress") || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Affiliation</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{form.getValues("correspondingAuthorAffiliation")}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 border-t pt-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Email</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 break-all">{form.getValues("correspondingEmail")}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Mobile</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{form.getValues("correspondingPhone")}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Co-Authors</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{form.getValues("supportingAuthors") || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Edit Submission Details</CardTitle>
                  <CardDescription>Modify any information below before uploading your manuscript</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                  <div className="space-y-2">
                    <Label htmlFor="publicationType">Target Journal *</Label>
                    <Select 
                      value={form.watch("publicationType")} 
                      onValueChange={(v) => form.setValue("publicationType", v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Journal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sjcm">Scholar Journal of Commerce & Management (SJCM)</SelectItem>
                        <SelectItem value="sjhss">Scholar Journal of Humanities & Social Sciences (SJHSS)</SelectItem>
                      </SelectContent>
                    </Select>
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
                  {paperFile && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-green-700 dark:text-green-400">File uploaded successfully</p>
                        <p className="text-green-600 dark:text-green-500 text-xs mt-0.5 break-all">{paperFile.name}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                type="button"
                onClick={() => {
                  if (!form.getValues("articleTitle")) {
                    toast({ title: "Required", description: "Please enter the article title.", variant: "destructive" }); return;
                  }
                  if (!form.getValues("correspondingAuthorName")) {
                    toast({ title: "Required", description: "Please enter the corresponding author name.", variant: "destructive" }); return;
                  }
                  if (!form.getValues("correspondingEmail")) {
                    toast({ title: "Required", description: "Please enter a valid email address.", variant: "destructive" }); return;
                  }
                  if (!form.getValues("correspondingPhone")) {
                    toast({ title: "Required", description: "Please enter a contact number.", variant: "destructive" }); return;
                  }
                  if (!form.getValues("correspondingAuthorAffiliation")) {
                    toast({ title: "Required", description: "Please enter the affiliation/institution.", variant: "destructive" }); return;
                  }
                  if (!form.getValues("correspondingAuthorAddress")) {
                    toast({ title: "Required", description: "Please enter the address with pin/zip code.", variant: "destructive" }); return;
                  }
                  if (!paperFile) {
                    toast({ title: "Required", description: "Please upload your final paper.", variant: "destructive" }); return;
                  }
                  if (authors.some(a => !a.name || !a.designation || !a.affiliation || !a.email)) {
                    toast({ title: "Required", description: "Please fill in all author details.", variant: "destructive" }); return;
                  }
                  // Show alert before proceeding to copyright form
                  setShowAlert({ type: "manuscript", visible: true });
                }}
                className="w-full h-12 bg-[#213361] hover:bg-[#2a4078]"
                data-testid="button-next-step-1"
              >
                Continue to Copyright Form →
              </Button>
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
                  {copyrightFile && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-green-700 dark:text-green-400">File uploaded successfully</p>
                        <p className="text-green-600 dark:text-green-500 text-xs mt-0.5 break-all">{copyrightFile.name}</p>
                      </div>
                    </div>
                  )}
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
                <Button
                  type="button"
                  onClick={() => {
                    if (!form.getValues("conflictOfInterest")) {
                      toast({ title: "Required", description: "Please indicate conflict of interest status.", variant: "destructive" }); return;
                    }
                    if (!form.getValues("fundingSupport")) {
                      toast({ title: "Required", description: "Please indicate funding support status.", variant: "destructive" }); return;
                    }
                    if (!form.getValues("agreementAccepted")) {
                      toast({ title: "Required", description: "Please accept the license agreement.", variant: "destructive" }); return;
                    }
                    if (!copyrightFile) {
                      toast({ title: "Required", description: "Please upload the signed copyright form.", variant: "destructive" }); return;
                    }
                    // Show alert before proceeding to payment
                    setShowAlert({ type: "copyright", visible: true });
                  }}
                  className="flex-1 bg-[#213361] hover:bg-[#2a4078]"
                  data-testid="button-next-step-2"
                >
                  Continue to Payment →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-6">
              
              {/* Payment Section Grid */}
              <div className="grid lg:grid-cols-12 gap-8">
                
                {/* Left Column: Payment Details & QR */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* UPI Payment Box */}
                  {paymentCompleted !== "complementary" && (
                    <Card className="border-blue-100 dark:border-blue-900 shadow-sm overflow-hidden bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background">
                      <CardHeader className="bg-[#213361] text-white pb-3">
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-green-400" />
                          Secure Payment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200">
                            <img src={upiQrPath} alt="UPI QR Code" className="w-40 h-40 object-contain mx-auto" />
                            <p className="text-[10px] mt-2 font-black text-[#213361] text-center uppercase tracking-widest">SCAN TO PAY</p>
                          </div>
                          
                          <div className="flex-1 space-y-4">
                            <div>
                              <p className="text-base font-bold text-gray-900 dark:text-gray-100">UPI Payment</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Scan with any UPI app or copy the ID</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Input readOnly value="PPQR01.HNZMKU@iob" className="font-mono text-sm" />
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="icon"
                                onClick={async () => {
                                  await navigator.clipboard.writeText("PPQR01.HNZMKU@iob");
                                  toast({ title: "UPI ID Copied!" });
                                }}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                              <p className="text-sm text-blue-800 dark:text-blue-300">Amount to Pay</p>
                              <p className="text-xl pl-1 font-extrabold text-blue-900 dark:text-blue-100">₹{form.getValues('publicationType') === 'sjcm' ? '1,500' : '1,500'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                          <p className="text-xs text-yellow-800 dark:text-yellow-300">
                            <span className="font-bold">📱 Steps:</span> Open any UPI app (Google Pay, PhonePe, Paytm, etc.), scan the QR code or enter the UPI ID manually, and complete the payment.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Payment Details Form */}
                  {paymentCompleted !== "complementary" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Mode of Payment *</Label>
                            <Select
                              value={form.watch("paymentMethod")}
                              onValueChange={(value) => form.setValue("paymentMethod", value)}
                            >
                              <SelectTrigger data-testid="select-payment-method">
                                <SelectValue placeholder="Select payment mode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bank_transfer">Bank Transfer (NEFT/RTGS)</SelectItem>
                                <SelectItem value="upi">UPI Payment</SelectItem>
                                <SelectItem value="credit_card">Card Payment</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="transactionId">Transaction Number *</Label>
                            <Input
                              id="transactionId"
                              data-testid="input-transaction-id"
                              placeholder="e.g., TXN12345"
                              {...form.register("transactionId")}
                            />
                          </div>
                        </div>

                        {/* Payment Screenshot Upload */}
                        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <Label className="flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Payment Proof (Screenshot/Receipt) *
                          </Label>
                          <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-5 text-center transition-all hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                            <Input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)}
                              className="hidden"
                              id="payment-screenshot"
                              data-testid="input-payment-screenshot"
                            />
                            <label htmlFor="payment-screenshot" className="cursor-pointer block w-full">
                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {paymentScreenshot ? paymentScreenshot.name : "Upload Payment Screenshot"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG, or PDF (Max 10MB)
                              </p>
                              {!paymentScreenshot && (
                                <div className="mt-3 mx-auto inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <Upload className="w-4 h-4 mr-2" /> Choose File
                                </div>
                              )}
                            </label>
                          </div>
                          {paymentScreenshot && (
                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                              <div className="text-sm">
                                <p className="text-green-700 dark:text-green-400">Payment proof attached successfully</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Column: Your Order */}
                <div className="lg:col-span-4 max-lg:order-first">
                  <Card className="border border-gray-200 shadow-md sticky top-6">
                    <CardHeader className="bg-[#213361] text-white">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5" /> Your Order
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      
                      {paymentCompleted !== "complementary" ? (
                        <>
                          <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                            <p className="text-sm text-gray-500 font-medium mb-1">Publication Fee</p>
                            <p className="text-3xl font-black text-[#213361] dark:text-blue-300">₹{form.getValues('publicationType') === 'sjcm' ? '1,500' : '1,500'}</p>
                          </div>

                          <div className="p-5 bg-green-50/70 dark:bg-green-950/20 m-4 rounded-lg border border-green-100 dark:border-green-900">
                            <p className="font-bold text-green-800 dark:text-green-400 text-sm mb-3">Includes:</p>
                            <ul className="text-xs text-green-700 dark:text-green-500 space-y-2">
                              {['✓ Crossref DOI', '✓ Peer Review', '✓ Professional Editing', '✓ Open Access', '✓ Academic Indexing'].map((feature, i) => (
                                <li key={i}>{feature}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Secure Payment
                          </div>
                        </>
                      ) : (
                        <div className="p-6 text-center">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                          <p className="text-lg font-bold text-green-700 dark:text-green-400">Complementary Submission</p>
                          <p className="text-sm text-gray-600 mt-2">Zero fee will be applied for this publication.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
              </div>

              {/* Complement Submission Checkbox */}
              <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="opt-complementary"
                      checked={paymentCompleted === "complementary"}
                      onCheckedChange={(checked) => {
                         if (checked) {
                            setPaymentCompleted("complementary");
                            setPaymentNonReason("complementary");
                         } else {
                            setPaymentCompleted("yes");
                            setPaymentNonReason("");
                         }
                      }}
                      className="mt-1"
                      data-testid="checkbox-complementary"
                    />
                    <div>
                      <Label htmlFor="opt-complementary" className="text-base font-bold text-amber-900 dark:text-amber-300 cursor-pointer">
                        Complementary Submission (No Payment Required)
                      </Label>
                      {paymentCompleted === "complementary" && (
                        <div className="mt-3 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400 text-sm">
                          <p className="font-bold flex items-center gap-2">
                            ⚠️ Warning
                          </p>
                          <p className="mt-1 font-medium">
                            If you select this option and your manuscript is NOT approved for complementary waiver by the editorial team, your final paper will be directly rejected without any further intimation.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submission Status & Buttons */}
              {((paymentCompleted !== "complementary" && paymentCompleted !== "no" && paymentScreenshot) || (paymentCompleted === "complementary")) && (
                <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                  <CardContent className="pt-5">
                    <p className="font-semibold text-green-800 dark:text-green-300 mb-3">Ready to Submit:</p>
                    <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                      <li>✓ Final Paper uploaded and formatted</li>
                      <li>✓ Copyright form signed and uploaded</li>
                      <li>✓ All declarations completed</li>
                      <li>✓ {paymentCompleted === "complementary" ? "Complementary Submission Selected" : "Payment details provided"}</li>
                    </ul>
                  </CardContent>
                </Card>
              )}

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

        {/* Centered Alert Modal - Manuscript Warning */}
        {showAlert.type === "manuscript" && showAlert.visible && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full shadow-2xl">
              <CardHeader className="bg-amber-600 text-white rounded-t-lg overflow-hidden">
                <CardTitle className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6" />
                  Important Reminder
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 pb-6">
                <p className="text-lg text-gray-900 dark:text-gray-100 font-semibold mb-4">
                  ⚠️ Make sure you have uploaded your final manuscript as per the journal template.
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-6">
                  Otherwise, your manuscript will be summarily rejected without any further intimation.
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  Please ensure your document follows the journal's formatting guidelines and includes all necessary revisions.
                </p>
              </CardContent>
              <div className="flex gap-3 px-6 pb-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAlert({ type: null, visible: false })}
                  className="flex-1"
                >
                  Go Back & Review
                </Button>
                <Button
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  onClick={() => {
                    setShowAlert({ type: null, visible: false });
                    setCurrentStep(2);
                  }}
                >
                  I Confirm - Continue
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Centered Alert Modal - Copyright Notice */}
        {showAlert.type === "copyright" && showAlert.visible && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full shadow-2xl">
              <CardHeader className="bg-[#213361] text-white rounded-t-lg overflow-hidden">
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6" />
                  Submission Confirmation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 pb-6">
                <p className="text-lg text-gray-900 dark:text-gray-100 font-semibold mb-4">
                  ✓ All declarations and copyright form have been recorded.
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-6">
                  You will now proceed to the payment information section. Please provide your payment details in the next step.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Next Steps:</p>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>Provide payment method details</li>
                    <li>Upload payment proof/screenshot</li>
                    <li>Review and submit all documents</li>
                  </ul>
                </div>
              </CardContent>
              <div className="flex gap-3 px-6 pb-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAlert({ type: null, visible: false })}
                  className="flex-1"
                >
                  Review Again
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setShowAlert({ type: null, visible: false });
                    setCurrentStep(3);
                  }}
                >
                  Continue to Payment
                </Button>
              </div>
            </Card>
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
