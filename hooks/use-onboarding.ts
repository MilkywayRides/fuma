'use client';

import { useSearchParams } from 'next/navigation';

export function useOnboarding() {
  const searchParams = useSearchParams();
  const onboarding = searchParams.get('onboarding') === 'true';

  return onboarding;
}