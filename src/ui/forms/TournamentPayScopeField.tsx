import { FormGroup } from '@patternfly/react-core';
import type { TournamentPayScope } from '@/domain/tournament';

type Props = {
  value: TournamentPayScope;
  onChange: (value: TournamentPayScope) => void;
  inline?: boolean;
};

export function TournamentPayScopeField({
  value,
  onChange,
  inline = false,
}: Props) {
  return (
    <FormGroup label="Pay structure" fieldId="tournament-pay-scope">
      <select
        id="tournament-pay-scope"
        className="rs-select"
        value={value}
        onChange={(event) =>
          onChange(event.target.value as TournamentPayScope)
        }
      >
        <option value="tournament">One fee for the tournament</option>
        <option value="per_match">Paid per match</option>
      </select>
      {!inline ? (
        <p className="rs-form-hint">
          {value === 'tournament'
            ? 'Track pay once on the tournament. Individual games will not expect separate fees.'
            : 'Each game can track its own pay. The default below pre-fills new games.'}
        </p>
      ) : null}
    </FormGroup>
  );
}
