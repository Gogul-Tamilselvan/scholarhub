import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";

export default function ContactUs() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    enquiryType: "",
    subject: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const [firstName, ...lastNames] = formData.name.split(' ');
      const { error } = await supabase.from('contact_messages').insert([{
        first_name: firstName || '',
        last_name: lastNames.join(' ') || '',
        email: formData.email,
        phone: formData.phone,
        enquiry_type: formData.enquiryType,
        subject: formData.subject,
        message: formData.message,
        submitted_at: new Date().toISOString(),
        is_read_system: false
      }]);

      if (!error) {
        toast({
          title: "Message sent successfully!",
          description: "We have received your request. Our team will contact you soon.",
        });
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          enquiryType: "",
          subject: "",
          message: ""
        });
      } else {
        throw new Error(error.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Contact Scholar India Publishers - Chennai | editor@scholarindiapub.com"
        description="Contact Scholar India Publishers for journal submission queries, book publication, conference proceedings, and academic services. Email: editor@scholarindiapub.com. Chennai, Tamil Nadu, India. Mon-Fri 10 AM - 4 PM IST."
        keywords="contact scholar india publishers, scholar india publishers email, academic publisher Chennai contact, journal submission inquiry, manuscript query India, book publishing contact Chennai, conference proceedings inquiry, scholar india publishers address Tamil Nadu, research journal India contact"
        canonical="https://scholarindiapub.com/contact"
      />
      <Header />
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#213361] py-16 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <Mail className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto">
            Get in touch with Scholar India Publishers
          </p>
        </div>
      </motion.div>
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
              <CardHeader className="bg-[#213361] text-white">
                <CardTitle className="text-xl text-white">
                  Get In Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <MapPin className="w-6 h-6 text-[#213361] dark:text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#213361] dark:text-amber-400 mb-1">Address</h3>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      Scholar India Publishers<br />
                      2/477, Perumal Kovil Street,<br />
                      Mettuchery, Mappedu, Tiruvallur,<br />
                      Chennai - 631402, Tamilnadu, India
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Mail className="w-6 h-6 text-[#213361] dark:text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#213361] dark:text-amber-400 mb-1">Email</h3>
                    <a 
                      href="mailto:editor@scholarindiapub.com" 
                      className="text-sm text-gray-900 dark:text-gray-100 hover:text-[#213361] dark:hover:text-amber-400 hover:underline"
                      data-testid="link-contact-email"
                    >editor@scholarindiapub.com</a>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Phone className="w-6 h-6 text-[#213361] dark:text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#213361] dark:text-amber-400 mb-1">Phone</h3>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      Available via email
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardHeader className="bg-[#213361] text-white">
                <CardTitle className="text-xl text-white">
                  Office Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  <strong>Monday - Friday:</strong><br />
                  10:00 AM - 4:00 PM IST
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-3">
                  <strong>Saturday - Sunday:</strong><br />
                  Closed
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardHeader className="bg-[#213361] text-white">
                <CardTitle className="text-2xl text-white">
                  Send Us a Message
                </CardTitle>
                <p className="text-sm text-blue-100 mt-2">
                  Fill out the form below and we'll get back to you as soon as possible
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Full Name <span className="text-red-600">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        data-testid="input-contact-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Email Address <span className="text-red-600">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your.email@example.com"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        data-testid="input-contact-email"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 9876543210"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        data-testid="input-contact-phone"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="enquiryType" className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Type of Enquiry <span className="text-red-600">*</span>
                      </label>
                      <select
                        id="enquiryType"
                        name="enquiryType"
                        value={formData.enquiryType}
                        onChange={handleChange}
                        required
                        className="w-full h-10 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                        data-testid="select-contact-enquiry-type"
                      >
                        <option value="">-- Select Enquiry Type --</option>
                        <option value="general enquiry">General Enquiry</option>
                        <option value="book publication">Book Publication</option>
                        <option value="reviewer application">Reviewer Application</option>
                        <option value="editor application">Editor Application</option>
                        <option value="manuscript status">Manuscript Status</option>
                        <option value="conference support">Conference Support</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Subject <span className="text-red-600">*</span>
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="What is this regarding?"
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      data-testid="input-contact-subject"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Message <span className="text-red-600">*</span>
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Please provide details about your inquiry..."
                      rows={6}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 resize-none text-gray-900 dark:text-gray-100"
                      data-testid="input-contact-message"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#213361] text-yellow-400 hover:bg-[#2a4078]"
                    data-testid="button-submit-contact"
                  >
                    {isSubmitting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
