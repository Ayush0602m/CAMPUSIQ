import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getAuthHeaders } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  GraduationCap, LogOut, Send, BookOpen, AlertCircle,
  User, Bot, ChevronDown, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface Source {
  documentId: string;
  title: string;
  chunkIndex: number;
  text: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: Date;
}

interface KnowledgeBase {
  totalDocuments: number;
  categories: string[];
  documents: Array<{ id: string; title: string; category: string; pageCount: number }>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [kb, setKb] = useState<KnowledgeBase | null>(null);
  const [showDocs, setShowDocs] = useState(false);
  const [user, setUser] = useState<{ name: string; isAdmin: boolean } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login'); return; }

    // Load user info
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }

    // Load knowledge base info
    fetch('/api/knowledge', { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then(setKb)
      .catch(() => {});

    // Load chat history
    fetch('/api/chat/history', { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        if (data.history?.length) setMessages(data.history.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      })
      .catch(() => {});
  }, [navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to get answer');

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.answer,
          sources: data.sources,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="font-bold text-lg">StudyRAG</span>
              {kb && (
                <button
                  onClick={() => setShowDocs(!showDocs)}
                  className="ml-3 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <BookOpen className="h-3 w-3" />
                  {kb.totalDocuments} doc{kb.totalDocuments !== 1 ? 's' : ''} in knowledge base
                  <ChevronDown className={`h-3 w-3 transition-transform ${showDocs ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user?.isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                <ShieldCheck className="h-4 w-4 mr-1.5" />
                Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>

        {/* Knowledge base doc list dropdown */}
        {showDocs && kb && kb.documents.length > 0 && (
          <div className="border-t border-border bg-muted/30 max-w-4xl mx-auto px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Available documents:</p>
            <div className="flex flex-wrap gap-2">
              {kb.documents.map((doc) => (
                <Badge key={doc.id} variant="secondary" className="text-xs">
                  {doc.title}
                  {doc.category !== 'General' && (
                    <span className="ml-1 opacity-60">· {doc.category}</span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* No API key / no docs warning */}
      {kb?.totalDocuments === 0 && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-4">
          <Alert className="border-yellow-500/40 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-400 text-sm">
              The knowledge base is empty. Ask your administrator to upload documents.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[40vh] text-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <GraduationCap className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Ask anything</h2>
                <p className="text-muted-foreground max-w-sm">
                  I'll search the knowledge base and give you accurate answers with sources.
                </p>
              </div>
              {kb && kb.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {kb.categories.map((cat) => (
                    <Badge key={cat} variant="outline">{cat}</Badge>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-card border border-border rounded-tl-sm'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown className="prose prose-sm prose-invert max-w-none">
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="space-y-1 w-full">
                        <p className="text-xs text-muted-foreground font-medium">Sources:</p>
                        {msg.sources.map((src, i) => (
                          <div key={i} className="text-xs bg-muted/50 border border-border rounded-lg px-3 py-2">
                            <span className="font-medium text-primary">{src.title}</span>
                            <p className="text-muted-foreground mt-0.5 line-clamp-2">{src.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border bg-card flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your study materials..."
              className="flex-1 min-h-[52px] max-h-32 resize-none"
              rows={1}
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-[52px] w-[52px] flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
