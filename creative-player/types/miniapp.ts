export interface MiniappUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

export interface MiniappEmbed {
  version: string;
  title: string;
  description: string;
  image: string;
  actionUrl: string;
  splashPage?: string;
  mentions?: MiniappUser[];
  [key: string]: any; // Allow for future extensions
}

export interface MiniappCast {
  text: string;
  mentions: MiniappUser[];
  embeds?: MiniappEmbed[];
  [key: string]: any; // Allow for future extensions
}

// Default Mini App Embed configuration
export const DEFAULT_MINIAPP_EMBED: MiniappEmbed = {
  version: "1.0",
  title: "Creative Player",
  description: "A creative way to interact with onchain music.",
  image: "/screenshot.png",
  actionUrl: "/",
  splashPage: "/splash.png",
};
