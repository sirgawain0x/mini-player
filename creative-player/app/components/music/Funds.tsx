"use client";
import React, { useState, useEffect } from "react";
import { AdvancedFunds } from "./AdvancedFunds";
// import { useAccount } from "wagmi";
// import { generateSessionToken, formatAddressesForToken } from "@/lib/session-token";
// NOTE: To integrate Divvi referral, import getDataSuffix, submitReferral from '@divvi/referral-sdk' and useChainId from 'wagmi' when adding a custom transaction. See integration plan for details.

type FundProps = {
  setActiveTab: (tab: string) => void;
};

export function Fund({ setActiveTab }: FundProps) {
  const [cdpProjectId, setCdpProjectId] = useState("");

  useEffect(() => {
    // Fetch CDP Project ID from server
    const fetchCdpProjectId = async () => {
      try {
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setCdpProjectId(data.config.cdpProjectId || "");
        }
      } catch {
        setCdpProjectId("");
      }
    };

    fetchCdpProjectId();
  }, []);

  return (
    <AdvancedFunds setActiveTab={setActiveTab} cdpProjectId={cdpProjectId} />
  );
}
