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

export function MobileShell() {
  const { isDemoMode } = useDemoMode();

  return (
    <Page
      masthead={
        <Masthead className="rs-masthead">
          <MastheadMain className="rs-masthead__main">
            <MastheadBrand className="rs-masthead__brand">
              <span className="rs-brand-row">
                <span className="rs-brand">Match Calendar</span>
                <ThemeToggle />
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
        Skip to main content
      </a>
      <PageSection
        id="main-content"
        className="rs-page-body"
        isFilled
        component="main"
      >
        {isDemoMode && (
          <div className="rs-demo-banner" role="status">
            <strong>Demo mode</strong>
            <span>Sample matches for preview — not your live data.</span>
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
