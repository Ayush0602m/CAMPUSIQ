import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/auth';
import { AlertCircle, Settings } from 'lucide-react';

interface Source {
  documentId: string;
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

export function ChatInterface() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [hasApiKey, setHasApiKey] = useState(true);
  const [checkingApiKey, setCheckingApiKey] = useState(true);

  useEffect(() => {
    // Check if API key is configured
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
        setCheckingApiKey(false);
      }
    };

    checkApiKey();

    // Load chat history
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/chat/history', {
          headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (response.ok) {
          setMessages(data.history);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };

    fetchHistory();
  }, []);

  const handleSend = async (question: string) => {
    if (!hasApiKey) {
      toast.error('Please add your OpenAI API key in Settings first');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setLoadingMessage('Searching documents...');

    try {
      const response = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ question }),
      });

      setLoadingMessage('Generating answer...');

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to get answer');
      
      // Remove user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Chat Assistant</h2>
        <p className="text-sm text-muted-foreground">
          Ask questions about your documents
        </p>
      </div>

      {!checkingApiKey && !hasApiKey && (
        <div className="p-4 border-b border-border">
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-500 flex items-center justify-between">
              <span>OpenAI API key not configured. Add your API key to start asking questions.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
                className="ml-4"
              >
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <MessageList
        messages={messages}
        loading={loading}
        loadingMessage={loadingMessage}
      />

      <ChatInput onSend={handleSend} disabled={loading || !hasApiKey} />
    </div>
  );
}
