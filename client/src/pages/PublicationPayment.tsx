import { useState } from "react";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Copy, Check, Upload, Loader2, QrCode } from "lucide-react";
import { supabase } from "@/lib/supabase";
import upiQrPath from "@assets/IMG-20260120-WA0001_1768957901426.jpg";
import { MAIL_SERVER_URL, MAIL_API_KEY } from "@/lib/config";

export default function PublicationPayment() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    designation: "",
    contactNumber: "",
    workDescription: "",
    paymentMode: "",
    paymentDate: new Date().toISOString().split('T')[0],
    transactionId: "",
  });
  
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyUPI = async () => {
    const upiId = "PPQR01.HNZMKU@iob";
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

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.contactNumber || !formData.workDescription || 
        !formData.paymentMode || !formData.paymentDate || !formData.transactionId) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!paymentFile) {
      toast({
        title: "Payment Proof Required",
        description: "Please upload your payment screenshot before confirming.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Upload Payment Proof to S3
      const fileExtension = paymentFile.name.split('.').pop() || 'png';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const s3FileName = `receipts/PAY-${uniqueSuffix}.${fileExtension}`;

      const { data: presignData, error: presignError } = await supabase.functions.invoke('s3-presign', {
        body: {
          fileName: s3FileName,
          fileType: paymentFile.type || 'image/png',
        }
      });

      if (presignError) throw new Error("Failed to authenticate upload with server.");

      const { signedUrl, publicUrl: s3Url } = presignData;

      const arrayBuffer = await paymentFile.arrayBuffer();
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": paymentFile.type || 'image/png' },
        body: new Uint8Array(arrayBuffer),
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload the payment proof to S3 storage.");

      // 2. Insert into third_party_payments
      const { error: dbError } = await supabase
        .from('third_party_payments')
        .insert([{
          name: formData.name.trim(),
          email: formData.email.trim(),
          designation: formData.designation.trim(),
          contact_number: formData.contactNumber.trim(),
          work_description: formData.workDescription.trim(),
          payment_mode: formData.paymentMode.trim(),
          payment_date: formData.paymentDate,
          transaction_id: formData.transactionId.trim(),
          payment_proof_url: s3Url,
          status: 'Pending'
        }]);

      if (dbError) throw new Error(dbError.message);

      // 3. Send email via Scholar Hub Server
      try {
        await fetch(`${MAIL_SERVER_URL}/send/third-party-receipt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': MAIL_API_KEY
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            workDescription: formData.workDescription.trim(),
            transactionId: formData.transactionId.trim(),
            date: formData.paymentDate
          })
        });
      } catch (mailError) {
        console.error("Failed to send receipt email:", mailError);
        // We do not throw here, as the database insert was successful
      }

      setIsSuccess(true);
      toast({ title: "Payment Details Submitted", description: "Your details have been submitted manually for verification." });
      
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEO title="Payment Success | Scholar India Publishers" description="Payment details submitted." />
        <Header />
        <main className="flex-grow flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-green-200">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">Submission Successful</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-600">
              <p>Your payment details and proof have been successfully received. We will manually verify your submission and contact you via email shortly.</p>
              <Button onClick={() => window.location.reload()} className="mt-6 bg-[#213361] text-white">Submit Another</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Payment Form | Scholar India Publishers"
        description="Secure payment collection for third-party works and services."
        keywords="payment, services, Scholar India Publishers"
      />
      <Header />

      <div className="bg-[#213361] py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Make a Payment</h1>
          </div>
          <p className="text-blue-100 mt-2">Submit your details and payment proof for manual verification.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Payment Form */}
          <div className="lg:col-span-7">
            <Card className="shadow-lg border-gray-200">
              <CardHeader className="bg-[#213361] text-white rounded-t-xl">
                <CardTitle className="text-xl text-white">Your Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" required />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                      <Label htmlFor="designation">Designation / Role</Label>
                      <Input id="designation" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="e.g. Researcher, Author..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number *</Label>
                      <Input id="contactNumber" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} placeholder="Phone number" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workDescription">Work / Purpose Description *</Label>
                    <Textarea 
                      id="workDescription" 
                      value={formData.workDescription} 
                      onChange={e => setFormData({...formData, workDescription: e.target.value})} 
                      placeholder="Briefly describe the purpose of this payment..." 
                      className="min-h-[100px]"
                      required 
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentMode">Mode of Payment *</Label>
                      <Input id="paymentMode" value={formData.paymentMode} onChange={e => setFormData({...formData, paymentMode: e.target.value})} placeholder="e.g. UPI, NEFT" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentDate">Date of Payment *</Label>
                      <Input id="paymentDate" type="date" value={formData.paymentDate} onChange={e => setFormData({...formData, paymentDate: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transactionId">Transaction ID / UTR *</Label>
                      <Input id="transactionId" value={formData.transactionId} onChange={e => setFormData({...formData, transactionId: e.target.value})} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Proof (Screenshot / Receipt) *</Label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <input
                        type="file"
                        id="paymentProof"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="paymentProof" className="cursor-pointer flex flex-col items-center">
                        <Upload className="w-8 h-8 text-blue-500 mb-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {fileName ? fileName : 'Click to upload payment screenshot'}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG, PDF (Max 10MB)</span>
                      </label>
                    </div>
                  </div>

                  <Button type="submit" disabled={isProcessing} className="w-full bg-[#213361] hover:bg-[#2a4078] h-12 text-lg font-bold">
                    {isProcessing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying Details...</> : "Submit Payment Details"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Bank Details Panel */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-blue-100 dark:border-blue-900 shadow-sm overflow-hidden">
              <CardHeader className="bg-[#213361] text-white">
                <CardTitle className="text-xl text-white">Bank Account Details</CardTitle>
                <CardDescription className="text-blue-100">Direct Bank Transfer (NEFT/IMPS/RTGS)</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Bank Name:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Indian Overseas Bank</span>
                    
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Account Name:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Scholar India Publishers</span>
                    
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Account Type:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Current Account</span>
                    
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Account Number:</span>
                    <span className="text-[#213361] dark:text-blue-400 font-bold tracking-wider">171202000000231</span>
                    
                    <span className="font-semibold text-gray-800 dark:text-gray-200">IFSC Code:</span>
                    <span className="text-[#213361] dark:text-blue-400 font-bold tracking-wider">IOBA0001712</span>
                    
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Branch:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Loyola College</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-900 shadow-sm overflow-hidden bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
              <CardHeader className="bg-amber-500 text-white pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-white" />
                  Quick Scan & Pay
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-white p-3 rounded-xl shadow-lg border border-amber-200">
                    <img src={upiQrPath} alt="UPI QR Code" className="w-48 h-48 object-contain mx-auto" />
                    <p className="text-xs mt-2 font-black text-[#213361] uppercase tracking-widest">Scholar India Publishers</p>
                  </div>
                  <div className="space-y-3 w-full pt-2">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Scan using any UPI app (GPay, PhonePe, Paytm)</p>
                    <Button 
                      variant="outline" 
                      className="w-full font-bold border-amber-300 hover:bg-amber-100 text-amber-800"
                      onClick={handleCopyUPI}
                    >
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? "ID Copied Successfully" : "Copy UPI ID"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden bg-white">
          <div className="bg-[#213361] py-4 px-6">
            <h2 className="text-xl font-bold text-white">Why Do We Charge Article Processing Charges?</h2>
          </div>
          <div className="p-6 text-gray-700">
            <p className="mb-8">
              Like other reputed international journals, Scholar India Publishers charges Article Processing Charges (APC) to maintain the highest standards of academic publishing. Since we provide unlimited free access to all our published research (Open Access), we do not charge readers or institutions for subscriptions.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-gray-900 mb-4">APC Includes:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-800" /> <span className="text-sm text-gray-600">Crossref DOI</span></li>
                  <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-800" /> <span className="text-sm text-gray-600">Peer Review</span></li>
                  <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-800" /> <span className="text-sm text-gray-600">Professional Editing</span></li>
                  <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-800" /> <span className="text-sm text-gray-600">Open Access</span></li>
                  <li className="flex items-center gap-3"><Check className="w-4 h-4 text-gray-800" /> <span className="text-sm text-gray-600">Academic Indexing</span></li>
                </ul>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Technical Infrastructure</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Supports permanent hosting, Crossref DOI registration, XML conversion, and archival in global databases.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Global Visibility</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Ensures your research is discoverable through Google Scholar, ResearchGate, and major indexing services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
