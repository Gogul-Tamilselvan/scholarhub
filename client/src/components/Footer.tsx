import { Link } from "wouter";
import { Mail, MapPin, Phone, Send, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  const { data: visitorData } = useQuery<{ count: number }>({
    queryKey: ['/api/visitor-count'],
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Error", description: "Please enter your email", variant: "destructive" });
      return;
    }

    setIsSubscribing(true);
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert([{ 
        email: email, 
        subscribed_at: new Date().toISOString() 
      }]);

      if (error) {
        if (error.code === '23505') {
            toast({ title: "Already Subscribed", description: "This email is already on our newsletter list!" });
            setEmail("");
            return;
        }
        throw new Error(error.message);
      }

      toast({ title: "Success", description: "You've been subscribed to our newsletter!" });
      setEmail("");
      
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An error occurred. Please try again.", variant: "destructive" });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#213361] dark:bg-gray-950 text-white border-t border-blue-800/30">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Journals */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-100">Journals</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/commerce-management" className="text-gray-300 hover:text-blue-200 transition">Commerce & Management</Link></li>
              <li><Link href="/humanities" className="text-gray-300 hover:text-blue-200 transition">Humanities & Social Sciences</Link></li>
            </ul>
          </div>

          {/* Publications */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-100">Publications</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/submit" className="text-gray-300 hover:text-blue-200 transition">Submit Manuscript</Link></li>
              <li><Link href="/manuscript-track" className="text-yellow-300 hover:text-yellow-100 font-medium transition">Track Manuscript</Link></li>
              <li><Link href="/call-for-books" className="text-gray-300 hover:text-blue-200 transition">Call for Books</Link></li>
              <li><Link href="/published-books" className="text-gray-300 hover:text-blue-200 transition">Published Books</Link></li>
              <li><Link href="/join-reviewer" className="text-gray-300 hover:text-blue-200 transition">Join as Editor/Reviewer</Link></li>
              <li><Link href="/reviewer-search" className="text-gray-300 hover:text-blue-200 transition">Editor & Reviewer Track Portal</Link></li>
              <li><Link href="/reviewer-login" className="text-yellow-300 hover:text-yellow-100 font-medium transition">Reviewer Login Portal</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-100">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/book-publication-info" className="text-gray-300 hover:text-blue-200 transition">Book Publication Info</Link></li>
              <li><Link href="/conference-seminars" className="text-gray-300 hover:text-blue-200 transition">Conference & Seminars</Link></li>
              <li><Link href="/other-services" className="text-gray-300 hover:text-blue-200 transition">Other Services</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-100">About</h3>
            <ul className="space-y-2 text-sm mb-6">
              <li><Link href="/about" className="text-gray-300 hover:text-blue-200 transition">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-blue-200 transition">Contact Us</Link></li>
              <li><Link href="/payment" className="text-gray-300 hover:text-blue-200 transition">Payment & APC</Link></li>
            </ul>
            {/* Newsletter Subscribe */}
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-blue-200 uppercase">Newsletter</label>
              <div className="flex gap-1">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubscribing}
                  className="bg-white text-black placeholder:text-gray-400 text-xs py-1 h-8"
                  data-testid="input-newsletter-email"
                />
                <Button
                  type="submit"
                  disabled={isSubscribing}
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 h-8"
                  data-testid="button-newsletter-subscribe"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-blue-800 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col items-center justify-center gap-4 text-sm text-gray-300 text-center">
          {visitorData && (
            <div className="flex items-center gap-2 bg-blue-800/50 px-4 py-2 rounded-full border border-blue-700/50">
              <Users className="w-4 h-4 text-blue-200" />
              <span className="text-blue-100 font-medium">Total Visitors: {visitorData.count.toLocaleString()}</span>
            </div>
          )}
          <div>
            <p className="font-semibold text-blue-100">© 2025 Scholar India Publishers</p>
            <p>Chennai - 631402, Tamilnadu, India</p>
            <p className="mt-1">
              All Rights Reserved • 
              <a href="mailto:editor@scholarindiapub.com" className="text-blue-300 hover:text-blue-200 transition ml-1">
                editor@scholarindiapub.com
              </a>
              <span className="mx-1">•</span>
              Designed and Developed by Dr. Kalaiarasan C
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
