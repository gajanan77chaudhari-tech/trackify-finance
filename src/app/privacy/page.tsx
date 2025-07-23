// src/app/privacy/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPrivateData, savePrivateData, type PrivateContent } from '@/services/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Shield, Home } from 'lucide-react';

export default function PrivacyPage() {
  const [privateContent, setPrivateContent] = useState<PrivateContent[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function loadContent() {
      const data = await getPrivateData();
      setPrivateContent(data);
      setIsLoading(false);
    }
    loadContent();
  }, []);
  
  const handleSaveContent = async () => {
    if (!newNote && !newPhoto) return;

    const newItem: Omit<PrivateContent, 'id'> = {
        type: newPhoto ? 'photo' : 'note',
        content: newPhoto || newNote,
        createdAt: new Date().toISOString()
    };
    await savePrivateData(newItem);
    const data = await getPrivateData();
    setPrivateContent(data);
    setNewNote('');
    setNewPhoto(null);
    toast({ title: 'Content saved securely.'});
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewPhoto(reader.result as string);
            setNewNote(''); // Clear note if photo is uploaded
        };
        reader.readAsDataURL(file);
    }
  };

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
          <div>
            <Label htmlFor="new-note">Add a new private note</Label>
            <Textarea id="new-note" value={newNote} onChange={(e) => { setNewNote(e.target.value); setNewPhoto(null); }} placeholder="Type your secure note here..."/>
          </div>
           <div className="text-center text-sm text-muted-foreground">OR</div>
          <div>
              <Label htmlFor="photo-upload">Upload a private photo</Label>
              <div className="flex items-center gap-4">
                  <Input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="flex-grow"/>
              </div>
              {newPhoto && <img src={newPhoto} alt="Preview" className="mt-4 rounded-md max-h-40" />}
          </div>
          <Button onClick={handleSaveContent} className="w-full">Save to Private Storage</Button>
          
          <div className="mt-8 space-y-4">
              <h3 className="font-bold text-lg">Your Private Content</h3>
              {privateContent.length === 0 && <p className="text-muted-foreground">No private items stored yet.</p>}
              <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
              {privateContent.map(item => (
                  <div key={item.id} className="p-3 rounded-md border bg-secondary/50">
                      {item.type === 'note' ? (
                          <p className="whitespace-pre-wrap">{item.content}</p>
                      ) : (
                          <img src={item.content} alt="Private photo" className="rounded-md max-h-60" />
                      )}
                      <p className="text-xs text-muted-foreground mt-2">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
              ))}
              </div>
          </div>

        </CardContent>
      </Card>
      <div className="text-center mt-4">
           <Button variant="link" onClick={() => router.push('/')}>Back to Calendar</Button>
       </div>
    </div>
  );
}
