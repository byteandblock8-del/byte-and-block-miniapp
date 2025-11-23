"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function FarcasterReady() {
  useEffect(() => {
    async function notifyReady() {
      try {
        // In normal browsers (not Warpcast/Base), the sdk may not exist.
        if (!sdk || !sdk.actions || typeof sdk.actions.ready !== "function") {
          console.warn(
            "[FarcasterReady] sdk.actions.ready not available – skipping."
          );
          return;
        }

        await sdk.actions.ready();
        console.log("[FarcasterReady] sdk.actions.ready() called");
      } catch (err) {
        console.error("[FarcasterReady] Error calling ready()", err);
      }
    }

    notifyReady();
  }, []);

  // Nothing to render – this just runs the effect
  return null;
}
