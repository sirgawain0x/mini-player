"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import Image from "next/image";
import {
  Transaction,
  TransactionButton,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionError,
  TransactionResponse,
  TransactionStatusAction,
  TransactionStatusLabel,
  TransactionStatus,
} from "@coinbase/onchainkit/transaction";
import { useNotification } from "@coinbase/onchainkit/minikit";
import { Song } from "@/types/music";
import { Card } from "../ui/Card";
import { Icon } from "../ui/Icon";

type JukeboxProps = {
  onSongTipped: (song: Song) => void;
  setSelectedSong: (song: Song) => void;
};

export function Jukebox({ onSongTipped, setSelectedSong }: JukeboxProps) {
  const [selectedSong, _setSelectedSong] = useState<Song | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const sendNotification = useNotification();
  const minTipEth = BigInt(Math.floor(0.00001429 * 1e18));

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("https://api.spinamp.xyz/v3/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{
          allTrendingTracks(first: 10) {
            edges {
              node {
                processedTrackByTrackId {
                  id
                  createdAtTime
                  createdAtBlockNumber
                  title
                  slug
                  platformInternalId
                  lossyAudioIpfsHash
                  lossyAudioUrl
                  description
                  lossyArtworkIpfsHash
                  lossyArtworkUrl
                  websiteUrl
                  platformId
                  artistId
                  supportingArtist
                  insertionId
                  phasesUpdatedAtBlock
                  chorusStart
                  duration
                  lossyAudioMimeType
                  lossyArtworkMimeType
                  mintStart
                  artistByArtistId {
                      id
                      createdAtTime
                      createdAtBlockNumber
                      slug
                      userId
                      avatarUrl
                      name
                      avatarIpfsHash
                      description
                      customTheme
                      predefinedThemeName
                    }
                  platformByPlatformId {
                    id
                    type
                    name
                  }
                  artistBySupportingArtist {
                    id
                    createdAtTime
                    createdAtBlockNumber
                    slug
                    userId
                    description
                    customTheme
                    predefinedThemeName
                    name
                    avatarIpfsHash
                    avatarUrl
                    userByUserId {
                      id
                      avatarUrl
                      name
                      avatarIpfsHash
                      description
                      customTheme
                      predefinedThemeName
                      metadata
                    }
                  }
                }
              }
            }
          }
        }`,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const edges = data?.data?.allTrendingTracks?.edges || [];
        type TrendingTrackEdge = {
          node: {
            processedTrackByTrackId: {
              id: string;
              title: string;
              lossyAudioUrl?: string;
              lossyArtworkUrl?: string;
              artistByArtistId?: {
                name?: string;
              };
            } | null;
            trendingScore: number;
          };
        };
        const mappedSongs: Song[] = (edges as TrendingTrackEdge[])
          .map((edge) => {
            const track = edge.node.processedTrackByTrackId;
            return track
              ? {
                  id: track?.id,
                  title: track?.title,
                  artist: track?.artistByArtistId?.name || "Unknown Artist",
                  cover: track?.lossyArtworkUrl || "",
                  creatorAddress: "",
                  audioUrl: track.lossyAudioUrl || "",
                  playCount: 0,
                }
              : null;
          })
          .filter(Boolean) as Song[];
        setSongs(mappedSongs);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load songs from Spinamp.");
        setLoading(false);
      });
  }, []);

  const calls = useMemo(
    () =>
      selectedSong && address
        ? [
            {
              to: selectedSong.creatorAddress as `0x${string}`,
              data: "0x" as `0x${string}`,
              value: minTipEth,
            },
          ]
        : [],
    [selectedSong, address, minTipEth]
  );
  const handleSuccess = useCallback(
    async (response: TransactionResponse) => {
      const transactionHash = response.transactionReceipts[0].transactionHash;
      await sendNotification({
        title: "Thank you!",
        body: `You tipped the creator! Tx: ${transactionHash}`,
      });
      if (selectedSong) {
        onSongTipped(selectedSong);
      }
    },
    [sendNotification, selectedSong, onSongTipped]
  );
  function handleSelectSong(song: Song) {
    _setSelectedSong(song);
    setSelectedSong(song);
  }
  return (
    <Card title=" Discover Music">
      <div className="space-y-4">
        {loading ? (
          <div>Loading songs...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {songs.map((song) => (
              <div
                key={song.id}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedSong?.id === song.id ? "border-[var(--app-accent)] bg-[var(--app-accent-light)]" : "border-[var(--app-card-border)] bg-[var(--app-card-bg)]"}`}
                onClick={() => handleSelectSong(song)}
              >
                <Image
                  src={song.cover}
                  alt={song.title}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-lg object-cover mr-4"
                />
                <div className="flex-1">
                  <div className="font-medium text-[var(--app-foreground)] flex items-center gap-2">
                    {song.title}
                  </div>
                  <div className="text-xs text-[var(--app-foreground-muted)]">
                    {song.artist}
                  </div>
                </div>
                {selectedSong?.id === song.id && (
                  <Icon name="check" className="text-[var(--app-accent)]" />
                )}
              </div>
            ))}
          </div>
        )}
        {selectedSong && (
          <div className="mt-4 space-y-2">
            <audio
              controls
              src={selectedSong.audioUrl}
              className="w-full rounded"
            />
            <Transaction
              calls={calls}
              onSuccess={handleSuccess}
              onError={(error: TransactionError) =>
                sendNotification({
                  title: "Transaction failed",
                  body: error.message,
                })
              }
            >
              <div className="w-full">
                <span className="block text-center font-medium text-[var(--app-accent)] mb-1">
                  Tip 5¢ in ETH to Creator
                </span>
                <TransactionButton className="w-full bg-[var(--app-accent)] text-white mt-2" />
              </div>
              <TransactionStatus>
                <TransactionStatusAction />
                <TransactionStatusLabel />
              </TransactionStatus>
              <TransactionToast className="mb-4">
                <TransactionToastIcon />
                <TransactionToastLabel />
                <TransactionToastAction />
              </TransactionToast>
            </Transaction>
          </div>
        )}
      </div>
    </Card>
  );
}
