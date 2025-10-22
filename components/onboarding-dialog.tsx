'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function OnboardingDialogContent() {
  const isOnboarding = useOnboarding();
  const [step, setStep] = React.useState(1);
  const [interests, setInterests] = React.useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [countryCode, setCountryCode] = React.useState('+1');
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const onContinue = () => {
    setStep(step + 1);
  };

  const onFinish = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleInterestChange = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  return (
    <Dialog open={isOnboarding}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {step === 1 ? '🎉 Welcome to Fuma!' : step === 2 ? 'What are your interests?' : 'Contact Information'}
            </DialogTitle>
            <DialogDescription>
              {step === 1 && "We're excited to have you here. Let's get you set up in just a few steps."}
              {step === 2 && "Select the topics you're interested in to personalize your experience."}
              {step === 3 && "Add your contact information to stay connected (optional)."}
            </DialogDescription>
          </motion.div>
        </DialogHeader>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 py-4"
          >
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors">
                <Checkbox id="development" checked={interests.includes('development')} onCheckedChange={() => handleInterestChange('development')} />
                <Label htmlFor="development" className="flex-1 cursor-pointer">
                  <div className="font-medium">Development</div>
                  <div className="text-sm text-muted-foreground">Code, APIs, and technical content</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors">
                <Checkbox id="design" checked={interests.includes('design')} onCheckedChange={() => handleInterestChange('design')} />
                <Label htmlFor="design" className="flex-1 cursor-pointer">
                  <div className="font-medium">Design</div>
                  <div className="text-sm text-muted-foreground">UI/UX, graphics, and visual content</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors">
                <Checkbox id="writing" checked={interests.includes('writing')} onCheckedChange={() => handleInterestChange('writing')} />
                <Label htmlFor="writing" className="flex-1 cursor-pointer">
                  <div className="font-medium">Writing</div>
                  <div className="text-sm text-muted-foreground">Articles, blogs, and documentation</div>
                </Label>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <Select onValueChange={setCountryCode} defaultValue={countryCode}>
                    <SelectTrigger className="w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+1">🇺🇸 +1</SelectItem>
                      <SelectItem value="+44">🇬🇧 +44</SelectItem>
                      <SelectItem value="+91">🇮🇳 +91</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input id="phone" placeholder="123-456-7890" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="flex-1" />
                </div>
              </div>
            </div>
          )}
          </motion.div>
        </AnimatePresence>
        <DialogFooter className="gap-2">
          {step > 1 && step < 3 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
          )}
          {step < 3 ? (
            <Button onClick={onContinue}>Continue</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading}>Back</Button>
              <Button onClick={onFinish} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Finishing...' : 'Finish'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function OnboardingDialog() {
  return (
    <Suspense fallback={null}>
      <OnboardingDialogContent />
    </Suspense>
  );
}
