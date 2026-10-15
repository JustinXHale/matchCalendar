import { Outlet } from 'react-router-dom';
import {
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  Page,
  PageSection,
} from '@patternfly/react-core';
import { useDemoMode } from '@/demo/DemoModeContext';
import { BottomNav } from '@/ui/BottomNav';
import { DemoModeToggle } from '@/ui/DemoModeToggle';
import { ProfileNavLink } from '@/ui/ProfileNavLink';
import { ThemeToggle } from '@/ui/ThemeToggle';
import { AppDataGate } from '@/ui/AppDataGate';
import { OfflineBanner } from '@/ui/OfflineBanner';
import { UpdatePrompt } from '@/pwa/UpdatePrompt';
import { appBuildLabel } from '@/app/appBuild';
import { useI18n } from '@/i18n/I18nProvider';

export function MobileShell() {
  const { isDemoMode } = useDemoMode();
  const { t } = useI18n();

  return (
    <Page
      masthead={
        <Masthead className="rs-masthead">
          <MastheadMain className="rs-masthead__main">
            <MastheadBrand className="rs-masthead__brand">
              <span className="rs-brand-block">
                <span className="rs-brand-row">
                  <span className="rs-brand">Match Calendar</span>
                  <ThemeToggle />
                </span>
                <span className="rs-brand-build">{appBuildLabel()}</span>
              </span>
            </MastheadBrand>
          </MastheadMain>
          <MastheadContent className="rs-masthead__content">
            <DemoModeToggle />
            <ProfileNavLink />
          </MastheadContent>
        </Masthead>
      }
    >
      <a className="rs-skip-link" href="#main-content">
        {t('shell.skip')}
      </a>
      <PageSection
        id="main-content"
        className="rs-page-body"
        isFilled
        component="main"
      >
        {isDemoMode && (
          <div className="rs-demo-banner" role="status">
            <strong>{t('demo.mode')}</strong>
            <span>{t('demo.description')}</span>
          </div>
        )}
        <OfflineBanner />
        <AppDataGate>
          <Outlet />
        </AppDataGate>
      </PageSection>
      <UpdatePrompt />
      <BottomNav />
    </Page>
  );
}
