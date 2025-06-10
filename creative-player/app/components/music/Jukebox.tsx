"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
import { Pills } from "../ui/Pills";

type JukeboxProps = {
  onSongTipped: (song: Song) => void;
  setSelectedSong: (song: Song) => void;
};

export function Jukebox({ onSongTipped, setSelectedSong }: JukeboxProps) {
  const [selectedSong, _setSelectedSong] = useState<Song | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("TRENDING");
  const [after, setAfter] = useState<string | null>(null);
  const [before, setBefore] = useState<string | null>(null);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [pageInfo, setPageInfo] = useState<{
    endCursor: string | null;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
  }>({
    endCursor: null,
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
  });
  const { address } = useAccount();
  const sendNotification = useNotification();
  const minTipEth = BigInt(Math.floor(0.00001429 * 1e18));
  const [failedImages, setFailedImages] = useState<{ [id: string]: boolean }>(
    {}
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sortOptions = [
    { label: "🔥 Trending", value: "TRENDING" },
    { label: "🆕 Newest", value: "CREATED_AT_TIME_DESC" },
  ];

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setAfter(null);
    setBefore(null);
    setDirection("forward");
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Different queries for different sort types
    let query = "";
    let dataPath = "";
    const variables: Record<string, unknown> = {};
    if (sortBy === "TRENDING") {
      if (direction === "forward") {
        variables.first = 10;
        if (after) variables.after = after;
      } else {
        variables.last = 10;
        if (before) variables.before = before;
      }
      query = `query TrendingTracks($first: Int, $last: Int, $after: Cursor, $before: Cursor) {
        allTrendingTracks(first: $first, last: $last, after: $after, before: $before) {
          edges {
            cursor
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
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
        }
      }`;
      dataPath = "allTrendingTracks";
    } else {
      if (direction === "forward") {
        variables.first = 10;
        if (after) variables.after = after;
      } else {
        variables.last = 10;
        if (before) variables.before = before;
      }
      variables.orderBy = [sortBy, "ID_DESC"];
      query = `query ProcessedTracks($first: Int, $last: Int, $after: Cursor, $before: Cursor, $orderBy: [ProcessedTracksOrderBy!]) {
        allProcessedTracks(first: $first, last: $last, after: $after, before: $before, orderBy: $orderBy) {
          edges {
            cursor
            node {
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
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
        }
      }`;
      dataPath = "allProcessedTracks";
    }

    fetch("https://api.spinamp.xyz/v3/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.errors) {
          setError(
            data.errors[0]?.message.includes("timeout")
              ? "The server took too long to respond. Please try again later or reduce the number of tracks."
              : `GraphQL Error: ${data.errors[0]?.message || "Unknown error"}`
          );
          setLoading(false);
          return;
        }
        const connection = data?.data?.[dataPath] || {};
        const edges: Edge[] = connection.edges || [];
        const pageInfo = connection.pageInfo || {};
        setPageInfo({
          endCursor: pageInfo.endCursor || null,
          hasNextPage: !!pageInfo.hasNextPage,
          hasPreviousPage: !!pageInfo.hasPreviousPage,
          startCursor: pageInfo.startCursor || null,
        });

        if (!Array.isArray(edges) || edges.length === 0) {
          console.error("No edges returned for", sortBy, data);
        }

        type TrackNode = {
          processedTrackByTrackId?: {
            id: string;
            title: string;
            lossyAudioUrl?: string;
            lossyArtworkUrl?: string;
            artistId?: string;
            artistByArtistId?: {
              name?: string;
            };
            platformByPlatformId?: {
              name?: string;
            };
          };
          id?: string;
          title?: string;
          lossyAudioUrl?: string;
          lossyArtworkUrl?: string;
          artistId?: string;
          artistByArtistId?: {
            name?: string;
          };
          platformByPlatformId?: {
            name?: string;
          };
        };
        type Edge = {
          node: TrackNode;
        };

        const mappedSongs: Song[] = edges
          .map((edge: Edge) => {
            // Support both node structures
            let track: TrackNode["processedTrackByTrackId"] | TrackNode | null =
              null;
            let artistId: string | undefined;
            if (sortBy === "TRENDING") {
              track = edge.node.processedTrackByTrackId;
              artistId = edge.node.processedTrackByTrackId?.artistId;
            } else {
              track = edge.node;
              artistId = edge.node.artistId;
            }
            if (!track) return null;
            return {
              id: track.id || "unknown-id",
              title: track.title || "Untitled",
              artist: track.artistByArtistId?.name || "Unknown Artist",
              cover: track.lossyArtworkUrl || "",
              creatorAddress: artistId?.split("/")[1] || "",
              audioUrl: track.lossyAudioUrl || "",
              playCount: 0,
              platformName: track.platformByPlatformId?.name || undefined,
            };
          })
          .filter(Boolean) as Song[];

        setSongs(mappedSongs);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load songs from Spinamp.");
        setLoading(false);
      });
  }, [sortBy, after, before, direction]);

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

  useEffect(() => {
    if (selectedSong && audioRef.current) {
      // Try to play the audio when a new song is selected
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay might be blocked, ignore error
        });
      }
    }
  }, [selectedSong]);

  return (
    <Card title=" Discover Music">
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="text-sm font-medium text-[var(--app-foreground-muted)]">
            Sort by:
          </div>
          <Pills
            options={sortOptions}
            value={sortBy}
            onChange={handleSortChange}
          />
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-4" aria-label="Loading songs">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex items-center p-3 rounded-lg border border-[var(--app-card-border)] bg-[var(--app-card-bg)] animate-pulse"
              >
                <div className="w-12 h-12 rounded-lg bg-[var(--app-gray)] mr-4" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[var(--app-gray)] rounded w-2/3" />
                  <div className="h-3 bg-[var(--app-gray)] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedSong?.id === song.id ? "border-[var(--app-accent)] bg-[var(--app-accent-light)]" : "border-[var(--app-card-border)] bg-[var(--app-card-bg)]"}`}
                  onClick={() => handleSelectSong(song)}
                >
                  {song.cover && !failedImages[song.id] ? (
                    <Image
                      src={song.cover}
                      alt={song.title}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-cover mr-4"
                      priority
                      onError={() =>
                        setFailedImages((prev) => ({
                          ...prev,
                          [song.id]: true,
                        }))
                      }
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[var(--app-gray)] mr-4 flex items-center justify-center">
                      <Icon
                        name="star"
                        size="sm"
                        className="text-[var(--app-foreground-muted)]"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-[var(--app-foreground)] flex items-center gap-2">
                      {song.title}
                      {song.platformName && (
                        <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-[var(--app-accent-light)] text-[var(--app-accent)]">
                          {song.platformName}
                        </span>
                      )}
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
            <div className="flex justify-between mt-4">
              <button
                className="px-4 py-2 rounded bg-[var(--app-card-border)] text-[var(--app-foreground-muted)] disabled:opacity-50"
                onClick={() => {
                  setBefore(pageInfo.startCursor);
                  setAfter(null);
                  setDirection("backward");
                }}
                disabled={!pageInfo.hasPreviousPage || loading}
              >
                Previous
              </button>
              <button
                className="px-4 py-2 rounded bg-[var(--app-card-border)] text-[var(--app-foreground-muted)] disabled:opacity-50"
                onClick={() => {
                  setAfter(pageInfo.endCursor);
                  setBefore(null);
                  setDirection("forward");
                }}
                disabled={!pageInfo.hasNextPage || loading}
              >
                Next
              </button>
            </div>
          </>
        )}
        {selectedSong && (
          <div className="mt-4 space-y-2">
            <audio
              ref={audioRef}
              controls
              src={selectedSong.audioUrl}
              className="w-full rounded"
              autoPlay
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
                  Tip 5¢ in ETH to Creators
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
