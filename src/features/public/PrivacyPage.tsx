import { routes } from '@/app/routes';
import { PolicyDocument } from '@/features/public/PolicyDocument';
import {
  PRIVACY_POLICY_LAST_UPDATED,
  PRIVACY_POLICY_SECTIONS,
} from '@/features/public/privacyPolicyContent';

export function PrivacyPage() {
  return (
    <PolicyDocument
      title="Privacy Policy"
      lastUpdated={PRIVACY_POLICY_LAST_UPDATED}
      sections={PRIVACY_POLICY_SECTIONS}
      backTo={routes.login}
      headingIdPrefix="privacy"
    />
  );
}
