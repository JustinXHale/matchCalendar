import assert from 'node:assert/strict';
import {
  detectAppLocale,
  isLanguagePreference,
  resolveAppLocale,
} from '../src/i18n/languages';
import { english, translations } from '../src/i18n/translations';

assert.equal(detectAppLocale(['es-MX', 'en-US']), 'es');
assert.equal(detectAppLocale(['fr-CA']), 'fr');
assert.equal(detectAppLocale(['pt-PT']), 'pt-BR');
assert.equal(detectAppLocale(['de-DE']), 'en');
assert.equal(resolveAppLocale('es'), 'es');
assert.equal(isLanguagePreference('pt-BR'), true);
assert.equal(isLanguagePreference('de'), false);

for (const [locale, dictionary] of Object.entries(translations)) {
  assert.deepEqual(
    Object.keys(dictionary).sort(),
    Object.keys(english).sort(),
    `${locale} dictionary should contain every translation key`,
  );
}

console.log('Language detection and translation completeness checks passed.');
