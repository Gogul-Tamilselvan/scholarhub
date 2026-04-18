import { Search, RefreshCw, Loader2, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ReviewApprovalsProps {
  allReviews: any[];
  loadingReviews: boolean;
  fetchReviews: (force?: boolean) => void;
  reviewsSearchTerm: string;
  setReviewsSearchTerm: (term: string) => void;
  reviewsLimit: number;
  setReviewsLimit: (limit: (prev: number) => number) => void;
}

export const ReviewApprovals = ({
  allReviews,
  loadingReviews,
  fetchReviews,
  reviewsSearchTerm,
  setReviewsSearchTerm,
  reviewsLimit,
  setReviewsLimit
}: ReviewApprovalsProps) => {
  const filteredReviews = allReviews.filter(r => {
    if (reviewsSearchTerm) {
      const term = reviewsSearchTerm.toLowerCase();
      if (!`${r.manuscript_title || ''} ${r.reviewer_full_name || ''} ${r.id || ''}`.toLowerCase().includes(term)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 print:hidden">
        <div className="pl-2">
          <h2 className="text-xl font-bold font-sans text-slate-800 tracking-tight">Review Approvals</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Submitted reviews awaiting admin decision. You can approve or reject each review with a note.</p>
        </div>
        <div className="flex items-center gap-3 pr-2">
          <Button onClick={() => fetchReviews(true)} disabled={loadingReviews} variant="outline" size="sm" className="bg-white gap-2 font-bold text-[11px] h-9 px-4 border-slate-200 rounded-md shadow-sm text-blue-700 bg-blue-50 border-blue-100">
            <RefreshCw size={14} className={loadingReviews ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-3 border-b border-slate-100 px-6 bg-slate-50/30 print:hidden">
          <div className="relative w-full max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              value={reviewsSearchTerm}
              onChange={(e) => setReviewsSearchTerm(e.target.value)}
              placeholder="Search by manuscript or reviewer..." 
              className="pl-9 h-9 text-xs border-slate-200 focus-visible:ring-blue-500 rounded-lg shadow-sm w-full bg-white"
            />
          </div>
          <div className="text-[11px] font-bold text-slate-500 whitespace-nowrap">{filteredReviews.length} pending review(s)</div>
        </div>

        <div className="grid grid-cols-12 gap-x-4 px-6 py-4 bg-slate-50/80 border-b border-slate-100 italic">
          <div className="col-span-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ASSIGNED AT</div>
          <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">MANUSCRIPT</div>
          <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">REVIEWER</div>
          <div className="col-span-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">RECOMMENDATION</div>
          <div className="col-span-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">MARKS</div>
          <div className="col-span-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">SUBMITTED</div>
          <div className="col-span-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">STATUS</div>
          <div className="col-span-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">ACTIONS</div>
        </div>

        <div className="divide-y divide-slate-100 bg-[#FFFFF9]">
          {loadingReviews && allReviews.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium text-sm">No submitted reviews found.</div>
          ) : (
            filteredReviews.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-x-4 px-6 py-5 hover:bg-slate-50 items-center">
                <div className="col-span-1 text-[11px] font-bold text-slate-600">
                  {r.assigned_at ? new Date(r.assigned_at).toLocaleDateString('en-GB') : '—'}
                </div>
                <div className="col-span-3 space-y-1">
                  <h4 className="text-[12px] font-bold text-slate-800 leading-snug">{r.manuscript_title}</h4>
                  <div className="text-[10px] font-black text-slate-400 tracking-wider uppercase">{r.manuscript_id}</div>
                </div>
                <div className="col-span-3 space-y-1">
                  <h4 className="text-[12px] font-bold text-slate-800 leading-snug">{r.reviewer_full_name}</h4>
                  <div className="text-[10px] font-black text-slate-400 tracking-wider uppercase">{r.reviewer_id}</div>
                </div>
                <div className="col-span-1 text-[11px] font-medium text-slate-700">
                  {r.recommendation || '—'}
                </div>
                <div className="col-span-1 text-center">
                  <span className="text-[13px] font-extrabold text-emerald-600 tracking-tight">{r.overall_marks || '—'}</span>
                  <span className="text-[9px] font-bold text-slate-400 ml-0.5">/10</span>
                </div>
                <div className="col-span-1 text-center text-[11px] font-medium text-slate-600">
                  —
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <Badge variant="outline" className="border-none bg-emerald-100 text-emerald-600 text-[9px] font-black px-3 py-1 rounded-full uppercase">
                    {r.status || 'Completed'}
                  </Badge>
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  <Button className="h-8 bg-blue-800 hover:bg-blue-700 text-[10px] font-black uppercase px-4 rounded-lg text-white shadow-md flex items-center gap-2">
                    <FileSearch size={14} /> Review
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {allReviews.length >= reviewsLimit && (
          <div className="p-4 bg-white border-t border-slate-100 flex justify-center print:hidden">
            <Button onClick={() => setReviewsLimit(prev => prev + 10)} disabled={loadingReviews} variant="outline" className="text-xs font-extra-bold text-slate-600 border-slate-200 bg-white hover:bg-slate-50 rounded-xl h-10 px-8 shadow-sm transition-all hover:border-blue-300">
              Load More Reviews
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
