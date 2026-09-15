import { useState, type ReactNode } from 'react';

type Props = {
  title: string;
  summary?: string;
  defaultExpanded?: boolean;
  children: ReactNode;
};

export function ExpandableFormCard({
  title,
  summary,
  defaultExpanded = false,
  children,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <section className="rs-expand-card">
      <button
        type="button"
        className="rs-expand-card__header"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className="rs-expand-card__heading">
          <span className="rs-expand-card__title">{title}</span>
          {summary && !expanded ? (
            <span className="rs-expand-card__summary">{summary}</span>
          ) : null}
        </span>
        <span className="rs-expand-card__chevron" aria-hidden>
          {expanded ? '−' : '+'}
        </span>
      </button>
      {expanded ? <div className="rs-expand-card__body">{children}</div> : null}
    </section>
  );
}
