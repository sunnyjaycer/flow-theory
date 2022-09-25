import { useRouter } from 'next/router';

export const useCurrentDashboard = (): 'lender' | 'borrower' | undefined => {
  const { pathname } = useRouter();

  if (pathname.includes('lender')) return 'lender';
  if (pathname.includes('borrower')) return 'borrower';
};
