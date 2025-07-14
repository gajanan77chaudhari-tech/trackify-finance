import { Wallet } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-white/10">
      <div className="container mx-auto flex items-center gap-4 p-4 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20">
            <Wallet className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground">
          Trackify Finance
        </h1>
      </div>
    </header>
  );
}
