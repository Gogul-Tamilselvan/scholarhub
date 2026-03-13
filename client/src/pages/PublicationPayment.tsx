import { useState } from "react";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, CheckCircle2, Lock, Zap, Copy, Check, Upload, X, Search, Loader2, AlertCircle, QrCode } from "lucide-react";
import upiQrPath from "@assets/IMG-20260120-WA0001_1768957901426.jpg";

export default function PublicationPayment() {
  const [step, setStep] = useState<"verify" | "cart" | "checkout" | "payment" | "success">("verify");
  const [manuscriptId, setManuscriptIdInput] = useState("");
  const [verifyingManuscript, setVerifyingManuscript] = useState(false);
  const [manuscriptData, setManuscriptData] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    manuscriptTitle: "",
    email: "",
    affiliation: "",
    publicationType: "",
    numberOfAuthors: "1",
    authorType: "",
    modeOfPayment: "",
    dateOfPayment: "",
    transactionNumber: "",
  });
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [verificationError, setVerificationError] = useState<string>("");
  const [isUnderReview, setIsUnderReview] = useState(false);
  const { toast } = useToast();

  const handleVerifyManuscript = async () => {
    if (!manuscriptId.trim()) {
      toast({ title: 'Error', description: 'Please enter a Manuscript ID', variant: 'destructive' });
      return;
    }

    setVerifyingManuscript(true);
    setVerificationError("");
    setIsUnderReview(false);
    try {
      const response = await fetch('/api/verify-manuscript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manuscriptId: manuscriptId.trim() })
      });

      const result = await response.json();

      if (result.success && result.manuscript) {
        setManuscriptData(result.manuscript);
        setFormData(prev => ({
          ...prev,
          manuscriptTitle: result.manuscript.title
        }));
        setStep("cart");
        toast({ title: 'Success!', description: 'Manuscript verified. Please fill in your details.' });
      } else {
        const messageText = result.message || 'Verification failed. Please try again.';
        setVerificationError(messageText);
        
        if (messageText.toLowerCase().includes('under review')) {
          setIsUnderReview(true);
        }
      }
    } catch (error) {
      setVerificationError('Failed to verify manuscript. Please try again.');
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' });
    } finally {
      setVerifyingManuscript(false);
    }
  };

  // Calculate APC
  const calculateAPC = () => {
    if (formData.authorType === "indian") {
      return { base: 1180, gst: 0, total: 1180, currency: "₹", display: "₹1,180" };
    } else if (formData.authorType === "non-indian") {
      return { base: 50, gst: 0, total: 50, currency: "$", display: "US $50" };
    }
    return { base: 0, gst: 0, total: 0, currency: "", display: "-" };
  };

  const apc = calculateAPC();
  const isReadyForCheckout = formData.firstName && formData.lastName && formData.manuscriptTitle && formData.email && 
    formData.affiliation && formData.publicationType && formData.authorType && apc.total > 0;

  const handleCopyUPI = async () => {
    const upiId = import.meta.env.VITE_PAYMENT_UPI_ID || "PPQR01.HNZMKU@iob";
    await navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast({ title: "UPI ID Copied!", description: "Ready to pay" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive"
        });
        return;
      }
      setPaymentFile(file);
      setFileName(file.name);
    }
  };

  const handlePayment = async () => {
    // Validate all required fields
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.affiliation || !formData.publicationType || !formData.numberOfAuthors || 
        !formData.authorType || !formData.modeOfPayment || !formData.dateOfPayment || 
        !formData.transactionNumber || !apc.total) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields including mode of payment, date, and transaction number.",
        variant: "destructive"
      });
      return;
    }

    if (!paymentFile) {
      toast({
        title: "Payment Screenshot Required",
        description: "Please upload your payment screenshot before confirming.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName.trim());
      formDataToSend.append('lastName', formData.lastName.trim());
      formDataToSend.append('manuscriptTitle', formData.manuscriptTitle.trim());
      formDataToSend.append('manuscriptId', manuscriptId.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('affiliation', formData.affiliation.trim());
      formDataToSend.append('publicationType', formData.publicationType);
      formDataToSend.append('numberOfAuthors', formData.numberOfAuthors);
      formDataToSend.append('authorType', formData.authorType);
      formDataToSend.append('modeOfPayment', formData.modeOfPayment);
      formDataToSend.append('dateOfPayment', formData.dateOfPayment);
      formDataToSend.append('transactionNumber', formData.transactionNumber);
      formDataToSend.append('amount', apc.total.toString());
      formDataToSend.append('currency', apc.currency);
      formDataToSend.append('paymentScreenshot', paymentFile);

      console.log('Sending payment data with file:', fileName);

      const response = await fetch('/api/process-payment', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('Payment response:', result);

      if (response.ok && result.success) {
        setStep("success");
        toast({ title: "Payment Received!", description: "Confirmation email has been sent" });
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Publish Your Research - Simple Payment | Scholar India Publishers"
        description="Simple, secure payment collection for research paper publication. Indian authors: ₹1,180. International: US $50. DOI included."
        keywords="research publication, APC payment, journal publication, Scholar India Publishers"
      />
      <Header />

      {/* Header */}
      <div className="bg-[#213361] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Publish Your Research</h1>
          </div>
          <p className="text-blue-100 text-lg">Complete your publication in just a few steps</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-4 overflow-x-auto">
            <div className={`flex flex-col items-center gap-2 ${step === "verify" || step === "cart" || step === "checkout" || step === "payment" || step === "success" ? "text-[#213361] dark:text-blue-300" : "text-gray-400"} whitespace-nowrap`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === "verify" || step === "cart" || step === "checkout" || step === "payment" || step === "success" ? "bg-[#213361] text-white" : "bg-gray-200 text-gray-600"}`}>1</div>
              <span className="text-sm font-medium">Verify ID</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className={`flex flex-col items-center gap-2 ${step === "cart" || step === "checkout" || step === "payment" || step === "success" ? "text-[#213361] dark:text-blue-300" : "text-gray-400"} whitespace-nowrap`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === "cart" || step === "checkout" || step === "payment" || step === "success" ? "bg-[#213361] text-white" : "bg-gray-200 text-gray-600"}`}>2</div>
              <span className="text-sm font-medium">Your Details</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className={`flex flex-col items-center gap-2 ${step === "checkout" || step === "payment" || step === "success" ? "text-[#213361] dark:text-blue-300" : "text-gray-400"} whitespace-nowrap`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === "checkout" || step === "payment" || step === "success" ? "bg-[#213361] text-white" : "bg-gray-200 text-gray-600"}`}>3</div>
              <span className="text-sm font-medium">Review</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className={`flex flex-col items-center gap-2 ${step === "payment" || step === "success" ? "text-[#213361] dark:text-blue-300" : "text-gray-400"} whitespace-nowrap`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === "payment" || step === "success" ? "bg-[#213361] text-white" : "bg-gray-200 text-gray-600"}`}>4</div>
              <span className="text-sm font-medium">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {step === "verify" && (
          <div className="mb-12 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                <CardHeader className="bg-[#213361] text-white">
                  <CardTitle className="text-2xl text-white">Indian Authors</CardTitle>
                  <CardDescription className="text-blue-100">Domestic Publication Fee</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="text-4xl font-bold text-[#213361] dark:text-blue-300">₹1,180</div>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Full Article Publication
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Global Indexing
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background overflow-hidden">
                <CardHeader className="bg-[#213361] text-white">
                  <CardTitle className="text-2xl text-white">Foreign Authors</CardTitle>
                  <CardDescription className="text-blue-100">International Publication Fee</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">US $50</div>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Crossref DOI Assignment
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Perpetual Open Access
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="border-blue-100 dark:border-blue-900 shadow-sm overflow-hidden">
              <CardHeader className="bg-[#213361] text-white">
                <CardTitle className="text-xl text-white">Bank Account Details</CardTitle>
                <CardDescription className="text-blue-100">Direct Bank Transfer (NEFT/IMPS/RTGS)</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Bank Name:</span>
                      <span className="text-gray-700 dark:text-gray-300">Indian Overseas Bank</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Account Name:</span>
                      <span className="text-gray-700 dark:text-gray-300">Scholar India Publishers</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Account Type:</span>
                      <span className="text-gray-700 dark:text-gray-300">Current Account</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Account Number:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-mono">171202000000231</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">IFSC Code:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-mono">IOBA0001712</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Branch:</span>
                      <span className="text-gray-700 dark:text-gray-300">Loyola College</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                    <img src={upiQrPath} alt="UPI QR Code" className="w-32 h-32 object-contain" />
                    <p className="text-[10px] text-center mt-1 font-bold text-[#213361]">Scan & Pay</p>
                  </div>
                  <div className="flex flex-col justify-center space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Please make the payment using the details above or scan the QR code and save the transaction screenshot. You will need to upload it in the next step to verify your payment.
                    </p>
                    <div className="flex items-center gap-2 text-[#213361] dark:text-blue-300">
                      <Lock className="w-4 h-4" />
                      <span className="text-xs font-medium">Secure Payment Options</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(step as string) !== "success" && (
              <Card className="border-blue-100 dark:border-blue-900 shadow-sm overflow-hidden">
                <CardHeader className="bg-[#213361] text-white">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-yellow-400" />
                    Quick Scan & Pay
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="bg-white p-3 rounded-xl shadow-md border border-blue-100">
                      <img src={upiQrPath} alt="UPI QR Code" className="w-48 h-40 object-contain mx-auto" />
                      <p className="text-[10px] mt-1 font-bold text-[#213361] uppercase">Scholar India Publishers</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Scan this QR code using any UPI app (GPay, PhonePe, Paytm) to make your payment instantly.</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={handleCopyUPI}
                      >
                        {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        Copy UPI ID
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-blue-100 dark:border-blue-900 shadow-sm overflow-hidden">
              <CardHeader className="bg-[#213361] text-white">
                <CardTitle className="text-xl text-white">Why Do We Charge Article Processing Charges?</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  Like other reputed international journals, Scholar India Publishers charges Article Processing Charges (APC) to maintain the highest standards of academic publishing. Since we provide unlimited free access to all our published research (Open Access), we do not charge readers or institutions for subscriptions.
                </p>
                <div className="grid md:grid-cols-2 gap-8 mt-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">APC Includes:</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center gap-2">
                        <span className="text-[#213361] dark:text-blue-300 font-bold">✓</span> Crossref DOI
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#213361] dark:text-blue-300 font-bold">✓</span> Peer Review
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#213361] dark:text-blue-300 font-bold">✓</span> Professional Editing
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#213361] dark:text-blue-300 font-bold">✓</span> Open Access
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#213361] dark:text-blue-300 font-bold">✓</span> Academic Indexing
                      </li>
                    </ul>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Technical Infrastructure</h4>
                      <p className="text-xs text-gray-500">Supports permanent hosting, Crossref DOI registration, XML conversion, and archival in global databases.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Global Visibility</h4>
                      <p className="text-xs text-gray-500">Ensures your research is discoverable through Google Scholar, ResearchGate, and major indexing services.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "verify" && (
              <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg overflow-hidden">
                <CardHeader className="bg-[#213361] text-white">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Search className="w-5 h-5 text-yellow-400" />
                    Verify Your Manuscript & Submit Payment Receipt
                  </CardTitle>
                  <CardDescription className="text-blue-100">Enter your manuscript ID to get started</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        Only manuscripts with <strong>"Accepted"</strong> status can proceed to payment. Please enter your manuscript ID to verify its status.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manuscriptId">Manuscript ID *</Label>
                      <Input
                        id="manuscriptId"
                        data-testid="input-manuscript-id"
                        placeholder="e.g., MS-2024-001"
                        value={manuscriptId}
                        onChange={(e) => setManuscriptIdInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !verifyingManuscript && handleVerifyManuscript()}
                      />
                    </div>

                    <Button 
                      onClick={handleVerifyManuscript}
                      disabled={verifyingManuscript || !manuscriptId.trim()}
                      className="w-full bg-[#213361] hover:bg-[#2a4078] h-12 text-lg"
                      data-testid="button-verify-manuscript"
                    >
                      {verifyingManuscript ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Verify Manuscript
                        </>
                      )}
                    </Button>

                    {verificationError && isUnderReview && (
                      <div className="bg-[#213361]/5 dark:bg-[#213361]/10 border border-[#213361]/20 dark:border-[#213361]/30 p-6 rounded-lg">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="w-6 h-6 text-[#213361] dark:text-blue-300" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Manuscript Under Review</h3>
                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                              {verificationError}
                            </p>
                            <p className="text-xs text-gray-700 dark:text-gray-300 mt-3 font-medium">
                              We'll notify you via email once the review is complete. Thank you for your patience!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {verificationError && !isUnderReview && (
                      <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-700 p-4 rounded-lg">
                        <div className="flex gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-800 dark:text-red-200">
                            {verificationError.replace('editor@scholarindiapub.com', 'editor@scholarindiapub.com')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "cart" && (
              <>
                {/* Manuscript Details Card */}
                {manuscriptData && (
                  <Card className="mb-8 border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
                    <CardHeader>
                      <CardTitle className="text-green-900 dark:text-green-300 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Manuscript Verified
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-green-700 dark:text-green-400">Manuscript ID</p>
                        <p className="font-semibold text-green-900 dark:text-green-300">{manuscriptData.manuscriptId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-700 dark:text-green-400">Title</p>
                        <p className="font-semibold text-green-900 dark:text-green-300">{manuscriptData.title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-700 dark:text-green-400">First Author</p>
                        <p className="font-semibold text-green-900 dark:text-green-300">{manuscriptData.author}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Why Do We Charge APC Section */}
                <Card className="mb-8 border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground">Why Do We Charge Article Processing Charges?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Like other reputed international journals, Scholar India Publishers charges Article Processing Charges (APC) to maintain the highest standards of academic publishing and ensure open access to quality research.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-[#213361]/10 dark:bg-[#213361]/30">
                            <span className="text-[#213361] dark:text-blue-300 text-sm font-semibold">✓</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">Rigorous Peer Review</p>
                          <p className="text-xs text-muted-foreground">Double-blind review by subject experts ensuring research quality</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-[#213361]/10 dark:bg-[#213361]/30">
                            <span className="text-[#213361] dark:text-blue-300 text-sm font-semibold">✓</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">Global Indexing</p>
                          <p className="text-xs text-muted-foreground">Listed in Crossref, Google Scholar, and major academic databases</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-[#213361]/10 dark:bg-[#213361]/30">
                            <span className="text-[#213361] dark:text-blue-300 text-sm font-semibold">✓</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">Professional Editing</p>
                          <p className="text-xs text-muted-foreground">Language polishing and formatting to international standards</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-[#213361]/10 dark:bg-[#213361]/30">
                            <span className="text-[#213361] dark:text-blue-300 text-sm font-semibold">✓</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">DOI & Perpetual Access</p>
                          <p className="text-xs text-muted-foreground">Permanent unique identifier and unlimited free access for all readers</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-[#213361]/10 dark:bg-[#213361]/30">
                            <span className="text-[#213361] dark:text-blue-300 text-sm font-semibold">✓</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">Plagiarism Detection</p>
                          <p className="text-xs text-muted-foreground">Advanced screening to ensure research integrity and originality</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-[#213361]/10 dark:bg-[#213361]/30">
                            <span className="text-[#213361] dark:text-blue-300 text-sm font-semibold">✓</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">Certificate & Badge</p>
                          <p className="text-xs text-muted-foreground">Digital certificate of publication and shareable achievement badge</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Author Information Form */}
                <Card>
                  <CardHeader className="bg-[#213361] text-white">
                    <CardTitle className="text-white">Author Information</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          data-testid="input-first-name"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          data-testid="input-last-name"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manuscriptTitle">Manuscript Title *</Label>
                      <Input
                        id="manuscriptTitle"
                        data-testid="input-manuscript-title"
                        placeholder="Enter your research paper title"
                        value={formData.manuscriptTitle}
                        onChange={(e) => setFormData({...formData, manuscriptTitle: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        data-testid="input-email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="affiliation">Affiliation / Institution *</Label>
                      <Input
                        id="affiliation"
                        data-testid="input-affiliation"
                        placeholder="University/Organization name"
                        value={formData.affiliation}
                        onChange={(e) => setFormData({...formData, affiliation: e.target.value})}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="publicationType">Publication Type *</Label>
                        <Select value={formData.publicationType} onValueChange={(value) => setFormData({...formData, publicationType: value})}>
                          <SelectTrigger id="publicationType" data-testid="select-publication-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="journal">Journal Article</SelectItem>
                            <SelectItem value="book">Book</SelectItem>
                            <SelectItem value="book-chapter">Book Chapter</SelectItem>
                            <SelectItem value="conference">Conference Paper</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="numberOfAuthors">Number of Authors *</Label>
                        <Select value={formData.numberOfAuthors} onValueChange={(value) => setFormData({...formData, numberOfAuthors: value})}>
                          <SelectTrigger id="numberOfAuthors" data-testid="select-authors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Array(6)].map((_, i) => (
                              <SelectItem key={i+1} value={String(i+1)}>{i+1} Author{i>0 ? 's' : ''}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="authorType">Author Location *</Label>
                      <Select value={formData.authorType} onValueChange={(value) => setFormData({...formData, authorType: value})}>
                        <SelectTrigger id="authorType" data-testid="select-author-type">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="indian">🇮🇳 India</SelectItem>
                          <SelectItem value="non-indian">🌍 International</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        variant="outline"
                        onClick={() => setStep("verify")}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={() => setStep("checkout")} 
                        disabled={!isReadyForCheckout}
                        className="flex-1 bg-[#213361] hover:bg-[#2a4078] h-12"
                      >
                        Continue to Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {step === "checkout" && (
              <Card>
                <CardHeader className="bg-[#213361] text-white">
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">Manuscript ID:</span>
                      <span className="font-medium">{manuscriptData?.manuscriptId}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">Author:</span>
                      <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">Manuscript Title:</span>
                      <span className="font-medium text-right max-w-xs">{formData.manuscriptTitle}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">Institution:</span>
                      <span className="font-medium">{formData.affiliation}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">Publication Type:</span>
                      <span className="font-medium capitalize">{formData.publicationType}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">Number of Authors:</span>
                      <span className="font-medium">{formData.numberOfAuthors}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-foreground">What's Included:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> Crossref DOI Assignment</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> Professional Peer Review</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> Open Access Publishing</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> Permanent Hosting & Indexing</li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep("cart")} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={() => setStep("payment")} className="flex-1 bg-[#213361] hover:bg-[#2a4078]">
                      Proceed to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "payment" && (
              <Card>
                <CardHeader className="bg-[#213361] text-white">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Lock className="w-5 h-5 text-green-400" />
                    Secure Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {formData.authorType === "indian" ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                          <div className="flex-shrink-0 bg-white p-3 rounded-xl shadow-md border border-blue-200">
                            <img src={upiQrPath} alt="UPI QR Code" className="w-40 h-40 object-contain" />
                            <div className="flex items-center justify-center gap-2 mt-2">
                              <QrCode className="w-4 h-4 text-[#213361]" />
                              <span className="text-xs font-bold text-[#213361] uppercase">Scan to Pay</span>
                            </div>
                          </div>
                          
                          <div className="flex-1 space-y-4 w-full">
                            <h4 className="font-bold text-lg text-foreground mb-2">UPI Payment</h4>
                            
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-muted-foreground mb-2">Scan with any UPI app or copy the ID</p>
                                <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-3 rounded border border-blue-300 dark:border-blue-700">
                                  <code className="flex-1 font-mono text-sm font-semibold text-foreground" data-testid="text-upi-id">
                                    {import.meta.env.VITE_PAYMENT_UPI_ID || "PPQR01.HNZMKU@iob"}
                                  </code>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={handleCopyUPI}
                                    data-testid="button-copy-upi"
                                  >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                  </Button>
                                </div>
                              </div>

                              <div className="bg-white dark:bg-gray-900 p-4 rounded border border-blue-300 dark:border-blue-700">
                                <p className="text-sm text-muted-foreground mb-2">Amount to Pay</p>
                                <p className="text-3xl font-bold text-[#213361] dark:text-blue-300">{apc.display}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                        <p className="text-sm text-yellow-900 dark:text-yellow-300">
                          📱 <strong>Steps:</strong> Open any UPI app (Google Pay, PhonePe, Paytm, etc.), scan the QR code or enter the UPI ID manually, and complete the payment.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
                        <h4 className="font-bold text-lg text-foreground mb-4">Wire Transfer</h4>
                        
                        <div className="space-y-3">
                          <div className="bg-white dark:bg-gray-900 p-4 rounded border border-green-300 dark:border-green-700">
                            <p className="text-sm text-muted-foreground mb-2">Bank Details</p>
                            <p className="font-mono text-sm text-foreground whitespace-pre-wrap">{import.meta.env.VITE_PAYMENT_BANK_DETAILS || "Contact editor@scholarindiapub.com for bank details"}</p>
                          </div>

                          <div className="bg-white dark:bg-gray-900 p-4 rounded border border-green-300 dark:border-green-700">
                            <p className="text-sm text-muted-foreground mb-2">Amount to Pay</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">US $50</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                        <p className="text-sm text-yellow-900 dark:text-yellow-300">
                          🏦 <strong>Steps:</strong> Use the bank details above for wire transfer. Payment typically processes within 24 hours.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg text-foreground mb-4">Payment Details</h3>
                    
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="modeOfPayment">Mode of Payment *</Label>
                        <Select value={formData.modeOfPayment} onValueChange={(value) => setFormData({...formData, modeOfPayment: value})}>
                          <SelectTrigger id="modeOfPayment" data-testid="select-mode-of-payment">
                            <SelectValue placeholder="Select payment mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="neft">NEFT</SelectItem>
                            <SelectItem value="rtgs">RTGS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfPayment">Date of Payment *</Label>
                        <Input
                          id="dateOfPayment"
                          data-testid="input-date-of-payment"
                          type="date"
                          value={formData.dateOfPayment}
                          onChange={(e) => setFormData({...formData, dateOfPayment: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transactionNumber">Transaction Number *</Label>
                        <Input
                          id="transactionNumber"
                          data-testid="input-transaction-number"
                          placeholder="e.g., TXN12345"
                          value={formData.transactionNumber}
                          onChange={(e) => setFormData({...formData, transactionNumber: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Payment Proof (Screenshot/Receipt)
                    </h3>
                    <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <label htmlFor="paymentScreenshot" className="cursor-pointer block">
                        <p className="font-semibold text-foreground mb-1">Upload Payment Screenshot</p>
                        <p className="text-sm text-muted-foreground mb-4">PNG, JPG, or PDF (Max 10MB)</p>
                        <input
                          id="paymentScreenshot"
                          data-testid="input-payment-screenshot"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('paymentScreenshot')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                      </label>
                    </div>
                    
                    {fileName && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">{fileName}</span>
                        </div>
                        <button
                          onClick={() => {
                            setPaymentFile(null);
                            setFileName("");
                          }}
                          className="text-red-600 hover:text-red-700"
                          data-testid="button-remove-file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                    <p className="text-sm text-green-900 dark:text-green-300">
                      ✓ After uploading payment proof, click "Confirm Payment". We'll verify within 24 hours and send your DOI.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep("checkout")} className="flex-1">
                      Back
                    </Button>
                    <Button 
                      onClick={handlePayment} 
                      disabled={isProcessing || !paymentFile}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      data-testid="button-confirm-payment"
                    >
                      {isProcessing ? "Processing..." : "Confirm Payment"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "success" && (
              <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="bg-green-100 dark:bg-green-950/30 p-4 rounded-full">
                      <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-green-900 dark:text-green-300 mb-4">
                    Payment Received!
                  </h2>
                  <p className="text-green-800 dark:text-green-200 mb-6 max-w-xl mx-auto text-lg">
                    Thank you for your payment. A confirmation has been sent to {formData.email}
                  </p>
                  
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-8 text-left max-w-xl mx-auto border border-green-200 dark:border-green-800">
                    <h3 className="font-semibold text-foreground mb-4">What Happens Next:</h3>
                    <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                      <li>We verify your payment (typically within 24 hours)</li>
                      <li>You'll receive your unique DOI via email</li>
                      <li>Your article will be published in our journal</li>
                      <li>Your work will be globally indexed and discoverable</li>
                    </ol>
                  </div>

                  <Button onClick={() => window.location.href = '/'} className="bg-[#213361] hover:bg-[#2a4078]">
                    Return to Home
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          {step !== "verify" && (
            <div className="lg:col-span-1">
              <Card className="sticky top-20 border border-gray-200 dark:border-gray-700">
                <CardHeader className="bg-[#213361] text-white">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ShoppingCart className="w-5 h-5" />
                    Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Publication Fee</p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                      <p className="text-2xl font-bold text-[#213361] dark:text-blue-300">{apc.display}</p>
                    </div>
                  </div>


                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded space-y-2">
                    <h4 className="font-semibold text-sm text-green-900 dark:text-green-300">Includes:</h4>
                    <ul className="text-xs text-green-800 dark:text-green-200 space-y-1">
                      <li>✓ Crossref DOI</li>
                      <li>✓ Peer Review</li>
                      <li>✓ Professional Editing</li>
                      <li>✓ Open Access</li>
                      <li>✓ Academic Indexing</li>
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t">
                    <Lock className="w-3 h-3" />
                    <span>Secure Payment</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
