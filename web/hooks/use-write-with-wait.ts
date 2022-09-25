import { WriteContractResult } from '@wagmi/core';
import { useState } from 'react';
import { UseContractWriteMutationArgs } from 'wagmi/dist/declarations/src/hooks/contracts/useContractWrite';

declare type ContractWriteAsyncFn = (
  overrideConfig?: UseContractWriteMutationArgs
) => Promise<WriteContractResult>;

export const useWriteWithWait = (
  fn?: ContractWriteAsyncFn,
  callback?: () => Promise<any>
) => {
  const [loading, setLoading] = useState(false);
  const callWithWait = async () => {
    try {
      setLoading(true);

      const tx = await fn?.();
      if (tx === undefined) {
        setLoading(false);
        return;
      }

      await tx.wait();
      await callback?.();
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return {
    loading,
    callWithWait,
  };
};
