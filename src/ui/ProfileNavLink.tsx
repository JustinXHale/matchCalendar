import { NavLink, useLocation } from 'react-router-dom';
import { routes } from '@/app/routes';
import { useProfile } from '@/features/profile/ProfileProvider';
import { ProfileAvatar } from '@/ui/ProfileAvatar';

export function ProfileNavLink() {
  const location = useLocation();
  const { profile } = useProfile();
  const isActive =
    location.pathname.startsWith(routes.profile) ||
    location.pathname.startsWith(routes.settings);

  return (
    <NavLink
      to={routes.profile}
      className={() =>
        ['rs-masthead-profile', isActive ? 'active' : ''].filter(Boolean).join(' ')
      }
      aria-label="Profile"
    >
      <ProfileAvatar
        displayName={profile.displayName}
        photoUrl={profile.photoUrl}
        size="sm"
        className="rs-masthead-profile__avatar"
      />
    </NavLink>
  );
}
