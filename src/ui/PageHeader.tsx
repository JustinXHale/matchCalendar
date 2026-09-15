import type { ReactNode } from 'react';
import { Title } from '@patternfly/react-core';

type Props = {
  title: string;
  actions?: ReactNode;
};

export function PageHeader({ title, actions }: Props) {
  return (
    <header
      className={[
        'rs-page-header',
        actions ? 'rs-page-header--with-actions' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Title headingLevel="h1" size="2xl">
        {title}
      </Title>
      {actions}
    </header>
  );
}
