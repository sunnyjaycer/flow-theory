import { DetailedHTMLProps, HTMLAttributes } from 'react';

export const GradientText = ({
  className,
  ...props
}: DetailedHTMLProps<
  HTMLAttributes<HTMLParagraphElement>,
  HTMLParagraphElement
>) => {
  return (
    <p
      {...props}
      className={
        `text-transparent bg-clip-text bg-gradient-to-b from-brand-blue to-brand-purple ` +
        className
      }
    ></p>
  );
};
