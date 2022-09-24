import { useNetwork, chainId } from 'wagmi';

export const useLendingCoreAddress = (): string => {
  const nullAddress = '0x0';
  const { chain } = useNetwork();
  if (chain?.id === undefined) {
    return nullAddress;
  }

  const contractAddress = {
    [chainId.goerli]: '0x5c2A0458DC8CA0670C5FfD76ccDda9C2afFc2266',
    [chainId.rinkeby]: '0x0',
    [chainId.mainnet]: '0x0',
    [chainId.optimismGoerli]: '0x0',
    [chainId.polygonMumbai]: '0x0',
  }[chain.id];

  if (contractAddress === undefined) {
    return nullAddress;
  }

  return contractAddress;
};
