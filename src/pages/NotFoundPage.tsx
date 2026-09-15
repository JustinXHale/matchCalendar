import { Button } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/app/routes';
import { PageHeader } from '@/ui/PageHeader';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="rs-stack">
      <PageHeader title="Page not found" />
      <div className="rs-placeholder-card">
        <p>This page does not exist.</p>
      </div>
      <Button
        variant="primary"
        isBlock
        onClick={() => navigate(routes.schedule)}
      >
        Back to Agenda
      </Button>
    </div>
  );
}
