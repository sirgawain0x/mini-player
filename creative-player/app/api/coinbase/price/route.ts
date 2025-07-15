import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.coinbase.com/v2/prices/ETH-USD/spot",
      {
        headers: {
          "Content-Type": "application/json",
          "X-Coinbase-Version": "2024-07-25",
        },
        next: {
          revalidate: 60, // Revalidate every 60 seconds
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch price from Coinbase: ${response.statusText}`
      );
    }

    const data = await response.json();
    const ethPrice = parseFloat(data.data.amount);
    return NextResponse.json({ ethPrice });
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    return NextResponse.json(
      { error: "Failed to fetch ETH price" },
      { status: 500 }
    );
  }
}
