import { Address } from "viem";
import { useReadContract, useWriteContract } from "wagmi";

export const playlistNFTABI = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addCollaborator",
    inputs: [
      { name: "playlistId", type: "uint256", internalType: "uint256" },
      { name: "collaborator", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addSong",
    inputs: [
      { name: "playlistId", type: "uint256", internalType: "uint256" },
      { name: "songId", type: "string", internalType: "string" },
      { name: "artist", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "id", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOfBatch",
    inputs: [
      { name: "accounts", type: "address[]", internalType: "address[]" },
      { name: "ids", type: "uint256[]", internalType: "uint256[]" },
    ],
    outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createPlaylist",
    inputs: [
      {
        name: "metadata",
        type: "tuple",
        internalType: "struct PlaylistNFT.PlaylistMetadata",
        components: [
          { name: "name", type: "string", internalType: "string" },
          { name: "description", type: "string", internalType: "string" },
          { name: "coverImageUrl", type: "string", internalType: "string" },
          { name: "tags", type: "string[]", internalType: "string[]" },
          { name: "creator", type: "address", internalType: "address" },
          { name: "createdAt", type: "uint256", internalType: "uint256" },
          { name: "songs", type: "string[]", internalType: "string[]" },
          { name: "artists", type: "address[]", internalType: "address[]" },
          { name: "isPrivate", type: "bool", internalType: "bool" },
          { name: "maxSupply", type: "uint256", internalType: "uint256" },
          { name: "price", type: "uint256", internalType: "uint256" },
          {
            name: "collaborators",
            type: "address[]",
            internalType: "address[]",
          },
        ],
      },
      {
        name: "storageContract",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getPlaylist",
    inputs: [{ name: "id", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct PlaylistNFT.PlaylistMetadata",
        components: [
          { name: "name", type: "string", internalType: "string" },
          { name: "description", type: "string", internalType: "string" },
          { name: "coverImageUrl", type: "string", internalType: "string" },
          { name: "tags", type: "string[]", internalType: "string[]" },
          { name: "creator", type: "address", internalType: "address" },
          { name: "createdAt", type: "uint256", internalType: "uint256" },
          { name: "songs", type: "string[]", internalType: "string[]" },
          { name: "artists", type: "address[]", internalType: "address[]" },
          { name: "isPrivate", type: "bool", internalType: "bool" },
          { name: "maxSupply", type: "uint256", internalType: "uint256" },
          { name: "price", type: "uint256", internalType: "uint256" },
          {
            name: "collaborators",
            type: "address[]",
            internalType: "address[]",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isApprovedForAll",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "operator", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isCollaborator",
    inputs: [
      { name: "playlistId", type: "uint256", internalType: "uint256" },
      { name: "account", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "mintPlaylist",
    inputs: [
      { name: "to", type: "address", internalType: "address" },
      { name: "id", type: "uint256", internalType: "uint256" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "playlistStorageContracts",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "playlists",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "name", type: "string", internalType: "string" },
      { name: "description", type: "string", internalType: "string" },
      { name: "coverImageUrl", type: "string", internalType: "string" },
      { name: "creator", type: "address", internalType: "address" },
      { name: "createdAt", type: "uint256", internalType: "uint256" },
      { name: "isPrivate", type: "bool", internalType: "bool" },
      { name: "maxSupply", type: "uint256", internalType: "uint256" },
      { name: "price", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "removeCollaborator",
    inputs: [
      { name: "playlistId", type: "uint256", internalType: "uint256" },
      { name: "collaborator", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "safeBatchTransferFrom",
    inputs: [
      { name: "from", type: "address", internalType: "address" },
      { name: "to", type: "address", internalType: "address" },
      { name: "ids", type: "uint256[]", internalType: "uint256[]" },
      { name: "values", type: "uint256[]", internalType: "uint256[]" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "safeTransferFrom",
    inputs: [
      { name: "from", type: "address", internalType: "address" },
      { name: "to", type: "address", internalType: "address" },
      { name: "id", type: "uint256", internalType: "uint256" },
      { name: "value", type: "uint256", internalType: "uint256" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setApprovalForAll",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
      { name: "approved", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setURI",
    inputs: [{ name: "newuri", type: "string", internalType: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "supportsInterface",
    inputs: [{ name: "interfaceId", type: "bytes4", internalType: "bytes4" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [{ name: "id", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unpause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "uri",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "ApprovalForAll",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "operator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "approved",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CollaboratorAdded",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "collaborator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CollaboratorRemoved",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "collaborator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      {
        name: "version",
        type: "uint64",
        indexed: false,
        internalType: "uint64",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Paused",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PlaylistCreated",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "creator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      { name: "name", type: "string", indexed: false, internalType: "string" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PlaylistMinted",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      { name: "to", type: "address", indexed: true, internalType: "address" },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SongAdded",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "songId",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "artist",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TransferBatch",
    inputs: [
      {
        name: "operator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      { name: "from", type: "address", indexed: true, internalType: "address" },
      { name: "to", type: "address", indexed: true, internalType: "address" },
      {
        name: "ids",
        type: "uint256[]",
        indexed: false,
        internalType: "uint256[]",
      },
      {
        name: "values",
        type: "uint256[]",
        indexed: false,
        internalType: "uint256[]",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TransferSingle",
    inputs: [
      {
        name: "operator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      { name: "from", type: "address", indexed: true, internalType: "address" },
      { name: "to", type: "address", indexed: true, internalType: "address" },
      { name: "id", type: "uint256", indexed: false, internalType: "uint256" },
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "URI",
    inputs: [
      {
        name: "value",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      { name: "id", type: "uint256", indexed: true, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Unpaused",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "ERC1155InvalidOperator",
    inputs: [{ name: "operator", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "ERC1155InvalidReceiver",
    inputs: [{ name: "receiver", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "ERC1155InvalidSender",
    inputs: [{ name: "sender", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "ERC1155InsufficientBalance",
    inputs: [
      { name: "sender", type: "address", internalType: "address" },
      { name: "balance", type: "uint256", internalType: "uint256" },
      { name: "needed", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "ERC1155MissingApprovalForAll",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
      { name: "owner", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "EnforcedPause",
    inputs: [],
  },
  {
    type: "error",
    name: "ExpectedPause",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: [],
  },
  {
    type: "error",
    name: "NotInitializing",
    inputs: [],
  },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
  },
] as const;

export type PlaylistMetadata = {
  name: string;
  description: string;
  coverImageUrl: string;
  tags: string[];
  creator: Address;
  createdAt: bigint;
  songs: string[];
  artists: Address[];
  isPrivate: boolean;
  maxSupply: bigint;
  price: bigint;
  collaborators: Address[];
};

// Hooks for PlaylistNFT contract

// Write Hooks
export const useCreatePlaylist = (playlistAddress?: Address) => {
  const { writeContract, ...rest } = useWriteContract();
  return {
    createPlaylist: (metadata: PlaylistMetadata, storageContract: Address) => {
      if (!playlistAddress) return;
      return writeContract({
        address: playlistAddress,
        abi: playlistNFTABI,
        functionName: "createPlaylist",
        args: [metadata, storageContract],
      });
    },
    ...rest,
  };
};

export const useMintPlaylist = (playlistAddress?: Address) => {
  const { writeContract, ...rest } = useWriteContract();
  return {
    mintPlaylist: (to: Address, id: bigint, amount: bigint) => {
      if (!playlistAddress) return;
      return writeContract({
        address: playlistAddress,
        abi: playlistNFTABI,
        functionName: "mintPlaylist",
        args: [to, id, amount],
      });
    },
    ...rest,
  };
};

export const useAddSongToPlaylist = (playlistAddress?: Address) => {
  const { writeContract, ...rest } = useWriteContract();
  return {
    addSongToPlaylist: (
      playlistId: bigint,
      songId: string,
      artist: Address
    ) => {
      if (!playlistAddress) return;
      return writeContract({
        address: playlistAddress,
        abi: playlistNFTABI,
        functionName: "addSong",
        args: [playlistId, songId, artist],
      });
    },
    ...rest,
  };
};

export const useAddCollaborator = (playlistAddress?: Address) => {
  const { writeContract, ...rest } = useWriteContract();
  return {
    addCollaborator: (playlistId: bigint, collaborator: Address) => {
      if (!playlistAddress) return;
      return writeContract({
        address: playlistAddress,
        abi: playlistNFTABI,
        functionName: "addCollaborator",
        args: [playlistId, collaborator],
      });
    },
    ...rest,
  };
};

export const useRemoveCollaborator = (playlistAddress?: Address) => {
  const { writeContract, ...rest } = useWriteContract();
  return {
    removeCollaborator: (playlistId: bigint, collaborator: Address) => {
      if (!playlistAddress) return;
      return writeContract({
        address: playlistAddress,
        abi: playlistNFTABI,
        functionName: "removeCollaborator",
        args: [playlistId, collaborator],
      });
    },
    ...rest,
  };
};

export const useSetURI = (playlistAddress?: Address) => {
  const { writeContract, ...rest } = useWriteContract();
  return {
    setURI: (newuri: string) => {
      if (!playlistAddress) return;
      return writeContract({
        address: playlistAddress,
        abi: playlistNFTABI,
        functionName: "setURI",
        args: [newuri],
      });
    },
    ...rest,
  };
};

export const usePausePlaylist = (playlistAddress?: Address) => {
  const { writeContract, ...rest } = useWriteContract();
  return {
    pausePlaylist: () => {
      if (!playlistAddress) return;
      return writeContract({
        address: playlistAddress,
        abi: playlistNFTABI,
        functionName: "pause",
      });
    },
    ...rest,
  };
};

export const useUnpausePlaylist = (playlistAddress?: Address) => {
  const { writeContract, ...rest } = useWriteContract();
  return {
    unpausePlaylist: () => {
      if (!playlistAddress) return;
      return writeContract({
        address: playlistAddress,
        abi: playlistNFTABI,
        functionName: "unpause",
      });
    },
    ...rest,
  };
};

// Read Hooks
export const useGetPlaylist = (playlistAddress?: Address, id?: bigint) => {
  return useReadContract({
    address: playlistAddress,
    abi: playlistNFTABI,
    functionName: "getPlaylist",
    args: [id!] as const,
    query: {
      enabled: !!playlistAddress && typeof id !== "undefined",
    },
  });
};

export const useIsCollaborator = (
  playlistAddress?: Address,
  playlistId?: bigint,
  account?: Address
) => {
  return useReadContract({
    address: playlistAddress,
    abi: playlistNFTABI,
    functionName: "isCollaborator",
    args: [playlistId!, account!] as const,
    query: {
      enabled:
        !!playlistAddress &&
        typeof playlistId !== "undefined" &&
        typeof account !== "undefined",
    },
  });
};

export const useTotalSupply = (playlistAddress?: Address, id?: bigint) => {
  return useReadContract({
    address: playlistAddress,
    abi: playlistNFTABI,
    functionName: "totalSupply",
    args: [id!] as const,
    query: {
      enabled: !!playlistAddress && typeof id !== "undefined",
    },
  });
};

export const usePlaylistPaused = (playlistAddress?: Address) => {
  return useReadContract({
    address: playlistAddress,
    abi: playlistNFTABI,
    functionName: "paused",
    query: {
      enabled: !!playlistAddress,
    },
  });
};

export const usePlaylistOwner = (playlistAddress?: Address) => {
  return useReadContract({
    address: playlistAddress,
    abi: playlistNFTABI,
    functionName: "owner",
    query: {
      enabled: !!playlistAddress,
    },
  });
};
