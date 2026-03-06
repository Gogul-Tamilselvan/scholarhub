import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface Reviewer {
  id: string;
  name: string;
  email: string;
}

interface Manuscript {
  id: string;
  manuscriptId: string;
  title: string;
  author: string;
}

interface AdminAssignmentFormProps {
  onAssignmentSuccess?: () => void;
}

export default function AdminAssignmentForm({ onAssignmentSuccess }: AdminAssignmentFormProps) {
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [selectedManuscript, setSelectedManuscript] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reviewersRes, manuscriptsRes] = await Promise.all([
        fetch('/api/admin/reviewers-for-assignment', { credentials: 'include' }),
        fetch('/api/admin/manuscripts-for-assignment', { credentials: 'include' })
      ]);

      const reviewersData = await reviewersRes.json();
      const manuscriptsData = await manuscriptsRes.json();

      setReviewers(reviewersData.reviewers || []);
      setManuscripts(manuscriptsData.manuscripts || []);
    } catch (err: any) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReviewer || !selectedManuscript) {
      setError('Please select both a reviewer and a manuscript');
      return;
    }

    if (!dueDate) {
      setError('Please set a due date for review');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/assign-manuscript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reviewerId: selectedReviewer,
          manuscriptId: selectedManuscript,
          notes: notes,
          dueDate: dueDate
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Manuscript successfully assigned to reviewer!`);
        setSelectedReviewer('');
        setSelectedManuscript('');
        setNotes('');
        setDueDate('');
        
        // Reload data after assignment
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadData();
        onAssignmentSuccess?.();
      } else {
        setError(data.message || 'Assignment failed');
      }
    } catch (err: any) {
      setError('Error assigning manuscript: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading form data...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Manuscript to Reviewer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAssign} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md flex gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-md flex gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Reviewer *
            </label>
            <select
              value={selectedReviewer}
              onChange={(e) => setSelectedReviewer(e.target.value)}
              disabled={submitting}
              data-testid="select-reviewer"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">-- Choose a reviewer --</option>
              {reviewers.map((reviewer) => (
                <option key={reviewer.id} value={reviewer.id}>
                  {reviewer.name} ({reviewer.email})
                </option>
              ))}
            </select>
            {reviewers.length === 0 && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">No reviewers available</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Manuscript *
            </label>
            <select
              value={selectedManuscript}
              onChange={(e) => setSelectedManuscript(e.target.value)}
              disabled={submitting}
              data-testid="select-manuscript"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">-- Choose a manuscript --</option>
              {manuscripts.map((manuscript) => (
                <option key={manuscript.id} value={manuscript.id}>
                  {manuscript.manuscriptId} - {manuscript.title.substring(0, 50)}...
                </option>
              ))}
            </select>
            {manuscripts.length === 0 && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">No manuscripts available</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Due Date *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={submitting}
              required
              data-testid="input-due-date"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
              placeholder="e.g., Priority review, specific focus areas..."
              data-testid="input-notes"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting || !selectedReviewer || !selectedManuscript}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="button-assign"
          >
            {submitting ? 'Assigning...' : 'Assign Manuscript'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
