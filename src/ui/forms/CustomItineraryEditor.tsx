import { DateTimeInput } from '@/ui/forms/DateTimeInput';
import { Button, FormGroup, TextInput } from '@patternfly/react-core';
import type { CustomItineraryItem } from '@/domain/match';

type Props = {
  items: CustomItineraryItem[];
  onChange: (items: CustomItineraryItem[]) => void;
};

export function CustomItineraryEditor({ items, onChange }: Props) {
  const addItem = () => {
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        label: '',
        at: new Date(),
        order: items.length,
      },
    ]);
  };

  const updateItem = (id: string, patch: Partial<CustomItineraryItem>) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="rs-form-stack">
      {items.map((item) => (
        <div key={item.id} className="rs-custom-field-row">
          <FormGroup label="Label" fieldId={`itinerary-label-${item.id}`}>
            <TextInput
              id={`itinerary-label-${item.id}`}
              value={item.label}
              onChange={(_event, value) =>
                updateItem(item.id, { label: value })
              }
            />
          </FormGroup>
          <DateTimeInput id={`itinerary-at-${item.id}`} label="Date and time"
            value={item.at} onChange={(at) => { if (at) updateItem(item.id, { at }); }} />
          {(!(item.at instanceof Date) || Number.isNaN(item.at.getTime())) && (
            <span className="rs-form-error" role="alert">Choose a date and time to show this item on the timeline.</span>
          )}
          <FormGroup label="Notes" fieldId={`itinerary-note-${item.id}`}>
            <TextInput
              id={`itinerary-note-${item.id}`}
              value={item.notes ?? ''}
              onChange={(_event, value) =>
                updateItem(item.id, { notes: value })
              }
            />
          </FormGroup>
          <Button variant="link" isDanger onClick={() => removeItem(item.id)}>
            Remove
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={addItem}>
        Add itinerary item
      </Button>
    </div>
  );
}
