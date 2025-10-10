import { ShieldX } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Banned',
};

export default function BannedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <ShieldX className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Account Banned</h1>
          <p className="text-muted-foreground">
            Your account has been banned by an administrator. You cannot access this application.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          If you believe this is a mistake, please contact support.
        </p>
      </div>
    </div>
  );
}
