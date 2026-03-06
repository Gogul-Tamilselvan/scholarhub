import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface Manuscript {
  id: string;
  manuscriptId: string;
  title: string;
  author: string;
  journal: string;
  submittedDate: string;
  status: string;
  assignedTo?: string;
}

export default function AdminManuscriptsList() {
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadManuscripts();
  }, []);

  const loadManuscripts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/manuscripts');
      const data = await response.json();
      setManuscripts(data.manuscripts || []);
    } catch (err: any) {
      setError('Failed to load manuscripts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading manuscripts...</div>;
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
        All Manuscripts ({manuscripts.length})
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Manuscript ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Title</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Author</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Journal</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Submitted</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {manuscripts.map((manuscript, idx) => (
              <tr
                key={manuscript.id}
                className={`border-b border-gray-200 dark:border-gray-700 ${
                  idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                }`}
              >
                <td className="px-4 py-3 text-sm font-mono text-blue-600 dark:text-blue-400">{manuscript.manuscriptId}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">{manuscript.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{manuscript.author}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{manuscript.journal}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{manuscript.submittedDate}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    manuscript.status === 'Published'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : manuscript.status === 'Rejected'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {manuscript.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {manuscript.assignedTo ? (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs">
                      {manuscript.assignedTo}
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">Not assigned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {manuscripts.length === 0 && (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          No manuscripts found
        </div>
      )}
    </div>
  );
}
