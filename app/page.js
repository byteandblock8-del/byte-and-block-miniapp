import Image from "next/image";
import Card from "./components/Card";
import SwapCard from "./components/SwapCard";
import FarcasterReady from "./components/FarcasterReady";

export const revalidate = 60;

/** Decode basic HTML entities from RSS titles */
function decodeHTMLEntities(str) {
  if (!str) return "";
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/** Format BTC price nicely */
function formatUSD(value) {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/** Map numerical Fear & Greed to a text label */
function getFearGreedLabel(value) {
  if (value <= 20) return "Extreme Fear";
  if (value <= 40) return "Fear";
  if (value <= 60) return "Neutral";
  if (value <= 80) return "Greed";
  return "Extreme Greed";
}

/** Fetch BTC price + 24h change from CoinGecko */
async function getBTCData() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      console.error("Failed to fetch BTC price:", res.status, res.statusText);
      return { price: null, change: null };
    }

    const data = await res.json();
    return {
      price: data.bitcoin?.usd ?? null,
      change: data.bitcoin?.usd_24h_change ?? null,
    };
  } catch (err) {
    console.error("Error fetching BTC price:", err);
    return { price: null, change: null };
  }
}

/** Fetch Fear & Greed index from alternative.me */
async function getFearGreed() {
  try {
    const res = await fetch(
      "https://api.alternative.me/fng/?limit=1&format=json",
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      console.error(
        "Failed to fetch Fear & Greed:",
        res.status,
        res.statusText
      );
      return { value: null, classification: null };
    }

    const json = await res.json();
    const item = json.data?.[0];

    const value = item ? Number(item.value) : null;
    const classification = item ? item.value_classification : null;

    return { value, classification };
  } catch (err) {
    console.error("Error fetching Fear & Greed:", err);
    return { value: null, classification: null };
  }
}

/** Fetch latest blog post from Byte & Block RSS */
async function getLatestPost() {
  try {
    const res = await fetch("https://byteandblock.com/feed", {
      // cache for 10 minutes; tweak as you like
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      console.error("Failed to fetch RSS feed");
      return null;
    }

    const xml = await res.text();

    // Grab the first <item> block
    const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);
    if (!itemMatch) return null;

    const item = itemMatch[1];

    const titleMatch = item.match(
      /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/
    );
    const linkMatch = item.match(/<link>(.*?)<\/link>/);

    const title = titleMatch
      ? (titleMatch[1] || titleMatch[2] || "").trim()
      : "Latest post";
    const link = linkMatch ? linkMatch[1].trim() : "https://byteandblock.com";

    // --- description / pseudo-excerpt ---
    const descMatch = item.match(
      /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/s
    );
    const rawDescription = descMatch ? (descMatch[1] || descMatch[2] || "") : "";

    // Decode HTML entities & strip tags
    const decodedDesc = decodeHTMLEntities(rawDescription)
      .replace(/<[^>]+>/g, "") // strip HTML tags just in case
      .trim();

    // Remove boilerplate intro if present
    const cleanedDesc = decodedDesc.replace(
      /^By Byte & Block — exploring the building blocks of digital finance\.\s*/i,
      ""
    );

    // Base excerpt (plain text, trimmed to ~180 chars)
    const maxLen = 180;
    const excerpt =
      cleanedDesc.length > maxLen
        ? cleanedDesc.slice(0, maxLen).trimEnd() + "…"
        : cleanedDesc;

    // HTML version with line breaks before numbered items: 1., 2., 3., ...
    const excerptHTML = excerpt
      .replace(/(\d+\.\s*)/g, "<br/>$1") // insert <br/> before each number
      .replace(/^<br\/>/, ""); // remove leading <br/> if any

    return { title, link, excerpt, excerptHTML };
  } catch (err) {
    console.error("Error parsing RSS feed", err);
    return null;
  }
}

/**
 * Try to scrape a featured image from the post page.
 * 1) Prefer <meta property="og:image" content="...">
 * 2) Fallback to the first <img src="..."> (skipping logo-ish ones)
 */
async function getFeaturedImage(postUrl) {
  if (!postUrl) return null;

  try {
    const res = await fetch(postUrl, {
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      console.error("Failed to fetch post HTML for thumbnail");
      return null;
    }

    const html = await res.text();

    // 1) Prefer og:image if present
    let match =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i
      );

    if (match && match[1]) {
      return match[1];
    }

    // 2) Fallback: scan all <img> tags, skip likely logos/icons
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const candidates = [];
    let imgMatch;

    while ((imgMatch = imgRegex.exec(html)) !== null) {
      const src = imgMatch[1];
      if (!src) continue;
      candidates.push(src);
    }

    if (!candidates.length) return null;

    const contentImg =
      candidates.find((src) => !/logo|icon|avatar|sprite/i.test(src)) ||
      candidates[0];

    return contentImg || null;
  } catch (err) {
    console.error("Error scraping featured image", err);
    return null;
  }
}

