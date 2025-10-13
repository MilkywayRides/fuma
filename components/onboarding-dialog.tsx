'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type UserType = 'student' | 'teacher' | 'developer' | 'other';

export function OnboardingDialog({ open, onOpenChange }: OnboardingDialogProps) {
  const [step, setStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [userType, setUserType] = React.useState<UserType>('student');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const { toast } = useToast();

  const steps = [
    {
      title: "Welcome to Fuma!",
      description: "Let's get you set up with your new account. This will only take a minute.",
      content: (
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold">Welcome aboard! 👋</h2>
          <p className="text-gray-500">
            {"We're excited to have you here. Let's personalize your experience."}
          </p>
        </div>
      )
    },
    {
      title: "What best describes you?",
      description: "This helps us tailor your experience.",
      content: (
        <div className="space-y-4">
          <Label>I am a...</Label>
          <Select value={userType} onValueChange={(value: UserType) => setUserType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    },
    {
      title: "Verify your phone number",
      description: "We'll send you a verification code.",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input 
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          {phoneNumber && !otp && (
            <Button 
              onClick={handleSendOtp}
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                'Send Verification Code'
              )}
            </Button>
          )}
          {otp && (
            <div className="space-y-2">
              <Label>Enter Verification Code</Label>
              <Input 
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          )}
        </div>
      )
    }
  ];

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      toast({
        title: "OTP Sent",
        description: "We've sent a verification code to your phone.",
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send verification code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      });
      if (!res.ok) throw new Error('Invalid OTP');
      
      // Update user profile with phone and type
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          phoneVerified: true,
          userType,
          onboardingCompleted: true,
        }),
      });

      toast({
        title: 'Success!',
        description: 'Your account is now set up.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid verification code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const currentStep = steps[step];

  const handleNext = () => {
    if (step === steps.length - 1) {
      if (!otp) {
        toast({
          title: 'Error',
          description: 'Please enter the verification code.',
          variant: 'destructive',
        });
        return;
      }
      handleVerifyOtp();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full">
          <div className="space-y-4">
            <DialogPrimitive.Title className="text-lg font-semibold">
              {currentStep.title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-gray-500">
              {currentStep.description}
            </DialogPrimitive.Description>
            <div className="py-4">{currentStep.content}</div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={loading}>
                {step === steps.length - 1 ? (
                  loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Complete'
                  )
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}