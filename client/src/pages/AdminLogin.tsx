import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Lock } from 'lucide-react';
import Header from '@/components/Header';
import SEO from '@/components/SEO';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store admin session in localStorage
        localStorage.setItem('adminSession', JSON.stringify({
          email: data.email,
          token: data.token,
          loginTime: new Date().toISOString()
        }));
        setLocation('/admin/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setError('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#213361]">
      <SEO
        title="Admin Login - Scholar India Publishers"
        description="Administrator access to manage reviewers and manuscript assignments."
      />
      <Header />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md mx-4 shadow-2xl">
          <CardHeader className="bg-[#213361] text-white">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-6 h-6" />
              <CardTitle className="text-2xl">Admin Portal</CardTitle>
            </div>
            <p className="text-blue-100 text-sm">Reviewer & Manuscript Management</p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md flex gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  data-testid="input-email"
                  className="border-gray-300 dark:border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  data-testid="input-password"
                  className="border-gray-300 dark:border-gray-600"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-login"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                This is a restricted administrative area. Unauthorized access is prohibited.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
