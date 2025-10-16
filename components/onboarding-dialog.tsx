'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export function OnboardingDialog() {
  const isOnboarding = useOnboarding();
  const [step, setStep] = React.useState(1);
  const [interests, setInterests] = React.useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [countryCode, setCountryCode] = React.useState('+1');
  const { toast } = useToast();

  const onContinue = () => {
    setStep(step + 1);
  };

  const onFinish = async () => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests, phoneNumber: `${countryCode}${phoneNumber}`, onboardingCompleted: true }),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      // Redirect to root URL instead of reloading to avoid keeping the onboarding=true param
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to finish onboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleInterestChange = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  return (
    <Dialog open={isOnboarding}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{step === 1 ? 'Welcome to Fuma!' : step === 2 ? 'What are your interests?' : 'What is your phone number?'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {step === 1 && (
            <div>
              <p>We're excited to have you here. Let's get you set up.</p>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="development" onCheckedChange={() => handleInterestChange('development')} />
                <label htmlFor="development">Development</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="design" onCheckedChange={() => handleInterestChange('design')} />
                <label htmlFor="design">Design</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="writing" onCheckedChange={() => handleInterestChange('writing')} />
                <label htmlFor="writing">Writing</label>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="flex items-center gap-2">
              <Select onValueChange={setCountryCode} defaultValue={countryCode}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+1">+1</SelectItem>
                  <SelectItem value="+44">+44</SelectItem>
                  <SelectItem value="+91">+91</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Phone number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
            </div>
          )}
        </div>
        <DialogFooter>
          {step < 3 ? (
            <Button onClick={onContinue}>Continue</Button>
          ) : (
            <Button onClick={onFinish}>Finish</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
