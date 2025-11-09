import { unstable_cache } from 'next/cache';

export const getCachedData = <T>(
  fn: () => Promise<T>,
  keys: string[],
  options?: {
    revalidate?: number | false;
    tags?: string[];
  }
) => {
  return unstable_cache(fn, keys, {
    revalidate: options?.revalidate ?? 3600,
    tags: options?.tags,
  });
};

export const revalidateCache = async (tag: string) => {
  const { revalidateTag } = await import('next/cache');
  revalidateTag(tag);
};
