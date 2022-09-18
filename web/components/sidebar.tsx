import Image from 'next/image';
import { useCurrentDashboard } from '../hooks/use-current-dashboard';

export const Sidebar = () => {
  const collateralRatio = 4.2;
  const fixedApr = 1.0;
  const decimals = 2;
  const currentDashboard = useCurrentDashboard();

  if (!currentDashboard) {
    return null;
  }

  const interestEarned = 0;
  const interestPaid = 0;

  const rate = 0;

  const interestText = {
    lender: 'Interest Earned',
    borrower: 'Interest Paid',
  }[currentDashboard];

  const interest = {
    lender: interestEarned,
    borrower: interestPaid,
  }[currentDashboard];

  const getFormattedRate = () => {
    if (rate === undefined) {
      return `--/year`;
    }
    return `USDC ${rate.toFixed(decimals)}/year`;
  };

  const displayRate = `${rate === undefined ? `--` : 'rate'}/year`;

  return (
    <div>
      <div className="font-bold text-blue--3">
        <p className="mb-4">
          Collateral Ratio | {collateralRatio.toFixed(decimals)}
        </p>
        <p className="mb-4">Fixed APR | {fixedApr.toFixed(decimals)}</p>
        <h2 className="text-4xl font-thin mb-4 text-white">{interestText}</h2>
        <p className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-brand-blue to-brand-purple mb-4">
          {interest.toFixed(decimals)}
        </p>
        <div className="mb-4">
          <Image src="/usdc-logo.png" width={50} height={50} />
        </div>

        <p>Rate: {getFormattedRate()}</p>
      </div>
    </div>
  );
};
