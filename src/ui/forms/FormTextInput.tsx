import { TextInput, type TextInputProps } from '@patternfly/react-core';
import { handleFormFieldEnterKey } from '@/ui/forms/formFieldNav';

type Props = TextInputProps & {
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  isLast?: boolean;
};

export function FormTextInput({
  enterKeyHint,
  isLast = false,
  onKeyDown,
  type = 'text',
  ...props
}: Props) {
  const resolvedHint = enterKeyHint ?? (isLast ? 'done' : 'next');

  return (
    <TextInput
      {...props}
      type={type}
      enterKeyHint={resolvedHint}
      onKeyDown={(event) => {
        handleFormFieldEnterKey(event);
        onKeyDown?.(event);
      }}
    />
  );
}
