import { User, Bot, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Source {
  documentId: string;
  chunkIndex: number;
  text: string;
}

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

export function MessageBubble({ role, content, sources }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary' : 'bg-muted'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-foreground" />
        )}
      </div>

      <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <Card
          className={`p-3 ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-card'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </Card>

        {sources && sources.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Sources:</p>
            {sources.map((source, idx) => (
              <Card key={idx} className="p-2 bg-muted/50">
                <div className="flex items-start gap-2">
                  <ExternalLink className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {source.text}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
