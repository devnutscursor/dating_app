/** Coins → USD rate for all members ($5 per 100 coins). */
export const COIN_TO_USD = 0.05;

/** Minimum withdrawal value in USD after fee. */
export const MIN_WITHDRAWAL_USD = 60;

/** Platform fee on withdrawals (5%). */
export const WITHDRAWAL_FEE_RATE = 0.05;

export function coinsToUsd(coins) {
  return Math.round(coins * COIN_TO_USD * 100) / 100;
}

export function withdrawalFeeCoins(amountCoins) {
  return Math.floor(amountCoins * WITHDRAWAL_FEE_RATE);
}

export function netUsdAfterFee(amountCoins) {
  const fee = withdrawalFeeCoins(amountCoins);
  return Math.round((amountCoins - fee) * COIN_TO_USD * 100) / 100;
}

export function meetsMinimumWithdrawal(amountCoins) {
  return netUsdAfterFee(amountCoins) >= MIN_WITHDRAWAL_USD;
}
