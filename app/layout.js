import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Byte & Block Snack",
  description: "BTC mood, Fear & Greed, your latest news byte, and quick swaps — all in one miniapp.",
   manifest: "/manifest.json"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Coinbase miniapp manifest */}
        <link rel="miniapp-manifest" href="/miniapp.json" />

        {/* Miniapp metadata */}
        <meta name="miniapp:display" content="standalone" />
        <meta name="miniapp:version" content="1.0.0" />

        {/* Recommended mobile app capability */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>

      <body>
        {children}


      </body>
    </html>
  );
}
