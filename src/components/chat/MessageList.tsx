import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Loader2 } from 'lucide-react';

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
}

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
  loadingMessage?: string;
}

export function MessageList({ messages, loading, loadingMessage }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && !loading && (
        <div className="flex items-center justify-center h-full text-center">
          <div className="max-w-md">
            <h3 className="text-lg font-medium mb-2">Ask me anything!</h3>
            <p className="text-sm text-muted-foreground">
              I'll search through your uploaded documents to find accurate answers to your questions.
            </p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          role={message.role}
          content={message.content}
          sources={message.sources}
        />
      ))}

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">{loadingMessage || 'Thinking...'}</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
