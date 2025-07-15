# Playlist NFT Smart Contract Integration Guide

## Overview

The PlaylistNFT smart contract system is built on ERC1155 with upgradeable capabilities and includes
a Create2Factory for playlist creation with pricing. This guide explains how to integrate music
playlist NFTs from your frontend application.

## Deployed Contracts

### Base Mainnet (Production)

- **PlaylistNFT**: `0x4B9c51D7F985DD62f226dAB60EaA254975cB177B`
- **Create2Factory**: `0x585571bF2BE914e0C9CE549E99E2E61888d09cC2`
- **Network**: Base Mainnet (Chain ID: 8453)
- **Block Explorer**: [BaseScan](https://basescan.org)

### Base Sepolia (Testnet)

- **PlaylistNFT**: `0xCb44364CCdb30fc79e7852e778bEc20033a69b8B`
- **Create2Factory**: `0x5A7861D29088B67Cc03d85c4D89B855201e030EB`
- **Network**: Base Sepolia (Chain ID: 84532)
- **Block Explorer**: [BaseScan Sepolia](https://sepolia.basescan.org/)

## Contract Details

### PlaylistNFT

- Base Standard: ERC1155 (Upgradeable)
- Features: Creating and minting playlist NFTs, collaborative management, song tracking

### Create2Factory

- Purpose: Playlist creation with pricing validation using Chainlink price feeds
- Features: ETH/USD price conversion, platform fees, deterministic deployment

## Key Structures

### PlaylistMetadata (PlaylistNFT)

```solidity
struct PlaylistMetadata {
    string name;              // Playlist name
    string description;       // Playlist description
    string coverImageUrl;     // Cover image URL
    string[] tags;           // Playlist tags
    address creator;         // Creator's address
    uint256 createdAt;       // Creation timestamp
    string[] songs;          // Array of song IDs/URIs
    address[] artists;       // Corresponding artists for each song
    bool isPrivate;          // Whether the playlist is private
    uint256 maxSupply;       // Maximum number of copies (0 for unlimited)
    uint256 price;           // Price in wei (0 for free)
    address[] collaborators; // List of collaborator addresses
}
```

## Contract Setup

### Using Viem + wagmi (Recommended)

```javascript
import { getContractAddresses } from "@/lib/contracts";
import { useChainId } from "wagmi";

// Get contract addresses for current network
const chainId = useChainId();
const addresses = getContractAddresses(chainId);

// Addresses will contain the correct contracts for the current network:
// Base Mainnet (8453) or Base Sepolia (84532)
console.log(addresses.PLAYLIST_NFT);
console.log(addresses.CREATE2_FACTORY);
```

### Using ethers (Legacy)

```javascript
import { ethers } from "ethers";

// Contract addresses by network
const CONTRACT_ADDRESSES = {
  8453: {
    // Base Mainnet
    PLAYLIST_NFT: "0x4B9c51D7F985DD62f226dAB60EaA254975cB177B",
    CREATE2_FACTORY: "0x585571bF2BE914e0C9CE549E99E2E61888d09cC2",
  },
  84532: {
    // Base Sepolia
    PLAYLIST_NFT: "0xCb44364CCdb30fc79e7852e778bEc20033a69b8B",
    CREATE2_FACTORY: "0x5A7861D29088B67Cc03d85c4D89B855201e030EB",
  },
};

// Get current network
const network = await provider.getNetwork();
const addresses = CONTRACT_ADDRESSES[network.chainId];

// Initialize contracts
const playlistNFTContract = new ethers.Contract(addresses.PLAYLIST_NFT, playlistNFTABI, signer);
const create2FactoryContract = new ethers.Contract(
  addresses.CREATE2_FACTORY,
  create2FactoryABI,
  signer
);
```

## Main Functions

### 1. Creating a New Playlist (via PlaylistNFT)

```javascript
// Function signature
function createPlaylist(
    PlaylistMetadata memory metadata,
    address storageContract
) public returns (uint256)

// Example usage
const playlistMetadata = {
    name: "Summer Vibes 2024",
    description: "A curated collection of this summer's best indie tracks",
    coverImageUrl: "https://ipfs.io/ipfs/...",
    tags: ["indie", "summer", "2024"],
    songs: [],
    artists: [],
    isPrivate: false,
    maxSupply: 100,  // Limited edition playlist
    price: ethers.utils.parseEther("0.1"),  // 0.1 ETH per copy
    collaborators: []
};

const storageContract = "0x..."; // Your playlist storage contract address
const tx = await playlistNFTContract.createPlaylist(playlistMetadata, storageContract);
const receipt = await tx.wait();
const event = receipt.events.find(e => e.event === 'PlaylistCreated');
const playlistId = event.args.tokenId;
```

### 2. Creating Playlists with Platform Fees (via Create2Factory)

```javascript
// Function signature
function deployPlaylist(
    string memory name,
    string memory coverImageUrl,
    string memory description,
    string[] memory tags,
    address owner,
    address _priceFeed,
    uint256 salt
) public payable returns (address)

// Get required platform fee
const requiredETH = await create2FactoryContract.getRequiredETHForCents(10); // 10 cents

// Deploy playlist
const tx = await create2FactoryContract.deployPlaylist(
    "Summer Vibes 2024",
    "https://ipfs.io/ipfs/...",
    "A curated collection of this summer's best indie tracks",
    ["indie", "summer", "2024"],
    userAddress,
    "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1", // Price feed address
    Date.now(), // salt
    { value: requiredETH }
);
```

### 3. Minting Playlist Copies

```javascript
// Function signature
function mintPlaylist(
    address to,
    uint256 id,
    uint256 amount
) public payable

// Example usage
const playlistId = 1;
const copiesAmount = 1;
const playlistData = await playlistNFTContract.getPlaylist(playlistId);
const totalPrice = playlistData.price.mul(copiesAmount);

await playlistNFTContract.mintPlaylist(
    userAddress,
    playlistId,
    copiesAmount,
    { value: totalPrice }
);
```

### 4. Managing Collaborators

```javascript
// Adding a collaborator
await playlistNFTContract.addCollaborator(playlistId, collaboratorAddress);

// Removing a collaborator
await playlistNFTContract.removeCollaborator(playlistId, collaboratorAddress);

// Checking if address is a collaborator
const isCollaborator = await playlistNFTContract.isCollaborator(playlistId, address);
```

### 5. Adding Songs

```javascript
// Function signature
function addSong(
    uint256 playlistId,
    string memory songId,
    address artist
) public

// Example usage
await playlistNFTContract.addSong(
    playlistId,
    "spotify:track:...",
    artistAddress
);
```

### 6. Reading Playlist Data

```javascript
// Get playlist metadata
const playlistData = await playlistNFTContract.getPlaylist(playlistId);

// Check playlist supply
const totalSupply = await playlistNFTContract.totalSupply(playlistId);

// Check user's balance
const balance = await playlistNFTContract.balanceOf(address, playlistId);

// Get current ETH/USD price (from Create2Factory)
const ethUsdPrice = await create2FactoryContract.getLatestETHUSDPrice();
```

## Network Configuration

### Base Mainnet (Production)

```javascript
const baseMainnetConfig = {
  chainId: 8453,
  name: "Base",
  rpcUrl: "https://mainnet.base.org",
  blockExplorer: "https://basescan.org",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
};

// Add network to wallet
await window.ethereum.request({
  method: "wallet_addEthereumChain",
  params: [baseMainnetConfig],
});
```

### Base Sepolia Testnet

```javascript
const baseSepoliaConfig = {
  chainId: 84532,
  name: "Base Sepolia",
  rpcUrl: "https://sepolia.base.org",
  blockExplorer: "https://sepolia.basescan.org",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
};

// Add network to wallet
await window.ethereum.request({
  method: "wallet_addEthereumChain",
  params: [baseSepoliaConfig],
});
```

## Important Notes

1. **Storage Contract**: Each playlist requires a storage contract address for extended data
   storage.

2. **Platform Fees**: Create2Factory charges a 10 cent platform fee (converted to ETH via
   Chainlink).

3. **Pricing**: Playlists can be free (price = 0) or require payment in ETH.

4. **Supply Control**: Set maxSupply to 0 for unlimited copies, or specify a number for limited
   editions.

5. **Collaboration**: Only creators can manage collaborators, but both creators and collaborators
   can add songs.

6. **Metadata Storage**: Consider using IPFS for storing cover images and extended metadata.

## Events to Monitor

### PlaylistNFT Events

```solidity
event PlaylistCreated(uint256 indexed tokenId, address indexed creator, string name);
event SongAdded(uint256 indexed tokenId, string songId, address indexed artist);
event PlaylistMinted(uint256 indexed tokenId, address indexed to, uint256 amount);
event CollaboratorAdded(uint256 indexed tokenId, address indexed collaborator);
event CollaboratorRemoved(uint256 indexed tokenId, address indexed collaborator);
```

### Create2Factory Events

```solidity
event PlaylistDeployed(address indexed playlistAddress, string name, address indexed owner, uint256 salt, string[] tags);
event PlaylistDeploymentFailed(string name, address indexed owner, string reason);
```

## Error Handling

Common error messages to handle:

### PlaylistNFT Errors

- "Name cannot be empty": Playlist name is required
- "Invalid storage contract": Storage contract address cannot be zero
- "Not authorized": Only creator or collaborators can perform this action
- "Would exceed max supply": Minting would exceed the maximum supply limit
- "Insufficient payment": Sent value is less than required price
- "Already a collaborator": Attempted to add an existing collaborator
- "Collaborator not found": Attempted to remove a non-existent collaborator

### Create2Factory Errors

- "Name is too long": Playlist name exceeds 100 characters
- "Description is too long": Description exceeds 500 characters
- "Too many tags": More than 10 tags provided
- "Tag is too long": Individual tag exceeds 20 characters
- "Insufficient platform fee": Sent value less than required platform fee
- "Invalid price": Chainlink price feed returned invalid data

## Security Considerations

1. Validate all user inputs before sending transactions
2. Implement proper access control for creator/collaborator functions
3. Use appropriate gas limits for different operations
4. Ensure storage contract integration is secure
5. Handle payments carefully, especially for priced playlists
6. Monitor and react to contract pause status
7. Verify Chainlink price feed data before using

## Best Practices for Frontend Integration

1. **Metadata Management**:

   - Store extended playlist data in IPFS
   - Use appropriate image formats and sizes for cover art
   - Include comprehensive song metadata

2. **User Experience**:

   - Show clear pricing information including platform fees
   - Display remaining supply for limited editions
   - Indicate playlist privacy status
   - Show collaboration status and permissions
   - Display current ETH/USD conversion rates

3. **Transaction Handling**:

   - Implement proper error handling
   - Show transaction status updates
   - Handle network changes gracefully
   - Validate inputs before sending transactions
   - Show gas estimates for transactions

4. **Event Monitoring**:
   - Listen for relevant events from both contracts
   - Update UI based on event data
   - Handle event errors gracefully
   - Implement proper error recovery

## Testing on Base Sepolia

1. **Get Test ETH**: Use
   [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. **Add Base Sepolia to Wallet**: Use the network configuration above
3. **Verify Contracts**: Both contracts are verified on
   [BaseScan Sepolia](https://sepolia.basescan.org/)
4. **Monitor Transactions**: Use the block explorer to track transaction status
