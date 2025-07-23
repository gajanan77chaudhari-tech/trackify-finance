// src/app/privacy/page.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Shield, Home, KeyRound, Lock, Unlock, Eye, EyeOff, Loader2, FileImage, StickyNote, CalendarDays, Clock, Settings } from 'lucide-react';
import { 
    hasPrivacyPassword, 
    setPrivacyPassword, 
    checkPrivacyPassword, 
    getPrivateData, 
    savePrivateData,
    setPrivacyUnlockDateTime,
    checkPrivacyUnlockDateTime
} from '@/services/db';
import { PrivateContent } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

type PrivacyState = 'loading' | 'setup_password' | 'setup_date' | 'setup_time' | 'locked' | 'date_lock' | 'time_lock' | 'unlocked';

export default function PrivacyPage() {
  const [privacyState, setPrivacyState] = useState<PrivacyState>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [unlockDate, setUnlockDate] = useState<Date | undefined>(new Date());
  const [unlockTime, setUnlockTime] = useState('12:00');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [privateContent, setPrivateContent] = useState<PrivateContent[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isPending, startTransition] = useTransition();

  // Settings states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newUnlockDate, setNewUnlockDate] = useState<Date | undefined>(new Date());
  const [newUnlockTime, setNewUnlockTime] = useState('12:00');
  const [settingsError, setSettingsError] = useState('');


  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function checkPassword() {
      const hasPass = await hasPrivacyPassword();
      setPrivacyState(hasPass ? 'locked' : 'setup_password');
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
    setPrivacyState('setup_date'); // Move to date setup
    setError('');
    toast({ title: 'Password Set!', description: 'Now select your secret unlock date.' });
  };
  
  const handleSetDate = async () => {
      if (!unlockDate) {
          setError('Please select an unlock date.');
          return;
      }
      setPrivacyState('setup_time');
      setError('');
      toast({ title: 'Date Set!', description: 'Finally, set your secret unlock time.' });
  }

  const handleSetTime = async () => {
      if (!unlockDate || !unlockTime) {
          setError('Invalid date or time.');
          return;
      }
      const [hours, minutes] = unlockTime.split(':').map(Number);
      const finalDateTime = new Date(unlockDate);
      finalDateTime.setHours(hours, minutes, 0, 0);

      await setPrivacyUnlockDateTime(finalDateTime);
      setPrivacyState('unlocked');
      setError('');
      toast({ title: 'Setup Complete!', description: 'Your private storage is now fully protected.' });
  }


  const handleUnlockPassword = async () => {
    const isCorrect = await checkPrivacyPassword(password);
    if (isCorrect) {
      setPrivacyState('date_lock'); // Move to date lock
      setError('');
    } else {
      setError('Incorrect password.');
    }
  };

  const handleUnlockDate = async () => {
    if (!unlockDate) {
      setError('Please select a date to unlock.');
      return;
    }
    setPrivacyState('time_lock');
    setError('');
  }

  const handleUnlockTime = async () => {
    if (!unlockDate || !unlockTime) {
      setError('Invalid date or time.');
      return;
    }
    const [hours, minutes] = unlockTime.split(':').map(Number);
    const finalDateTime = new Date(unlockDate);
    finalDateTime.setHours(hours, minutes, 0, 0);

    const isCorrect = await checkPrivacyUnlockDateTime(finalDateTime);
    if (isCorrect) {
        setPrivacyState('unlocked');
        setError('');
        loadPrivateContent();
    } else {
        setError('Incorrect date or time selected.');
        toast({
            variant: "destructive",
            title: "Access Denied",
            description: "The date or time you selected is incorrect.",
        })
    }
  }
  
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
  
  const handleChangePassword = async () => {
    if (newPassword.length < 4) {
      setSettingsError('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setSettingsError('New passwords do not match.');
      return;
    }
    await setPrivacyPassword(newPassword);
    setSettingsError('');
    setNewPassword('');
    setConfirmNewPassword('');
    toast({ title: 'Password Updated!', description: 'Your password has been changed successfully.' });
  };
  
  const handleChangeUnlockDateTime = async () => {
    if (!newUnlockDate || !newUnlockTime) {
      setSettingsError('Invalid date or time.');
      return;
    }
    const [hours, minutes] = newUnlockTime.split(':').map(Number);
    const finalDateTime = new Date(newUnlockDate);
    finalDateTime.setHours(hours, minutes, 0, 0);

    await setPrivacyUnlockDateTime(finalDateTime);
    setSettingsError('');
    toast({ title: 'Unlock Credentials Updated!', description: 'Your secret date and time have been changed.' });
  }

  const showSettingsButton = !['loading', 'setup_password'].includes(privacyState);

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
          <div className="flex items-center gap-2">
              {showSettingsButton && (
                <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="w-5 h-5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => router.push('/')}><Home className="w-5 h-5" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          {privacyState === 'setup_password' && (
            <div className="space-y-4 text-center">
              <KeyRound className="w-12 h-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Step 1: Create Your Password</h3>
              <p className="text-muted-foreground">Set a password to protect your private storage.</p>
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
              <Button onClick={handleSetPassword} className="w-full">Set Password & Continue</Button>
            </div>
          )}

          {privacyState === 'setup_date' && (
            <div className="space-y-4 text-center">
              <CalendarDays className="w-12 h-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Step 2: Set Unlock Date</h3>
              <p className="text-muted-foreground">Select a secret date. You will need this to unlock your storage.</p>
              <div className="flex justify-center">
                 <Calendar
                    mode="single"
                    selected={unlockDate}
                    onSelect={setUnlockDate}
                    className="rounded-md border"
                  />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleSetDate} className="w-full" disabled={!unlockDate}>Continue</Button>
            </div>
          )}

           {privacyState === 'setup_time' && (
            <div className="space-y-4 text-center">
              <Clock className="w-12 h-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Step 3: Set Unlock Time</h3>
              <p className="text-muted-foreground">Select a secret time. This is the final step.</p>
              <div className="flex justify-center">
                 <Input 
                    type="time" 
                    value={unlockTime} 
                    onChange={(e) => setUnlockTime(e.target.value)} 
                    className="w-1/2 text-center text-2xl p-2"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleSetTime} className="w-full" disabled={!unlockTime}>Finish Setup</Button>
            </div>
          )}


          {privacyState === 'locked' && (
             <div className="space-y-4 text-center">
              <Lock className="w-12 h-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Storage Locked</h3>
              <p className="text-muted-foreground">Enter your password to continue.</p>
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
              <Button onClick={handleUnlockPassword} className="w-full">
                Continue
              </Button>
            </div>
          )}

          {privacyState === 'date_lock' && (
             <div className="space-y-4 text-center">
              <CalendarDays className="w-12 h-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Select Unlock Date</h3>
              <p className="text-muted-foreground">Select your secret date to continue.</p>
              <div className="flex justify-center">
                 <Calendar
                    mode="single"
                    selected={unlockDate}
                    onSelect={setUnlockDate}
                    className="rounded-md border"
                  />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleUnlockDate} className="w-full" disabled={!unlockDate}>
                Continue
              </Button>
            </div>
          )}

          {privacyState === 'time_lock' && (
             <div className="space-y-4 text-center">
              <Clock className="w-12 h-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Select Unlock Time</h3>
              <p className="text-muted-foreground">Select your secret time to unlock.</p>
              <div className="flex justify-center">
                 <Input 
                    type="time" 
                    value={unlockTime} 
                    onChange={(e) => setUnlockTime(e.target.value)} 
                    className="w-1/2 text-center text-2xl p-2"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleUnlockTime} className="w-full" disabled={!unlockTime}>
                 <Unlock className="mr-2 h-4 w-4" />
                Unlock Storage
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

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Privacy Settings</DialogTitle>
                  <DialogDescription>
                      Update your security credentials here.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                  <div className="space-y-4">
                      <Label className="font-semibold">Change Password</Label>
                      <Input 
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <Input
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                      />
                      <Button onClick={handleChangePassword} size="sm">Update Password</Button>
                  </div>
                  <div className="space-y-4">
                      <Label className="font-semibold">Change Unlock Date & Time</Label>
                      <div className="flex justify-center">
                          <Calendar
                              mode="single"
                              selected={newUnlockDate}
                              onSelect={setNewUnlockDate}
                              className="rounded-md border"
                          />
                      </div>
                      <Input
                          type="time"
                          value={newUnlockTime}
                          onChange={(e) => setNewUnlockTime(e.target.value)}
                          className="w-1/2 mx-auto text-center"
                      />
                      <Button onClick={handleChangeUnlockDateTime} size="sm" className="w-full">Update Date & Time</Button>
                  </div>
                  {settingsError && <p className="text-sm text-destructive text-center">{settingsError}</p>}
              </div>
              <DialogFooter>
                  <DialogClose asChild>
                      <Button variant="outline">Close</Button>
                  </DialogClose>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      <div className="text-center mt-4">
        <Button variant="link" onClick={() => router.push('/')}>Back to Calendar</Button>
      </div>
    </div>
  );
}
