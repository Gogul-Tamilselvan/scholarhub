import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ArrowRight, CheckCircle, Award, ChevronRight, Briefcase, Globe } from 'lucide-react';
import Header from '@/components/Header';
import Footer from "@/components/Footer";
import SEO from '@/components/SEO';

interface Reviewer {
  reviewerId: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  designation: string;
  journal: string;
  nationality: string;
  status: string;
  submittedDate: string;
  areaOfInterest: string;
  institution: string;
  state: string;
  district: string;
  pinNumber: string;
  orcid: string;
  googleScholar: string;
  messageToEditor: string;
  profilePdfLink: string;
}

export default function ReviewerSearch() {
  const [activeTab, setActiveTab] = useState<'mobile' | 'id'>('mobile');
  const [searchValue, setSearchValue] = useState('');
  const [reviewer, setReviewer] = useState<Reviewer | null>(null);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [showSelection, setShowSelection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewerIdSearch, setReviewerIdSearch] = useState('');
  const [idSearchLoading, setIdSearchLoading] = useState(false);
  const [idSearchError, setIdSearchError] = useState('');
  const [certificates, setCertificates] = useState<any[]>([]);
  const [fetchingCertificates, setFetchingCertificates] = useState(false);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError('Please enter your mobile number');
      return;
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(searchValue.replace(/\s|-/g, ''))) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');
    setReviewer(null);
    setReviewers([]);
    setShowSelection(false);

    try {
      const { data, error: sbError } = await supabase
        .from('reviewers')
        .select('*')
        .eq('mobile', searchValue.replace(/\s|-/g, ''));

      if (sbError) throw sbError;

      if (data && data.length > 0) {
        const reviewerList = data.map((r: any) => ({
          reviewerId: r.id,
          name: `${r.first_name} ${r.last_name}`,
          email: r.email,
          mobile: r.mobile,
          role: r.role,
          designation: r.designation,
          journal: r.journal,
          nationality: r.nationality || '',
          status: r.status,
          submittedDate: r.submitted_date,
          areaOfInterest: r.area_of_interest,
          institution: r.institution,
          state: r.state,
          district: r.district,
          pinNumber: r.pin_number,
          orcid: r.orcid,
          googleScholar: r.google_scholar,
          messageToEditor: r.message_to_editor,
          profilePdfLink: r.profile_pdf_link
        }));
        
        if (reviewerList.length === 1) {
          setReviewer(reviewerList[0]);
        } else {
          setReviewers(reviewerList);
          setShowSelection(true);
        }
      } else {
        setError('Reviewer not found. Please check your email or mobile number.');
      }
    } catch (err: any) {
      setError('Error searching reviewer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificatesData = async (rid: string) => {
    setFetchingCertificates(true);
    try {
      const { data, error } = await supabase
        .from('reviewer_certificates')
        .select('*')
        .eq('reviewer_id', rid)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCertificates(data || []);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setFetchingCertificates(false);
    }
  };

  const handleSelectReviewer = (selectedReviewer: Reviewer) => {
    setReviewer(selectedReviewer);
    setShowSelection(false);
    fetchCertificatesData(selectedReviewer.reviewerId);
  };

  const handleBackToSelection = () => {
    setReviewer(null);
    setShowSelection(true);
  };

  const handleSearchByReviewerId = async () => {
    if (!reviewerIdSearch.trim()) {
      setIdSearchError('Please enter your Reviewer ID');
      return;
    }

    setIdSearchLoading(true);
    setIdSearchError('');
    setReviewer(null);
    setReviewers([]);
    setShowSelection(false);

    try {
      const { data, error: sbError } = await supabase
        .from('reviewers')
        .select('*')
        .eq('id', reviewerIdSearch.trim())
        .maybeSingle();

      if (sbError) throw sbError;

      if (data) {
        setReviewer({
          reviewerId: data.id,
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          mobile: data.mobile,
          role: data.role,
          designation: data.designation,
          journal: data.journal,
          nationality: data.nationality || '',
          status: data.status,
          submittedDate: data.submitted_date,
          areaOfInterest: data.area_of_interest,
          institution: data.institution,
          state: data.state,
          district: data.district,
          pinNumber: data.pin_number,
          orcid: data.orcid,
          googleScholar: data.google_scholar,
          messageToEditor: data.message_to_editor,
          profilePdfLink: data.profile_pdf_link
        });
      } else {
        setIdSearchError('Reviewer ID not found. Please check and try again, or apply for reviewer if you haven\'t already.');
      }
    } catch (err: any) {
      setIdSearchError('Error searching reviewer: ' + err.message);
    } finally {
      setIdSearchLoading(false);
    }
  };

  // Call certificates fetch when single reviewer is found directly via ID or mobile
  useEffect(() => {
    if (reviewer) {
      fetchCertificatesData(reviewer.reviewerId);
    }
  }, [reviewer?.reviewerId]);

  const getStatusStyle = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'active') {
      return 'bg-green-600 text-white';
    } else if (lowerStatus === 'rejected') {
      return 'bg-red-600 text-white';
    } else if (lowerStatus === 'under process') {
      return 'bg-amber-600 text-white';
    }
    return 'bg-blue-600 text-white';
  };

  const getRoleBadgeStyle = (role: string) => {
    return role === 'Editorial Board Member'
      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-700 dark:to-emerald-600'
      : 'bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600';
  };

  const getRoleIcon = (role: string) => {
    return role === 'Editorial Board Member' ? <Award className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Editor & Reviewer Verification Portal - Scholar India Publishers"
        description="Verify your profile as an Editor or Reviewer at Scholar India Publishers. Search and access your verified credentials."
      />
      <Header />
      
      <style>{`
        .cert-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cert-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 dark:text-blue-300 mb-4">
            Editor & Reviewer Verification Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Search and verify your profile as an Editor or Reviewer
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('mobile')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'mobile'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            data-testid="tab-mobile"
          >
            Search by Mobile
          </button>
          <button
            onClick={() => setActiveTab('id')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'id'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            data-testid="tab-id"
          >
            Search by Reviewer ID
          </button>
        </div>

        {activeTab === 'mobile' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="Enter your mobile number..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                data-testid="input-search"
              />
              <Button
                onClick={handleSearch}
                disabled={loading}
                data-testid="button-search"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md" data-testid="text-error">
                <p className="mb-4">{error}</p>
                {error.includes('not found') && (
                  <Link href="/join-reviewer">
                    <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-join-reviewer">
                      Join us as Reviewer
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {activeTab === 'id' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search by Reviewer ID</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter your Reviewer ID (e.g., REV00001)..."
                value={reviewerIdSearch}
                onChange={(e) => setReviewerIdSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchByReviewerId()}
                data-testid="input-reviewer-id"
              />
              <Button
                onClick={handleSearchByReviewerId}
                disabled={idSearchLoading}
                data-testid="button-search-id"
              >
                <Search className="w-4 h-4 mr-2" />
                {idSearchLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {idSearchError && (
              <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md" data-testid="text-id-search-error">
                <p>{idSearchError}</p>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Multiple Reviewer Selection - Grouped by Role and Journal */}
        {showSelection && reviewers.length > 0 && (
          <Card className="mb-8 border-2 border-blue-300 dark:border-blue-700 overflow-hidden">
            <CardHeader className="bg-[#213361] text-white">
              <CardTitle className="text-white">
                Your Profiles ({reviewers.length} found)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We found multiple profiles associated with your email. Select the one you want to view:
              </p>
              <div className="space-y-3">
                {reviewers.map((rev, index) => (
                  <button
                    key={`${rev.role}-${rev.journal}-${index}`}
                    onClick={() => handleSelectReviewer(rev)}
                    className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
                    data-testid={`button-select-reviewer-${index}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold text-white ${getRoleBadgeStyle(rev.role)}`}>
                            {getRoleIcon(rev.role)}
                            {rev.role}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                            <Globe className="w-4 h-4" />
                            {rev.journal.replace('Scholar Journal of ', '')}
                          </span>
                          <span className={`px-2 py-1 text-xs font-bold rounded ${getStatusStyle(rev.status)}`}>
                            {rev.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Reviewer ID: <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{rev.reviewerId}</span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Designation: <span className="font-semibold text-gray-900 dark:text-gray-100">{rev.designation}</span>
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Single Reviewer Details - Professional Display */}
        {reviewer && (
          <Card className="border-2 border-blue-200 dark:border-blue-700">
            <CardContent className="pt-8">
              {/* 5 Key Fields Display */}
              <div className="space-y-6">
                {/* Row 1: Role and Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                  {/* Role */}
                  <div className="text-center" data-testid="text-reviewer-role">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-4">Position</p>
                    <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white ${getRoleBadgeStyle(reviewer.role)}`}>
                      {getRoleIcon(reviewer.role)}
                      <span>{reviewer.role}</span>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="text-center" data-testid="text-reviewer-name">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-4">Name</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{reviewer.name}</p>
                  </div>
                </div>

                {/* Row 2: Reviewer ID, Journal, Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Reviewer ID */}
                  <div className="text-center" data-testid="text-reviewer-id">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-4">Reviewer ID</p>
                    <p className="text-xl font-bold font-mono text-blue-900 dark:text-blue-300">{reviewer.reviewerId}</p>
                  </div>

                  {/* Journal */}
                  <div className="text-center" data-testid="text-reviewer-journal">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-4">Journal</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{reviewer.journal.replace('Scholar Journal of ', '')}</p>
                  </div>

                  {/* Status */}
                  <div className="text-center" data-testid="text-reviewer-status">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-4">Status</p>
                    <p className={`inline-block text-base font-bold px-4 py-2 rounded-lg ${getStatusStyle(reviewer.status)}`}>
                      {reviewer.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Back to List Button */}
              {reviewers.length > 1 && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                  <Button
                    variant="outline"
                    onClick={handleBackToSelection}
                    data-testid="button-back-to-selection"
                  >
                    Back to List
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Certificates Section */}
        {reviewer && (
          <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4 py-1">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Your Certificates</h2>
                <p className="text-sm text-slate-500">Official recognition for your contributions</p>
              </div>
              <Award className="w-6 h-6 text-blue-600 ml-auto" />
            </div>

            {fetchingCertificates ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert) => (
                  <Card key={cert.id} className="cert-card border-slate-200 dark:border-slate-800 overflow-hidden group">
                    <div className="h-2 bg-blue-600 w-full" />
                    <CardHeader className="pb-2">
                       <div className="flex justify-between items-start">
                         <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border-blue-200 text-blue-700">
                           {cert.cert_no}
                         </Badge>
                         <span className="text-[10px] text-slate-400">
                           {new Date(cert.created_at).toLocaleDateString('en-GB')}
                         </span>
                       </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Journal</h4>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{cert.journal_name}</p>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Manuscript</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic line-clamp-2">"{cert.manuscript_title}"</p>
                      </div>
                      <Button 
                        asChild
                        className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs h-10 gap-2 mt-2"
                      >
                        <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer">
                          <Download size={14} />
                          Download Certificate
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Certificates Found</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  If you have recently completed a review, your certificate will appear here once issued by the administrator.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    <Footer />
    </div>
  );
}
