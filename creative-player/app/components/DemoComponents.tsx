"use client";

import {
  type ReactNode,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useAccount } from "wagmi";
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
  TransactionSponsor,
  type LifecycleStatus,
} from "@coinbase/onchainkit/transaction";
import { useNotification } from "@coinbase/onchainkit/minikit";
import confetti from "canvas-confetti";

// eslint-disable-next-line no-restricted-syntax

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  icon,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052FF] disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    primary:
      "bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-[var(--app-background)]",
    secondary:
      "bg-[var(--app-gray)] hover:bg-[var(--app-gray-dark)] text-[var(--app-foreground)]",
    outline:
      "border border-[var(--app-accent)] hover:bg-[var(--app-accent-light)] text-[var(--app-accent)]",
    ghost:
      "hover:bg-[var(--app-accent-light)] text-[var(--app-foreground-muted)]",
  };

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5 rounded-md",
    md: "text-sm px-4 py-2 rounded-lg",
    lg: "text-base px-6 py-3 rounded-lg",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="flex items-center mr-2">{icon}</span>}
      {children}
    </button>
  );
}

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

function Card({ title, children, className = "", onClick }: CardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] overflow-hidden transition-all hover:shadow-xl ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
    >
      {title && (
        <div className="px-5 py-3 border-b border-[var(--app-card-border)]">
          <h3 className="text-lg font-medium text-[var(--app-foreground)]">
            {title}
          </h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

type FeaturesProps = {
  setActiveTab: (tab: string) => void;
};

export function Features({ setActiveTab }: FeaturesProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Key Features">
        <ul className="space-y-3 mb-4">
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              Discover and curate new music.
            </span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              Tip independent creators.
            </span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              AI text to image generation.
            </span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              Onchain music player.
            </span>
          </li>
        </ul>
        <Button variant="outline" onClick={() => setActiveTab("home")}>
          Back to Home
        </Button>
      </Card>
    </div>
  );
}

type HomeProps = {
  setActiveTab: (tab: string) => void;
};

type Song = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  creatorAddress: string;
  audioUrl: string;
  playCount: number;
};

type Playlist = {
  name: string;
  coverImage: string;
  description: string;
  tags: string[];
};

