"use server";
import { NextRequest, NextResponse } from "next/server";
import { livepeer } from "@/lib/livepeer";
import { getContractAddresses } from "@/lib/contracts";
import { createPublicClient, http } from "viem";
import { baseSepolia, base } from "viem/chains";

// ABI for checking payment
const create2FactoryABI = [
  {
    name: "getRequiredETHForCents",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "cents", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      height,
      width,
      model_id = "",
      guidanceScale,
      negativePrompt,
      safetyCheck,
      numInferenceSteps,
      numImagesPerPrompt,
      paymentTx, // Transaction hash of the payment
      chainId, // Chain ID where payment was made
    } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!paymentTx || !chainId) {
      return NextResponse.json(
        { error: "Payment is required for image generation" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.LIVEPEER_API_KEY) {
      console.error("LIVEPEER_API_KEY not configured");
      return NextResponse.json(
        { error: "Livepeer API key not configured" },
        { status: 500 }
      );
    }

    // Create public client based on chain
    const chain = chainId === 84532 ? baseSepolia : base;
    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    // Verify payment transaction
    try {
      const tx = await publicClient.getTransaction({
        hash: paymentTx as `0x${string}`,
      });
      const addresses = getContractAddresses(chainId);

      // Check if transaction was sent to the correct contract
      if (tx.to?.toLowerCase() !== addresses.CREATE2_FACTORY.toLowerCase()) {
        return NextResponse.json(
          { error: "Invalid payment transaction - wrong recipient" },
          { status: 400 }
        );
      }

      // Get required ETH amount for 2 cents
      const requiredETH = await publicClient.readContract({
        address: addresses.CREATE2_FACTORY,
        abi: create2FactoryABI,
        functionName: "getRequiredETHForCents",
        args: [BigInt(2)], // 2 cents per image
      });

      // Check if enough ETH was paid
      if (tx.value < requiredETH) {
        return NextResponse.json(
          { error: "Insufficient payment amount" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      return NextResponse.json(
        { error: "Failed to verify payment transaction" },
        { status: 400 }
      );
    }

    console.log("Generating image with prompt:", prompt);

    const response = await livepeer?.generate?.textToImage({
      prompt,
      height: height || 576,
      width: width || 1024,
      guidanceScale: guidanceScale ?? 7.5,
      numInferenceSteps: numInferenceSteps ?? 20,
      modelId: model_id || "",
      safetyCheck: safetyCheck ?? true,
      numImagesPerPrompt: numImagesPerPrompt ?? 1,
      ...(negativePrompt && { negativePrompt }),
    });

    console.log("Livepeer response:", JSON.stringify(response, null, 2));

    // Handle the response more gracefully
    if (!response) {
      return NextResponse.json(
        { error: "No response from Livepeer" },
        { status: 500 }
      );
    }

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error generating image with Livepeer:", error);

    // Check if it's an SDK error (including validation or API errors)
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      (error.name === "SDKValidationError" || error.name === "SDKError")
    ) {
      console.error("SDK Error details:", error);

      // Handle service unavailable specifically
      if ("statusCode" in error && error.statusCode === 503) {
        return NextResponse.json(
          {
            error: "Livepeer service is temporarily unavailable",
            details:
              "The image generation service is currently overloaded. Please try again in a few minutes.",
            retryable: true,
          },
          { status: 503 }
        );
      }

      // Handle other API errors
      if ("body" in error && typeof error.body === "string") {
        try {
          const errorBody = JSON.parse(error.body);
          return NextResponse.json(
            {
              error: "Image generation service error",
              details: errorBody.error?.message || "Unknown service error",
              retryable: true,
            },
            {
              status:
                "statusCode" in error && typeof error.statusCode === "number"
                  ? error.statusCode
                  : 500,
            }
          );
        } catch {
          // If we can't parse the error body, fall through to generic handling
        }
      }

      // Try to extract useful error information from the raw response
      if (
        "rawValue" in error &&
        typeof error.rawValue === "object" &&
        error.rawValue &&
        "errors" in error.rawValue
      ) {
        return NextResponse.json(
          { error: "Image generation failed", details: error.rawValue.errors },
          { status: 500 }
        );
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    const errorType =
      error &&
      typeof error === "object" &&
      "name" in error &&
      typeof error.name === "string"
        ? error.name
        : "Unknown";

    return NextResponse.json(
      {
        error: "Failed to generate image",
        details: errorMessage,
        type: errorType,
      },
      { status: 500 }
    );
  }
}
