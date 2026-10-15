import { Button } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/app/routes';
import { PageHeader } from '@/ui/PageHeader';
import { useI18n } from '@/i18n/I18nProvider';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="rs-stack">
      <PageHeader title={t('notFound.title')} />
      <div className="rs-placeholder-card">
        <p>{t('notFound.message')}</p>
      </div>
      <Button
        variant="primary"
        isBlock
        onClick={() => navigate(routes.schedule)}
      >
        {t('notFound.back')}
      </Button>
    </div>
  );
}
