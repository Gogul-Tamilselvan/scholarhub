import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Save, AlertCircle } from 'lucide-react';

interface CertificateTemplate {
  headerLine1: string;
  headerLine2: string;
  headerLine3: string;
  certificateTitle: string;
  bodyText: string;
}

export default function AdminCertificateEditor() {
  const [template, setTemplate] = useState<CertificateTemplate>({
    headerLine1: 'SCHOLAR INDIA PUBLISHERS',
    headerLine2: 'An Academic Publishing Organization',
    headerLine3: 'Dedicated to Excellence in Scholarly Communication',
    certificateTitle: 'Certificate of Reviewer',
    bodyText: 'has actively served as a peer reviewer and demonstrated exceptional expertise and commitment to academic excellence. This reviewer has contributed significantly to the quality and integrity of academic publishing through meticulous manuscript evaluation and constructive feedback.'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    try {
      const response = await fetch('/api/certificate-template');
      const data = await response.json();
      if (data.template) {
        setTemplate(data.template);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading template:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/certificate-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template })
      });

      if (!response.ok) throw new Error('Failed to save template');

      setMessage('✓ Certificate template saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('✗ Error saving template: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-300 mb-2">
          Admin: Certificate Template Editor
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Customize the reviewer certificate template. Changes apply to all generated certificates.
        </p>

        {message && (
          <div className={`p-4 rounded-md mb-6 ${message.startsWith('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Certificate Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-3 text-blue-900">Header Lines</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium block mb-2">Header Line 1</label>
                  <Input
                    value={template.headerLine1}
                    onChange={(e) => setTemplate({ ...template, headerLine1: e.target.value })}
                    placeholder="e.g., SCHOLAR INDIA PUBLISHERS"
                    data-testid="input-header-line1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Header Line 2</label>
                  <Input
                    value={template.headerLine2}
                    onChange={(e) => setTemplate({ ...template, headerLine2: e.target.value })}
                    placeholder="e.g., An Academic Publishing Organization"
                    data-testid="input-header-line2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Header Line 3</label>
                  <Input
                    value={template.headerLine3}
                    onChange={(e) => setTemplate({ ...template, headerLine3: e.target.value })}
                    placeholder="e.g., Dedicated to Excellence in Scholarly Communication"
                    data-testid="input-header-line3"
                  />
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="font-semibold mb-3 text-blue-900">Certificate Content</h3>
              <div>
                <label className="text-sm font-medium block mb-2">Certificate Title</label>
                <Input
                  value={template.certificateTitle}
                  onChange={(e) => setTemplate({ ...template, certificateTitle: e.target.value })}
                  placeholder="e.g., Certificate of Reviewer"
                  data-testid="input-certificate-title"
                />
              </div>
              <div className="mt-3">
                <label className="text-sm font-medium block mb-2">Body Text</label>
                <Textarea
                  value={template.bodyText}
                  onChange={(e) => setTemplate({ ...template, bodyText: e.target.value })}
                  rows={5}
                  placeholder="Body text describing the reviewer's role..."
                  data-testid="textarea-body-text"
                />
                <p className="text-xs text-gray-500 mt-1">Reviewer ID, Name, and other details will be automatically inserted before this text.</p>
              </div>
            </div>


            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 mt-6"
              data-testid="button-save-template"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Template'}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Save your changes here. The updated template will be used for all new certificates generated by reviewers.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
