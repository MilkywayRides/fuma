import Link from 'next/link';
import { Card } from '@/components/ui/card';

export function Footer() {
  return (
    <footer className="mt-8 mx-[30px]">
      <Card className="rounded-t-3xl rounded-b-none border-t border-b-0">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">BlazeNeuro</h3>
            <p className="text-sm text-muted-foreground">
              Building the future of development with modern tools and technologies.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
              <li><Link href="/docs" className="text-muted-foreground hover:text-foreground">Docs</Link></li>
              <li><Link href="/community" className="text-muted-foreground hover:text-foreground">Community</Link></li>
              <li><Link href="/admin" className="text-muted-foreground hover:text-foreground">Admin</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://github.com" className="text-muted-foreground hover:text-foreground">GitHub</a></li>
              <li><a href="https://twitter.com" className="text-muted-foreground hover:text-foreground">Twitter</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BlazeNeuro. All rights reserved.</p>
        </div>
      </div>
      </Card>
    </footer>
  );
}
