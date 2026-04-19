import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, UserCheck, CheckCircle, AlertCircle, Upload, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

// Validation functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const isValidMobile = (mobile: string): boolean => {
  const digitsOnly = mobile.replace(/[\s\-\+]/g, '');
  return /^\d{10}$/.test(digitsOnly) || /^91\d{10}$/.test(digitsOnly);
};

const isValidName = (name: string): boolean => {
  return name.trim().length >= 2;
};

const isValidInstitution = (inst: string): boolean => {
  return inst.trim().length >= 3;
};

const isValidDesignation = (designation: string): boolean => {
  return designation.trim().length > 0;
};

const isValidAreaOfInterest = (area: string): boolean => {
  return area.trim().length >= 3;
};

const isValidState = (state: string): boolean => {
  return state.trim().length >= 2;
};

const isValidDistrict = (district: string): boolean => {
  return district.trim().length >= 2;
};

const isValidPinNumber = (pin: string): boolean => {
  return /^\d{5,6}$/.test(pin.replace(/\s/g, ''));
};

const isValidNationality = (nationality: string): boolean => {
  return nationality.trim().length >= 2;
};

const isValidOrcid = (orcid: string): boolean => {
  if (!orcid) return true; // Optional field
  return /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/.test(orcid) || orcid.length >= 15;
};

const isValidGoogleScholar = (url: string): boolean => {
  if (!url) return true; // Optional field
  return url.includes('scholar.google') || /^https?:\/\//.test(url);
};

interface ReviewerApplicationFormProps {
  journalTitle?: string;
  onCancel?: () => void;
}