export default async function Home() {
  // 1) Get BTC + F&G + latest post from RSS
  const [{ price, change }, { value: fgValue }, latestPost] = await Promise.all([
    getBTCData(),
    getFearGreed(),
    getLatestPost(),
  ]);

  // 2) If we have a post, try to grab its featured image
  let featuredImage = null;
  if (latestPost?.link) {
    featuredImage = await getFeaturedImage(latestPost.link);
  }

  const priceFormatted = formatUSD(price);
  const changeFormatted =
    change == null
      ? "-"
      : `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;

  const fgNumeric = fgValue ?? 0;
  const fgLabel = getFearGreedLabel(fgNumeric);

  // Map 0–100 → 10–90% so the dot doesn’t sit on the very edge
  const pointerOffset =
    10 + (Math.max(0, Math.min(100, fgNumeric)) / 100) * 80;

  return (
    <div className="app-root">
      {/* ⭐ ADDED: Hide Base splash screen when ready */}
      <FarcasterReady />
      {/* ⭐ END ADDED */}
      <div className="app-shell">
        {/* Header */}
        <header className="bb-header">
          <div className="bb-header-logo">
            <Image
              src="/bb-ghost.png"
              alt="Byte & Block ghost"
              width={60}
              height={60}
              className="bb-header-logo-img"
              priority
            />
          </div>
          <div className="bb-header-text">
            <h1 className="bb-header-title">Byte & Block Snack</h1>
            <p className="bb-header-subtitle">
              BTC mood, Fear &amp; Greed and your latest byte of news.
            </p>
          </div>
        </header>

        {/* Cards grid */}
        <div className="bb-grid">
          {/* BTC MARKET MOOD */}
<Card title="BTC Market Mood" tag="Today">
  <div className="bb-price-main">
    <div className="bb-price-value">
      {price == null ? "—" : priceFormatted}
    </div>

    {price != null && change != null && (
      <div
        className={`bb-price-change ${
          change >= 0 ? "positive" : "negative"
        }`}
      >
        {changeFormatted}
      </div>
    )}
  </div>

  <p className="bb-price-caption">
    {price == null
      ? "Unable to load BTC price right now. Please try again in a bit."
      : "Live BTC price with 24h move."}
  </p>
</Card>

          {/* FEAR & GREED */}
<Card title="Fear & Greed Index" tag="Sentiment">
  {fgValue == null ? (
    <p className="bb-price-caption">
      Fear &amp; Greed data is temporarily unavailable. Try again later.
    </p>
  ) : (
    <div className="bb-fg-wrapper">
      <div className="bb-fg-arc">
        <div className="bb-fg-arc-inner" />
        <div
          className="bb-fg-pointer"
          style={{ left: `${pointerOffset}%` }}
        />
      </div>
      <div className="bb-fg-value">{fgValue}</div>
      <div className="bb-fg-label">{fgLabel}</div>
    </div>
  )}
</Card>

          {/* LATEST POST – wired to RSS + thumbnail scrape */}
          <Card title="Latest Byte & Block Post" tag="Blog">
            {latestPost ? (
              <div
                className="bb-latest-wrapper"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                {/* Thumbnail on the left */}
                {featuredImage && (
                  <img
                    src={featuredImage}
                    alt="Post thumbnail"
                    width={40}
                    height={40}
                    style={{
                      borderRadius: "10px",
                      flexShrink: 0,
                      objectFit: "cover",
                    }}
                  />
                )}

                {/* Text block on the right */}
                <div className="bb-latest-text">
                <a
                  href={latestPost.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bb-latest-title-link"
                >
                  <strong>{decodeHTMLEntities(latestPost.title)}</strong>
                </a>

                  {/* Read-on line directly under the title */}
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--bb-text-muted)",
                      marginTop: "2px",
                      marginBottom: "4px",
                    }}
                  >
                    Read on byteandblock.com ↗
                  </div>

                  {/* Multi-line excerpt (with line breaks for 1., 2., 3.) */}
                  <div
                    className="bb-latest-excerpt"
                    style={{ marginTop: "2px", lineHeight: "1.4" }}
                    dangerouslySetInnerHTML={{
                      __html:
                        latestPost.excerptHTML ||
                        (latestPost.excerpt
                          ? latestPost.excerpt.replace(/\n/g, "<br/>")
                          : "Read the latest Daily Byte on byteandblock.com."),
                    }}
                  />
                </div>
              </div>
            ) : (
              <p>
                Couldn&apos;t load the latest post right now. Check{" "}
                <a href="https://byteandblock.com">byteandblock.com</a> directly.
              </p>
            )}
          </Card>
          {/* NEW: SWAP CARD */}
          <SwapCard />
        </div>
      </div>
    </div>
  );
}
