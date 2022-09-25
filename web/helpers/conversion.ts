import { BigNumber } from 'ethers';

export const wethToUSD = (wethAmount: string) => {
  // TODO: This should come from a data source
  if (wethAmount === '') return BigNumber.from(0);

  return BigNumber.from(wethAmount).mul(1300);
};
