import { NextRequest, NextResponse } from "next/server";
import { livepeer } from "@/lib/livepeer";

export async function POST(req: NextRequest) {
  try {
    const { prompt, height, width, model_id = "" } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const response = await livepeer?.generate?.textToImage({
      prompt,
      height,
      width,
      guidanceScale: 7.5,
      numInferenceSteps: 20,
      modelId: model_id,
      safetyCheck: true,
      numImagesPerPrompt: 1,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error generating image with Livepeer:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to generate image", details: errorMessage },
      { status: 500 },
    );
  }
}
