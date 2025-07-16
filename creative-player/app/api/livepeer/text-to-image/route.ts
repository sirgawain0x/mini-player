import { NextRequest, NextResponse } from "next/server";
import { livepeer } from "@/lib/livepeer";

// Configure runtime for Node.js APIs
export const runtime = "nodejs";

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
    } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
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
