// src/app/privacy/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Home } from 'lucide-react';

export default function PrivacyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
      return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl font-headline">Loading Private Storage...</div>
          </div>
      )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <CardTitle>Private Storage</CardTitle>
            </div>
          </div>
           <Button variant="ghost" size="icon" onClick={() => router.push('/')}><Home className="w-5 h-5" /></Button>
        </CardHeader>
        <CardContent className="space-y-6">
           <p className="text-muted-foreground text-center py-8">This area is currently empty.</p>
        </CardContent>
      </Card>
      <div className="text-center mt-4">
           <Button variant="link" onClick={() => router.push('/')}>Back to Calendar</Button>
       </div>
    </div>
  );
}
