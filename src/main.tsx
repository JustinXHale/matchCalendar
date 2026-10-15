import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@patternfly/react-core/dist/styles/base.css';
import '@/styles/tokens.css';
import '@/styles/theme-high-contrast.css';
import '@/styles/shell/index.css';
import { AppRouter } from '@/app/AppRouter';
import { initTheme, watchSystemContrastPreferences } from '@/app/theme';
import { AppToastProvider } from '@/ui/AppToastProvider';
import { DemoModeProvider } from '@/demo/DemoModeContext';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { MatchesProvider } from '@/features/matches/MatchesProvider';
import { ProfileProvider } from '@/features/profile/ProfileProvider';
import { TournamentsProvider } from '@/features/tournaments/TournamentsProvider';
import { I18nProvider } from '@/i18n/I18nProvider';

document.documentElement.classList.add('rs-theme');
initTheme();
watchSystemContrastPreferences();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppToastProvider>
      <AuthProvider>
        <DemoModeProvider>
          <ProfileProvider>
            <I18nProvider>
              <MatchesProvider>
                <TournamentsProvider>
                  <AppRouter />
                </TournamentsProvider>
              </MatchesProvider>
            </I18nProvider>
          </ProfileProvider>
        </DemoModeProvider>
      </AuthProvider>
    </AppToastProvider>
  </StrictMode>,
);
