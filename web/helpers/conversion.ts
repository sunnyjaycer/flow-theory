import { BigNumber } from 'ethers';

export const wethToUSD = (wethAmount: BigNumber) => {
  // TODO: This should come from a data source
  return wethAmount.mul(1300);
};
