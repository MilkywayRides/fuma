import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-4 text-4xl font-bold">Welcome to My Blog</h1>
      <p className="text-fd-muted-foreground mb-8">
        Read the latest articles and insights
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/blog"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-semibold"
        >
          View Blog
        </Link>
        <Link
          href="/admin"
          className="px-6 py-3 border rounded-md hover:bg-accent font-semibold"
        >
          Admin Dashboard
        </Link>
      </div>
    </main>
  );
}
