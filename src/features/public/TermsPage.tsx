import { routes } from '@/app/routes';
import { PolicyDocument } from '@/features/public/PolicyDocument';
import {
  TERMS_OF_USE_LAST_UPDATED,
  TERMS_OF_USE_SECTIONS,
} from '@/features/public/termsOfUseContent';

export function TermsPage() {
  return (
    <PolicyDocument
      title="Terms of Use"
      lastUpdated={TERMS_OF_USE_LAST_UPDATED}
      sections={TERMS_OF_USE_SECTIONS}
      backTo={routes.login}
      headingIdPrefix="terms"
    />
  );
}
