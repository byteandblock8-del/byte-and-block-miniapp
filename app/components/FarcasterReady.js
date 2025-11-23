"use client";

import { useEffect } from "react";

export default function FarcasterReady() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // ⬇️ Paste the exact "mini app ready" snippet from the Base/Farcaster docs here.
    // For example, if the docs say something like:
    //
    //   window.dispatchEvent(new Event("miniapp-ready"));
    //
    // then put that line here.

    // Example placeholder (you can replace with the real one from docs):
    // window.dispatchEvent(new Event("miniapp-ready"));
  }, []);

  // No UI — this component just runs the effect
  return null;
}
