import { Typography } from '@mui/material';
import type { ReactNode } from 'react';

type Heading = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const variants = {
  '4xl': 'h1',
  '3xl': 'h1',
  '2xl': 'h1',
  xl: 'h1',
  lg: 'h2',
  md: 'h3',
  sm: 'subtitle1',
  xs: 'body2',
} as const;

export function Title({
  headingLevel = 'h2',
  size = 'lg',
  children,
  className,
  id,
}: {
  headingLevel?: Heading;
  size?: keyof typeof variants | string;
  children?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <Typography
      component={headingLevel}
      variant={variants[size as keyof typeof variants] ?? 'h6'}
      className={['pf-v6-c-title', `pf-m-${headingLevel}`, className]
        .filter(Boolean)
        .join(' ')}
      id={id}
    >
      {children}
    </Typography>
  );
}
