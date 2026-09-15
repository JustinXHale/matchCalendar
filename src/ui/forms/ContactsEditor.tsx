import { Button, FormGroup, TextInput } from '@patternfly/react-core';
import type { MatchContact } from '@/domain/match';

type Props = {
  contacts: MatchContact[];
  onChange: (contacts: MatchContact[]) => void;
};

export function ContactsEditor({ contacts, onChange }: Props) {
  const addContact = () => {
    onChange([
      ...contacts,
      {
        id: crypto.randomUUID(),
        order: contacts.length,
      },
    ]);
  };

  const updateContact = (id: string, patch: Partial<MatchContact>) => {
    onChange(
      contacts.map((contact) =>
        contact.id === id ? { ...contact, ...patch } : contact,
      ),
    );
  };

  const removeContact = (id: string) => {
    onChange(contacts.filter((contact) => contact.id !== id));
  };

  return (
    <div className="rs-form-stack">
      {contacts.map((contact) => (
        <div key={contact.id} className="rs-contact-card">
          <FormGroup label="Name" fieldId={`contact-name-${contact.id}`}>
            <TextInput
              id={`contact-name-${contact.id}`}
              value={contact.name ?? ''}
              onChange={(_event, value) =>
                updateContact(contact.id, { name: value })
              }
            />
          </FormGroup>
          <div className="rs-form-row">
            <FormGroup label="Phone" fieldId={`contact-phone-${contact.id}`}>
              <TextInput
                id={`contact-phone-${contact.id}`}
                value={contact.phone ?? ''}
                onChange={(_event, value) =>
                  updateContact(contact.id, { phone: value })
                }
              />
            </FormGroup>
            <FormGroup label="Email" fieldId={`contact-email-${contact.id}`}>
              <TextInput
                id={`contact-email-${contact.id}`}
                type="email"
                value={contact.email ?? ''}
                onChange={(_event, value) =>
                  updateContact(contact.id, { email: value })
                }
              />
            </FormGroup>
          </div>
          <FormGroup label="Team / organization" fieldId={`contact-team-${contact.id}`}>
            <TextInput
              id={`contact-team-${contact.id}`}
              value={contact.team ?? ''}
              onChange={(_event, value) =>
                updateContact(contact.id, { team: value })
              }
            />
          </FormGroup>
          <Button
            variant="link"
            isDanger
            onClick={() => removeContact(contact.id)}
          >
            Remove contact
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={addContact}>
        Add contact
      </Button>
    </div>
  );
}
