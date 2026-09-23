'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import {
  auth,
  GoogleAuthProvider,
  signInWithCredential,
} from '@/lib/firebase';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: 'signin' | 'signup' | 'use';
            prompt_parent_id?: string;
          }) => void;
          prompt: (momentListener?: (notification: {
            isNotDisplayed: () => boolean;
            getNotDisplayedReason: () => string;
            isSkippedMoment: () => boolean;
            getSkippedReason: () => string;
            isDismissedMoment: () => boolean;
            getDismissedReason: () => string;
          }) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string | number;
              locale?: string;
            }
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleOneTapProps {
  buttonContainerId?: string;
  context?: 'signin' | 'signup' | 'use';
  onSuccess?: () => void;
  onError?: (err: string) => void;
  autoPrompt?: boolean;
}

export default function GoogleOneTap({
  buttonContainerId,
  context = 'signin',
  onSuccess,
  onError,
  autoPrompt = true,
}: GoogleOneTapProps) {
  const router = useRouter();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '464724046592-ps58qrtfljnivlmpspm43ecevftgrib6.apps.googleusercontent.com';

  const handleCredentialResponse = async (response: { credential: string }) => {
    if (!response.credential) {
      console.warn('No Google credential returned from One Tap.');
      return;
    }

    setIsProcessing(true);
    try {
      const credential = GoogleAuthProvider.credential(response.credential);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Sync user profile with local DB
      await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Customer',
          email: user.email,
          photoUrl: user.photoURL,
        }),
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Google One Tap sign-in error:', err);
      const msg = err.message || 'Google authentication failed.';
      if (onError) {
        onError(msg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const initGoogleOneTap = () => {
    if (typeof window === 'undefined' || !window.google?.accounts?.id) return;
    if (!googleClientId) {
      console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured in .env');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: context,
      });

      // Render official Google button if target container exists
      if (buttonContainerId) {
        const container = document.getElementById(buttonContainerId);
        if (container) {
          container.innerHTML = ''; // clear previous
          window.google.accounts.id.renderButton(container, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: context === 'signup' ? 'signup_with' : 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: '100%',
          });
        }
      }

      // Automatically pop up the floating One Tap prompt in top right
      if (autoPrompt) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log('Google One Tap not displayed:', notification.getNotDisplayedReason());
          } else if (notification.isSkippedMoment()) {
            console.log('Google One Tap skipped:', notification.getSkippedReason());
          } else if (notification.isDismissedMoment()) {
            console.log('Google One Tap dismissed:', notification.getDismissedReason());
          }
        });
      }
    } catch (err) {
      console.error('Error initializing Google One Tap:', err);
    }
  };

  useEffect(() => {
    if (scriptLoaded) {
      initGoogleOneTap();
    }
  }, [scriptLoaded, buttonContainerId]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => console.error('Failed to load Google Identity Services script.')}
      />
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 shadow-2xl flex items-center gap-3 border border-slate-200">
            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-slate-800">
              Authenticating with Google...
            </span>
          </div>
        </div>
      )}
    </>
  );
}
