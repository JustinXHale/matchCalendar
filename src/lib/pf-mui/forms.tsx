import { Box, FormLabel, TextField, type TextFieldProps } from '@mui/material';
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  type ChangeEvent,
  type KeyboardEventHandler,
  type ReactElement,
  type ReactNode,
} from 'react';

export type TextInputProps = Omit<
  TextFieldProps,
  'onChange' | 'onKeyDown' | 'variant' | 'select' | 'ref'
> & {
  onChange?: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string,
  ) => void;
  validated?: 'default' | 'error' | 'warning' | 'success';
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  readOnly?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  pattern?: string;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    {
      onChange,
      validated,
      isRequired,
      isDisabled,
      isReadOnly,
      readOnly,
      disabled,
      required,
      min,
      max,
      step,
      pattern,
      inputMode,
      onKeyDown,
      className,
      fullWidth = true,
      size = 'small',
      ...rest
    },
    ref,
  ) {
    return (
      <TextField
        inputRef={ref}
        fullWidth={fullWidth}
        size={size}
        required={isRequired ?? required}
        disabled={isDisabled ?? disabled}
        error={validated === 'error'}
        className={['pf-v6-c-form-control', className].filter(Boolean).join(' ')}
        slotProps={{
          htmlInput: {
            min,
            max,
            step,
            pattern,
            inputMode,
            readOnly: isReadOnly ?? readOnly,
            onKeyDown,
          },
        }}
        onChange={(event) => onChange?.(event, event.target.value)}
        {...rest}
      />
    );
  },
);

export function FormGroup({
  label,
  fieldId,
  isRequired,
  children,
  className,
  labelInfo,
}: {
  label?: ReactNode;
  fieldId?: string;
  isRequired?: boolean;
  children?: ReactNode;
  className?: string;
  labelInfo?: ReactNode;
}) {
  const autoId = useId();
  const id = fieldId ?? autoId;
  const errorId = `${id}-error`;
  const hasError = Children.toArray(children).some(
    (child) =>
      isValidElement(child) &&
      typeof (child.props as { className?: unknown }).className === 'string' &&
      (child.props as { className: string }).className.includes('rs-form-error'),
  );
  const content = Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child;
    const childProps = child.props as {
      id?: string;
      className?: string;
      'aria-describedby'?: string;
    };

    if (childProps.className?.includes('rs-form-error')) {
      return cloneElement(child as ReactElement<{ id?: string }>, {
        id: childProps.id ?? errorId,
      });
    }
    if (index !== 0) return child;
    return cloneElement(
      child as ReactElement<{
        id?: string;
        'aria-describedby'?: string;
      }>,
      {
        id: childProps.id ?? id,
        'aria-describedby': hasError
          ? [childProps['aria-describedby'], errorId].filter(Boolean).join(' ')
          : childProps['aria-describedby'],
      },
    );
  });

  return (
    <Box
      className={['pf-v6-c-form__group', className].filter(Boolean).join(' ')}
      sx={{ gap: 0.75, display: 'flex', flexDirection: 'column' }}
    >
      {label != null ? (
        <FormLabel
          htmlFor={id}
          required={isRequired}
          className="pf-v6-c-form__label pf-v6-c-form__group-label"
        >
          {label}
          {labelInfo}
        </FormLabel>
      ) : null}
      {content}
    </Box>
  );
}
