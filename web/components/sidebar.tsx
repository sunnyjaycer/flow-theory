import Image from 'next/image';
import { useCurrentDashboard } from '../hooks/use-current-dashboard';
import { GradientText } from './gradient-text';
import { Odometer } from './odometer';
import { useQuery, gql } from '@apollo/client';
import { useEffect, useState } from 'react';
import { formatEther } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { RATE_MULTIPLE } from '../constants';
import { useAccount, useContractRead } from 'wagmi';
import { useLendingCoreAddress } from '../hooks/use-lending-core-address';
import { useTokenPrices } from '../hooks/use-token-prices';

const GET_STREAMS = gql`
  query GetStreams {
    streams(
      where: {
        sender: "0xcdccad1de51d4e2671e0930a0b7310042998c252"
        receiver: "0x86734dad0dc33fe712ec1179e60b09469e7fb83b"
      }
    ) {
      token {
        id
        symbol
      }
      createdAtTimestamp
      updatedAtTimestamp
      currentFlowRate
      streamedUntilUpdatedAt
    }
  }
`;

const fixedApr = 1.0;
const decimals = 2;

export const Sidebar = () => {
  const currentDashboard = useCurrentDashboard();

  const { address } = useAccount();

  if (!currentDashboard) {
    return null;
  }

  if (currentDashboard === 'borrower') {
    return <BorrowerSidebar></BorrowerSidebar>;
  } else {
    return <LenderSidebar></LenderSidebar>;
  }
};

const BorrowerSidebar = () => {
  const currentDashboard = useCurrentDashboard();
  const { loading, error, data: getStreamsResult } = useQuery(GET_STREAMS);
  const [totalStreamed, setTotalStreamed] = useState(0);
  const [flowRate, setFlowRate] = useState(0);
  const [collateralRatio, setCollateralRatio] = useState('');

  useEffect(() => {
    if (loading === false) {
      setTotalStreamed(getTotalStreamed());
      setFlowRate(getFlowRate());
    }
  }, [loading]);

  const { address } = useAccount();
  const { contractAddress: lendingCoreAddress, abi: lendingCoreAbi } =
    useLendingCoreAddress();
  const {
    data: borrowerProfile,
    isFetching: isFetchingBorrowerProfiles,
    refetch: refetchBorrowerProfiles,
  } = useContractRead({
    addressOrName: lendingCoreAddress,
    contractInterface: lendingCoreAbi,
    functionName: 'borrowerProfiles',
    args: [address],
  });
  const { collateralTokenPrice, debtTokenPrice, granularity } =
    useTokenPrices();
  const currentCollateralAmount =
    borrowerProfile?.collateralAmount as any as BigNumber;
  const currentBorrowAmount = borrowerProfile?.debtAmount as any as BigNumber;

  useEffect(() => {
    if (isFetchingBorrowerProfiles === false) {
      setCollateralRatio(getCollateralRatio?.()?.toString() ?? '');
    }
  }, [isFetchingBorrowerProfiles]);

  const getActiveStream = () => {
    if (getStreamsResult === undefined) return {};

    const activeStream = getStreamsResult.streams.filter(
      (stream: any) => Number(stream.currentFlowRate) > 0
    )[0];

    return activeStream;
  };

  const getFlowRate = () => {
    const activeStream = getActiveStream();
    if (activeStream === undefined) return 0;

    return Number(formatEther(activeStream.currentFlowRate));
  };

  const getTotalStreamed = () => {
    const activeStream = getActiveStream();

    const currentTime = Math.floor(Date.now() / 1000);
    const streamedUntilUpdatedAt = BigNumber.from(
      activeStream.streamedUntilUpdatedAt
    );
    const delta = BigNumber.from(
      currentTime - Number(activeStream.updatedAtTimestamp)
    );
    const currentFlowRate = BigNumber.from(activeStream.currentFlowRate);
    const totalPaid = streamedUntilUpdatedAt.add(delta.mul(currentFlowRate));

    return Number(formatEther(totalPaid));
  };

  const getCollateralRatio = () => {
    if (currentBorrowAmount.mul(debtTokenPrice).eq(0)) {
      return undefined;
    }

    return currentCollateralAmount
      .mul(collateralTokenPrice)
      .div(currentBorrowAmount.mul(debtTokenPrice));
  };

  const interestPaid = totalStreamed;

  const rate = flowRate * RATE_MULTIPLE;

  const getFormattedRate = () => {
    if (rate === undefined) {
      return `--/year`;
    }
    const annualizedRate = (rate / RATE_MULTIPLE) * 60 * 60 * 24 * 365;
    return `USDC ${annualizedRate.toFixed(decimals)}/year`;
  };

  return (
    <div>
      <div className="font-bold text-blue--3">
        {currentDashboard === 'borrower' ? (
          <p className="mb-4">Collateral Ratio | {collateralRatio}</p>
        ) : null}
        <p className="mb-4">Fixed APR | {fixedApr.toFixed(decimals)}</p>
        <h2 className="text-4xl font-thin mb-4 text-white">Interest Paid</h2>
        <Odometer start={interestPaid} rate={rate} />
        <div className="mb-4">
          <Image src="/usdc-logo.png" width={50} height={50} alt="USDC Logo" />
        </div>

        {currentDashboard === 'borrower' ? (
          <p>Rate: {getFormattedRate()}</p>
        ) : null}
      </div>
    </div>
  );
};

const LenderSidebar = () => {
  return (
    <div>
      <div className="font-bold text-blue--3">
        <p className="mb-4">Fixed APR | {fixedApr.toFixed(decimals)}</p>
        <h2 className="text-4xl font-thin mb-4 text-white">Interest Gained</h2>
        <Odometer start={0} rate={0} />
        <div className="mb-4">
          <Image src="/usdc-logo.png" width={50} height={50} alt="USDC Logo" />
        </div>
        <p>Payout: (Once a day)</p>
      </div>
    </div>
  );
};
