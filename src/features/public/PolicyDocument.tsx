import { Button } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import type { PolicySection } from '@/features/public/policyTypes';
import { PublicFooter } from '@/features/public/PublicFooter';
import './public.css';

function PolicyBlock({
  paragraphs,
  bullets,
}: {
  paragraphs?: string[];
  bullets?: string[];
}) {
  return (
    <>
      {paragraphs?.map((text) => (
        <p key={text.slice(0, 48)}>{text}</p>
      ))}
      {bullets && bullets.length > 0 && (
        <ul>
          {bullets.map((item) => (
            <li key={item.slice(0, 48)}>{item}</li>
          ))}
        </ul>
      )}
    </>
  );
}

type PolicyDocumentProps = {
  title: string;
  lastUpdated: string;
  sections: PolicySection[];
  backTo: string;
  backLabel?: string;
  headingIdPrefix: string;
};

export function PolicyDocument({
  title,
  lastUpdated,
  sections,
  backTo,
  backLabel = '← Back to sign in',
  headingIdPrefix,
}: PolicyDocumentProps) {
  const navigate = useNavigate();

  return (
    <article className="rs-public-policy rs-page-pad">
      <header className="rs-public-policy__header">
        <Button
          variant="link"
          className="rs-public-policy__back"
          onClick={() => navigate(backTo)}
        >
          {backLabel}
        </Button>
        <h1>{title}</h1>
        <p className="rs-public-policy__updated">Last updated: {lastUpdated}</p>
      </header>

      {sections.map((section) => (
        <section
          key={section.title}
          id={section.id}
          aria-labelledby={`${headingIdPrefix}-${section.title}`}
        >
          <h2 id={`${headingIdPrefix}-${section.title}`}>{section.title}</h2>
          <PolicyBlock
            paragraphs={section.paragraphs}
            bullets={section.bullets}
          />
          {section.subsections?.map((sub) => (
            <div key={sub.title}>
              <h3>{sub.title}</h3>
              <PolicyBlock paragraphs={sub.paragraphs} bullets={sub.bullets} />
            </div>
          ))}
        </section>
      ))}

      <PublicFooter />
    </article>
  );
}
