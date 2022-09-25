import { useNetwork, chainId } from 'wagmi';
import ERC20 from '../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';

export const useUsdcxAddress = () => {
  const nullAddress = '0x0000000000000000000000000000000000000000';
  const { chain } = useNetwork();
  if (chain?.id === undefined) {
    return { contractAddress: nullAddress, abi: ERC20.abi };
  }

  const contractAddress = {
    [chainId.goerli]: '0x8aE68021f6170E5a766bE613cEA0d75236ECCa9a',
    [chainId.rinkeby]: '0x0000000000000000000000000000000000000000',
    [chainId.mainnet]: '0x0000000000000000000000000000000000000000',
    [chainId.optimismGoerli]: '0x0000000000000000000000000000000000000000',
    [chainId.polygonMumbai]: '0x42bb40bF79730451B11f6De1CbA222F17b87Afd7',
  }[chain.id];

  if (contractAddress === undefined) {
    return { contractAddress: nullAddress, abi: ERC20.abi };
  }

  return {
    contractAddress,
    abi: ERC20.abi,
  };
};
