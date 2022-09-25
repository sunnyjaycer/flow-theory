import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';

export const onChangeNumberAmount = (
  e: ChangeEvent<HTMLInputElement>,
  callback: Dispatch<SetStateAction<string>>
) => {
  const value = e.target.value;
  // if (isNaN(value)) {
  //   return;
  // }
  callback(value);
};
