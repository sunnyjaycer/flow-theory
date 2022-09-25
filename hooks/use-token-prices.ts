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
    enabled:
      lendingCoreAddress !== '0x0000000000000000000000000000000000000000',
  });

  const { data: debtTokenPrice, isFetching: isFetchingDebtTokenPrice } =
    useContractRead({
      addressOrName: lendingCoreAddress,
      contractInterface: lendingCoreAbi,
      functionName: 'debtTokenPrice',
      enabled:
        lendingCoreAddress !== '0x0000000000000000000000000000000000000000',
    });

  const { data: granularity, isFetching: isFetchingGranularity } =
    useContractRead({
      addressOrName: lendingCoreAddress,
      contractInterface: lendingCoreAbi,
      functionName: 'GRANULARITY',
      enabled:
        lendingCoreAddress !== '0x0000000000000000000000000000000000000000',
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
    collateralTokenPrice: (collateralTokenPrice ??
      BigNumber.from(0)) as any as BigNumber,
    debtTokenPrice: (debtTokenPrice ?? BigNumber.from(0)) as any as BigNumber,
    granularity: (granularity ?? BigNumber.from(1)) as any as BigNumber,
  };
};
