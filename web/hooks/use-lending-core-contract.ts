import LendingCore from '../../artifacts/contracts/LendingCore.sol/LendingCore.json';
import {
  useContract,
  useNetwork,
  usePrepareContractWrite,
  useContractWrite,
} from 'wagmi';
import { useLendingCoreAddress } from './use-lending-core-address';
import { LendingCoreInterface } from '../../typechain-types/contracts/LendingCore';

export const useLendingCoreContractWrite = (
  functions: LendingCoreInterface['functions']
) => {
  const contractAddress = useLendingCoreAddress();
  const { config, error } = usePrepareContractWrite({
    addressOrName: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    contractInterface: LendingCore.abi,
    functionName: 'borrow',
  });
  const { write } = useContractWrite(config);

  // const contract = useContract<LendingCoreInterface>({
  //   contractInterface: LendingCore.abi,
  //   addressOrName: contractAddress,
  // });

  // return contract;
};
