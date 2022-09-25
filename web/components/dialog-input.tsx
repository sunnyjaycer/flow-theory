import { ChangeEvent, Dispatch, ReactNode, SetStateAction } from 'react';
import { onChangeNumberAmount } from '../helpers/number-helpers';
import Image from 'next/image';
import { BigNumber } from 'ethers';

export const DialogInput = ({
  value,
  icon,
  label,
  buttonText,
  className,
  onChange,
  onButtonPress,
}: {
  value: string | number | readonly string[] | undefined;
  icon?: string;
  label: string;
  buttonText?: string;
  className?: string;
  onChange: Dispatch<SetStateAction<BigNumber>>;
  onButtonPress?: VoidFunction;
}) => {
  // Dialog Input is always used for a number input right now
  const sanitizedOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChangeNumberAmount(e, onChange);
  };
  const inputName = (Math.random() + 1).toString(36).substring(7);

  return (
    <div className={className}>
      <div className="flex justify-between mb-2">
        <label className="font-bold" htmlFor={inputName}>
          {label}
        </label>
        {buttonText && onButtonPress ? (
          <button className="text-brand-blue font-bold" onClick={onButtonPress}>
            {buttonText}
          </button>
        ) : null}
      </div>
      <div className="flex items-center bg-background px-2 gap-2">
        {icon ? <Image src={icon} width={30} height={30} alt={icon} /> : null}
        <input
          name={inputName}
          placeholder="0"
          className="bg-background text-xl font-thin w-full h-12 mt-1 focus:outline-none"
          value={value}
          onChange={sanitizedOnChange}
        />
      </div>
    </div>
  );
};
