import { CustomNavbar } from '@/components/custom-navbar';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <CustomNavbar />
      {children}
    </>
  );
}
