import { useNetwork, chainId } from 'wagmi';
import InterestManager from '../artifacts/contracts/InterestManager.sol/InterestManager.json';

export const useInterestManagerAddress = () => {
  const nullAddress = '0x0000000000000000000000000000000000000000';
  const { chain } = useNetwork();
  if (chain?.id === undefined) {
    return { contractAddress: nullAddress, abi: InterestManager.abi };
  }

  const contractAddress = {
    [chainId.goerli]: '0xcCC25F477249Aab44b4b16567539AbD37C40A4b8',
    [chainId.rinkeby]: '0x0000000000000000000000000000000000000000',
    [chainId.mainnet]: '0x0000000000000000000000000000000000000000',
    [chainId.optimismGoerli]: '0xa9a74Eb69F30e19Dd88990e8a0E1c461aDC6d0db',
    [chainId.polygonMumbai]: '0xf5Ef6A17B7C39442024d69c320A906C9cC84Dc78',
  }[chain.id];

  if (contractAddress === undefined) {
    return { contractAddress: nullAddress, abi: InterestManager.abi };
  }

  return {
    contractAddress,
    abi: InterestManager.abi,
  };
};
