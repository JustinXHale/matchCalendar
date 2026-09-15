/** Expandable “about” copy on the public sign-in page (OAuth homepage). */
export function PublicLandingAbout() {
  return (
    <section className="rs-public__expandables" aria-label="About Match Calendar">
      <details className="rs-public__details">
        <summary>What this app is for</summary>
        <div className="rs-public__details-body">
          <p>
            Match Calendar is your personal schedule and record as a sports
            official. Keep each assignment in one place — kickoff, venue, travel,
            lodging, contacts, fees, and expenses — without juggling spreadsheets,
            email, and a separate calendar app.
          </p>
          <p>
            Agenda shows what is next. Calendar lets you browse by date. Money and
            Insights help you track pay, reimbursements, and your season at a
            glance.
          </p>
          <p>
            Sign-in syncs your data to your account. Try demo loads sample
            assignments in your browser without writing to our servers.
          </p>
        </div>
      </details>

      <details className="rs-public__details">
        <summary>What you can do after sign-in</summary>
        <div className="rs-public__details-body">
          <ul className="rs-public__bullets">
            <li>Add matches quickly or open full details for travel and pay</li>
            <li>Track tournaments with shared travel and child matches</li>
            <li>Record paid, unpaid, and donated assignments plus expenses</li>
            <li>Close out completed matches with After Match</li>
            <li>Install the app and read your schedule offline after it loads once</li>
          </ul>
        </div>
      </details>
    </section>
  );
}
