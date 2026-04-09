import { Switch, Route, useLocation } from "wouter";
import { useEffect, useLayoutEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import FounderProfile from "@/pages/FounderProfile";
import CommerceJournal from "@/pages/CommerceJournal";
import HumanitiesJournal from "@/pages/HumanitiesJournal";
import SocialSciencesJournal from "@/pages/SocialSciencesJournal";
import SubmitManuscriptPage from "@/pages/SubmitManuscriptPage";
import BookPublicationInfo from "@/pages/BookPublicationInfo";
import CallForBooks from "@/pages/CallForBooks";
import PublishedBooks from "@/pages/PublishedBooks";
import ConferenceSeminars from "@/pages/ConferenceSeminars";
import OtherServices from "@/pages/OtherServices";
import ContactUs from "@/pages/ContactUs";
import ReviewerApplication from "@/pages/ReviewerApplication";
import ReviewerSearch from "@/pages/ReviewerSearch";
import ManuscriptTrack from "@/pages/ManuscriptTrack";
import AdminCertificateEditor from "@/pages/AdminCertificateEditor";
import PublicationPayment from "@/pages/PublicationPayment";
import ArticleLanding from "@/pages/ArticleLanding";
import IssueLanding from "@/pages/IssueLanding";
import ReviewerLogin from "@/pages/ReviewerLogin";
import ReviewerDashboard from "@/pages/ReviewerDashboard";
import EditorDashboard from "@/pages/EditorDashboard";
import EditorProfile from "@/pages/EditorProfile";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import FinalPaperForm from "@/pages/FinalPaperForm";

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

function ErpRedirect({ to }: { to: string }) {
  useLayoutEffect(() => {
    window.location.href = to;
  }, [to]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
          <div className="max-w-xl text-center space-y-3">
            <h1 className="text-3xl font-bold text-foreground">Scholar India Publishers</h1>
            <p className="text-muted-foreground">
              Preview is ready. Use the site navigation to browse the home page, journals, books, and ERP pages.
            </p>
          </div>
        </div>
      </Route>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/founder" component={FounderProfile} />
      <Route path="/commerce-management" component={CommerceJournal} />
      <Route path="/humanities" component={HumanitiesJournal} />
      <Route path="/social-sciences" component={SocialSciencesJournal} />
      <Route path="/humanities-social-sciences" component={HumanitiesJournal} />
      <Route path="/journals/humanities" component={HumanitiesJournal} />
      <Route path="/journals/commerce" component={CommerceJournal} />
      <Route path="/submit" component={SubmitManuscriptPage} />
      <Route path="/book-publication-info" component={BookPublicationInfo} />
      <Route path="/call-for-books" component={CallForBooks} />
      <Route path="/published-books" component={PublishedBooks} />
      <Route path="/conference-seminars" component={ConferenceSeminars} />
      <Route path="/other-services" component={OtherServices} />
      <Route path="/contact" component={ContactUs} />
      <Route path="/join-reviewer" component={ReviewerApplication} />
      <Route path="/reviewer-search" component={ReviewerSearch} />
      <Route path="/manuscript-track" component={ManuscriptTrack} />
      <Route path="/reviewer-login">
        {() => <ErpRedirect to="/erp/member-login.html" />}
      </Route>
      <Route path="/reviewer-dashboard">
        {() => <ErpRedirect to="/erp/member-dashboard.html" />}
      </Route>
      <Route path="/editor-dashboard">
        {() => <ErpRedirect to="/erp/member-dashboard.html" />}
      </Route>
      <Route path="/editor-profile/:name" component={EditorProfile} />
      <Route path="/admin/login">
        {() => <ErpRedirect to="/erp/admin-login.html" />}
      </Route>
      <Route path="/admin/dashboard">
        {() => <ErpRedirect to="/erp/admin-dashboard.html" />}
      </Route>
      <Route path="/admin/certificate-editor" component={AdminCertificateEditor} />
      <Route path="/payment" component={PublicationPayment} />
      <Route path="/copyright-form" component={FinalPaperForm} />
      <Route path="/final-paper" component={FinalPaperForm} />
      <Route path="/article/:id">
        {(params) => {
          // Check if the ID is an issue (e.g., sjcm-v1i1) or an article (e.g., sjcm-v1i1-001)
          const id = params.id;
          const isArticle = id.split('-').length > 2; // Articles have more dashes (sjcm-v1i1-001)
          
          if (isArticle) {
            return <ArticleLanding />;
          } else {
            return <IssueLanding />;
          }
        }}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ScrollToTop />
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
