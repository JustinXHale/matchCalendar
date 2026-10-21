import { Box } from '@mui/material';
import type { ElementType, ReactNode } from 'react';

type WrapperProps = { children?: ReactNode; className?: string };

export function Page({ masthead, children }: WrapperProps & { masthead?: ReactNode }) {
  return (
    <div className="pf-v6-c-page">
      {masthead}
      {children}
    </div>
  );
}

export function PageSection({
  component = 'section',
  children,
  className,
  id,
  isFilled: _isFilled,
}: WrapperProps & { component?: ElementType; id?: string; isFilled?: boolean }) {
  void _isFilled;
  return (
    <Box component={component} id={id} className={['pf-v6-c-page__main-section', className].filter(Boolean).join(' ')}>
      {children}
    </Box>
  );
}

export function Masthead({ children, className }: WrapperProps) {
  return <header className={['pf-v6-c-masthead', className].filter(Boolean).join(' ')}>{children}</header>;
}

export function MastheadMain({ children, className }: WrapperProps) {
  return <div className={['pf-v6-c-masthead__main', className].filter(Boolean).join(' ')}>{children}</div>;
}

export function MastheadBrand({ children, className }: WrapperProps) {
  return <div className={['pf-v6-c-masthead__brand', className].filter(Boolean).join(' ')}>{children}</div>;
}

export function MastheadContent({ children, className }: WrapperProps) {
  return <div className={['pf-v6-c-masthead__content', className].filter(Boolean).join(' ')}>{children}</div>;
}
