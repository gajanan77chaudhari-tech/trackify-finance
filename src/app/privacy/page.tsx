// src/app/privacy/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPrivacySettings, savePrivacySettings, getPrivateData, savePrivateData, type PrivateContent } from '@/services/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, Shield, LogOut, Upload } from 'lucide-react';

export default function PrivacyPage() {
  const [hasSettings, setHasSettings] = useState<boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // Setup state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [unlockDate, setUnlockDate] = useState<Date | undefined>(new Date());
  const [unlockTime, setUnlockTime] = useState('12:00');

  // Unlock state
  const [unlockPassword, setUnlockPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Private content state
  const [privateContent, setPrivateContent] = useState<PrivateContent[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newPhoto, setNewPhoto] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function checkSettings() {
      const settings = await getPrivacySettings();
      setHasSettings(!!settings);
    }
    checkSettings();
  }, []);

  const handleSetup = async () => {
    if (password.length < 4) {
      toast({ variant: 'destructive', title: 'Password must be at least 4 characters.' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwords do not match.' });
      return;
    }
    if (!unlockDate) {
      toast({ variant: 'destructive', title: 'Please select an unlock date.' });
      return;
    }
    await savePrivacySettings({ password, unlockDate: unlockDate.toISOString(), unlockTime });
    toast({ title: 'Privacy settings saved!', description: 'You can now log in to your private storage.' });
    setHasSettings(true);
  };

  const handleUnlock = async () => {
    const settings = await getPrivacySettings();
    if (!settings) {
        toast({ variant: 'destructive', title: 'Setup not complete.' });
        return;
    }
    
    const selectedDate = unlockDate ? unlockDate.toISOString().split('T')[0] : '';
    const storedDate = new Date(settings.unlockDate).toISOString().split('T')[0];

    if (unlockPassword === settings.password && selectedDate === storedDate && unlockTime === settings.unlockTime) {
      setIsUnlocked(true);
      const data = await getPrivateData();
      setPrivateContent(data);
      toast({ title: 'Unlocked!' });
    } else {
      toast({ variant: 'destructive', title: 'Incorrect password, date, or time.' });
    }
  };
  
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

  if (isUnlocked) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <CardTitle>Private Storage</CardTitle>
                <CardDescription>Your secure area for notes and photos.</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsUnlocked(false)}><LogOut className="w-5 h-5" /></Button>
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
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Lock className="w-8 h-8 text-primary" />
            <div>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                {hasSettings
                  ? 'Unlock your private storage area.'
                  : 'Set up your password, date, and time lock.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasSettings === null ? (
            <p>Loading...</p>
          ) : hasSettings ? (
            // Unlock Form
            <div className="space-y-4">
              <div>
                <Label htmlFor="unlock-password">Password</Label>
                <div className="relative">
                  <Input id="unlock-password" type={showPassword ? 'text' : 'password'} value={unlockPassword} onChange={(e) => setUnlockPassword(e.target.value)} />
                   <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Unlock Date</Label>
                  <Calendar mode="single" selected={unlockDate} onSelect={setUnlockDate} className="p-0 border rounded-md" />
                </div>
                <div>
                  <Label htmlFor="unlock-time">Unlock Time</Label>
                  <Input id="unlock-time" type="time" value={unlockTime} onChange={(e) => setUnlockTime(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleUnlock} className="w-full">Unlock</Button>
            </div>
          ) : (
            // Setup Form
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Create Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Set Unlock Date</Label>
                  <Calendar mode="single" selected={unlockDate} onSelect={setUnlockDate} className="p-0 border rounded-md" />
                </div>
                <div>
                  <Label htmlFor="time">Set Unlock Time</Label>
                  <Input id="time" type="time" value={unlockTime} onChange={(e) => setUnlockTime(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleSetup} className="w-full">Save Settings</Button>
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
