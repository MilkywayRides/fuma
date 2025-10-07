import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { getBlogTree } from '@/lib/blog-source';
import { APP_NAME } from '@/lib/config';

export default async function BlogPostLayout({ children }: { children: React.ReactNode }) {
  const tree = await getBlogTree();

  return (
    <DocsLayout
      tree={tree}
      nav={{
        enabled: false,
        title: (
          <>
            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" aria-label="Logo">
              <circle cx={12} cy={12} r={12} fill="currentColor" />
            </svg>
            {APP_NAME}
          </>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
