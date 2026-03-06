import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface Reviewer {
  id: string;
  name: string;
  email: string;
  role: string;
  journal: string;
  status: string;
  institution: string;
}

export default function AdminReviewersList() {
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReviewers();
  }, []);

  const loadReviewers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reviewers');
      const data = await response.json();
      setReviewers(data.reviewers || []);
    } catch (err: any) {
      setError('Failed to load reviewers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading reviewers...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md flex gap-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        All Reviewers ({reviewers.length})
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Journal</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Institution</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {reviewers.map((reviewer, idx) => (
              <tr
                key={reviewer.id}
                className={`border-b border-gray-200 dark:border-gray-700 ${
                  idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{reviewer.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{reviewer.email}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs font-medium">
                    {reviewer.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{reviewer.journal}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{reviewer.institution}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    reviewer.status === 'Verified' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {reviewer.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {reviewers.length === 0 && (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          No reviewers found
        </div>
      )}
    </div>
  );
}
