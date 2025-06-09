"use client";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { FundCard } from "@coinbase/onchainkit/fund";

type FundProps = {
  setActiveTab: (tab: string) => void;
};

export function Fund({ setActiveTab }: FundProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Top Up Your Wallet">
        <FundCard
          assetSymbol="ETH"
          country="US"
          currency="USD"
          presetAmountInputs={["10", "20", "100"]}
        />
        <Button variant="outline" onClick={() => setActiveTab("home")}>
          Back to Home
        </Button>
      </Card>
    </div>
  );
}
