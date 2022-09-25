import { BigNumber } from 'ethers';
import { useContractRead } from 'wagmi';
import { useLendingCoreAddress } from './use-lending-core-address';

export const useTokenPrices = () => {
  const { contractAddress: lendingCoreAddress, abi: lendingCoreAbi } =
    useLendingCoreAddress();

  const {
    data: collateralTokenPrice,
    isFetching: isFetchingCollateralTokenPrice,
  } = useContractRead({
    addressOrName: lendingCoreAddress,
    contractInterface: lendingCoreAbi,
    functionName: 'collateralTokenPrice',
  });

  const { data: debtTokenPrice, isFetching: isFetchingDebtTokenPrice } =
    useContractRead({
      addressOrName: lendingCoreAddress,
      contractInterface: lendingCoreAbi,
      functionName: 'debtTokenPrice',
    });

  const { data: granularity, isFetching: isFetchingGranularity } =
    useContractRead({
      addressOrName: lendingCoreAddress,
      contractInterface: lendingCoreAbi,
      functionName: 'GRANULARITY',
    });

  const loading =
    isFetchingCollateralTokenPrice ||
    isFetchingDebtTokenPrice ||
    isFetchingGranularity;
  if (loading) {
    return {
      collateralTokenPrice: BigNumber.from(0),
      debtTokenPrice: BigNumber.from(0),
      granularity: BigNumber.from(1),
    };
  }

  return {
    collateralTokenPrice: collateralTokenPrice as any as BigNumber,
    debtTokenPrice: debtTokenPrice as any as BigNumber,
    granularity: granularity as any as BigNumber,
  };
};
