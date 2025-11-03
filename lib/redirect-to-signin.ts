import { redirect } from 'next/navigation';

export function redirectToSignIn(currentPath: string) {
  redirect(`/sign-in?redirectTo=${encodeURIComponent(currentPath)}`);
}
