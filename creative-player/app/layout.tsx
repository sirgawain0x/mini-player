import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Inter } from "next/font/google";
import { generateMiniappEmbedMetaTags } from "./utils/miniapp-embed";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const url = process.env.NEXT_PUBLIC_URL
    ? new URL(process.env.NEXT_PUBLIC_URL)
    : new URL("https://jukebox.creativeplatform.xyz");

  // Generate Mini App Embed meta tags
  const miniappMetaTags = generateMiniappEmbedMetaTags({
    title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Genesis Jukebox",
    description: "On-chain music. Tip artists directly. AI-powered playlists.",
    imageUrl: "/screenshot.png",
    homeUrl: "/",
    splashImageUrl: "/splash.png",
  });

  return {
    title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Genesis Jukebox",
    description: "On-chain music. Tip artists directly. AI-powered playlists.",
    metadataBase: url,
    other: {
      ...Object.fromEntries(
        miniappMetaTags.map(tag => [tag.name, tag.content])
      ),
      // Frame-specific meta tags for validation
      "fc:frame": "vNext",
      "fc:frame:image": `${url.origin}/screenshot.png`,
      "fc:frame:button:1": "Open Jukebox",
      "fc:frame:post_url": `${url.origin}/api/frame`,
      "fc:frame:state": "jukebox",
      "fc:frame:input:text": "false",
    },
    openGraph: {
      url: url,
      title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Genesis Jukebox",
      description: "On-chain music. Tip artists directly. AI-powered playlists.",
      images: [
        {
          url: `${url.origin}/screenshot.png`,
          width: 1200,
          height: 630,
          alt: "Genesis Jukebox",
        },
      ],
      siteName: "Genesis Jukebox",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      creator: "@love",
      title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Genesis Jukebox",
      description: "On-chain music. Tip artists directly. AI-powered playlists.",
      images: [
        {
          url: `${url.origin}/screenshot.png`,
          width: 1200,
          height: 630,
          alt: "Genesis Jukebox",
        },
      ],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
