# Session Token Integration with Coinbase CDP

This document explains how to integrate Coinbase CDP session tokens for secure onramp/offramp
functionality in your application.

## Overview

Session tokens provide a secure way to initialize onramp/offramp flows without exposing sensitive
API credentials to the client-side code. They use JWT authentication with the CDP SDK for better
security.

## Setup

### 1. Install Dependencies

The CDP SDK is already installed in this project:

```bash
npm install @coinbase/cdp-sdk
```

### 2. Environment Variables

Ensure you have the following environment variables set:

```env
CDP_API_KEY_NAME=your_api_key_name
CDP_API_KEY_PRIVATE_KEY=your_private_key
```

## Usage Examples

### Basic Session Token Generation

```typescript
import { generateSessionToken, formatAddressesForToken } from "@/lib/session-token";

// Generate a session token for a user's wallet
const sessionToken = await generateSessionToken({
  addresses: formatAddressesForToken("0x1234567890123456789012345678901234567890", [
    "ethereum",
    "base",
  ]),
  assets: ["ETH", "USDC", "USDT"],
});
```

### Custom Onramp Flow

```typescript
import { useAccount } from "wagmi";
import { generateSessionToken, formatAddressesForToken } from "@/lib/session-token";

function CustomOnrampButton() {
  const { address } = useAccount();

  const handleCustomOnramp = async () => {
    if (!address) return;

    try {
      // Generate session token
      const sessionToken = await generateSessionToken({
        addresses: formatAddressesForToken(address, ["ethereum", "base"]),
        assets: ["ETH", "USDC", "USDT"]
      });

      if (sessionToken) {
        // Use session token in custom onramp URL
        const onrampUrl = `https://pay.coinbase.com/buy/select-asset?sessionToken=${sessionToken}`;
        window.open(onrampUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to generate session token:', error);
    }
  };

  return (
    <button onClick={handleCustomOnramp} disabled={!address}>
      Custom Onramp Flow
    </button>
  );
}
```

### Multi-Chain Support

```typescript
// Support multiple chains and assets
const sessionToken = await generateSessionToken({
  addresses: [
    {
      address: userAddress,
      blockchains: ["ethereum", "base", "polygon"],
    },
  ],
  assets: ["ETH", "USDC", "USDT", "WETH", "DAI"],
});
```

### Error Handling

```typescript
async function safeGenerateSessionToken(address: string) {
  try {
    const sessionToken = await generateSessionToken({
      addresses: formatAddressesForToken(address, ["ethereum", "base"]),
      assets: ["ETH", "USDC"],
    });

    if (!sessionToken) {
      throw new Error("Failed to generate session token");
    }

    return sessionToken;
  } catch (error) {
    console.error("Session token generation failed:", error);

    // Fallback to basic onramp without session token
    return null;
  }
}
```

## API Reference

### `generateSessionToken(params)`

Generates a session token for secure onramp/offramp initialization.

**Parameters:**

- `params.addresses`: Array of address objects with `address` and `blockchains` fields
- `params.assets`: Optional array of asset symbols (defaults to ["ETH", "USDC"])

**Returns:** `Promise<string | null>`

### `formatAddressesForToken(address, networks)`

Helper function to format addresses for session token requests.

**Parameters:**

- `address`: The wallet address string
- `networks`: Array of blockchain network names

**Returns:** `Array<{ address: string; blockchains: string[] }>`

### `generateJWT(keyName, keySecret)`

Generates a JWT token for CDP API authentication using the CDP SDK.

**Parameters:**

- `keyName`: The CDP API key name
- `keySecret`: The CDP API private key

**Returns:** `Promise<string>`

## Security Considerations

1. **Server-Side Only**: JWT generation happens server-side to protect API credentials
2. **Token Expiration**: JWT tokens expire after 120 seconds by default
3. **Secure Storage**: Never expose CDP API credentials in client-side code
4. **HTTPS Only**: Always use HTTPS in production for secure token transmission

## Migration from Manual HMAC

If you're migrating from manual HMAC signing to CDP SDK:

**Before:**

```typescript
// Manual HMAC signing
const signature = crypto.createHmac("sha256", apiSecret).update(message).digest("hex");
```

**After:**

```typescript
// CDP SDK JWT generation
const token = await generateJWT(apiKey, apiSecret);
```

## Troubleshooting

### Common Issues

1. **"Invalid JWT"**: Check that your API credentials are correct
2. **"Token Expired"**: Regenerate the token (they expire after 120 seconds)
3. **"Invalid Address Format"**: Ensure addresses are valid Ethereum addresses
4. **"Network Not Supported"**: Use supported blockchain networks (ethereum, base, polygon, etc.)

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=session-token
```

This will log detailed information about token generation and API calls.

## Example Integration

See the following components for examples of session token integration:

- `app/components/music/Funds.tsx` - Simple integration with commented examples
- `app/components/music/AdvancedFunds.tsx` - Full-featured component with session token integration
- `app/api/onramp/session-token/route.ts` - API endpoint using CDP SDK
- `lib/session-token.ts` - Session token utilities
- `lib/onramp-utils.ts` - Onramp configuration and URL generation utilities

## Component Features

### AdvancedFunds Component

The `AdvancedFunds` component provides:

1. **Dual Mode Interface**: Switch between simple (OnchainKit FundCard) and advanced configuration
2. **Session Token Security**: Automatic session token generation for secure transactions
3. **Multi-Asset Support**: Support for ETH, USDC, BTC, USDT, DAI, and WETH
4. **Network Compatibility**: Automatic network filtering based on selected assets
5. **Payment Options**: Multiple payment methods, currencies, and countries
6. **URL Generation**: Create shareable onramp URLs with session tokens
7. **Guest Checkout**: Optional guest checkout for users without wallets
8. **Real-time Prices**: Cryptocurrency price fetching and display

### Usage

```typescript
import { AdvancedFunds } from "@/app/components/music/AdvancedFunds";

function MyComponent() {
  const [activeTab, setActiveTab] = useState("funds");

  return (
    <div>
      {activeTab === "funds" && <AdvancedFunds setActiveTab={setActiveTab} />}
    </div>
  );
}
```

## Additional Resources

- [Coinbase CDP Documentation](https://docs.cdp.coinbase.com/)
- [OnchainKit Fund Documentation](https://docs.base.org/builderkits/onchainkit/fund)
- [Wagmi Documentation](https://wagmi.sh/)
