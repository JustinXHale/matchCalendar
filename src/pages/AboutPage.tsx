import { PageHeader } from '@/ui/PageHeader';

export function AboutPage() {
  return (
    <div className="rs-stack rs-about-page">
      <PageHeader title="About" />
      <p className="rs-page-lede">
        Match Calendar is your personal schedule and record as a sports official.
      </p>

      <section className="rs-detail-card rs-about-section" aria-labelledby="about-problem">
        <h2 id="about-problem" className="rs-about-section__title">The problem</h2>
        <p>
          Assignments, travel, hotels, pay, and notes often live in different
          places — Google Sheets, assigner platforms, email, and a calendar app
          you maintain by hand. Before a match you end up hunting for the one
          detail you need.
        </p>
      </section>

      <section className="rs-detail-card rs-about-section" aria-labelledby="about-solution">
        <h2 id="about-solution" className="rs-about-section__title">The solution</h2>
        <p>
          Match Calendar gives you one place to keep what matters for each
          assignment: kickoff, venue, teams, position, fees, flights, lodging,
          expenses, and contacts. Add a match in seconds with Quick Match, or
          open Full details when travel and money need more room.
        </p>
        <p>
          It is built for officials, not assigners. You control what goes in;
          nothing here replaces league scheduling or crew workflows.
        </p>
      </section>

      <section className="rs-detail-card rs-about-section" aria-labelledby="about-benefits">
        <h2 id="about-benefits" className="rs-about-section__title">
          Why referees use it
        </h2>
        <ul className="rs-detail-list">
          <li>
            <strong>Agenda first</strong> — see what is next without digging
            through a month grid.
          </li>
          <li>
            <strong>Everything in one record</strong> — match day, travel, and
            pay on the same assignment.
          </li>
          <li>
            <strong>Works at the venue</strong> — your schedule stays available
            offline after you have opened it once.
          </li>
          <li>
            <strong>Money clarity</strong> — track unpaid, paid, donated, and
            reimbursed work without a spreadsheet.
          </li>
          <li>
            <strong>Your data, your account</strong> — schedule syncs to you,
            separate from assigner systems like MatchReadyTX.
          </li>
        </ul>
      </section>

      <p className="rs-detail-meta">
        Match Calendar · Rabbit Hole Apps · Personal schedule for sports officials
      </p>
    </div>
  );
}
