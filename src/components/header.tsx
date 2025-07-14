import { Wallet, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onHistoryClick: () => void;
}

export function Header({ onHistoryClick }: HeaderProps) {
  return (
    <header className="border-b border-white/10">
      <div className="container mx-auto flex items-center justify-between gap-4 p-4 md:p-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20">
              <Wallet className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground">
            Trackify Finance
          </h1>
        </div>
        <Button variant="outline" onClick={onHistoryClick}>
          <History className="mr-2 h-4 w-4" />
          View History
        </Button>
      </div>
    </header>
  );
}
