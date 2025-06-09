"use client";
import { useState, useCallback } from "react";
import { Playlist, Song } from "@/types/music";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Card } from "../ui/Card";
import { Jukebox } from "./Jukebox";
import { PlaylistSection } from "./PlaylistSection";
import { PlaylistView } from "./PlaylistView";
import { RecentTips } from "./RecentTips";
import { TransactionCard } from "./TransactionCard";

import { useAccount } from "wagmi";

type HomeProps = {
  setActiveTab: (tab: string) => void;
};

export function Home({ setActiveTab }: HomeProps) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tippedSongs, setTippedSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const handleSongTipped = (song: Song) => {
    setTippedSongs((prev) =>
      prev.find((s) => s.id === song.id) ? prev : [...prev, song]
    );
  };
  const handlePlaylistCreate = (pl: Playlist) => {
    setPlaylist(pl);
  };
  const artistId =
    selectedSong?.artist || "sound-0x7e4c2e6e6e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e";

  const { address } = useAccount();

  const generateOnrampUrl = useCallback(async () => {
    if (!address) return null;

    try {
      // Get session token from our API
      const response = await fetch("/api/onramp/session-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        console.error("Failed to get session token");
        return null;
      }

      const { token } = await response.json();

      // Generate onramp URL with session token
      const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID;
      const baseUrl = "https://pay.coinbase.com/buy";
      const params = new URLSearchParams({
        projectId: projectId || "",
        sessionToken: token,
        presetFiatAmount: "10",
        fiatCurrency: "USD",
      });

      return `${baseUrl}?${params.toString()}`;
    } catch (error) {
      console.error("Error generating onramp URL:", error);
      return null;
    }
  }, [address]);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Genesis Jukebox 🎵">
        <p className="text-[var(--app-foreground-muted)] mb-4">
          A Farcaster mini app that lets you discover and support independent
          artists through on-chain music streaming and direct creator tips.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={() => setActiveTab("features")}
            icon={<Icon name="arrow-right" size="sm" />}
          >
            Explore Features
          </Button>
          <Button
            onClick={async () => {
              const url = await generateOnrampUrl();
              if (url) {
                window.open(url, "_blank");
              }
            }}
            variant="outline"
            icon={<Icon name="plus" size="sm" />}
          >
            Add Funds
          </Button>
        </div>
      </Card>
      <Jukebox
        onSongTipped={handleSongTipped}
        setSelectedSong={setSelectedSong}
      />
      <PlaylistSection onCreate={handlePlaylistCreate} created={!!playlist} />
      {playlist ? (
        <>
          <PlaylistView playlist={playlist} songs={tippedSongs} />
          <RecentTips artistId={artistId} />
        </>
      ) : (
        <TransactionCard />
      )}
    </div>
  );
}
