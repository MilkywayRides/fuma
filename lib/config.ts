import packageJson from '@/package.json';

export const APP_NAME = packageJson.displayName || packageJson.name;
export const OAUTH_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://blazeneuro.com';
