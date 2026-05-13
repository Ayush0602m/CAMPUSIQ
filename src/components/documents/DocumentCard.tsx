import { FileText, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  id: string;
  title: string;
  filename: string;
  pageCount: number;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
}

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{document.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {document.pageCount} {document.pageCount === 1 ? 'page' : 'pages'}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}
            </p>

            {document.status === 'processing' && (
              <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Processing...</span>
              </div>
            )}

            {document.status === 'error' && (
              <p className="text-xs text-destructive mt-2">
                Error: {document.errorMessage || 'Failed to process'}
              </p>
            )}

            {document.status === 'ready' && (
              <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                <span>Ready</span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(document.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
