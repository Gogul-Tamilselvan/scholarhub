import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, BookOpen, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ReviewerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your registered email address.",
        variant: "destructive"
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter your password (Reviewer ID or New Password).",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/reviewer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.setItem('reviewerSession', JSON.stringify({
          reviewerId: result.reviewer.reviewerId,
          email: result.reviewer.email,
          name: result.reviewer.name,
          role: result.reviewer.role,
          journal: result.reviewer.journal,
          loggedInAt: new Date().toISOString()
        }));

        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.reviewer.firstName || result.reviewer.name || 'Reviewer'}!`,
        });

        setLocation('/reviewer-dashboard');
      } else {
        toast({
          title: "Login Failed",
          description: result.message || "Invalid email or Reviewer ID. Please check and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "Unable to connect to the server. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-md">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <Card className="shadow-lg overflow-hidden border-2 border-[#213361]">
            <CardHeader className="text-center bg-[#213361] text-white">
              <div className="flex justify-center mb-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <BookOpen className="w-8 h-8" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white" data-testid="text-login-title">Reviewer Portal</CardTitle>
              <CardDescription className="text-blue-100">
                Login to access your reviewer dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                    data-testid="input-email"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your Reviewer ID or New Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-10"
                      data-testid="input-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      data-testid="button-toggle-password-visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Use your Reviewer ID or the New Password set by admin
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Logging in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Login to Dashboard
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Don't have a Reviewer ID yet?
                </p>
                <Link href="/join-reviewer">
                  <Button variant="outline" className="w-full" data-testid="button-apply-reviewer">
                    Apply as Reviewer/Editor
                  </Button>
                </Link>
              </div>

              <div className="mt-4 text-center">
                <Link href="/reviewer-search" className="text-sm text-blue-600 hover:underline" data-testid="link-check-status">
                  Check Application Status
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Need help? Contact us at</p>
            <a href="mailto:editor@scholarindiapublishers.com" className="text-blue-600 hover:underline">
              editor@scholarindiapublishers.com
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
