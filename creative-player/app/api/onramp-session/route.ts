import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const CDP_API_KEY = process.env.CDP_API_KEY_NAME;
const CDP_API_SECRET = process.env.CDP_API_KEY_PRIVATE_KEY;
const CDP_PROJECT_ID = process.env.NEXT_PUBLIC_CDP_PROJECT_ID;

if (!CDP_API_KEY || !CDP_API_SECRET) {
  throw new Error(
    "CDP_API_KEY_NAME and CDP_API_KEY_PRIVATE_KEY must be set in your environment variables."
  );
}
if (!CDP_PROJECT_ID) {
  throw new Error(
    "NEXT_PUBLIC_CDP_PROJECT_ID must be set in your environment variables."
  );
}

function generateJWT() {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      iss: CDP_API_KEY,
      sub: CDP_API_KEY,
      aud: "coinbase-cloud",
      iat: now,
      exp: now + 60 * 5, // 5 minutes
    },
    CDP_API_SECRET as string,
    { algorithm: "HS256" }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      address,
      assets = ["USDC"],
      blockchains = ["base"],
      fiatCurrency = "USD",
      defaultPaymentMethod = "CRYPTO_ACCOUNT",
      presetFiatAmount,
      quoteId,
    } = body;

    // Validate address
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      );
    }

    // Validate supported assets
    const supportedAssets = ["USDC", "ETH", "USDT"];
    const invalidAssets = assets.filter(
      (asset: string) => !supportedAssets.includes(asset)
    );
    if (invalidAssets.length > 0) {
      return NextResponse.json(
        {
          error: `Unsupported assets: ${invalidAssets.join(", ")}. Supported: ${supportedAssets.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate supported blockchains
    const supportedBlockchains = ["base", "ethereum"];
    const invalidBlockchains = blockchains.filter(
      (chain: string) => !supportedBlockchains.includes(chain)
    );
    if (invalidBlockchains.length > 0) {
      return NextResponse.json(
        {
          error: `Unsupported blockchains: ${invalidBlockchains.join(", ")}. Supported: ${supportedBlockchains.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const jwtToken = generateJWT();

    // Prepare request body for session token
    const requestBody: {
      addresses: Array<{ address: string; blockchains: string[] }>;
      assets: string[];
      fiatCurrency: string;
      defaultPaymentMethod: string;
      presetFiatAmount?: number;
      quoteId?: string;
    } = {
      addresses: [
        {
          address,
          blockchains,
        },
      ],
      assets,
      fiatCurrency,
      defaultPaymentMethod,
    };
    if (presetFiatAmount) requestBody.presetFiatAmount = presetFiatAmount;
    if (quoteId) requestBody.quoteId = quoteId;

    // Call Coinbase Onramp Session Token API
    const response = await fetch(
      "https://api.developer.coinbase.com/onramp/v1/token",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    let data: { token?: string; data?: { token?: string }; error?: string };
    let sessionToken: string | undefined;

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
      sessionToken = data.token || data.data?.token;
    } else {
      const text = await response.text();
      data = { error: text };
    }

    if (!response.ok || !sessionToken) {
      return NextResponse.json(
        { error: data.error || "Failed to get session token" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      sessionToken,
      config: {
        assets,
        blockchains,
        fiatCurrency,
        defaultPaymentMethod,
        presetFiatAmount,
        projectId: CDP_PROJECT_ID,
      },
    });
  } catch (e) {
    console.error("Error generating session token:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
