import { Address } from "viem";
import { useReadContract, useWriteContract, useChainId } from "wagmi";

// Contract addresses by chain
const CONTRACT_ADDRESSES = {
  // Base Sepolia (Testnet)
  84532: {
    CREATE2_FACTORY: "0x5A7861D29088B67Cc03d85c4D89B855201e030EB" as const,
    PRICE_FEED: "0x4aB110558a2007490647A5371F8953114422915B" as const, // ETH/USD
  },
  // Base Mainnet (Production)
  8453: {
    CREATE2_FACTORY: "0x585571bF2BE914e0C9CE549E99E2E61888d09cC2" as const,
    PRICE_FEED: "0x4aDC67696bA383F43DD60A9e78F2C97A81542192" as const, // ETH/USD
  },
} as const;

// Helper function to get contract addresses for current chain
export function getContractAddresses(chainId: number) {
  const addresses =
    CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!addresses) {
    throw new Error(
      `Unsupported chain ID: ${chainId}. Supported chains: Base Sepolia (84532), Base Mainnet (8453)`
    );
  }
  return addresses;
}

// Legacy exports for backward compatibility (Base Sepolia)
export const CREATE2_FACTORY_ADDRESS =
  CONTRACT_ADDRESSES[84532].CREATE2_FACTORY;

// Contract ABIs
export const create2FactoryABI = [
  {
    name: "getRequiredETHForCents",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "cents", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "deployPlaylist",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "name", type: "string" },
      { name: "coverImageUrl", type: "string" },
      { name: "description", type: "string" },
      { name: "tags", type: "string[]" },
      { name: "owner", type: "address" },
      { name: "_priceFeed", type: "address" },
      { name: "salt", type: "uint256" },
    ],
    outputs: [{ type: "address" }],
  },
  {
    type: "event",
    name: "PlaylistCreated",
    inputs: [
      {
        name: "playlistAddress",
        type: "address",
        indexed: true,
      },
      {
        name: "owner",
        type: "address",
        indexed: true,
      },
    ],
    anonymous: false,
  },
] as const;

export const playlistABI = [
  {
    name: "getSongs",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        components: [
          { name: "id", type: "string" },
          { name: "title", type: "string" },
          { name: "artist", type: "string" },
          { name: "cover", type: "string" },
          { name: "creatorAddress", type: "address" },
          { name: "audioUrl", type: "string" },
          { name: "playCount", type: "uint256" },
        ],
        name: "songs",
        type: "tuple[]",
      },
    ],
  },
] as const;

// Hooks for contract interactions
export function useDeployPlaylist() {
  const {
    writeContract,
    data: hash,
    isPending,
    isSuccess,
    isError,
    error,
  } = useWriteContract();
  const chainId = useChainId();

  const deployPlaylist = (
    name: string,
    coverImageUrl: string,
    description: string,
    tags: string[],
    owner: Address,
    salt: bigint,
    value: bigint
  ) => {
    const addresses = getContractAddresses(chainId);
    writeContract({
      abi: create2FactoryABI,
      address: addresses.CREATE2_FACTORY,
      functionName: "deployPlaylist",
      args: [
        name,
        coverImageUrl,
        description,
        tags,
        owner,
        addresses.PRICE_FEED,
        salt,
      ],
      value,
    });
  };

  return { deployPlaylist, hash, isPending, isSuccess, isError, error };
}

export function useGetRequiredETH(cents: bigint) {
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);

  const { data, isLoading, isError, ...rest } = useReadContract({
    address: addresses.CREATE2_FACTORY,
    abi: create2FactoryABI,
    functionName: "getRequiredETHForCents",
    args: [cents],
    // Only run query if cents is greater than 0
    query: {
      enabled: cents > BigInt(0),
    },
  });

  // If cents is 0, return 0 immediately
  if (cents === BigInt(0)) {
    return { data: BigInt(0), isLoading: false, isError: false, ...rest };
  }

  return { data, isLoading, isError, ...rest };
}

export function useGetPlaylistSongs(playlistAddress?: `0x${string}`) {
  const { data, isLoading, isError, ...rest } = useReadContract({
    address: playlistAddress,
    abi: playlistABI,
    functionName: "getSongs",
    query: {
      enabled: !!playlistAddress,
    },
  });

  return { data, isLoading, isError, ...rest };
}
