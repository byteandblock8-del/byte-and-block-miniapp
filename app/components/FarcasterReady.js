"use client";

import { useEffect } from "react";

export default function FarcasterReady() {
  useEffect(() => {
    try {
      const w = window;

      // If some SDK is injected on window (implementation-defined),
      // try to call actions.ready() on it in a best-effort way.
      const candidates = [
        w?.sdk,
        w?.miniapp,
        w?.farcasterMiniAppSdk,
        w?.farcaster?.miniapp,
      ].filter(Boolean);

      for (const maybeSdk of candidates) {
        const actions = maybeSdk?.actions || maybeSdk?.client?.actions;
        if (actions && typeof actions.ready === "function") {
          actions.ready();
          // Stop after the first successful call
          break;
        }
      }
    } catch (err) {
      // Never break the app if something goes wrong
      console.error("FarcasterReady: failed to call actions.ready()", err);
    }
  }, []);

  // This component doesn’t render anything; it just runs the effect.
  return null;
}
