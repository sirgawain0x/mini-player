import { useEffect, useState } from "react";
import { useGetRequiredETH } from "@/lib/contracts";

export interface ImageGenerationPrice {
  usdPrice: number;
  ethPrice: string;
  lastUpdated: Date;
  isLoading: boolean;
  error?: string;
}

export function useImageGenerationPrice() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const priceInCents = BigInt(2); // 2 cents per image

  const {
    data: ethRequired,
    isError,
    isLoading,
  } = useGetRequiredETH(priceInCents);

  const formatPrice = (wei: bigint): string => {
    return (Number(wei) / 1e18).toFixed(9); // Convert wei to ETH with 9 decimal places
  };

  const price: ImageGenerationPrice = {
    usdPrice: Number(priceInCents) / 100, // Convert cents to dollars
    ethPrice: ethRequired ? formatPrice(ethRequired) : "0",
    lastUpdated,
    isLoading,
    error: isError ? "Failed to fetch price" : undefined,
  };

  // Update lastUpdated timestamp when price changes
  useEffect(() => {
    if (ethRequired) {
      setLastUpdated(new Date());
    }
  }, [ethRequired]);

  return price;
}
