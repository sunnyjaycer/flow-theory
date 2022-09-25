import { useNetwork, chainId } from 'wagmi';
import LendingCore from '../artifacts/contracts/LendingCore.sol/LendingCore.json';

export const useLendingCoreAddress = () => {
  const nullAddress = '0x0000000000000000000000000000000000000000';
  const { chain } = useNetwork();
  if (chain?.id === undefined) {
    return { contractAddress: nullAddress, abi: LendingCore.abi };
  }

  const contractAddress = {
    [chainId.goerli]: '0x417f9cF15Ab5EE43fAB217911472927Da492b417',
    [chainId.rinkeby]: '0x0000000000000000000000000000000000000000',
    [chainId.mainnet]: '0x0000000000000000000000000000000000000000',
    [chainId.optimismGoerli]: '0x5f0c411b7101A4A882948450Ee16710a998D0Eab',
    [chainId.polygonMumbai]: '0x53D64fd973efed01bde18025B49a65634A79e748',
  }[chain.id];

  if (contractAddress === undefined) {
    return { contractAddress: nullAddress, abi: LendingCore.abi };
  }

  return {
    contractAddress,
    abi: LendingCore.abi,
  };
};
