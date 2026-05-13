import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getAuthHeaders, getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload, Trash2, FileText, Key, CheckCircle2, AlertCircle,
  LogOut, GraduationCap, RefreshCw, BookOpen, ShieldCheck,
  Sparkles, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { DOC_CATEGORIES, type DocCategory } from '@/lib/categories';

interface Doc {
  id: string;
  title: string;
  filename: string;
  pageCount: number;
  status: 'processing' | 'ready' | 'error';
  category: DocCategory;
  uploadedAt: string;
  errorMessage?: string;
}

interface AIStatus {
  provider: 'openai' | 'gemini';
  openai: { configured: boolean; masked: string | null };
  gemini: { configured: boolean; masked: string | null };
}

export default function AdminPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [docs, setDocs] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<DocCategory>('General');
  const [loadingDocs, setLoadingDocs] = useState(true);

  // AI config state
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login'); return; }
    const user = getUser();
    if (!user?.isAdmin) { navigate('/dashboard'); return; }

    fetchDocs();
    fetchAIStatus();
    const interval = setInterval(fetchDocs, 4000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/admin/documents', { headers: getAuthHeaders() });
      if (res.status === 403) { navigate('/dashboard'); return; }
      const data = await res.json();
      setDocs(data.documents ?? []);
    } catch { /* silent */ } finally {
      setLoadingDocs(false);
    }
  };

  const fetchAIStatus = async () => {
    try {
      const res = await fetch('/api/admin/openai-key', { headers: getAuthHeaders() });
      const data: AIStatus = await res.json();
      setAiStatus(data);
    } catch { /* silent */ }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('Only PDF files are supported'); return; }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('PDF must be under 5MB. Split or compress larger files first.');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('category', category);

    try {
      const res = await fetch('/api/admin/documents/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`"${data.title}" uploaded — processing...`);
      fetchDocs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}" from the knowledge base?`)) return;
    try {
      const res = await fetch('/api/admin/documents/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Document deleted');
      fetchDocs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleSaveOpenAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openaiKey.startsWith('sk-')) { toast.error('OpenAI keys must start with "sk-"'); return; }
    setSavingKey(true);
    try {
      const res = await fetch('/api/admin/openai-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ apiKey: openaiKey, provider: 'openai' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('OpenAI key saved and set as active provider');
      setOpenaiKey('');
      fetchAIStatus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save key');
    } finally {
      setSavingKey(false);
    }
  };

  const handleSaveGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiKey.trim()) { toast.error('Please enter a Gemini API key'); return; }
    setSavingKey(true);
    try {
      const res = await fetch('/api/admin/openai-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ apiKey: geminiKey, provider: 'gemini' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Gemini key saved and set as active provider');
      setGeminiKey('');
      fetchAIStatus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save key');
    } finally {
      setSavingKey(false);
    }
  };

  const handleSwitchProvider = async (provider: 'openai' | 'gemini') => {
    if (provider === 'openai' && !aiStatus?.openai.configured) {
      toast.error('Add an OpenAI key first');
      return;
    }
    if (provider === 'gemini' && !aiStatus?.gemini.configured) {
      toast.error('Add a Gemini key first');
      return;
    }
    try {
      // Switch by re-posting the existing key with the new provider flag
      const res = await fetch('/api/admin/ai-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Switched to ${provider === 'openai' ? 'OpenAI' : 'Gemini'}`);
      fetchAIStatus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to switch provider');
    }
  };

  const handleRemoveKey = async (provider: 'openai' | 'gemini') => {
    if (!confirm(`Remove the ${provider === 'openai' ? 'OpenAI' : 'Gemini'} API key?`)) return;
    try {
      await fetch('/api/admin/openai-key', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ provider }),
      });
      toast.success('Key removed');
      fetchAIStatus();
    } catch { toast.error('Failed to remove key'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const readyDocs = docs.filter((d) => d.status === 'ready');
  const processingDocs = docs.filter((d) => d.status === 'processing');
  const categoryGroups = DOC_CATEGORIES.map((cat) => ({
    cat,
    count: readyDocs.filter((d) => d.category === cat).length,
  })).filter((g) => g.count > 0);

  const anyKeyConfigured = aiStatus?.openai.configured || aiStatus?.gemini.configured;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CampusIQ</h1>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ShieldCheck className="h-3 w-3" />
                Admin Panel
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <BookOpen className="h-4 w-4 mr-2" />
              Student View
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Docs', value: docs.length, icon: FileText, color: 'text-blue-400' },
            { label: 'Ready', value: readyDocs.length, icon: CheckCircle2, color: 'text-green-400' },
            { label: 'Processing', value: processingDocs.length, icon: RefreshCw, color: 'text-yellow-400' },
            { label: 'Categories', value: categoryGroups.length, icon: BookOpen, color: 'text-purple-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-5 pb-4 flex items-center gap-3">
                <Icon className={`h-7 w-7 ${color} flex-shrink-0`} />
                <div>
                  <p className="text-2xl font-bold leading-none">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Provider Config */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle>AI Provider</CardTitle>
            </div>
            <CardDescription>
              Configure OpenAI or Google Gemini. The active provider is used for all student queries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Active provider indicator */}
            {aiStatus && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                <div className={`w-2 h-2 rounded-full ${anyKeyConfigured ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm">
                  {anyKeyConfigured
                    ? <>Active: <strong className="text-foreground capitalize">{aiStatus.provider === 'openai' ? 'OpenAI GPT-4' : 'Google Gemini 2.5 Flash'}</strong></>
                    : <span className="text-yellow-400">No AI provider configured — students cannot ask questions</span>
                  }
                </span>
              </div>
            )}

            <Tabs defaultValue="openai">
              <TabsList className="w-full">
                <TabsTrigger value="openai" className="flex-1 gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  OpenAI
                  {aiStatus?.openai.configured && <span className="w-1.5 h-1.5 rounded-full bg-green-400 ml-1" />}
                </TabsTrigger>
                <TabsTrigger value="gemini" className="flex-1 gap-2">
                  <Zap className="h-3.5 w-3.5" />
                  Google Gemini
                  {aiStatus?.gemini.configured && <span className="w-1.5 h-1.5 rounded-full bg-green-400 ml-1" />}
                </TabsTrigger>
              </TabsList>

              {/* OpenAI Tab */}
              <TabsContent value="openai" className="space-y-3 pt-3">
                {aiStatus?.openai.configured ? (
                  <Alert className="border-green-500/30 bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-400 flex items-center justify-between">
                      <span>Key configured — <code className="font-mono text-xs">{aiStatus.openai.masked}</code></span>
                      {aiStatus.provider !== 'openai' && (
                        <Button size="sm" variant="outline" className="h-7 text-xs ml-4" onClick={() => handleSwitchProvider('openai')}>
                          Set as Active
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-yellow-500/30 bg-yellow-500/10">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-400 text-sm">
                      No OpenAI key. Get yours at{' '}
                      <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="underline">platform.openai.com</a>
                    </AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSaveOpenAI} className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={savingKey || !openaiKey.trim()}>
                    {savingKey ? 'Saving...' : aiStatus?.openai.configured ? 'Update' : 'Save & Activate'}
                  </Button>
                  {aiStatus?.openai.configured && (
                    <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveKey('openai')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </form>
              </TabsContent>

              {/* Gemini Tab */}
              <TabsContent value="gemini" className="space-y-3 pt-3">
                {aiStatus?.gemini.configured ? (
                  <Alert className="border-green-500/30 bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-400 flex items-center justify-between">
                      <span>Key configured — <code className="font-mono text-xs">{aiStatus.gemini.masked}</code></span>
                      {aiStatus.provider !== 'gemini' && (
                        <Button size="sm" variant="outline" className="h-7 text-xs ml-4" onClick={() => handleSwitchProvider('gemini')}>
                          Set as Active
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-yellow-500/30 bg-yellow-500/10">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-400 text-sm">
                      No Gemini key. Get yours at{' '}
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline">aistudio.google.com</a>
                    </AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSaveGemini} className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="AIza..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={savingKey || !geminiKey.trim()}>
                    {savingKey ? 'Saving...' : aiStatus?.gemini.configured ? 'Update' : 'Save & Activate'}
                  </Button>
                  {aiStatus?.gemini.configured && (
                    <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveKey('gemini')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </form>
                <p className="text-xs text-muted-foreground">
                  Uses <strong>Gemini 2.5 Flash</strong> for chat and <strong>gemini-embedding-001</strong> for document indexing.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Upload Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <CardTitle>Upload Documents</CardTitle>
            </div>
            <CardDescription>
              Upload PDFs to the knowledge base. Students can ask questions about any uploaded document.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end flex-wrap">
              <div className="space-y-1.5 flex-1 min-w-[180px]">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as DocCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleUpload} />
                <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="h-10">
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Choose PDF'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Knowledge Base</CardTitle>
                <Badge variant="secondary">{docs.length} docs</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchDocs}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDocs ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Loading...</p>
            ) : docs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No documents yet</p>
                <p className="text-sm mt-1">Upload a PDF to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate text-sm">{doc.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <Badge variant="outline" className="text-xs py-0 h-4">{doc.category}</Badge>
                          {doc.pageCount > 0 && <span>{doc.pageCount}p</span>}
                          <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                        {doc.status === 'error' && (
                          <p className="text-xs text-destructive mt-0.5">{doc.errorMessage}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <Badge
                        variant={doc.status === 'ready' ? 'default' : doc.status === 'error' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {doc.status === 'processing' && <RefreshCw className="h-2.5 w-2.5 mr-1 animate-spin" />}
                        {doc.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id, doc.title)}
                        className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin hint */}
        <Card className="border-dashed border-border/50">
          <CardContent className="pt-5 pb-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Creating admin accounts:</strong>{' '}
              On the register page, enter the admin code{' '}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">STUDYRAG_ADMIN</code>{' '}
              to create a coordinator account. Students leave this blank.
            </p>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
