import { FormGroup } from '@patternfly/react-core';
import { FormTextInput } from '@/ui/forms/FormTextInput';
import type { MatchTypePreset, PositionPreset } from '@/domain/match';
import {
  CHILD_MATCH_TYPE_OPTIONS,
  MATCH_TYPE_OPTIONS,
  POSITION_OPTIONS,
} from '@/domain/matchConstants';

type Props = {
  positionPreset: PositionPreset;
  customPosition: string;
  matchType: MatchTypePreset;
  customMatchType: string;
  gameFormat?: MatchTypePreset;
  customGameFormat?: string;
  positionError?: string;
  matchTypeError?: string;
  onChange: (patch: {
    positionPreset?: PositionPreset;
    customPosition?: string;
    matchType?: MatchTypePreset;
    customMatchType?: string;
  }) => void;
  onGameFormatChange?: (patch: {
    gameFormat?: MatchTypePreset;
    customGameFormat?: string;
  }) => void;
};

export function PresetSelectFields({
  positionPreset,
  customPosition,
  matchType,
  customMatchType,
  gameFormat,
  customGameFormat = '',
  positionError,
  matchTypeError,
  onChange,
  onGameFormatChange,
}: Props) {
  const showGameFormat = matchType === 'tournament';
  const activeGameFormat = gameFormat ?? '7s';

  return (
    <>
      <div
        className={[
          'rs-form-row',
          showGameFormat ? 'rs-form-row--3' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <FormGroup label="Position" isRequired fieldId="match-position-preset">
          <select
            id="match-position-preset"
            className="rs-select"
            value={positionPreset}
            onChange={(event) =>
              onChange({
                positionPreset: event.target.value as PositionPreset,
              })
            }
          >
            {POSITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {positionError ? (
            <span className="rs-form-error" role="alert">{positionError}</span>
          ) : null}
        </FormGroup>

        <FormGroup label="Match type" isRequired fieldId="match-type-preset">
          <select
            id="match-type-preset"
            className="rs-select"
            value={matchType}
            onChange={(event) =>
              onChange({
                matchType: event.target.value as MatchTypePreset,
              })
            }
          >
            {MATCH_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {matchTypeError ? (
            <span className="rs-form-error" role="alert">{matchTypeError}</span>
          ) : null}
        </FormGroup>

        {showGameFormat ? (
          <FormGroup label="Game format" isRequired fieldId="match-game-format">
            <select
              id="match-game-format"
              className="rs-select"
              value={activeGameFormat}
              onChange={(event) =>
                onGameFormatChange?.({
                  gameFormat: event.target.value as MatchTypePreset,
                })
              }
            >
              {CHILD_MATCH_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormGroup>
        ) : null}
      </div>

      {positionPreset === 'other' ? (
        <FormGroup label="Custom position" fieldId="match-custom-position">
          <FormTextInput
            id="match-custom-position"
            value={customPosition}
            onChange={(_event, value) => onChange({ customPosition: value })}
          />
        </FormGroup>
      ) : null}

      {matchType === 'other' ? (
        <FormGroup label="Custom match type" fieldId="match-custom-type">
          <FormTextInput
            id="match-custom-type"
            value={customMatchType}
            onChange={(_event, value) => onChange({ customMatchType: value })}
          />
        </FormGroup>
      ) : null}

      {showGameFormat && activeGameFormat === 'other' ? (
        <FormGroup label="Custom game format" fieldId="match-custom-game-format">
          <FormTextInput
            id="match-custom-game-format"
            value={customGameFormat}
            onChange={(_event, value) =>
              onGameFormatChange?.({ customGameFormat: value })
            }
          />
        </FormGroup>
      ) : null}
    </>
  );
}
