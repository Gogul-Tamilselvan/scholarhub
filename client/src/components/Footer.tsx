import { Link } from "wouter";
import { Mail, MapPin, Phone, Send, Users, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import logoImage from "@assets/Untitled design (1)_1760793768867.png";

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

  const linkClass = "group flex items-center text-[13px] text-gray-400 hover:text-amber-400 transition-colors duration-300 w-fit";
  const iconClass = "h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-amber-500";

  return (
    <footer className="relative bg-[#0d162d] dark:bg-gray-950 text-white border-t border-white/10 overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-[20%] w-[60%] h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#213361]/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
          
          {/* Brand Column (takes up more space on large screens) */}
          <div className="lg:col-span-4 flex flex-col gap-6 pr-4">
             <div className="flex items-center gap-3 cursor-default">
              <img
                src={logoImage}
                alt="Scholar India Publishers Logo"
                className="h-16 w-auto object-contain filter brightness-110 drop-shadow-md"
              />
              <div className="flex flex-col justify-center">
                <span className="text-xl font-black text-white leading-tight tracking-tight">
                  Scholar India
                </span>
                <span className="text-xl font-black text-amber-400 leading-tight tracking-tight">
                  Publishers
                </span>
              </div>
            </div>
            <p className="text-[13px] text-gray-400 leading-relaxed max-w-sm">
              International peer-reviewed publisher offering robust open-access pathways for robust academic research, monographs, and journals.
            </p>
            {/* Newsletter Subscribe */}
            <div className="mt-2 bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl relative shadow-lg overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
               <label className="block text-xs font-black text-white uppercase tracking-[0.15em] mb-3">Subscribe to Newsletter</label>
               <form onSubmit={handleSubscribe} className="flex gap-2">
                 <Input
                   type="email"
                   placeholder="Enter email address..."
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   disabled={isSubscribing}
                   className="bg-black/20 text-white border-white/10 placeholder:text-gray-500 text-[13px] focus-visible:ring-amber-500 h-10 rounded-xl px-4"
                   data-testid="input-newsletter-email"
                 />
                 <Button
                   type="submit"
                   disabled={isSubscribing}
                   className="bg-amber-500 hover:bg-amber-400 text-[#0d162d] font-bold h-10 px-4 rounded-xl shadow-md transition-colors"
                   data-testid="button-newsletter-subscribe"
                 >
                   <Send className="w-4 h-4" />
                 </Button>
               </form>
            </div>
          </div>

          {/* Links Grid (Takes up the rest of the columns) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {/* Journals */}
            <div>
              <h3 className="text-sm font-black tracking-[0.15em] text-white uppercase mt-4 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                Journals
              </h3>
              <ul className="space-y-4">
                <li><Link href="/commerce-management" className={linkClass}><ChevronRight className={iconClass}/>Commerce & Management</Link></li>
                <li><Link href="/humanities" className={linkClass}><ChevronRight className={iconClass}/>Humanities & Social Sciences</Link></li>
              </ul>
            </div>

            {/* Publications */}
            <div>
              <h3 className="text-sm font-black tracking-[0.15em] text-white uppercase mt-4 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                Publications
              </h3>
              <ul className="space-y-4">
                <li><Link href="/submit" className={linkClass}><ChevronRight className={iconClass}/>Submit Manuscript</Link></li>
                <li><Link href="/manuscript-track" className="group flex items-center text-[13px] font-bold text-amber-400 hover:text-amber-300 transition-colors w-fit"><ChevronRight className={iconClass}/>Track Manuscript</Link></li>
                <li><Link href="/call-for-books" className={linkClass}><ChevronRight className={iconClass}/>Call for Books</Link></li>
                <li><Link href="/published-books" className={linkClass}><ChevronRight className={iconClass}/>Published Books</Link></li>
                <li><Link href="/join-reviewer" className={linkClass}><ChevronRight className={iconClass}/>Join as Editor/Reviewer</Link></li>
                <li><Link href="/reviewer-search" className={linkClass}><ChevronRight className={iconClass}/>Editor & Reviewer Track</Link></li>
                <li><Link href="/reviewer-login" className="group flex items-center text-[13px] font-bold text-amber-400 hover:text-amber-300 transition-colors w-fit"><ChevronRight className={iconClass}/>Reviewer Login Portal</Link></li>
              </ul>
            </div>

            {/* Services & About */}
            <div className="space-y-10">
              <div>
                <h3 className="text-sm font-black tracking-[0.15em] text-white uppercase mt-4 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  Services
                </h3>
                <ul className="space-y-4">
                  <li><Link href="/book-publication-info" className={linkClass}><ChevronRight className={iconClass}/>Book Publication Info</Link></li>
                  <li><Link href="/conference-seminars" className={linkClass}><ChevronRight className={iconClass}/>Conference & Seminars</Link></li>
                  <li><Link href="/other-services" className={linkClass}><ChevronRight className={iconClass}/>Other Services</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-black tracking-[0.15em] text-white uppercase mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  Company
                </h3>
                <ul className="space-y-4">
                  <li><Link href="/about" className={linkClass}><ChevronRight className={iconClass}/>About Us</Link></li>
                  <li><Link href="/contact" className={linkClass}><ChevronRight className={iconClass}/>Contact Core Team</Link></li>
                  <li><Link href="/payment" className={linkClass}><ChevronRight className={iconClass}/>Payment & APC</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-10"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div className="flex flex-col gap-1.5 text-[13px] text-gray-400 text-center md:text-left">
            <p className="font-bold text-white tracking-wide">© 2025 Scholar India Publishers. <span className="font-medium text-gray-400">All Rights Reserved.</span></p>
            <p className="flex items-center justify-center md:justify-start flex-wrap gap-x-2 gap-y-1">
               Chennai - 631402, Tamilnadu, India <span className="hidden md:inline">•</span>
               <a href="mailto:editor@scholarindiapub.com" className="hover:text-amber-400 transition-colors text-white font-medium">editor@scholarindiapub.com</a>
            </p>
            <p className="text-[11px] uppercase tracking-widest mt-1 opacity-70">Designed & Developed by Dr. Kalaiarasan C</p>
          </div>

          {visitorData && (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl shadow-inner backdrop-blur-sm shrink-0">
              <div className="p-1.5 bg-amber-500/20 rounded-md">
                 <Users className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold leading-none mb-1">Global Views</span>
                <span className="text-white font-black leading-none">{visitorData.count.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
