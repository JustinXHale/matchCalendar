import {
  createBrowserRouter,
  Navigate,
  Route,
  RouterProvider,
  Routes,
  useLocation,
} from 'react-router-dom';
import { MobileShell } from '@/app/MobileShell';
import { routes } from '@/app/routes';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { AboutPage } from '@/pages/AboutPage';
import { SchedulePage } from '@/pages/SchedulePage';
import { FullMatchPage } from '@/pages/FullMatchPage';
import { InsightsPage } from '@/pages/InsightsPage';
import { LoginPage } from '@/pages/LoginPage';
import { MoneyPage } from '@/pages/MoneyPage';
import { MatchDetailPage } from '@/pages/MatchDetailPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { TournamentCreatePage } from '@/pages/TournamentCreatePage';
import { TournamentDetailPage } from '@/pages/TournamentDetailPage';
import { TournamentsPage } from '@/pages/TournamentsPage';
import { QuickMatchModal } from '@/ui/QuickMatchModal';
function AppRoutes() {
  const location = useLocation();
  const state = location.state as { background?: Location } | null;

  return (
    <>
      <Routes location={state?.background ?? location}>
        <Route path={routes.login} element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <MobileShell />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to={routes.schedule} replace />} />
          <Route path={routes.schedule} element={<SchedulePage />} />
          <Route
            path={routes.agenda}
            element={<Navigate to={routes.schedule} replace />}
          />
          <Route
            path={routes.calendar}
            element={<Navigate to={`${routes.schedule}?view=calendar`} replace />}
          />
          <Route path={routes.money} element={<MoneyPage />} />
          <Route path={routes.insights} element={<InsightsPage />} />
          <Route
            path={routes.history}
            element={<Navigate to={routes.money} replace />}
          />
          <Route path={routes.about} element={<AboutPage />} />
          <Route path={routes.profile} element={<ProfilePage />} />
          <Route
            path={routes.settings}
            element={<Navigate to={routes.profile} replace />}
          />
          <Route path={routes.fullMatch} element={<FullMatchPage />} />
          <Route path="/matches/:matchId" element={<MatchDetailPage />} />
          <Route path="/matches/:matchId/edit" element={<FullMatchPage />} />
          <Route path={routes.tournaments} element={<TournamentsPage />} />
          <Route path={routes.tournamentNew} element={<TournamentCreatePage />} />
          <Route
            path="/tournaments/:tournamentId/edit"
            element={<FullMatchPage />}
          />
          <Route
            path="/tournaments/:tournamentId"
            element={<TournamentDetailPage />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>

      <Routes>
        <Route path={routes.quickMatch} element={<QuickMatchModal />} />
      </Routes>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: '*',
    element: <AppRoutes />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
