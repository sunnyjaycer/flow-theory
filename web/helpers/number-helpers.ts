import { BigNumber } from 'ethers';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';

export const onChangeNumberAmount = (
  e: ChangeEvent<HTMLInputElement>,
  callback: Dispatch<SetStateAction<BigNumber>>
) => {
  const value = Number(e.target.value);
  if (isNaN(value)) {
    return;
  }
  callback(BigNumber.from(value));
};
