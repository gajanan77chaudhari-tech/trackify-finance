// src/app/privacy/page.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Shield, Home, KeyRound, Lock, Unlock, Eye, EyeOff, Loader2, FileImage, StickyNote } from 'lucide-react';
import { hasPrivacyPassword, setPrivacyPassword, checkPrivacyPassword, getPrivateData, savePrivateData } from '@/services/db';
import { PrivateContent } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

type PrivacyState = 'loading' | 'setup' | 'locked' | 'unlocked';

export default function PrivacyPage() {
  const [privacyState, setPrivacyState] = useState<PrivacyState>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [privateContent, setPrivateContent] = useState<PrivateContent[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function checkPassword() {
      const hasPass = await hasPrivacyPassword();
      setPrivacyState(hasPass ? 'locked' : 'setup');
    }
    checkPassword();
  }, []);

  const handleSetPassword = async () => {
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    await setPrivacyPassword(password);
    setPrivacyState('unlocked');
    setError('');
    toast({ title: 'Password Set!', description: 'Your private storage is now protected.' });
  };

  const handleUnlock = async () => {
    const isCorrect = await checkPrivacyPassword(password);
    if (isCorrect) {
      setPrivacyState('unlocked');
      setError('');
      loadPrivateContent();
    } else {
      setError('Incorrect password.');
    }
  };
  
  const loadPrivateContent = async () => {
      const data = await getPrivateData();
      setPrivateContent(data);
  }
  
  useEffect(() => {
      if(privacyState === 'unlocked') {
          loadPrivateContent();
      }
  }, [privacyState]);

  const handleAddNote = () => {
      if (!newNote.trim()) return;
      startTransition(async () => {
        await savePrivateData({ type: 'note', content: newNote });
        setNewNote('');
        loadPrivateContent();
        toast({ title: "Note Saved", description: "Your private note has been securely stored." });
      });
  };

  const handleAddPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        startTransition(async () => {
            await savePrivateData({ type: 'photo', content: dataUri });
            loadPrivateContent();
            toast({ title: "Photo Saved", description: "Your private photo has been securely stored." });
        });
      };
      reader.readAsDataURL(file);
    }
  };


  if (privacyState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-headline flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin"/>
            Loading Private Storage...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <CardTitle>Private Storage</CardTitle>
              <CardDescription>A secure area for your personal data.</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}><Home className="w-5 h-5" /></Button>
        </CardHeader>
        <CardContent>
          {privacyState === 'setup' && (
            <div className="space-y-4 text-center">
              <KeyRound className="w-12 h-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Create Your Password</h3>
              <p className="text-muted-foreground">Set a password to protect your private notes and photos.</p>
              <div className="relative">
                  <Input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                  />
                   <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                   </Button>
              </div>
               <div className="relative">
                  <Input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm new password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                  />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleSetPassword} className="w-full">Set Password</Button>
            </div>
          )}

          {privacyState === 'locked' && (
             <div className="space-y-4 text-center">
              <Lock className="w-12 h-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Storage Locked</h3>
              <p className="text-muted-foreground">Enter your password to unlock.</p>
               <div className="relative">
                 <Input 
                     type={showPassword ? 'text' : 'password'}
                     placeholder="Enter your password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="pr-10"
                 />
                 <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
               </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleUnlock} className="w-full">
                <Unlock className="mr-2 h-4 w-4" />
                Unlock
              </Button>
            </div>
          )}

          {privacyState === 'unlocked' && (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Add to Private Storage</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                             <Label htmlFor="new-note">Add a private note</Label>
                             <Textarea id="new-note" placeholder="Type your secure note here..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                             <Button onClick={handleAddNote} disabled={isPending || !newNote.trim()}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <StickyNote className="mr-2 h-4 w-4"/>}
                                Save Note
                             </Button>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="photo-upload">Upload a private photo</Label>
                            <Input id="photo-upload" type="file" accept="image/*" onChange={handleAddPhoto} disabled={isPending} />
                        </div>
                    </CardContent>
                </Card>

              <div>
                <h3 className="text-lg font-semibold mb-4">Your Private Content</h3>
                 {privateContent.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Your private storage is empty.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {privateContent.map(item => (
                            <Card key={item.id} className="overflow-hidden">
                                {item.type === 'photo' ? (
                                    <Image src={item.content} alt="Private photo" width={300} height={300} className="w-full h-auto object-cover" />
                                ) : (
                                    <CardContent className="p-4">
                                        <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                                    </CardContent>
                                )}
                                <CardContent className="p-2 border-t text-xs text-muted-foreground">
                                    {item.type === 'photo' ? <FileImage className="w-4 h-4 inline-block mr-1" /> : <StickyNote className="w-4 h-4 inline-block mr-1" />}
                                    Saved on {new Date(item.createdAt).toLocaleDateString()}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="text-center mt-4">
        <Button variant="link" onClick={() => router.push('/')}>Back to Calendar</Button>
      </div>
    </div>
  );
}
