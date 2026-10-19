"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "kc-install-banner-dismissed-at";
const DISMISS_DAYS = 14;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    const days = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    return days < DISMISS_DAYS;
  } catch {
    return false;
  }
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) return;

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    function handleAppInstalled() {
      setVisible(false);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    if (isIos) {
      setShowIosHint(true);
      setVisible(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Private browsing or storage disabled — just hide for this session.
    }
  }

  async function handleInstallClick() {
    if (showIosHint) return; // handled by the hint text itself
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }

  if (!visible) return null;

  return (
    <div className="border-b border-indigo-100 bg-indigo-50 px-4 py-2.5 print:hidden">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 sm:px-2">
        {showIosHint ? (
          <p className="text-xs text-indigo-900 sm:text-sm">
            Install this app: tap <span className="font-semibold">Share</span> ⬆️ then{" "}
            <span className="font-semibold">Add to Home Screen</span>.
          </p>
        ) : (
          <p className="text-xs text-indigo-900 sm:text-sm">
            Install this app on your device for quick, full-screen access.
          </p>
        )}
        <div className="flex shrink-0 items-center gap-2">
          {!showIosHint && (
            <button
              onClick={handleInstallClick}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 sm:text-sm"
            >
              Install App
            </button>
          )}
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="rounded px-2 py-1.5 text-xs text-indigo-500 hover:text-indigo-700"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
