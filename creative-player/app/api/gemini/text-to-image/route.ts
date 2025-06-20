import { GoogleGenAI, Modality } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import * as fs from "node:fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { prompt, paymentHash } = await request.json();

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Gemini uses API key billing, so payment hash is optional
    // You can still track payments if provided for analytics/credits
    if (paymentHash) {
      console.log("Payment hash provided for Gemini generation:", paymentHash);
    }

    // Initialize Gemini AI
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    });

    if (!process.env.GOOGLE_GENAI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Generate image using Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    // Process the response
    let imageBuffer: Buffer | null = null;
    let textResponse = "";

    if (!response.candidates || !response.candidates[0]?.content?.parts) {
      return NextResponse.json(
        { error: "Invalid response from Gemini" },
        { status: 500 }
      );
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        textResponse += part.text;
      } else if (part.inlineData?.data) {
        const imageData = part.inlineData.data;
        imageBuffer = Buffer.from(imageData, "base64");
      }
    }

    if (!imageBuffer) {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }

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
      textResponse,
      paymentHash,
    });
  } catch (error) {
    console.error("Gemini image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image with Gemini" },
      { status: 500 }
    );
  }
}
