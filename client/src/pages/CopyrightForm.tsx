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
import { apiRequest } from "@/lib/queryClient";
import { FileText, Download, Upload, CheckCircle, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const commerceTemplate = "/downloads/template-sjcm.docx";
const hssTemplate = "/downloads/template-sjhss.docx";
const copyrightFormTemplate = "/downloads/copyright-form.pdf";

const copyrightFormSchema = z.object({
  publicationType: z.string().min(1, "Please select a publication type"),
  manuscriptId: z.string().min(1, "Manuscript/Book ID is required"),
  articleTitle: z.string().min(1, "Article/Manuscript title is required"),
  correspondingAuthorName: z.string().min(1, "Corresponding author name is required"),
  correspondingAuthorAddress: z.string().min(1, "Address with Pin/Zip code is required"),
  correspondingAuthorAffiliation: z.string().min(1, "Affiliation is required"),
  supportingAuthors: z.string().optional(),
  correspondingEmail: z.string().email("Valid email is required"),
  correspondingPhone: z.string().min(10, "Valid phone number is required"),
  conflictOfInterest: z.string().min(1, "Please indicate conflict of interest status"),
  conflictDetails: z.string().optional(),
  fundingSupport: z.string().min(1, "Please indicate funding support status"),
  fundingDetails: z.string().optional(),
  agreementAccepted: z.boolean().refine(val => val === true, "You must accept the license agreement"),
});

type CopyrightFormData = z.infer<typeof copyrightFormSchema>;

export default function CopyrightForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [copyrightFile, setCopyrightFile] = useState<File | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [statusError, setStatusError] = useState<{ message: string; type: 'not_found' | 'pending' } | null>(null);

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
    setStatusError(null);
    try {
      const response = await fetch(`/api/manuscripts/${id}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setStatusError({ message: data.message, type: 'pending' });
        } else {
          setStatusError({ message: data.message || "Manuscript not found", type: 'not_found' });
        }
        return;
      }

      form.setValue("articleTitle", data.title || "");
      form.setValue("correspondingEmail", data.email || "");
      form.setValue("correspondingPhone", data.phone || "");
      
      toast({
        title: "Details Fetched",
        description: "Manuscript details have been automatically filled.",
      });
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const form = useForm<CopyrightFormData>({
    resolver: zodResolver(copyrightFormSchema),
    defaultValues: {
      publicationType: "",
      manuscriptId: "",
      articleTitle: "",
      correspondingAuthorName: "",
      correspondingAuthorAddress: "",
      correspondingAuthorAffiliation: "",
      supportingAuthors: "",
      correspondingEmail: "",
      correspondingPhone: "",
      conflictOfInterest: "",
      conflictDetails: "",
      fundingSupport: "",
      fundingDetails: "",
      agreementAccepted: false,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: CopyrightFormData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      if (copyrightFile) {
        formData.append("copyrightForm", copyrightFile);
      }
      const response = await fetch("/api/copyright-form", {
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
      toast({
        title: "Copyright Form Submitted",
        description: "Your copyright form has been successfully submitted.",
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

  const onSubmit = (data: CopyrightFormData) => {
    if (!copyrightFile) {
      toast({
        title: "Missing File",
        description: "Please upload the signed copyright form.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate(data);
  };

  const watchConflict = form.watch("conflictOfInterest");
  const watchFunding = form.watch("fundingSupport");
  const watchPublicationType = form.watch("publicationType");

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="pt-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                Copyright Form Submitted Successfully
              </h2>
              <p className="text-muted-foreground mb-6">
                Thank you for submitting your copyright form. Our team will review it and get back to you shortly.
              </p>
              <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-xl border border-blue-100 dark:border-blue-900 mb-6">
                <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Next Step: Final Paper Submission</h3>
                <p className="text-sm text-blue-800 dark:text-blue-400 mb-4">
                  Don't forget to submit your final paper with all corrections within <strong>7 days</strong>.
                </p>
                <Link href="/final-paper-form">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Submit Final Paper Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
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
            Copyright Form
          </h1>
          <p className="text-muted-foreground">
            Scholar India Publishers
          </p>
        </div>

        {statusError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="max-w-md w-full animate-in fade-in zoom-in duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  {statusError.type === 'pending' ? 'Manuscript Status Pending' : 'Manuscript Not Found'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {statusError.message}
                </p>
                <div className="flex gap-3 pt-2">
                  <Button 
                    className="flex-1"
                    onClick={() => setStatusError(null)}
                  >
                    Close
                  </Button>
                  {statusError.type === 'pending' && (
                    <Button 
                      variant="outline"
                      className="flex-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      onClick={() => window.location.href = "/track-manuscript"}
                    >
                      Track Status
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300">Important Instructions</p>
                <ul className="text-sm text-amber-700 dark:text-amber-400 mt-2 space-y-1 list-disc list-inside">
                  <li>Download the copyright form template below</li>
                  <li>Fill it completely, sign it, and scan/photograph it</li>
                  <li>Upload the signed form within <strong>10 days</strong> of receiving acceptance</li>
                  <li>For journal articles, format your paper using the appropriate template before final submission</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download Templates
            </CardTitle>
            <CardDescription>
              Download the copyright form and journal templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <a
                href={copyrightFormTemplate}
                download="Scholar_India_Publishers_Copyright_Form.pdf"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
              >
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Copyright Form</p>
                  <p className="text-xs text-muted-foreground">Download & Sign</p>
                </div>
              </a>
              <a
                href={commerceTemplate}
                download="SJCM_Article_Template.docx"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
              >
                <FileText className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Commerce & Management Template</p>
                  <p className="text-xs text-muted-foreground">For SJCM articles</p>
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
                  <p className="text-xs text-muted-foreground">For SJHSS articles</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Publication Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Publication Type *</Label>
                <Select
                  value={form.watch("publicationType")}
                  onValueChange={(value) => form.setValue("publicationType", value)}
                >
                  <SelectTrigger data-testid="select-publication-type">
                    <SelectValue placeholder="Select publication type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sjcm">Scholar Journal of Commerce and Management</SelectItem>
                    <SelectItem value="sjhss">Scholar Journal of Humanities and Social Sciences</SelectItem>
                    <SelectItem value="book">Book / Book Chapter</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.publicationType && (
                  <p className="text-sm text-red-500">{form.formState.errors.publicationType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manuscriptId">Manuscript ID / Book Reference Number *</Label>
                <div className="flex gap-2">
                  <Input
                    id="manuscriptId"
                    data-testid="input-manuscript-id"
                    placeholder="e.g., MANSJCM251200AB or SIPB2601001"
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
                <Label htmlFor="articleTitle">Title of Article/Paper/Manuscript *</Label>
                <Input
                  id="articleTitle"
                  data-testid="input-article-title"
                  placeholder="Enter the full title"
                  {...form.register("articleTitle")}
                />
                {form.formState.errors.articleTitle && (
                  <p className="text-sm text-red-500">{form.formState.errors.articleTitle.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Corresponding Author Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="correspondingAuthorName">Full Name *</Label>
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
                <Label htmlFor="supportingAuthors">Supporting Author(s) Name(s)</Label>
                <Textarea
                  id="supportingAuthors"
                  data-testid="input-supporting-authors"
                  placeholder="Enter names of co-authors (if any), separated by commas"
                  {...form.register("supportingAuthors")}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="correspondingEmail">Email *</Label>
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
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Declarations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>License Agreement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm space-y-3 max-h-80 overflow-y-auto border">
                <p className="font-semibold">LICENCE AGREEMENT:</p>
                <p>I hereby declare and agree, on behalf of myself and my co-authors (if any), that:</p>
                <div className="space-y-3 text-muted-foreground">
                  <p>[1] The article submitted is an original work and has neither been published in any other peer-reviewed journal nor is under consideration for publication by any other journal. In addition to it, the article does not contravene any existing copyright or any other third party rights.</p>
                  <p>[2] This transfer of copyright gives SCHOLAR INDIA PUBLISHERS the right to develop, promote, distribute, and archive a body of scientific works throughout the world. I certify that the article title mentioned above is already peer reviewed by my friend, colleague or any peer reviewer.</p>
                  <p>[3] The Author hereby grants and assigns to SCHOLAR INDIA PUBLISHERS (Journal/Book) all rights in and to Author’s work in and contributions to the Work. In connection with this assignment, the Author acknowledges that SCHOLAR INDIA PUBLISHERS (Journal/Book) will have the right to print, publish, and create derivative works throughout the world, all rights in and to all revisions or versions or subsequent editions of the Work in all languages and media throughout the world.</p>
                  <p className="pl-4 italic">The author(s), reserve the following rights:</p>
                  <ul className="list-disc list-inside pl-8 space-y-1">
                    <li>All proprietary rights other than copyrights, such as patent rights,</li>
                    <li>The right to use all or part of this article, including tables and figures in future works of their own, provided that the proper acknowledgment is made to the Publisher as copyright holder, and</li>
                    <li>The right to make copies of this article for his/her own use, but not for sale.</li>
                  </ul>
                  <p>[4] The article contains no such material that may be unlawful, infringe any proprietary or personal rights of others (including, without limitation, any copyrights or privacy rights); that the Work is factually accurate and contains no matter libelous or otherwise unlawful; that I/We have substantially participated in the creation of the Work and that it represents my original work adequate for me/us to claim the authorship.</p>
                  <p>[5] I/We certify that I/We have no financial interest in the subject matter of the Work or any affiliation with an organization or entity with a financial interest in the subject matter of the Work, other than as previously disclosed to the Association.</p>
                  <p>[6] If any plagiarism found in my camera-ready article after Publication, I am the solely responsible not SCHOLAR INDIA PUBLISHERS (Journal/Book) or SCHOLAR INDIA PUBLISHERS (Journal/Book) Board members.</p>
                  <p>[7] The article, the final version of which I enclose, is not substantially the same as any that I/we have already published elsewhere.</p>
                  <p>[8] No responsibility is undertaken by SCHOLAR INDIA PUBLISHERS Journal, its staff or members of the editorial board for any injury and/or damage to persons or property as a matter of products liability, negligence or otherwise, or from any use or operation of any methods, products instruction, advertisements or ideas contained in a publication by SCHOLAR INDIA PUBLISHERS (Journal/Book).</p>
                  <p>[9] If any dispute arises, final decision shall take by SCHOLAR INDIA PUBLISHERS (Journal/Book).</p>
                  <p>[10] I, the undersigned corresponding author, also certify that I have the consent of each author to transfer and assign any and all rights, title, and interest, including copyright of the article referred above. I hereby assign and transfer to the SCHOLAR INDIA PUBLISHERS Journal copyright and all rights under it in the event that such work is published by the SCHOLAR INDIA PUBLISHERS Journal. I further confirm that this article has not been published elsewhere, nor is it under consideration by any other publisher.</p>
                  
                  <p className="font-semibold mt-4 text-foreground">COPYRIGHT TRANSFER:</p>
                  <p>Copyright to the above work (including without limitation, the right to publish the work in whole, or in part, in any and all forms) is hereby transferred to SCHOLAR INDIA PUBLISHERS Journal, to ensure widest dissemination and protection against infringement of it. I hereby certify that I am authorized to sign this Copyright Form either in my own right or as an agent of my employer, and have made no changes to this current valid document supplied by SCHOLAR INDIA PUBLISHERS (Journal/Book). I have carefully read, understand and agree with all above written agreement with SCHOLAR INDIA PUBLISHERS Journal.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreementAccepted"
                  checked={form.watch("agreementAccepted")}
                  onCheckedChange={(checked) => form.setValue("agreementAccepted", checked as boolean)}
                />
                <Label htmlFor="agreementAccepted" className="text-sm leading-relaxed">
                  I have read and agree to the License Agreement and Copyright Transfer terms above. I certify that I am authorized to sign this Copyright Form either in my own right or as an agent of my employer. *
                </Label>
              </div>
              {form.formState.errors.agreementAccepted && (
                <p className="text-sm text-red-500">{form.formState.errors.agreementAccepted.message}</p>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Signed Copyright Form
              </CardTitle>
              <CardDescription>
                Download the copyright form template above, fill it, sign it, and upload the scanned/photographed copy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
                      if (allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024) {
                        setCopyrightFile(file);
                      } else {
                        toast({
                          title: "Invalid file",
                          description: "Please upload a PDF, JPG, or PNG file smaller than 10 MB",
                          variant: "destructive",
                        });
                        e.target.value = "";
                        setCopyrightFile(null);
                      }
                    } else {
                      setCopyrightFile(null);
                    }
                  }}
                  className="hidden"
                  id="copyright-file"
                  data-testid="input-copyright-file"
                />
                <label htmlFor="copyright-file" className="cursor-pointer">
                  <Upload className="w-10 h-10 mx-auto text-blue-500 mb-3" />
                  <p className="text-sm font-medium">
                    {copyrightFile ? copyrightFile.name : "Click to upload signed copyright form"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, JPG, PNG (Max 10MB)
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
              data-testid="button-submit-copyright"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Copyright Form"
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
