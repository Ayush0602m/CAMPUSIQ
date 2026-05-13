import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isAuthenticated, removeToken } from '@/lib/auth';
import { ArrowLeft, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/auth';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Check if API key is configured
    checkApiKey();
  }, [navigate]);

  const checkApiKey = async () => {
    try {
      const response = await fetch('/api/settings/openai-status', {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      setHasApiKey(data.configured);
    } catch (error) {
      console.error('Failed to check API key status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      toast.error('OpenAI API keys start with "sk-"');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/settings/openai-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save API key');
      }

      toast.success('OpenAI API key saved successfully!');
      setHasApiKey(true);
      setApiKey('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove your OpenAI API key? You will not be able to ask questions until you add a new key.')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/settings/openai-key', {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove API key');
      }

      toast.success('OpenAI API key removed');
      setHasApiKey(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove API key');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your OpenAI API key and account settings
          </p>
        </div>

        {/* OpenAI API Key Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle>OpenAI API Key</CardTitle>
            </div>
            <CardDescription>
              Your API key is required to generate embeddings and answer questions.
              Get your API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                OpenAI Platform
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {checking ? (
              <div className="text-sm text-muted-foreground">Checking API key status...</div>
            ) : hasApiKey ? (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-500">
                  OpenAI API key is configured. You can ask questions about your documents.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-yellow-500/50 bg-yellow-500/10">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-500">
                  No OpenAI API key configured. Add your API key to start asking questions.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">
                  {hasApiKey ? 'Update API Key' : 'Add API Key'}
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Your API key is stored securely and never shared. It's used only to process your documents and answer questions.
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading || !apiKey.trim()}>
                  {loading ? 'Saving...' : hasApiKey ? 'Update Key' : 'Save Key'}
                </Button>

                {hasApiKey && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleRemove}
                    disabled={loading}
                  >
                    Remove Key
                  </Button>
                )}
              </div>
            </form>

            <div className="pt-4 border-t border-border">
              <h4 className="font-medium mb-2">How to get an API key:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI Platform</a></li>
                <li>Sign in or create an account</li>
                <li>Click "Create new secret key"</li>
                <li>Copy the key and paste it above</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About API Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong>Privacy:</strong> Your API key is stored securely on the server and is never exposed to the client or shared with anyone.
            </p>
            <p>
              <strong>Usage:</strong> The API key is used to generate embeddings for your documents and to answer your questions using GPT-4.
            </p>
            <p>
              <strong>Costs:</strong> You will be charged by OpenAI based on your usage. Check{' '}
              <a href="https://openai.com/pricing" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                OpenAI's pricing
              </a>{' '}
              for current rates.
            </p>
            <p>
              <strong>Security:</strong> Keep your API key secure. If you believe it has been compromised, remove it here and generate a new one on the OpenAI platform.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