function PlaylistView({
  playlist,
  songs,
}: {
  playlist: Playlist;
  songs: Song[];
}) {
  return (
    <Card title={playlist.name || "Your Playlist"}>
      {playlist.coverImage && (
        <img
          src={playlist.coverImage}
          alt="Playlist cover"
          className="w-32 h-32 object-cover rounded mb-4"
        />
      )}
      <div className="mb-2 text-[var(--app-foreground-muted)]">
        {playlist.description}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {playlist.tags.map((tag, idx) => (
          <span
            key={idx}
            className="bg-[var(--app-accent-light)] text-[var(--app-accent)] px-2 py-1 rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
      <h4 className="font-medium mb-2">Tipped Songs</h4>
      {songs.length === 0 ? (
        <div className="text-[var(--app-foreground-muted)]">
          No songs tipped yet. Tip a song to add it to your playlist!
        </div>
      ) : (
        <ul className="space-y-3">
          {songs.map((song) => (
            <li key={song.id} className="flex items-center gap-3 border-b pb-2">
              <img
                src={song.cover}
                alt={song.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  {song.title}
                  <span className="flex items-center text-xs text-[var(--app-foreground-muted)] ml-2">
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="inline-block mr-1"
                      style={{ verticalAlign: "middle" }}
                    >
                      <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
                    </svg>
                    {song.playCount.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-[var(--app-foreground-muted)]">
                  {song.artist}
                </div>
                <audio
                  controls
                  src={song.audioUrl}
                  className="w-full mt-1 rounded"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Jukebox({
  onSongTipped,
  setSelectedSong,
}: {
  onSongTipped: (song: Song) => void;
  setSelectedSong: (song: Song) => void;
}) {
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
    [selectedSong, address, minTipEth],
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
    [sendNotification, selectedSong, onSongTipped],
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
                <img
                  src={song.cover}
                  alt={song.title}
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

function PlaylistSection({
  onCreate,
  created,
}: {
  onCreate: (playlist: Playlist) => void;
  created: boolean;
}) {
  const [playlistName, setPlaylistName] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);

  // Modal/payment state
  const [showSaveModal, setShowSaveModal] = useState(false);
  // eslint-disable-next-line no-restricted-syntax
  const [ethAmount, setEthAmount] = useState<bigint>(BigInt(0));
  const [saveState, setSaveState] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");

  const COMPANY_WALLET_ADDRESS = "0x1Fde40a4046Eda0cA0539Dd6c77ABF8933B94260";
  const BASE_CHAIN_ID = 8453; // Mainnet Base. Use 84532 for Base Sepolia testnet.

  // Fetch ETH price when modal opens
  useEffect(() => {
    if (showSaveModal) {
      fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
      )
        .then((res) => res.json())
        .then((data) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const price = data.ethereum.usd;
          // Calculate ETH amount in wei (BigInt)
          // eslint-disable-next-line no-restricted-syntax
          const eth = 0.1 / price;
          // eslint-disable-next-line no-restricted-syntax
          setEthAmount(BigInt(Math.floor(eth * 1e18)));
        });
    }
  }, [showSaveModal]);

  function launchConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleGenerateImage() {
    if (!imagePrompt) return showToast("Enter a prompt for your image");
    setLoadingImage(true);
    try {
      const response = await fetch("/api/livepeer/text-to-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt,
          height: 576,
          width: 1024,
        }),
      });
      const anyResult = await response.json();
      const url =
        anyResult.imageUrl ||
        anyResult.url ||
        (anyResult.images && anyResult.images[0]?.url) ||
        "";
      if (url) {
        setCoverImage(url);
        showToast("Image generated!");
      } else {
        showToast("No image returned.");
      }
    } catch {
      showToast("Failed to generate image.");
    }
    setLoadingImage(false);
  }

  // Handle Onchainkit transaction lifecycle
  const handleOnStatus = useCallback(
    async (status: LifecycleStatus) => {
      if (status.statusName === "success") {
        setSaveState("pending");
        const txHash =
          status.statusData.transactionReceipts[0]?.transactionHash;
        try {
          // POST playlist to backend
          const res = await fetch("/api/playlists", {
            method: "POST",
            body: JSON.stringify({
              name: playlistName,
              coverImage,
              description,
              tags,
              transactionHash: txHash,
            }),
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            setSaveState("success");
            setShowSaveModal(false);
            launchConfetti();
            showToast("Playlist created!");
            onCreate({ name: playlistName, coverImage, description, tags });
          } else {
            setSaveState("error");
            showToast("Failed to save playlist. Please contact support.");
          }
        } catch {
          setSaveState("error");
          showToast("Failed to save playlist. Please try again.");
        }
      } else if (status.statusName === "error") {
        setSaveState("error");
        showToast("Transaction failed. Please try again.");
      }
    },
    [playlistName, coverImage, description, tags, onCreate],
  );

  // eslint-disable-next-line no-restricted-syntax
  const calls = useMemo(
    () =>
      ethAmount > BigInt(0)
        ? [
            {
              to: COMPANY_WALLET_ADDRESS as `0x${string}`,
              data: "0x" as `0x${string}`,
              value: ethAmount,
            },
          ]
        : [],
    [ethAmount],
  );

  return (
    <Card title="Create Your Playlist">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!playlistName) return showToast("Playlist name required");
          setShowSaveModal(true);
        }}
      >
        <label className="block text-[var(--app-foreground)]">
          <span className="block mb-1 font-medium text-[var(--app-foreground)]">
            Playlist Name
          </span>
          <input
            className="w-full border rounded px-3 py-2"
            style={{ color: "#333" }}
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            required
          />
        </label>
        <label className="block text-[var(--app-foreground)]">
          <span className="block mb-1 font-medium text-[var(--app-foreground)]">
            Describe your playlist cover
          </span>
          <input
            className="w-full border rounded px-3 py-2"
            style={{ color: "#333" }}
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            placeholder="e.g. Futuristic neon city at night"
          />
          <button
            type="button"
            className="mt-2 bg-[var(--app-accent)] text-white px-3 py-1 rounded disabled:opacity-50"
            onClick={handleGenerateImage}
            disabled={loadingImage || !imagePrompt}
          >
            {loadingImage ? "Generating..." : "Generate Image"}
          </button>
        </label>
        <label className="block text-[var(--app-foreground)]">
          <span className="block mb-1 font-medium text-[var(--app-foreground)]">
            Cover Image URL
          </span>
          <input
            className="w-full border rounded px-3 py-2"
            style={{ color: "#333" }}
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="Paste image URL or use Generate Image above"
          />
        </label>
        {coverImage && (
          <div className="mb-2">
            <img
              src={coverImage}
              alt="Playlist cover"
              className="w-32 h-32 object-cover rounded"
            />
          </div>
        )}
        <label className="block text-[var(--app-foreground)]">
          <span className="block mb-1 font-medium text-[var(--app-foreground)]">
            Description
          </span>
          <textarea
            className="w-full border rounded px-3 py-2"
            style={{ color: "#333" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </label>
        <label className="block text-[var(--app-foreground)]">
          <span className="block mb-1 font-medium text-[var(--app-foreground)]">
            Tags
          </span>
          <input
            className="w-full border rounded px-3 py-2"
            style={{ color: "#333" }}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && tagInput.trim()) {
                setTags([...tags, tagInput.trim()]);
                setTagInput("");
                e.preventDefault();
              }
            }}
            placeholder="Type tag and press Enter"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-[var(--app-accent-light)] text-[var(--app-accent)] px-2 py-1 rounded text-xs flex items-center"
              >
                {tag}
                <button
                  type="button"
                  className="ml-1 text-[var(--app-accent)] hover:text-red-500"
                  onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </label>
        <Button type="submit" disabled={created || !playlistName}>
          {created ? "Playlist Created!" : "Create Playlist"}
        </Button>
      </form>

      {/* Modal for payment and confirmation */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-black rounded-xl p-8 shadow-xl w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">
              Save this playlist forever for $0.10 in ETH
            </h2>
            <p className="mb-2">
              ≈ {/* eslint-disable-next-line no-restricted-syntax */}
              {ethAmount > BigInt(0)
                ? (Number(ethAmount) / 1e18).toFixed(6)
                : "..."}{" "}
              ETH
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Gas fees not included. Payment is on Base network.
            </p>
            <Transaction
              chainId={BASE_CHAIN_ID}
              calls={calls}
              onStatus={handleOnStatus}
            >
              <TransactionButton
                className="w-full bg-[var(--app-accent)] text-white mt-2"
                disabled={ethAmount === BigInt(0)}
              />
              <TransactionSponsor />
              <TransactionStatus>
                <TransactionStatusLabel />
                <TransactionStatusAction />
              </TransactionStatus>
              <TransactionToast>
                <TransactionToastIcon />
                <TransactionToastLabel />
                <TransactionToastAction />
              </TransactionToast>
            </Transaction>
            <Button
              variant="secondary"
              className="w-full mt-2"
              onClick={() => setShowSaveModal(false)}
              disabled={saveState === "pending"}
            >
              Cancel
            </Button>
            {saveState === "error" && (
              <div className="text-red-500 mt-2">
                Transaction failed. Please try again.
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[var(--app-accent)] text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}
    </Card>
  );
}

function TransactionCard() {
  const { address } = useAccount();
  const calls = useMemo(
    () =>
      address
        ? [
            {
              to: address,
              data: "0x" as `0x${string}`,
              value: BigInt(0),
            },
          ]
        : [],
    [address],
  );
  const sendNotification = useNotification();
  const handleSuccess = useCallback(
    async (response: TransactionResponse) => {
      const transactionHash = response.transactionReceipts[0].transactionHash;
      console.log(`Transaction successful: ${transactionHash}`);
      await sendNotification({
        title: "Congratulations!",
        body: `You sent your a transaction, ${transactionHash}!`,
      });
    },
    [sendNotification],
  );
  return (
    <Card title="Customize Your Playlist">
      <div className="space-y-4">
        <p className="text-[var(--app-foreground-muted)] mb-4">
          Experience the power of being onchain.
        </p>
        <div className="flex flex-col items-center">
          {address ? (
            <Transaction
              calls={calls}
              onSuccess={handleSuccess}
              onError={(error: TransactionError) =>
                console.error("Transaction failed:", error)
              }
            >
              <TransactionButton className="text-white text-md" />
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
          ) : (
            <p className="text-yellow-400 text-sm text-center mt-2">
              Connect your wallet to customize your playlist.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// Add RecentTip type
interface RecentTip {
  amountEth: string;
  timestamp: string;
  txHash?: string;
  sender?: { address: string };
}

function RecentTips({ artistId }: { artistId: string }) {
  const [tips, setTips] = useState<RecentTip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setLoading(true);
    setError(undefined);
    fetch("https://api.spinamp.xyz/v3/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{
          artist(id: "${artistId}") {
            recentTips {
              amountEth
              timestamp
              txHash
              sender { address }
            }
          }
        }`,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTips(data?.data?.artist?.recentTips || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load tips");
        setLoading(false);
      });
  }, [artistId]);

  if (loading) {
    return (
      <div className="bg-white/10 dark:bg-black/20 rounded-xl p-4 shadow-md mt-6">
        Loading recent tips...
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-white/10 dark:bg-black/20 rounded-xl p-4 shadow-md mt-6 text-red-500">
        {error}
      </div>
    );
  }
  if (!tips.length) {
    return (
      <div className="bg-white/10 dark:bg-black/20 rounded-xl p-4 shadow-md mt-6">
        No recent tips found.
      </div>
    );
  }
  return (
    <div className="bg-white/10 dark:bg-black/20 rounded-xl p-4 shadow-md mt-6">
      <h3 className="font-semibold text-lg mb-3">Recent Tips</h3>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {tips.map((tip, idx) => (
          <li key={idx} className="py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                {tip.sender?.address
                  ? `${tip.sender.address.slice(0, 6)}...${tip.sender.address.slice(-4)}`
                  : "Unknown"}
              </span>
              <span className="text-xs text-gray-400">
                {timeAgo(Number(tip.timestamp))}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-green-500">
                {tip.amountEth ? Number(tip.amountEth).toFixed(4) : "?"} ETH
              </span>
              {tip.txHash && (
                <a
                  href={`https://basescan.io/tx/${tip.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 underline"
                >
                  View
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function timeAgo(unixSeconds: number) {
  const now = Date.now() / 1000;
  const diff = Math.floor(now - unixSeconds);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function Home({ setActiveTab }: HomeProps) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tippedSongs, setTippedSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const handleSongTipped = (song: Song) => {
    setTippedSongs((prev) =>
      prev.find((s) => s.id === song.id) ? prev : [...prev, song],
    );
  };
  const handlePlaylistCreate = (pl: Playlist) => {
    setPlaylist(pl);
  };
  const artistId =
    selectedSong?.artist || "sound-0x7e4c2e6e6e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e";
  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Genesis Jukebox 🎵">
        <p className="text-[var(--app-foreground-muted)] mb-4">
          A Farcaster mini app that lets you discover and support independent
          artists through on-chain music streaming and direct creator tips.
        </p>
        <Button
          onClick={() => setActiveTab("features")}
          icon={<Icon name="arrow-right" size="sm" />}
        >
          Explore Features
        </Button>
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

type IconProps = {
  name: "heart" | "star" | "check" | "plus" | "arrow-right";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function Icon({ name, size = "md", className = "" }: IconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const icons = {
    heart: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Heart</title>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    star: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Star</title>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    check: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Check</title>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    plus: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Plus</title>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    "arrow-right": (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Arrow Right</title>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
  };

  return (
    <span className={`inline-block ${sizeClasses[size]} ${className}`}>
      {icons[name]}
    </span>
  );
}
