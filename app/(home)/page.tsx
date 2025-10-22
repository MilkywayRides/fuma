'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useEffect, useState, memo } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';

const BackgroundGradientAnimation = dynamic(
  () => import('@/components/ui/background-gradient-animation').then(mod => ({ default: mod.BackgroundGradientAnimation })),
  { ssr: false, loading: () => <div className="h-[75vh] mt-[30px] mx-[30px] rounded-3xl bg-muted animate-pulse" /> }
);
const BlogPostsSection = dynamic(() => import('@/components/blog-posts-section').then(mod => ({ default: mod.BlogPostsSection })), { ssr: false });
const Footer = dynamic(() => import('@/components/footer').then(mod => ({ default: mod.Footer })), { ssr: false });

export default function HomePage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <LoadingSpinner fullScreen />;

  const isDark = theme === 'dark';

  return (
    <>
    <BackgroundGradientAnimation 
      interactive={false} 
      gradientBackgroundStart={isDark ? "#0A0A0A" : "#FFFFFF"}
      gradientBackgroundEnd={isDark ? "#0A0A0A" : "#F5F5F5"}
      firstColor="59, 130, 246"
      secondColor="147, 51, 234"
      thirdColor="236, 72, 153"
      fourthColor="249, 115, 22"
      fifthColor="34, 197, 94"
      containerClassName="h-[75vh] mt-[30px] mx-[30px] w-auto rounded-3xl"
    >
      <div className="absolute inset-0 flex items-center justify-center font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl">
        <p className="bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b from-foreground/80 to-foreground/20">
          The Future of Development
        </p>
      </div>
    </BackgroundGradientAnimation>
    <BlogPostsSection />
    <Footer />
    </>
  );
}
