import {
  Button as MuiButton,
  CircularProgress,
  type ButtonProps as MuiButtonProps,
} from '@mui/material';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type PfButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'danger'
  | 'warning'
  | 'link'
  | 'plain'
  | 'control';

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & {
  variant?: PfButtonVariant;
  isDisabled?: boolean;
  isAriaDisabled?: boolean;
  isInline?: boolean;
  isBlock?: boolean;
  isDanger?: boolean;
  isLoading?: boolean;
  size?: 'default' | 'sm' | 'lg' | string;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end' | 'left' | 'right';
  ouiaId?: string;
};

function mappedVariant(variant: PfButtonVariant, danger: boolean) {
  if (danger || variant === 'danger') {
    return { variant: 'contained', color: 'error' } as const;
  }
  if (variant === 'secondary' || variant === 'tertiary' || variant === 'control') {
    return { variant: 'outlined', color: 'primary' } as const;
  }
  if (variant === 'link' || variant === 'plain') {
    return { variant: 'text', color: 'primary' } as const;
  }
  if (variant === 'warning') {
    return { variant: 'contained', color: 'warning' } as const;
  }
  return { variant: 'contained', color: 'primary' } as const;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    isDisabled,
    isAriaDisabled,
    disabled,
    isBlock,
    isDanger = false,
    isLoading,
    size,
    icon,
    iconPosition = 'start',
    children,
    className,
    ouiaId,
    type = 'button',
    isInline,
    ...rest
  },
  ref,
) {
  const mapped = mappedVariant(variant, isDanger);
  const modifier = isDanger || variant === 'danger'
    ? 'pf-m-danger'
    : variant === 'secondary' || variant === 'tertiary' || variant === 'control'
      ? 'pf-m-secondary'
      : variant === 'link'
        ? 'pf-m-link'
        : variant === 'plain'
          ? 'pf-m-plain'
          : 'pf-m-primary';
  const progress = isLoading ? <CircularProgress color="inherit" size={18} /> : null;
  const startIcon = progress ?? (
    icon && (iconPosition === 'start' || iconPosition === 'left') ? icon : undefined
  );
  const endIcon = !isLoading && icon && (iconPosition === 'end' || iconPosition === 'right')
    ? icon
    : undefined;

  return (
    <MuiButton
      ref={ref}
      type={type}
      variant={mapped.variant}
      color={mapped.color}
      disabled={Boolean(isDisabled ?? disabled) || Boolean(isLoading)}
      aria-disabled={isAriaDisabled || undefined}
      startIcon={startIcon}
      endIcon={endIcon}
      fullWidth={isBlock}
      size={size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium'}
      className={['pf-v6-c-button', modifier, className].filter(Boolean).join(' ')}
      data-ouia-component-id={ouiaId}
      sx={isInline ? {
        alignSelf: 'center',
        minWidth: 0,
        minHeight: 'auto',
        padding: '2px 0',
        position: 'relative',
        verticalAlign: 'baseline',
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 'calc(100% + 16px)',
          height: 48,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        },
      } : undefined}
      {...(rest as MuiButtonProps)}
    >
      {children}
    </MuiButton>
  );
});
