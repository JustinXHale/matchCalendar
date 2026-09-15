import { useState } from 'react';

type ProfileAvatarProps = {
  displayName: string;
  photoUrl?: string;
  size?: 'sm' | 'md';
  className?: string;
};

function initialsFor(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) ?? '?').toUpperCase();
}

export function ProfileAvatar({
  displayName,
  photoUrl,
  size = 'md',
  className = '',
}: ProfileAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const dimension = size === 'sm' ? 32 : 64;
  const classNames = [
    size === 'sm' ? 'rs-profile-avatar--sm' : 'rs-profile-avatar',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (photoUrl && !imageFailed) {
    return (
      <img
        className={classNames}
        src={photoUrl}
        alt=""
        width={dimension}
        height={dimension}
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span className={`${classNames} rs-profile-avatar--initials`} aria-hidden>
      {initialsFor(displayName)}
    </span>
  );
}
