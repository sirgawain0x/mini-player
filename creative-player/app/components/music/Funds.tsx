"use client";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { FundCard } from "@coinbase/onchainkit/fund";
// NOTE: To integrate Divvi referral, import getDataSuffix, submitReferral from '@divvi/referral-sdk' and useChainId from 'wagmi' when adding a custom transaction. See integration plan for details.

type FundProps = {
  setActiveTab: (tab: string) => void;
};

export function Fund({ setActiveTab }: FundProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Add Funds to Your Wallet">
        <FundCard
          assetSymbol="ETH"
          country="US"
          currency="USD"
          presetAmountInputs={["10", "20", "100"]}
        />
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => setActiveTab("home")}
        >
          Back to Home
        </Button>
      </Card>
    </div>
  );
}
