import { ChangeEvent, Dispatch, SetStateAction } from 'react';

export const onChangeNumberAmount = (
  e: ChangeEvent<HTMLInputElement>,
  callback: Dispatch<SetStateAction<number>>
) => {
  const value = Number(e.target.value);
  if (isNaN(value)) {
    return;
  }
  callback(value);
};
