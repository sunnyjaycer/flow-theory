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
      collateralTokenPrice: 0,
      debtTokenPrice: 0,
    };
  }

  const formattedCollateralTokenPrice = (
    collateralTokenPrice as any as BigNumber
  ).div(granularity as any as BigNumber);
  const formattedDebtTokenPrice = (debtTokenPrice as any as BigNumber).div(
    granularity as any as BigNumber
  );

  return {
    collateralTokenPrice: formattedCollateralTokenPrice.toNumber(),
    debtTokenPrice: formattedDebtTokenPrice.toNumber(),
  };
};
