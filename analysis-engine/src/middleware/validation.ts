/**
 * Validate Ethereum wallet address format
 * @param address - The wallet address to validate
 * @returns true if valid, false otherwise
 */
export function validateWalletAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Check if it's a valid Ethereum address (0x followed by 40 hex characters)
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
}

/**
 * Normalize wallet address to lowercase with 0x prefix
 * @param address - The wallet address to normalize
 * @returns Normalized address
 */
export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}
