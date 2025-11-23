"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function FarcasterReady() {
  useEffect(() => {
    async function notifyReady() {
      try {
        console.log("[FarcasterReady] Calling sdk.actions.ready() …");
        await sdk.actions.ready();
        console.log("[FarcasterReady] Miniapp is ready!");
      } catch (err) {
        console.error("[FarcasterReady] Failed to call sdk.actions.ready()", err);
      }
    }

    notifyReady();
  }, []);

  return null;
}
