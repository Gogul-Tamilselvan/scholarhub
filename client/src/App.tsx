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
import DynamicJournalPage from "@/pages/DynamicJournalPage";
import AllJournalsPage from "@/pages/AllJournalsPage";
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
import SpecialIssueArticleLanding from "@/pages/SpecialIssueArticleLanding";
import IssueLanding from "@/pages/IssueLanding";
import ReviewerLogin from "@/pages/ReviewerLogin";
import ReviewerDashboard from "@/pages/ReviewerDashboard";
import EditorDashboard from "@/pages/EditorDashboard";
import EditorProfile from "@/pages/EditorProfile";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import FinalPaperForm from "@/pages/FinalPaperForm";
import CertificateVerification from "@/pages/CertificateVerification";

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/founder" component={FounderProfile} />
      <Route path="/commerce-management" component={CommerceJournal} />
      <Route path="/humanities" component={HumanitiesJournal} />
      <Route path="/social-sciences" component={SocialSciencesJournal} />
      <Route path="/humanities-social-sciences" component={HumanitiesJournal} />
      <Route path="/journals" component={AllJournalsPage} />
      <Route path="/journals/humanities" component={HumanitiesJournal} />
      <Route path="/journals/commerce" component={CommerceJournal} />
      <Route path="/journal/:slug" component={DynamicJournalPage} />
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
      <Route path="/reviewer-login" component={ReviewerLogin} />
      <Route path="/reviewer-dashboard" component={ReviewerDashboard} />
      <Route path="/editor-dashboard" component={EditorDashboard} />
      <Route path="/editor-profile/:name" component={EditorProfile} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/certificate-editor" component={AdminCertificateEditor} />
      <Route path="/payment" component={PublicationPayment} />
      <Route path="/copyright-form" component={FinalPaperForm} />
      <Route path="/final-paper" component={FinalPaperForm} />
      <Route path="/certificate-verification" component={CertificateVerification} />
      <Route path="/si-article/:id" component={SpecialIssueArticleLanding} />
      <Route path="/article/:id">
        {(params) => {
          // Check if the ID is an issue (e.g., sjcm-v1i1) or an article (e.g., sjcm-v1i1-001)
          const id = params.id;
          // Known issue prefixes: sjcm-v1i1, sjcm-v2i1, sjhss-v1i1, etc.
          // Articles have 3+ dash-separated parts OR are DB-based (always go to ArticleLanding which has DB fallback)
          const parts = id.split('-');
          const looksLikeIssue = parts.length === 2 && /^v\d+i\d+$/.test(parts[1]);
          
          if (looksLikeIssue) {
            return <IssueLanding />;
          } else {
            return <ArticleLanding />;
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
