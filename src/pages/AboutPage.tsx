import { PageHeader } from '@/ui/PageHeader';

export function AboutPage() {
  return (
    <div className="rs-stack">
      <PageHeader title="About" />
      <div className="rs-placeholder-card">
        <p>
          Match Calendar is a personal schedule and record for sports officials.
        </p>
      </div>
    </div>
  );
}
