import React, { useMemo } from "react";

// Define the blockchain type for better type safety
type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface BoxProps {
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

interface Props extends BoxProps {
  children?: React.ReactNode;
  // Additional props can be added here if needed
}

declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Record<string, number>;

interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
  currency: string;
  blockchain: Blockchain;
}
declare const WalletRow: React.FC<WalletRowProps>;

// Mock classes object
declare const classes: {
  row: string;
};

/**
 * Priority mapping for different blockchains
 * Higher values indicate higher priority
 */
const BLOCKCHAIN_PRIORITIES: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
} as const;

/**
 * Get priority value for a blockchain
 * @param blockchain - The blockchain to get priority for
 * @returns Priority number (higher = more priority)
 */
const getPriority = (blockchain: Blockchain): number => {
  return BLOCKCHAIN_PRIORITIES[blockchain] ?? -99;
};

/**
 * Check if a wallet balance should be displayed
 * @param balance - The wallet balance to check
 * @returns true if balance should be shown
 */
const shouldDisplayBalance = (balance: WalletBalance): boolean => {
  const priority = getPriority(balance.blockchain);
  // Only show balances with valid blockchain priority and positive amounts
  return priority > -99 && balance.amount > 0;
};

/**
 * Sort balances by priority (highest first) and then by amount (highest first)
 */
const sortBalances = (a: WalletBalance, b: WalletBalance): number => {
  const priorityA = getPriority(a.blockchain);
  const priorityB = getPriority(b.blockchain);

  if (priorityA !== priorityB) {
    return priorityB - priorityA;
  }

  return b.amount - a.amount;
};

/**
 * WalletPage component displays a list of wallet balances
 * sorted by blockchain priority and amount
 */
const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Filter, sort, and format balances with proper memoization
  const processedBalances = useMemo(() => {
    return balances
      .filter(shouldDisplayBalance)
      .sort(sortBalances)
      .map((balance): FormattedWalletBalance => {
        const usdValue = (prices[balance.currency] || 0) * balance.amount;
        return {
          ...balance,
          formatted: balance.amount.toFixed(2),
          usdValue,
        };
      });
  }, [balances, prices]);

  // Generate wallet rows with stable keys
  const walletRows = useMemo(() => {
    return processedBalances.map((balance) => (
      <WalletRow
        key={`${balance.blockchain}-${balance.currency}`}
        className={classes.row}
        amount={balance.amount}
        usdValue={balance.usdValue}
        formattedAmount={balance.formatted}
        currency={balance.currency}
        blockchain={balance.blockchain}
      />
    ));
  }, [processedBalances]);

  return (
    <div {...rest}>
      {walletRows}
      {children}
    </div>
  );
};

export default WalletPage;
export type { Props as WalletPageProps, WalletBalance, FormattedWalletBalance };
