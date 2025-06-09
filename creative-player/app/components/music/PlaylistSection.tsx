"use client";
import { useState, useCallback, useEffect } from "react";
import confetti from "canvas-confetti";
import { Playlist } from "@/types/music";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import {
  Transaction,
  TransactionButton,
  LifecycleStatus,
} from "@coinbase/onchainkit/transaction";

export function PlaylistSection({
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
  const [imageGenerationError, setImageGenerationError] = useState<
    string | null
  >(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [ethAmount, setEthAmount] = useState<bigint>(BigInt(0));
  const [saveState, setSaveState] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");

  const COMPANY_WALLET_ADDRESS = "0x1Fde40a4046Eda0cA0539Dd6c77ABF8933B94260";

  useEffect(() => {
    if (showSaveModal) {
      fetch("https://api.coinbase.com/v2/prices/ETH-USD/spot")
        .then((res) => res.json())
        .then((data) => {
          const price = parseFloat(data.data.amount);
          const eth = 0.1 / price;
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
    setImageGenerationError(null);

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

      const result = await response.json();

      if (!response.ok) {
        console.error("API Error:", result);

        // Handle specific error cases
        if (response.status === 503) {
          setImageGenerationError(
            "Service temporarily unavailable. Please try again in a few minutes."
          );
          showToast("Image service is temporarily unavailable.");
        } else if (result.retryable) {
          setImageGenerationError(
            result.details ||
              "Service temporarily unavailable. Please try again."
          );
          showToast(result.error || "Service temporarily unavailable.");
        } else {
          showToast(result.error || "Failed to generate image");
        }
        return;
      }

      // Try different possible response formats
      const url =
        result.imageUrl ||
        result.url ||
        (result.images && result.images[0]?.url) ||
        (result.data && result.data.imageUrl) ||
        (result.data && result.data.url) ||
        "";

      if (url) {
        setCoverImage(url);
        setImageGenerationError(null);
        showToast("Image generated!");
      } else {
        console.error("No image URL found in response:", result);
        showToast("No image was generated. Please try again.");
      }
    } catch (error) {
      console.error("Network error:", error);
      setImageGenerationError(
        "Network error. Please check your connection and try again."
      );
      showToast("Failed to generate image. Please check your connection.");
    } finally {
      setLoadingImage(false);
    }
  }

  const handleOnStatus = useCallback(
    async (status: LifecycleStatus) => {
      if (status.statusName === "success") {
        setSaveState("pending");
        const txHash =
          status.statusData.transactionReceipts[0]?.transactionHash;
        try {
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
    [playlistName, coverImage, description, tags, onCreate]
  );

  const calls =
    ethAmount > BigInt(0)
      ? [
          {
            to: COMPANY_WALLET_ADDRESS as `0x${string}`,
            data: "0x" as `0x${string}`,
            value: ethAmount,
          },
        ]
      : [];

  return (
    <Card title="Create Your Playlist">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!playlistName || created) return;
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
            onChange={(e) => {
              setImagePrompt(e.target.value);
              if (imageGenerationError) setImageGenerationError(null);
            }}
            placeholder="e.g. Futuristic neon city at night"
          />
          <button
            type="button"
            className="mt-2 bg-[var(--app-accent)] text-white px-3 py-1 rounded disabled:opacity-50"
            onClick={handleGenerateImage}
            disabled={loadingImage || !imagePrompt}
          >
            {loadingImage
              ? "Generating..."
              : imageGenerationError
                ? "Try Again"
                : "Generate Image"}
          </button>
          {imageGenerationError && (
            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
              <p className="mb-2">{imageGenerationError}</p>
            </div>
          )}
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
            {tags.map((tag: string, idx: number) => (
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

      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-black rounded-xl p-8 shadow-xl w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">
              Save this playlist forever for $0.10 in ETH
            </h2>
            <p className="mb-2">
              ≈{" "}
              {ethAmount > BigInt(0)
                ? (Number(ethAmount) / 1e18).toFixed(6)
                : "..."}{" "}
              ETH
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Gas fees not included. Payment is on Base network.
            </p>
            <Button
              variant="secondary"
              className="w-full mt-2"
              onClick={() => setShowSaveModal(false)}
              disabled={saveState === "pending"}
            >
              Cancel
            </Button>
            <div className="mt-4">
              <Transaction calls={calls} onStatus={handleOnStatus}>
                <TransactionButton
                  disabled={saveState === "pending" || created}
                  className="w-full"
                />
              </Transaction>
            </div>
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
