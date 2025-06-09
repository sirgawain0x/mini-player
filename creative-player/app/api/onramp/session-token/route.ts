"use server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.CDP_API_KEY_NAME;
    const apiSecret = process.env.CDP_API_KEY_PRIVATE_KEY;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "CDP API credentials not configured" },
        { status: 500 }
      );
    }

    // Create the request payload
    const payload = {
      addresses: [
        {
          address: address,
          blockchains: ["base", "ethereum"],
        },
      ],
      assets: ["ETH", "USDC"],
    };

    // Create timestamp and signature for authentication
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const method = "POST";
    const requestPath = "/onramp/v1/token";
    const body = JSON.stringify(payload);

    // Create the message to sign
    const message = timestamp + method + requestPath + body;

    // Import crypto for signing
    const crypto = await import("crypto");
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(message)
      .digest("hex");

    // Make the API call to Coinbase
    const response = await fetch(
      "https://api.developer.coinbase.com/onramp/v1/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CB-ACCESS-KEY": apiKey,
          "CB-ACCESS-SIGN": signature,
          "CB-ACCESS-TIMESTAMP": timestamp,
        },
        body: body,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Coinbase API error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate session token" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ token: data.token });
  } catch (error) {
    console.error("Session token generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
