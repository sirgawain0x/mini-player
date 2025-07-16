import { paymentMiddleware } from "x402-next";
import { facilitator } from "@coinbase/x402"; // For mainnet

// Configure the payment middleware
export const middleware = paymentMiddleware(
  (process.env.WALLET_ADDRESS || "0xYourAddress") as `0x${string}`, // your receiving wallet address
  {
    // Route configurations for protected endpoints
    "/api/livepeer/text-to-image": {
      price: "$0.04",
      network: "base", // mainnet
      config: {
        description: "AI Image Generation with Livepeer - $0.04 per image",
        maxTimeoutSeconds: 120, // Allow more time for image generation
      },
    },
    "/api/gemini/text-to-image": {
      price: "$0.05",
      network: "base", // mainnet
      config: {
        description: "AI Cover Art Generation with Gemini - $0.05 per image",
        maxTimeoutSeconds: 120, // Allow more time for image generation
      },
    },
  },
  facilitator // CDP mainnet facilitator
);

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/api/livepeer/text-to-image", "/api/gemini/text-to-image"],
};
