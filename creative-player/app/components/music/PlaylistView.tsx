"use client";
import { Playlist, Song } from "@/types/music";
import { Card } from "../ui/Card";
import Image from "next/image";
import { useGetPlaylistSongs } from "@/lib/contracts";

export function PlaylistView({ playlist }: { playlist: Playlist }) {
  const { name, description, coverImage, tags } = playlist;

  const { data: songs, isLoading: isLoadingSongs } = useGetPlaylistSongs(
    playlist.address
  );

  return (
    <Card title={name || "Your Playlist"}>
      {coverImage && (
        <Image
          src={coverImage}
          alt="Playlist cover"
          width={128}
          height={128}
          className="w-32 h-32 object-cover rounded mb-4"
          priority
          unoptimized={true}
        />
      )}
      <div className="mb-2 text-[var(--app-foreground-muted)]">
        {description}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag: string, idx: number) => (
          <span
            key={idx}
            className="bg-[var(--app-accent-light)] text-[var(--app-accent)] px-2 py-1 rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>

      <h4 className="font-medium mb-2">Tipped Songs</h4>
      {isLoadingSongs ? (
        <div>Loading songs...</div>
      ) : songs && songs.length === 0 ? (
        <div className="text-[var(--app-foreground-muted)]">
          No songs tipped yet. Tip a song to add it to your playlist!
        </div>
      ) : (
        <ul className="space-y-3">
          {songs?.map((song: Song) => (
            <li key={song.id} className="flex items-center gap-3 border-b pb-2">
              <Image
                src={song.cover}
                alt={song.title}
                width={48}
                height={48}
                className="w-12 h-12 rounded object-cover"
                priority
                unoptimized={true}
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
