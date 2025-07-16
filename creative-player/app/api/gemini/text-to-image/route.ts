import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import * as fs from "node:fs";
import path from "path";

// Configure runtime for Node.js APIs
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_GENAI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Initialize Google GenAI SDK
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    });

    // Generate image using the new SDK
    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002", // Use the recommended model for image generation
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/png",
        // You can add more config options here if needed
      },
    });

    // Check for generated images
    const imageObj = response?.generatedImages?.[0]?.image;
    if (!imageObj?.imageBytes) {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }

    // Decode base64 image
    const imageBuffer = Buffer.from(imageObj.imageBytes, "base64");

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `gemini-${timestamp}.png`;
    const filepath = path.join(process.cwd(), "public", "generated", filename);

    // Ensure the directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save the image
    fs.writeFileSync(filepath, imageBuffer);

    // Return the public URL
    const imageUrl = `/generated/${filename}`;

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error("Gemini image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image with Gemini" },
      { status: 500 }
    );
  }
}
