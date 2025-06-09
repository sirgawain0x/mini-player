export type Song = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  creatorAddress: string;
  audioUrl: string;
  playCount: number;
};

export type Playlist = {
  name: string;
  coverImage: string;
  description: string;
  tags: string[];
};

export type RecentTip = {
  amountEth: string;
  timestamp: string;
  txHash?: string;
  sender?: { address: string };
};
