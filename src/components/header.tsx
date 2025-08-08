import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLogo } from './app-logo';

interface HeaderProps {
  onHistoryClick: () => void;
}

export function Header({ onHistoryClick }: HeaderProps) {
  return (
    <header style={{ backgroundColor: '#2E2EFF' }} className="text-primary-foreground">
      <div className="container mx-auto flex items-center justify-between gap-4 p-4 md:p-6">
        <div className="flex items-center gap-4">
          <AppLogo />
          <h1 className="text-2xl md:text-3xl font-headline font-bold">
            Trackify Finance
          </h1>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onHistoryClick}>
              <History className="mr-2 h-4 w-4" />
              View History
            </Button>
        </div>
      </div>
    </header>
  );
}
