import { useEffect, useState } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { AlertCircle, ExternalLink, FileText } from 'lucide-react';

interface Manuscript {
  id: string;
  manuscriptId: string;
  title: string;
  author: string;
  journal: string;
  submitted_at?: string;
  status: string;
  file_url?: string;
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
      const { data, error: sbError } = await supabase
        .from('manuscripts')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (sbError) throw new Error(sbError.message);
      
      // Map columns if needed
      setManuscripts(data || []);
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
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Document</th>
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
                <td className="px-4 py-3 text-sm font-mono text-blue-600 dark:text-blue-400 font-bold">{manuscript.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">{manuscript.manuscript_title || manuscript.title || 'Untitled'}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{manuscript.author_name || manuscript.author}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate">{manuscript.journal}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {manuscript.submitted_at ? new Date(manuscript.submitted_at).toLocaleDateString() : 'Unknown'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    String(manuscript.status).toLowerCase().includes('publish') || String(manuscript.status).toLowerCase().includes('accept')
                      ? 'bg-green-100 text-green-800'
                      : String(manuscript.status).toLowerCase().includes('reject')
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {manuscript.status || 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {manuscript.file_url ? (
                    <a
                      href={manuscript.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 rounded-lg text-xs font-bold transition-colors"
                    >
                      <FileText size={14} /> Open S3 Link <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs italic">No S3 Link</span>
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
