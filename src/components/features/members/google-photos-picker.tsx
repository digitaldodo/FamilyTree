'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Script from 'next/script';
import { getGoogleClientId } from '@/app/actions/google';

interface GooglePhotosPickerProps {
  onPhotoSelected: (blob: Blob) => Promise<void>;
  disabled?: boolean;
}

export function GooglePhotosPicker({
  onPhotoSelected,
  disabled,
}: GooglePhotosPickerProps) {
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    // Also try checking NEXT_PUBLIC variable as fallback
    getGoogleClientId().then(id => {
      setClientId(id || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || null);
    });
  }, []);

  const handleScriptLoad = () => {
    setIsApiLoaded(true);
  };

  const startPickerFlow = async () => {
    if (!clientId) {
      toast.error(
        'Google Client ID is not configured (missing GOOGLE_CLIENT_ID or AUTH_GOOGLE_ID)'
      );
      return;
    }

    if (typeof window === 'undefined' || !(window as any).google) {
      toast.error('Google API is not loaded yet.');
      return;
    }

    setIsProcessing(true);

    try {
      const tokenClient = (
        window as any
      ).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope:
          'https://www.googleapis.com/auth/photospicker.mediaitems.readonly',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error !== undefined) {
            console.error('Google Auth Error:', tokenResponse);
            toast.error('Google authentication failed.');
            setIsProcessing(false);
            return;
          }
          await handlePickerSession(tokenResponse.access_token);
        },
      });

      tokenClient.requestAccessToken();
    } catch (error) {
      console.error('Picker flow error:', error);
      toast.error('Failed to start Google Photos picker.');
      setIsProcessing(false);
    }
  };

  const handlePickerSession = async (accessToken: string) => {
    let sessionId: string | null = null;
    try {
      // 1. Create Session
      const sessionRes = await fetch(
        'https://photospicker.googleapis.com/v1/sessions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      if (!sessionRes.ok) {
        throw new Error('Failed to create picker session');
      }

      const sessionData = await sessionRes.json();
      sessionId = sessionData.id;
      const pickerUri = sessionData.pickerUri;

      if (!sessionId || !pickerUri) {
        throw new Error('Invalid session response');
      }

      // 2. Open Picker Window
      const pickerWindow = window.open(
        pickerUri,
        'Google Photos Picker',
        'width=800,height=600'
      );

      // 3. Poll for completion
      const pollIntervalStr = sessionData.pollingConfig?.pollInterval || '2s';
      const pollIntervalMs =
        parseFloat(pollIntervalStr.replace('s', '')) * 1000 || 2000;

      let isComplete = false;
      let mediaItemsSet = false;

      const poll = async () => {
        if (pickerWindow?.closed) {
          isComplete = true; // User closed window manually
        }

        const pollRes = await fetch(
          `https://photospicker.googleapis.com/v1/sessions/${sessionId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (pollRes.ok) {
          const pollData = await pollRes.json();
          if (pollData.mediaItemsSet) {
            mediaItemsSet = true;
            isComplete = true;
          }
        }
      };

      while (!isComplete) {
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
        await poll();
      }

      if (pickerWindow && !pickerWindow.closed) {
        pickerWindow.close();
      }

      if (!mediaItemsSet) {
        // User closed the window without selecting
        toast.info('Google Photos selection cancelled.');
        setIsProcessing(false);
        return;
      }

      // 4. List Media Items
      const mediaRes = await fetch(
        `https://photospicker.googleapis.com/v1/mediaItems?sessionId=${sessionId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!mediaRes.ok) {
        throw new Error('Failed to list media items');
      }

      const mediaData = await mediaRes.json();
      if (!mediaData.mediaItems || mediaData.mediaItems.length === 0) {
        throw new Error('No media items found in session');
      }

      const selectedItem = mediaData.mediaItems[0];
      const mediaFileUrl = selectedItem.mediaFileUrl;

      // 5. Fetch image via our backend proxy to handle auth and CORS
      const downloadRes = await fetch('/api/upload/google-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaFileUrl, accessToken }),
      });
      if (!downloadRes.ok) {
        throw new Error('Failed to download media file from Google via backend');
      }
      const blob = await downloadRes.blob();

      // 6. Pass back to parent
      await onPhotoSelected(blob);
      toast.success('Photo retrieved successfully');
    } catch (error) {
      console.error('Session error:', error);
      toast.error('Failed to retrieve photo from Google Photos');
    } finally {
      if (sessionId) {
        // Clean up session
        fetch(`https://photospicker.googleapis.com/v1/sessions/${sessionId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        }).catch((e) => console.error('Failed to delete session', e));
      }
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={startPickerFlow}
        disabled={disabled || !isApiLoaded || isProcessing}
        className="w-full mt-2 flex items-center justify-center gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : (
          <ImageIcon className="w-4 h-4 text-slate-500" />
        )}
        <span className="text-sm font-medium">
          {isProcessing ? 'Connecting...' : 'Choose from Google Photos'}
        </span>
      </Button>
    </>
  );
}
