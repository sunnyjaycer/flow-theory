import { useState } from 'react';
import { FancyDottedBox } from '../components/fancy-dotted-box';
import { PrimaryButton } from '../components/primary-button';
import { DepositConfirmationDialog } from '../modals/lender/deposit-confirmation-dialog';
import { DepositDialog } from '../modals/lender/deposit-dialog';
import { PlusIcon } from '../svg/plus-icon';
import ERC20 from '../../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi';
import { useLendingCoreAddress } from '../hooks/use-lending-core-address';
import { ethers } from 'ethers';

type CurrentDialog = 'depositDialog' | 'depositConfirmationDialog' | undefined;

const Lender = () => {
  const currentLendAmount = 0;
  const [currentDialog, setCurrentDialog] = useState<CurrentDialog>();
  const [depositAmount, setDepositAmount] = useState(0);

  const exitDialog = () => {
    setCurrentDialog(undefined);
    setDepositAmount(0);
  };

  const usdcx = '0x8aE68021f6170E5a766bE613cEA0d75236ECCa9a'; // Goerly USDCX,
  const { address: owner } = useAccount();
  const { contractAddress: lendingCoreAddress, abi: lendingCoreAbi } =
    useLendingCoreAddress();
  const { data, isLoading: loadingAllowance } = useContractRead({
    addressOrName: usdcx,
    contractInterface: ERC20.abi,
    functionName: 'allowance',
    args: [owner, lendingCoreAddress],
  });
  const allowance = Number(data?.toString());

  const { config: configIncreaseAllowance, isLoading: loadingApproval } =
    usePrepareContractWrite({
      addressOrName: usdcx,
      contractInterface: ERC20.abi,
      functionName: 'approve',
      args: [lendingCoreAddress, ethers.constants.MaxUint256],
    });
  const { write: increaseAllowance } = useContractWrite(
    configIncreaseAllowance
  );

  if (loadingAllowance || loadingApproval) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {currentLendAmount === 0 ? (
        <NoLends
          allowance={allowance}
          increaseAllowance={increaseAllowance}
          openDialog={() => {
            setCurrentDialog('depositDialog');
          }}
        />
      ) : null}
      <DepositDialog
        depositAmount={depositAmount}
        setDepositAmount={setDepositAmount}
        showDialog={currentDialog === 'depositDialog'}
        closeDialog={exitDialog}
        onApprove={() => setCurrentDialog('depositConfirmationDialog')}
      />
      <DepositConfirmationDialog
        depositAmount={depositAmount}
        showDialog={currentDialog === 'depositConfirmationDialog'}
        closeDialog={exitDialog}
      />
    </>
  );
};

const NoLends = ({
  allowance,
  increaseAllowance,
  openDialog,
}: {
  allowance: number;
  increaseAllowance?: VoidFunction;
  openDialog: VoidFunction;
}) => {
  return (
    <FancyDottedBox>
      <div className="h-full flex gap-4 items-center">
        <p className="text-gray-400">Start depositing</p>
        {allowance === 0 ? (
          <PrimaryButton onClick={increaseAllowance}>
            <div className="flex items-center gap-2">
              Allow spending of USDCx
            </div>
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={openDialog}>
            <div className="flex items-center gap-2">
              <div className="mb-1">
                <PlusIcon />
              </div>
              Deposit Collateral
            </div>
          </PrimaryButton>
        )}
      </div>
    </FancyDottedBox>
  );
};

export default Lender;
