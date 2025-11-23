"use client";

import { useState } from "react";

export default function SwapCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* SWAP CARD */}
      <section className="bb-card">
        <div className="bb-card-inner">
          <header className="bb-card-header">
            <h2 className="bb-card-title">Swap ETH on Base</h2>
            <span className="bb-card-tag">Swap</span>
          </header>

          <div className="bb-swap-row">
            <p className="bb-swap-text">
              Quick swap between <strong>ETH</strong> and <strong>USDC</strong>, or other
              pairs, on Base.
            </p>
            <button className="bb-swap-button" onClick={() => setOpen(true)}>
              <span>Open swap</span>
            </button>
          </div>
        </div>
      </section>

      {/* FULL-SCREEN-ish MODAL */}
      {open && (
        <div className="bb-swap-modal-backdrop" onClick={() => setOpen(false)}>
          <div
            className="bb-swap-modal-shell"
            onClick={(e) => e.stopPropagation()} // prevent backdrop close on inner click
          >
            <header className="bb-swap-modal-header">
              <div>
                <div className="bb-swap-modal-title">
                  Swap ETH ↔ USDC and more on Base
                </div>
                <div className="bb-swap-modal-subtitle">
                  Powered by Uniswap. Swaps are non-custodial — always double-check
                  network &amp; token.
                </div>
              </div>
              <button
                className="bb-swap-modal-close"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close swap"
              >
                ✕
              </button>
            </header>

            <div className="bb-swap-modal-divider" />

            <div className="bb-swap-modal-body">
              <iframe
                className="bb-swap-iframe"
                src="https://app.uniswap.org/#/swap?chain=base&inputCurrency=eth&outputCurrency=usdc"
                title="Swap ETH to USDC on Base via Uniswap"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
