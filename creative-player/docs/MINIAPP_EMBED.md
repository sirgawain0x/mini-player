# Mini App Embed Implementation

This document describes the Mini App Embed functionality implemented for the Creative Player Farcaster Mini App.

## Overview

Mini App Embeds are an OpenGraph-inspired metadata standard that lets any page in a Mini App be rendered as a rich object that can launch users into an application. When a Mini App URL is rendered in a cast, the image is displayed in a 3:2 ratio with a button underneath.

## Implementation

### Types

The Mini App Embed types are defined in `types/miniapp.ts`:

```typescript
export interface MiniappEmbed {
  version: string;
  title: string;
  description: string;
  imageUrl: string;
  homeUrl: string;
  splashImageUrl?: string;
  mentions?: MiniappUser[];
  [key: string]: any; // Allow for future extensions
}
```

### Default Configuration

The default Mini App Embed configuration is defined in `types/miniapp.ts`:

```typescript
export const DEFAULT_MINIAPP_EMBED: MiniappEmbed = {
  version: "1.0",
  title: "Genesis Jukebox",
  description: "On-chain music. Tip artists directly. AI-powered playlists.",
  imageUrl: "/screenshot.png",
  homeUrl: "/",
  splashImageUrl: "/splash.png",
};
```

### Meta Tags

The Mini App Embed meta tags are automatically generated in the root layout (`app/layout.tsx`) and include:

- `fc:miniapp` - Primary Mini App Embed meta tag
- `fc:frame` - Backward compatibility meta tag

Both meta tags contain the same serialized JSON content.

### Utilities

#### `generateMiniappEmbedMetaTags()`

Generates Mini App Embed meta tags for HTML head:

```typescript
import { generateMiniappEmbedMetaTags } from "./utils/miniapp-embed";

const metaTags = generateMiniappEmbedMetaTags({
  title: "Custom Title",
  description: "Custom description",
  imageUrl: "/custom-image.png",
  homeUrl: "/custom-page",
});
```

#### `createMiniappEmbed()`

Creates a custom Mini App Embed configuration:

```typescript
import { createMiniappEmbed } from "./utils/miniapp-embed";

const customEmbed = createMiniappEmbed({
  title: "Custom Title",
  description: "Custom description",
  imageUrl: "/custom-image.png",
  homeUrl: "/custom-page",
});
```

#### `validateMiniappEmbed()`

Validates a Mini App Embed configuration:

```typescript
import { validateMiniappEmbed } from "./utils/miniapp-embed";

const validation = validateMiniappEmbed(embed);
if (!validation.isValid) {
  console.error("Validation errors:", validation.errors);
}
```

### Components

#### `MiniAppEmbed`

A React component that can be used to dynamically update Mini App Embed meta tags:

```typescript
import { MiniAppEmbed } from "./components/ui/MiniAppEmbed";

function MyPage() {
  const customEmbed = {
    title: "Page Title",
    description: "Page description",
    imageUrl: "/page-image.png",
    homeUrl: "/my-page",
  };

  return (
    <div>
      <MiniAppEmbed 
        embed={customEmbed}
        onValidationError={(errors) => {
          console.error("Embed validation errors:", errors);
        }}
      />
      {/* Page content */}
    </div>
  );
}
```

#### `useMiniAppEmbed`

A React hook for programmatically updating Mini App Embed meta tags:

```typescript
import { useMiniAppEmbed } from "./components/ui/MiniAppEmbed";

function MyComponent() {
  const embed = {
    title: "Dynamic Title",
    description: "Dynamic description",
    image: "/dynamic-image.png",
    actionUrl: "/dynamic-page",
  };

  useMiniAppEmbed(embed);

  return <div>Component content</div>;
}
```

## Usage Examples

### Static Embed (Default)

The default embed is automatically applied to all pages through the root layout.

### Dynamic Embed for Specific Pages

Use the `MiniAppEmbed` component to override the default embed for specific pages:

```typescript
// app/music/[id]/page.tsx
import { MiniAppEmbed } from "../../components/ui/MiniAppEmbed";

export default function MusicPage({ params }: { params: { id: string } }) {
  const musicEmbed = {
    title: `Music Track ${params.id}`,
    description: "Listen to this amazing track",
    imageUrl: `/music/${params.id}/cover.png`,
    homeUrl: `/music/${params.id}`,
  };

  return (
    <div>
      <MiniAppEmbed embed={musicEmbed} />
      {/* Music player content */}
    </div>
  );
}
```

### Embed with Mentions

Include user mentions in the embed:

```typescript
const embedWithMentions = {
  title: "Collaborative Playlist",
  description: "Check out this playlist by @user1 and @user2",
  imageUrl: "/playlist-cover.png",
  homeUrl: "/playlist/123",
  mentions: [
    {
      fid: 12345,
      username: "user1",
      displayName: "User One",
      pfpUrl: "https://example.com/avatar1.png",
    },
    {
      fid: 67890,
      username: "user2", 
      displayName: "User Two",
      pfpUrl: "https://example.com/avatar2.png",
    },
  ],
};
```



## Versioning

The Mini App Embed implementation follows the versioning scheme where:
- Non-breaking changes can be added to the same version
- Breaking changes must accompany a version bump

The current version is "1.0".

## Environment Variables

The following environment variables are used:

- `NEXT_PUBLIC_URL` - Base URL for the application (defaults to "https://creativeplatform.xyz")
- `NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME` - Project name for the embed title

## Files

- `types/miniapp.ts` - Type definitions
- `app/utils/miniapp-embed.ts` - Utility functions
- `app/components/ui/MiniAppEmbed.tsx` - React components
- `app/layout.tsx` - Root layout with default embed
- `docs/MINIAPP_EMBED.md` - This documentation
