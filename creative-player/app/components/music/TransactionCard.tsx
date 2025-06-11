"use client";
import { useAccount } from "wagmi";
import { useMemo, useCallback } from "react";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
  TransactionToast,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionToastAction,
  TransactionError,
  TransactionResponse,
} from "@coinbase/onchainkit/transaction";
import { useNotification } from "@coinbase/onchainkit/minikit";
import { Card } from "../ui/Card";
import { getDataSuffix, submitReferral } from "@divvi/referral-sdk";
import { useChainId } from "wagmi";

export function TransactionCard() {
  const { address } = useAccount();
  const chainId = useChainId();
  // Divvi referral dataSuffix
  const dataSuffix = getDataSuffix({
    consumer: "0x1Fde40a4046Eda0cA0539Dd6c77ABF8933B94260",
    providers: ["0xc95876688026be9d6fa7a7c33328bd013effa2bb"],
  });
  const calls = useMemo(
    () =>
      address
        ? [
            {
              to: address,
              data: ("0x" + dataSuffix.slice(2)) as `0x${string}`,
              value: BigInt(0),
            },
          ]
        : [],
    [address, dataSuffix]
  );
  const sendNotification = useNotification();
  const handleSuccess = useCallback(
    async (response: TransactionResponse) => {
      const transactionHash = response.transactionReceipts[0].transactionHash;
      await submitReferral({ txHash: transactionHash, chainId });
      console.log(`Transaction successful: ${transactionHash}`);
      await sendNotification({
        title: "Congratulations!",
        body: `You sent your a transaction, ${transactionHash}!`,
      });
    },
    [sendNotification, chainId]
  );
  return (
    <Card title="Customize Your Playlist">
      <div className="space-y-4">
        <p className="text-[var(--app-foreground-muted)] mb-4">
          Experience the power of being onchain.
        </p>
        <div className="flex flex-col items-center">
          {address ? (
            <Transaction
              calls={calls}
              onSuccess={handleSuccess}
              onError={(error: TransactionError) =>
                console.error("Transaction failed:", error)
              }
            >
              <TransactionButton className="text-white text-md" />
              <TransactionStatus>
                <TransactionStatusAction />
                <TransactionStatusLabel />
              </TransactionStatus>
              <TransactionToast className="mb-4">
                <TransactionToastIcon />
                <TransactionToastLabel />
                <TransactionToastAction />
              </TransactionToast>
            </Transaction>
          ) : (
            <p className="text-yellow-400 text-sm text-center mt-2">
              Connect your wallet to customize your playlist.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