export default function ReviewerApplicationForm({ journalTitle, onCancel }: ReviewerApplicationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "",
    areaOfInterest: "",
    journal: journalTitle || "",
    designation: "",
    orcid: "",
    googleScholar: "",
    institution: "",
    state: "",
    district: "",
    pinNumber: "",
    nationality: "",
    messageToEditor: "",
    institutionalProfilePage: "",
    profilePdf: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [reviewerId, setReviewerId] = useState<string | null>(null);
  const { toast } = useToast();

  const [showEditorialDialog, setShowEditorialDialog] = useState(false);

  const roles = ["Reviewer", "Editorial Board Member"];

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
    if (value === "Editorial Board Member") {
      setShowEditorialDialog(true);
    }
  };

  const [journals, setJournals] = useState<string[]>([]);
  
  useEffect(() => {
    async function fetchJournals() {
      const { data, error } = await supabase.from('journals').select('title');
      if (data && !error && data.length > 0) {
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
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Lecturer",
    "Research Scholar",
    "Industry Expert",
    "Post-doctoral Fellow",
    "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!isValidName(formData.name)) {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid name (at least 2 characters).",
        variant: "destructive"
      });
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address (e.g., name@domain.com).",
        variant: "destructive"
      });
      return;
    }

    if (!isValidMobile(formData.mobile)) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.role) {
      toast({
        title: "Role Required",
        description: "Please select a role (Reviewer or Editorial Board Member).",
        variant: "destructive"
      });
      return;
    }

    // Removed API check, handled below by catching unique constraint errors

    if (!formData.designation) {
      toast({
        title: "Designation Required",
        description: "Please select your designation.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.profilePdf) {
      toast({
        title: "Profile PDF Required",
        description: "Please upload your recent profile as PDF.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.journal) {
      toast({
        title: "Journal Required",
        description: "Please select a journal.",
        variant: "destructive"
      });
      return;
    }

    if (!isValidInstitution(formData.institution)) {
      toast({
        title: "Invalid Institution",
        description: "Please enter a valid institution name.",
        variant: "destructive"
      });
      return;
    }

    if (!isValidDesignation(formData.designation)) {
      toast({
        title: "Designation Required",
        description: "Please select your designation.",
        variant: "destructive"
      });
      return;
    }

    if (!isValidAreaOfInterest(formData.areaOfInterest)) {
      toast({
        title: "Area of Interest Required",
        description: "Please enter your area of interest (minimum 3 characters).",
        variant: "destructive"
      });
      return;
    }

    if (!isValidState(formData.state)) {
      toast({
        title: "State Required",
        description: "Please enter your state (minimum 2 characters).",
        variant: "destructive"
      });
      return;
    }

    if (!isValidDistrict(formData.district)) {
      toast({
        title: "District Required",
        description: "Please enter your district (minimum 2 characters).",
        variant: "destructive"
      });
      return;
    }

    if (!isValidPinNumber(formData.pinNumber)) {
      toast({
        title: "Invalid Pin Number",
        description: "Please enter a valid 5 or 6-digit pin number.",
        variant: "destructive"
      });
      return;
    }

    if (!isValidNationality(formData.nationality)) {
      toast({
        title: "Nationality Required",
        description: "Please enter your nationality (minimum 2 characters).",
        variant: "destructive"
      });
      return;
    }

    // ORCID and Google Scholar are optional - only validate if provided
    if (formData.orcid && !isValidOrcid(formData.orcid)) {
      toast({
        title: "Invalid ORCID",
        description: "Please enter a valid ORCID format (e.g., XXXX-XXXX-XXXX-XXXX) or leave empty.",
        variant: "destructive"
      });
      return;
    }

    if (formData.googleScholar && !isValidGoogleScholar(formData.googleScholar)) {
      toast({
        title: "Invalid Google Scholar Profile",
        description: "Please enter a valid URL (e.g., https://scholar.google.com/...) or leave empty.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.institutionalProfilePage || formData.institutionalProfilePage.trim().length < 5) {
      toast({
        title: "Institutional Profile Page Required",
        description: "Please provide your college/university website profile page URL.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Generate Smart Custom ID
      const rolePrefix = formData.role === "Editorial Board Member" ? "EDT" : "REV";
      const targetJournal = formData.journal || "";
      const getJournalCode = (name: string) => {
        if (!name) return "SJ";
        if (name.includes("Commerce")) return "SJCM";
        if (name.includes("Humanities")) return "SJHSS";
        if (name.toLowerCase() === 'test') return 'StSS';
        
        const ignored = ["of", "and", "the", "in", "a", "an", "for", "with"];
        return name
          .split(/\s+/)
          .filter(w => w.length > 0 && !ignored.includes(w.toLowerCase()))
          .map(w => w[0].toUpperCase())
          .join('') || "SJ";
      };

      const journalCode = getJournalCode(targetJournal);
      const year = new Date().getFullYear().toString().slice(-2);
      const randomChars = Array.from({ length: 6 }, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.floor(Math.random() * 36))
      ).join('');
      
      const uniqueId = `${rolePrefix}${journalCode}${year}${randomChars}`;
      const fileExtension = formData.profilePdf?.name.split('.').pop() || 'pdf';
      const s3FileName = `reviewers/${uniqueId}.${fileExtension}`;

      // 2. Get Pre-signed URL from Edge Function
      const { data: presignData, error: presignError } = await supabase.functions.invoke('s3-presign', {
        body: {
          fileName: s3FileName,
          fileType: formData.profilePdf.type || 'application/pdf',
        }
      });

      if (presignError) {
        throw new Error("Edge function failed to generate secure URL.");
      }

      const { signedUrl, publicUrl: s3Url } = presignData;

      // 3. Upload actual PDF directly to AWS S3 using the signed URL
      const arrayBuffer = await formData.profilePdf.arrayBuffer();
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": formData.profilePdf.type || 'application/pdf',
        },
        body: new Uint8Array(arrayBuffer),
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload the document to S3 storage.");
      }

      // Split name safely
      const nameParts = formData.name.trim().split(" ");
      const firstName = nameParts.length > 0 ? nameParts[0] : "";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      // 4. Submit to Supabase Database
      const { data, error } = await supabase
        .from('reviewers')
        .insert([{
          id: uniqueId,
          first_name: firstName,
          last_name: lastName,
          email: formData.email,
          mobile: formData.mobile,
          role: formData.role,
          designation: formData.designation,
          area_of_interest: formData.areaOfInterest,
          journal: formData.journal,
          orcid: formData.orcid,
          google_scholar: formData.googleScholar,
          institution: formData.institution,
          state: formData.state,
          district: formData.district,
          pin_number: formData.pinNumber,
          nationality: formData.nationality,
          message_to_editor: formData.messageToEditor,
          profile_pdf_link: s3Url,
          status: 'pending'
        }])
        .select();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation Code
          throw new Error("You have already applied using this email address.");
        }
        throw new Error(error.message);
      }

      setReviewerId(uniqueId);
      setSubmissionSuccess(true);
      
      toast({
        title: "Application submitted successfully!",
        description: `Your ID is: ${uniqueId}. Please save this for tracking.`,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        mobile: "",
        role: "",
        areaOfInterest: "",
        journal: "",
        designation: "",
        orcid: "",
        googleScholar: "",
        institution: "",
        state: "",
        district: "",
        pinNumber: "",
        nationality: "",
        messageToEditor: "",
        institutionalProfilePage: "",
        profilePdf: null
      });
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error("Application error:", error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Dialog open={showEditorialDialog} onOpenChange={setShowEditorialDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Eligibility Criteria
            </DialogTitle>
            <DialogDescription className="text-gray-700 dark:text-gray-300 pt-4">
              Please ensure you meet the following eligibility criteria for Editorial Board Member:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Valid institutional mail ID</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Doctorate holder (PhD)</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Good number of publications with citations</span>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-md border border-blue-100 dark:border-blue-900">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              If you do not meet these criteria, please apply for the <strong>Reviewer</strong> role instead.
            </p>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              onClick={() => setShowEditorialDialog(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 max-w-4xl mx-auto overflow-hidden">
      <CardHeader className="bg-[#213361] text-white">
        <CardTitle className="text-2xl font-serif flex items-center text-white">
          <UserCheck className="h-6 w-6 mr-2" />
          Join as Editor/Reviewer
        </CardTitle>
        <p className="text-sm text-blue-100">
          Join our distinguished panel of peer reviewers and editorial board members to contribute to advancing academic research
        </p>
      </CardHeader>
      <CardContent>
        {submissionSuccess && reviewerId && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200 font-semibold text-lg">✓ Application Submitted Successfully!</p>
            <p className="text-green-700 dark:text-green-300 mt-2">Your Reviewer ID: <span className="font-mono font-bold text-lg">{reviewerId}</span></p>
            <p className="text-green-700 dark:text-green-300 text-sm mt-2">Please save this ID for tracking your application status and future communications.</p>
            <div className="mt-4 pt-3 border-t border-green-200 dark:border-green-700">
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                A confirmation email has been sent to your email address. Our editorial team will review your application and contact you soon.
              </p>
              <Link href="/reviewer-search">
                <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 text-white" data-testid="button-track-reviewer-status">
                  Track Your Application Status
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6" style={{ display: submissionSuccess ? 'none' : 'block' }}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-blue-600 dark:text-blue-400" htmlFor="name">Full Name *</Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  data-testid="input-reviewer-name"
                  placeholder="Enter your full name"
                  className={`text-foreground ${formData.name && isValidName(formData.name) ? "border-green-500 pr-10" : formData.name ? "border-red-400" : ""}`}
                />
                {formData.name && isValidName(formData.name) && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
                {formData.name && !isValidName(formData.name) && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-blue-600 dark:text-blue-400" htmlFor="email">Institutional Email ID *</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  data-testid="input-reviewer-email"
                  placeholder="your.institutional.email@domain.edu"
                  className={`text-foreground ${formData.email && isValidEmail(formData.email) ? "border-green-500 pr-10" : formData.email ? "border-red-400" : ""}`}
                />
                {formData.email && isValidEmail(formData.email) && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
                {formData.email && !isValidEmail(formData.email) && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                )}
              </div>
              {formData.email && !isValidEmail(formData.email) && (
                <p className="text-xs text-red-500">Please enter a valid email (e.g., name@domain.com)</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-blue-600 dark:text-blue-400" htmlFor="mobile">Mobile Number *</Label>
              <div className="relative">
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                  required
                  data-testid="input-reviewer-mobile"
                  placeholder="9876543210"
                  className={`text-foreground ${formData.mobile && isValidMobile(formData.mobile) ? "border-green-500 pr-10" : formData.mobile ? "border-red-400" : ""}`}
                />
                {formData.mobile && isValidMobile(formData.mobile) && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
                {formData.mobile && !isValidMobile(formData.mobile) && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                )}
              </div>
              {formData.mobile && !isValidMobile(formData.mobile) && (
                <p className="text-xs text-red-500">Please enter a valid 10-digit mobile number</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-blue-600 dark:text-blue-400" htmlFor="role">Role *</Label>
              <div className="relative">
                <Select 
                  value={formData.role} 
                  onValueChange={handleRoleChange}
                  required
                >
                  <SelectTrigger data-testid="select-reviewer-role" className={formData.role ? "pr-10" : ""}>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.role && (
                  <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 pointer-events-none" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-blue-600 dark:text-blue-400" htmlFor="designation">Designation *</Label>
              <div className="relative">
                <Select 
                  value={formData.designation} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, designation: value }))}
                  required
                >
                  <SelectTrigger data-testid="select-reviewer-designation" className={formData.designation ? "pr-10" : ""}>
                    <SelectValue placeholder="Select your designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {designations.map((designation) => (
                      <SelectItem key={designation} value={designation}>
                        {designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.designation && (
                  <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 pointer-events-none" />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="areaOfInterest">Area of Interest *</Label>
            <div className="relative">
              <Textarea
                id="areaOfInterest"
                value={formData.areaOfInterest}
                onChange={(e) => setFormData(prev => ({ ...prev, areaOfInterest: e.target.value }))}
                required
                data-testid="textarea-area-interest"
                placeholder="Describe your research areas and expertise (e.g., Financial Management, Digital Marketing, Organizational Behavior...)"
                rows={3}
                className={`text-foreground ${formData.areaOfInterest && isValidAreaOfInterest(formData.areaOfInterest) ? "border-green-500 pr-10" : formData.areaOfInterest ? "border-red-400" : ""}`}
              />
            </div>
            {formData.areaOfInterest && !isValidAreaOfInterest(formData.areaOfInterest) && (
              <p className="text-xs text-red-500">Please describe your area of interest (minimum 3 characters)</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-blue-600 dark:text-blue-400" htmlFor="journal">Preferred Journal *</Label>
              <div className="relative">
                <Select 
                  value={formData.journal} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, journal: value }))}
                  required
                >
                  <SelectTrigger data-testid="select-reviewer-journal" className={formData.journal ? "pr-10" : ""}>
                    <SelectValue placeholder="Select preferred journal" />
                  </SelectTrigger>
                  <SelectContent>
                    {journals.map((journal) => (
                      <SelectItem key={journal} value={journal}>
                        {journal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.journal && (
                  <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 pointer-events-none" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-blue-600 dark:text-blue-400" htmlFor="orcid">ORCID *</Label>
              <div className="relative">
                <Input
                  id="orcid"
                  type="text"
                  value={formData.orcid}
                  onChange={(e) => setFormData(prev => ({ ...prev, orcid: e.target.value }))}
                  required
                  data-testid="input-reviewer-orcid"
                  placeholder="https://orcid.org/0000-0000-0000-0000"
                  className={`text-foreground ${formData.orcid && isValidOrcid(formData.orcid) ? "border-green-500 pr-10" : formData.orcid ? "border-red-400" : ""}`}
                />
                {formData.orcid && isValidOrcid(formData.orcid) && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
                {formData.orcid && !isValidOrcid(formData.orcid) && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                )}
              </div>
              {formData.orcid && !isValidOrcid(formData.orcid) && (
                <p className="text-xs text-red-500">Please enter a valid ORCID (e.g., 0000-0000-0000-0000)</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="googleScholar">Google Scholar Page Link *</Label>
            <div className="relative">
              <Input
                id="googleScholar"
                type="url"
                value={formData.googleScholar}
                onChange={(e) => setFormData(prev => ({ ...prev, googleScholar: e.target.value }))}
                required
                data-testid="input-reviewer-google-scholar"
                placeholder="https://scholar.google.com/citations?user=..."
                className={`text-foreground ${formData.googleScholar && isValidGoogleScholar(formData.googleScholar) ? "border-green-500 pr-10" : formData.googleScholar ? "border-red-400" : ""}`}
              />
              {formData.googleScholar && isValidGoogleScholar(formData.googleScholar) && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
              {formData.googleScholar && !isValidGoogleScholar(formData.googleScholar) && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
              )}
            </div>
            {formData.googleScholar && !isValidGoogleScholar(formData.googleScholar) && (
              <p className="text-xs text-red-500">Please enter a valid URL (e.g., https://scholar.google.com/citations?user=...)</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="institutionalProfilePage">Institutional/College Website Profile Page *</Label>
            <div className="relative">
              <Input
                id="institutionalProfilePage"
                type="url"
                value={formData.institutionalProfilePage}
                onChange={(e) => setFormData(prev => ({ ...prev, institutionalProfilePage: e.target.value }))}
                required
                data-testid="input-reviewer-institutional-profile"
                placeholder="https://www.yourcollege.edu/faculty/your-name"
                className={`text-foreground ${formData.institutionalProfilePage && formData.institutionalProfilePage.length >= 5 ? "border-green-500 pr-10" : formData.institutionalProfilePage ? "border-red-400" : ""}`}
              />
              {formData.institutionalProfilePage && formData.institutionalProfilePage.length >= 5 && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
              {formData.institutionalProfilePage && formData.institutionalProfilePage.length < 5 && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Provide the URL of your profile page on your college/university website
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="institution">Current Institution *</Label>
            <div className="relative">
              <Input
                id="institution"
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                required
                data-testid="input-reviewer-institution"
                placeholder="Name of your current institution/organization"
                className={`text-foreground ${formData.institution && isValidInstitution(formData.institution) ? "border-green-500 pr-10" : formData.institution ? "border-red-400" : ""}`}
              />
              {formData.institution && isValidInstitution(formData.institution) && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-blue-600 dark:text-blue-400" htmlFor="state">State *</Label>
              <div className="relative">
                <Input
                  id="state"
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  required
                  data-testid="input-reviewer-state"
                  placeholder="Enter your state"
                  className={`text-foreground ${formData.state && isValidState(formData.state) ? "border-green-500 pr-10" : formData.state ? "border-red-400" : ""}`}
                />
                {formData.state && isValidState(formData.state) && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
                {formData.state && !isValidState(formData.state) && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-blue-600 dark:text-blue-400" htmlFor="district">District *</Label>
              <div className="relative">
                <Input
                  id="district"
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  required
                  data-testid="input-reviewer-district"
                  placeholder="Enter your district"
                  className={`text-foreground ${formData.district && isValidDistrict(formData.district) ? "border-green-500 pr-10" : formData.district ? "border-red-400" : ""}`}
                />
                {formData.district && isValidDistrict(formData.district) && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
                {formData.district && !isValidDistrict(formData.district) && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-blue-600 dark:text-blue-400" htmlFor="pinNumber">PIN Number *</Label>
              <div className="relative">
                <Input
                  id="pinNumber"
                  type="text"
                  value={formData.pinNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, pinNumber: e.target.value }))}
                  required
                  data-testid="input-reviewer-pin"
                  placeholder="6-digit PIN code"
                  maxLength={6}
                  className={`text-foreground ${formData.pinNumber && isValidPinNumber(formData.pinNumber) ? "border-green-500 pr-10" : formData.pinNumber ? "border-red-400" : ""}`}
                />
                {formData.pinNumber && isValidPinNumber(formData.pinNumber) && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
                {formData.pinNumber && !isValidPinNumber(formData.pinNumber) && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                )}
              </div>
              {formData.pinNumber && !isValidPinNumber(formData.pinNumber) && (
                <p className="text-xs text-red-500">Please enter a valid 5-6 digit PIN number</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="nationality">Nationality *</Label>
            <div className="relative">
              <Select 
                value={formData.nationality} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, nationality: value }))}
                required
              >
                <SelectTrigger data-testid="select-reviewer-nationality" className={formData.nationality ? "pr-10" : ""}>
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="non-indian">Non-Indian</SelectItem>
                </SelectContent>
              </Select>
              {formData.nationality && (
                <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 pointer-events-none" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="messageToEditor">Message to Editor</Label>
            <Textarea
              id="messageToEditor"
              value={formData.messageToEditor}
              onChange={(e) => setFormData(prev => ({ ...prev, messageToEditor: e.target.value }))}
              data-testid="textarea-message-editor"
              placeholder="Share any additional information or message for the editorial team (optional)"
              rows={4}
              className="text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-blue-600 dark:text-blue-400" htmlFor="profilePdf">Upload Recent Profile (PDF) *</Label>
            <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer"
              onClick={() => document.getElementById('profilePdfInput')?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                PDF files only (Max 10 MB)
              </p>
              <input
                id="profilePdfInput"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.type === "application/pdf" && file.size <= 10 * 1024 * 1024) {
                      setFormData(prev => ({ ...prev, profilePdf: file }));
                    } else {
                      toast({
                        title: "Invalid file",
                        description: "Please upload a PDF file smaller than 10 MB",
                        variant: "destructive"
                      });
                    }
                  }
                }}
              />
            </div>
            {formData.profilePdf && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-blue-900 dark:text-blue-300 truncate max-w-[200px]">
                  {formData.profilePdf.name}
                </span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto h-7 px-2 text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData(prev => ({ ...prev, profilePdf: null }));
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
            data-testid="button-submit-reviewer-application"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="mr-2"
              >
                <Send className="w-5 h-5" />
              </motion.div>
            ) : (
              <Send className="w-5 h-5 mr-2" />
            )}
            {isSubmitting ? "Submitting Application..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
    </div>
  );
}
