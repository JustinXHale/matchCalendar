import { useAppBack, type BackNav } from '@/nav/backNav';

type Props = {
  fallback: BackNav;
};

export function DetailBackButton({ fallback }: Props) {
  const { goBack, backLabel } = useAppBack(fallback);

  return (
    <button type="button" className="rs-detail__back" onClick={goBack}>
      ← {backLabel}
    </button>
  );
}
