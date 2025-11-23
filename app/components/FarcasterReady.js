"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function FarcasterReady() {
  useEffect(() => {
    async function markReady() {
      try {
        // Tell Farcaster/Base that the mini app is ready,
        // so it can hide the splash screen.
        await sdk.actions.ready();
      } catch (err) {
        // Safe no-op outside of the mini app environment
        console.error("sdk.actions.ready() failed or not available", err);
      }
    }

    markReady();
  }, []);

  // This component doesn’t render anything visible
  return null;
}
