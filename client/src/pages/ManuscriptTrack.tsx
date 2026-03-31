import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Loader2, CheckCircle2, Clock, CreditCard, Settings, Globe, ArrowLeft, FileText } from 'lucide-react';
import Header from '@/components/Header';
import Footer from "@/components/Footer";
import SEO from '@/components/SEO';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ManuscriptStatus {
  manuscriptId: string;
  title: string;
  authorName: string;
  journal: string;
  submittedAt: string;
  status: string; // From Manuscript sheet Column O
  paymentStatus: string; // From Payment sheet Column R
  doi?: string;
}

export default function ManuscriptTrack() {
  const [trackId, setTrackId] = useState("");
  const [status, setStatus] = useState<ManuscriptStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackId.trim()) return;

    setLoading(true);
    try {
      const res = await apiRequest("GET", `/api/track-manuscript/${trackId.trim()}`);
      const data = await res.json();
      if (data.success) {
        setStatus(data.status);
      } else {
        toast({
          title: "Not Found",
          description: "Manuscript ID not found. Please check and try again.",
          variant: "destructive",
        });
        setStatus(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch manuscript status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (step: string) => {
    if (!status) return "pending";
    
    const currentStatus = (status.status || "").toLowerCase();
    const paymentStatus = (status.paymentStatus || "").toLowerCase();

    switch (step) {
      case "submitted":
        return "completed";
      case "reviewing":
        return currentStatus.includes("review") || currentStatus.includes("accepted") || currentStatus.includes("published") || currentStatus.includes("complement") || paymentStatus === "paid" ? "completed" : currentStatus.includes("submitted") ? "current" : "pending";
      case "decision":
        return currentStatus.includes("accepted") || currentStatus.includes("published") || currentStatus.includes("complement") || paymentStatus === "paid" ? "completed" : currentStatus.includes("review") ? "current" : "pending";
      case "payment":
        return paymentStatus === "paid" || currentStatus.includes("published") || currentStatus.includes("complement") ? "completed" : currentStatus.includes("accepted") ? "current" : "pending";
      case "production":
        return currentStatus.includes("published") ? "completed" : (paymentStatus === "paid" || currentStatus.includes("complement")) ? "current" : "pending";
      case "published":
        return currentStatus.includes("published") ? "completed" : "pending";
      default:
        return "pending";
    }
  };

  const steps = [
    { id: "submitted", label: "Submitted", icon: Clock },
    { id: "reviewing", label: "Reviewing", icon: Search },
    { id: "decision", label: "Decision", icon: CheckCircle2 },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "production", label: "Production", icon: Settings },
    { id: "published", label: "Published", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SEO
        title="Track Your Manuscript Status - Scholar India Publishers"
        description="Track the status of your submitted manuscript at Scholar India Publishers. Enter your Manuscript ID to check real-time progress from submission to publication for SJCM and SJHSS journals."
        keywords="track manuscript, manuscript status, submission tracking, manuscript ID, check paper status, journal submission status, Scholar India Publishers"
        canonical="https://scholarindiapub.com/manuscript-track"
      />
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-serif font-bold text-[#213361] dark:text-white mb-4">
            Track Your Manuscript
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your Manuscript ID to check the real-time status of your submission
          </p>
        </div>

        <Card className="mb-12 border-none shadow-md overflow-hidden bg-white dark:bg-gray-900">
          <CardContent className="p-6">
            <form onSubmit={handleTrack} className="flex gap-2">
              <Input
                placeholder="e.g., MANSJCM251200AB"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                className="flex-1 h-12"
              />
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-[#213361] hover:bg-[#2a4078] h-12 px-8"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Visual Progress Bar */}
            <div className="relative pt-8 pb-12">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-800 -translate-y-1/2" />
              <div className="relative flex justify-between items-center z-10">
                {steps.map((step) => {
                  const stepStatus = getStepStatus(step.id);
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                        stepStatus === "completed" 
                          ? "bg-[#213361] border-[#213361] text-white" 
                          : stepStatus === "current"
                          ? "bg-white border-[#213361] text-[#213361] animate-pulse shadow-[0_0_15px_rgba(33,51,97,0.3)]"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`absolute mt-12 text-[10px] md:text-xs font-medium whitespace-nowrap transition-all ${
                        stepStatus === "completed" || stepStatus === "current" ? "text-[#213361] font-bold" : "text-gray-500"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Card className="border-none shadow-lg bg-white dark:bg-gray-900 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-8 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="max-w-2xl">
                      <h2 className="text-2xl font-serif font-bold text-[#213361] dark:text-white mb-2 leading-tight">
                        {status.title || "Untitled Manuscript"}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <span className="font-medium">By {status.authorName || "Unknown Author"}</span>
                      </p>
                    </div>
                    <div className="px-6 py-3 bg-blue-100 dark:bg-blue-900/50 text-[#213361] dark:text-blue-200 rounded-lg font-black uppercase tracking-widest text-sm border-2 border-[#213361] dark:border-blue-700 shrink-0 shadow-md">
                      <span className="text-[10px] block opacity-70 font-bold mb-1">Current Status</span>
                      {status.status === "Published" ? "PUBLISHED" : status.status.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {status.status.toLowerCase() === "accepted" && (
                    <div className="md:col-span-2 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
                      <p className="text-amber-800 dark:text-amber-200 font-semibold flex items-center gap-2 text-base">
                        <CheckCircle2 className="w-5 h-5" />
                        Next Steps Required
                      </p>
                      <p className="text-amber-700 dark:text-amber-300 text-sm mt-1 mb-4">
                        Congratulations! Your manuscript has been accepted. Please complete the following steps to move to the production stage:
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <a href="/payment">
                          <Button size="sm" className="bg-[#213361] hover:bg-[#2a4078] text-white">1. Make Payment</Button>
                        </a>
                        <a href="/copyright-form">
                          <Button size="sm" variant="outline" className="border-[#213361] text-[#213361] hover:bg-blue-50">2. Copyright Form</Button>
                        </a>
                        <a href="/final-paper">
                          <Button size="sm" variant="outline" className="border-[#213361] text-[#213361] hover:bg-blue-50">3. Final Paper Upload</Button>
                        </a>
                      </div>
                    </div>
                  )}

                  {status.status.toLowerCase() === "complement" && (
                    <div className="md:col-span-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4">
                      <p className="text-green-800 dark:text-green-200 font-semibold flex items-center gap-2 text-base">
                        <CheckCircle2 className="w-5 h-5" />
                        Complimentary Publication
                      </p>
                      <p className="text-green-700 dark:text-green-300 text-sm mt-1 mb-4">
                        Your manuscript is approved for complimentary publication. Please complete the following steps to begin the production process:
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <a href="/copyright-form">
                          <Button size="sm" className="bg-[#213361] hover:bg-[#2a4078] text-white">1. Copyright Form</Button>
                        </a>
                        <a href="/final-paper">
                          <Button size="sm" variant="outline" className="border-[#213361] text-[#213361] hover:bg-blue-50">2. Final Paper Submission</Button>
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Submission Date</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{status.submittedAt || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Journal</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{status.journal || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">DOI / Publication Status</p>
                    <div className="font-medium text-[#213361] dark:text-blue-400 font-serif">
                      {status.status.toLowerCase() === "rejected" ? (
                        <span className="text-red-600 dark:text-red-400 font-bold">Not Applicable (Rejected)</span>
                      ) : status.status.toLowerCase() === "published" ? (
                        status.doi ? (
                          <a href={`https://doi.org/${status.doi}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700 transition-colors flex items-center gap-1">
                            {status.doi} <Globe className="w-3 h-3" />
                          </a>
                        ) : "Assigned (Update pending)"
                      ) : (status.paymentStatus || "").toLowerCase() === "paid" || status.status.toLowerCase() === "complement" ? (
                        <span className="text-green-600 dark:text-green-400 font-bold">Sent for Production</span>
                      ) : (
                        <span className="text-gray-500 italic">Processing...</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Manuscript Tracking ID</p>
                    <p className="font-mono font-bold text-[#213361] dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded inline-block">
                      {status.manuscriptId}
                    </p>
                  </div>
                </div>

                <div className="p-8 bg-gray-50 dark:bg-gray-800/40 flex justify-center border-t dark:border-gray-800">
                  <Button 
                    variant="outline" 
                    className="border-[#213361] text-[#213361] hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400"
                    onClick={() => {
                      setStatus(null);
                      setTrackId("");
                    }}
                  >
                    Track Another Submission
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}
