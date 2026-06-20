'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function InviteAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [treeName, setTreeName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function acceptInvite() {
      try {
        const res = await fetch('/api/invites/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          let data: any = {};
          try {
            try {
              data = await res.json();
            } catch (e) {
              throw new Error("Invalid JSON response from server");
            }
          } catch (e) {
            // ignore
          }
          throw new Error(data.error || 'Invalid or expired invite link');
        }

        let data;
    try {
      try {
        data = await res.json();
      } catch (e) {
        throw new Error("Invalid JSON response from server");
      }
    } catch (e) {
      throw new Error("Invalid JSON response from server");
    }
        setTreeName(data.treeName || 'Family Tree');
        setStatus('success');

        setTimeout(() => {
          router.push('/tree');
        }, 2000);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Invalid or expired invite link');
        setStatus('error');
      }
    }

    acceptInvite();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h1 className="text-xl font-semibold">Accepting invitation...</h1>
            <p className="text-muted-foreground text-sm">
              Please wait while we set things up for you.
            </p>
          </div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-xl font-semibold">You&apos;re in!</h1>
            <p className="text-muted-foreground text-sm">
              You&apos;ve been added to <span className="font-medium text-foreground">&ldquo;{treeName}&rdquo;</span>. Redirecting you to the tree...
            </p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold">Invitation Failed</h1>
            <p className="text-muted-foreground text-sm">
              {errorMessage}
            </p>
            <Link href="/dashboard">
              <Button variant="outline" className="mt-2">
                Go to Dashboard
              </Button>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
