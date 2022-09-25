import { useNetwork, chainId } from 'wagmi';
import ERC20 from '../../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';

export const useWethAddress = () => {
  const nullAddress = '0x0';
  const { chain } = useNetwork();
  if (chain?.id === undefined) {
    return { contractAddress: nullAddress, abi: ERC20.abi };
  }

  const contractAddress = {
    [chainId.goerli]: '0x5AF1c2B6275ECE07351Ab808dc54864f0f2747A1',
    [chainId.rinkeby]: '0x0',
    [chainId.mainnet]: '0x0',
    [chainId.optimismGoerli]: '0x0',
    [chainId.polygonMumbai]: '0x0',
  }[chain.id];

  if (contractAddress === undefined) {
    return { contractAddress: nullAddress, abi: ERC20.abi };
  }

  return {
    contractAddress,
    abi: ERC20.abi,
  };
};
