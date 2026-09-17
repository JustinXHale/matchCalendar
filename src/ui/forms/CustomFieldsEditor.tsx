import { Button, FormGroup } from '@patternfly/react-core';
import { FormTextInput } from '@/ui/forms/FormTextInput';
import type { CustomField } from '@/domain/match';

type Props = {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
};

export function CustomFieldsEditor({ fields, onChange }: Props) {
  const addField = () => {
    onChange([
      ...fields,
      {
        id: crypto.randomUUID(),
        label: '',
        value: '',
        order: fields.length,
      },
    ]);
  };

  const updateField = (id: string, patch: Partial<CustomField>) => {
    onChange(
      fields.map((field) =>
        field.id === id ? { ...field, ...patch } : field,
      ),
    );
  };

  const removeField = (id: string) => {
    onChange(fields.filter((field) => field.id !== id));
  };

  return (
    <div className="rs-form-stack">
      {fields.map((field) => (
        <div key={field.id} className="rs-custom-field-row">
          <FormGroup label="Label" fieldId={`cf-label-${field.id}`}>
            <FormTextInput
              id={`cf-label-${field.id}`}
              value={field.label}
              onChange={(_event, value) =>
                updateField(field.id, { label: value })
              }
            />
          </FormGroup>
          <FormGroup label="Value" fieldId={`cf-value-${field.id}`}>
            <FormTextInput
              id={`cf-value-${field.id}`}
              value={field.value}
              onChange={(_event, value) =>
                updateField(field.id, { value: value })
              }
            />
          </FormGroup>
          <Button
            variant="link"
            isDanger
            onClick={() => removeField(field.id)}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={addField}>
        Add custom field
      </Button>
    </div>
  );
}
