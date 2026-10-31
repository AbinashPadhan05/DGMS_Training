import { useState } from "react";
import { goTo } from "../utils/router";

// Initial-training days by mine category: DGMS (Legislative) Circular No. 01 of 2026, clause 2.1(i).
const CATEGORIES = [
  { key: "above", label: "Aboveground", parts: [2, 2, 2, 5, 1], refresher: 3 },
  { key: "open", label: "Opencast", parts: [2, 3, 3, 9, 1], refresher: 4 },
  { key: "ug", label: "Underground", parts: [2, 6, 5, 10, 1], refresher: 6 },
  { key: "gassy", label: "Gassy underground", parts: [2, 9, 6, 12, 1], refresher: 6 },
  { key: "on", label: "Onshore oil", parts: [2, 6, 5, 10, 1], refresher: 6 },
  { key: "off", label: "Offshore oil", parts: [2, 9, 6, 12, 1], refresher: 6 },
];
const PARTS = [
  { name: "Introductory", color: "#cfe3d8" },
  { name: "General safety", color: "#8fc3a6" },
  { name: "Trade or discipline", color: "#3f9a6b" },
  { name: "On-the-job", color: "#17724a" },
  { name: "Assessment", color: "#e3a62b" },
];

const FEATURES = [
  ["Training records", "Initial, refresher, special and after-absence, accident or job-change training, all kept per employee with full history."],
  ["Daily attendance", "Mark a whole batch present, half day, absent or on leave in one step. Days completed update on their own."],
  ["Assessment and re-evaluation", "A score below 40% opens additional training and a re-evaluation, as the circular requires."],
  ["Certificates and register", "A certificate is issued only when days, score and field test are complete, with a serial number in the register."],
  ["Refresher due dates", "See who is due soon and who is overdue, by mine category and employee type."],
  ["Records, archive and audit", "Archived records are kept for service plus five years. Every change is logged with who made it and when."],
];

const CHECKLIST = [
  ["2.1 (i)", "Initial and refresher days by mine category", "Required days are set from the mine category and progress is counted against them."],
  ["1.3", "Full-day release for training", "The day-wise attendance register decides days completed."],
  ["Assessment", "Below 40%: more training, then re-evaluation", "Pass mark 40%. A fail opens 2 additional days (1 for refresher) and a re-evaluation."],
  ["2.1 (ii)", "Practical field test for highly skilled trades", "Employees flagged as highly skilled need a passed field test before the certificate."],
  ["1.4, 1.5", "Special training and training after absence, accident or job change", "Each has its own training type with a 3-day minimum."],
  ["5.0", "Record keeping for service plus 5 years", "Archived records carry a retain-until date, and deletion is blocked until it passes."],
  ["5.0, 7.0", "Audit and inspection", "An audit log and inspection-ready PDF reports are always available."],
];

const STEPS = [
  ["Enrol", "Add the employee with mine category, grade and type."],
  ["Attend", "Mark daily attendance. Days completed follow the register."],
  ["Assess", "Take the assessment. A fail leads to additional training."],
  ["Certify", "A numbered certificate once days, score and field test are done."],
  ["Refresh", "Refresher due dates are flagged as due soon or overdue."],
  ["Retain", "Records are archived and kept for service plus five years."],
];

function Strata() {
  const [index, setIndex] = useState(2);
  const cat = CATEGORIES[index];
  const total = cat.parts.reduce((a, b) => a + b, 0);
  let day = 0;
  return (
    <div className="lp-strata">
      <div className="lp-strata-head">
        <h2 id="strata-title">Initial training by mine category</h2>
        <div className="lp-chips" role="tablist" aria-labelledby="strata-title">
          {CATEGORIES.map((c, i) => (
            <button key={c.key} type="button" role="tab" aria-selected={i === index} className={`lp-chip ${i === index ? "on" : ""}`} onClick={() => setIndex(i)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="lp-stack" role="tabpanel" aria-live="polite">
        {PARTS.map((p, i) => {
          const days = cat.parts[i];
          const from = day + 1;
          day += days;
          return (
            <div className="lp-band-row" key={p.name} style={{ "--d": days }}>
              <div className={`lp-band ${i === 4 ? "assess" : ""}`} style={{ background: p.color }} />
              <div className="lp-band-label">
                <strong>{p.name}</strong>
                <span>{days === 1 ? `Day ${from}` : `Day ${from} to ${day}`}, {days} {days === 1 ? "day" : "days"}</span>
              </div>
            </div>
          );
        })}
      </div>

      <dl className="lp-facts">
        <div><dt>Initial</dt><dd>{total} days</dd></div>
        <div><dt>Refresher</dt><dd>{cat.refresher} days</dd></div>
        <div><dt>Pass mark</dt><dd>40%</dd></div>
      </dl>
    </div>
  );
}

export default function LandingPage() {
  const signIn = goTo("/login");
  const signInAs = (role) => goTo(`/login?role=${role}`);

  return (
    <div className="lp">
      <header className="lp-header">
        <div className="lp-wrap lp-header-in">
          <a className="lp-brand" href="/" aria-label="MineMagma home">
            <span className="lp-logo">MM</span>
            <span>MineMagma</span>
          </a>
          <nav className="lp-nav" aria-label="Sections">
            <a href="#features">What it does</a>
            <a href="#compliance">DGMS checklist</a>
            <a href="#process">How it works</a>
            <a href="#roles">Who uses it</a>
          </nav>
          <a className="lp-btn lp-btn-dark lp-btn-sm" href="/login" onClick={signIn}>Sign in</a>
        </div>
      </header>

      <main className="lp-main">
        <section className="lp-hero">
          <div className="lp-wrap lp-hero-in">
            <div className="lp-hero-copy">
              <h1>Every worker trained, certified and on record.</h1>
              <p className="lp-lead">
                MineMagma tracks initial, refresher and special training against DGMS Circular 01/2026, from the first attendance mark to five years of retained records.
              </p>
              <div className="lp-actions">
                <a className="lp-btn lp-btn-dark" href="/login" onClick={signIn}>Sign in</a>
                <a className="lp-btn lp-btn-line" href="#compliance">See the DGMS checklist</a>
              </div>
              <p className="lp-note">Your mine runs the training. MineMagma keeps the record.</p>
            </div>
            <Strata />
          </div>
        </section>

        <section className="lp-section" id="features">
          <div className="lp-wrap lp-split">
            <div className="lp-split-head">
              <h2>One place for the whole training record</h2>
              <p>From enrolment to the inspector&rsquo;s visit, each step is recorded once and reused everywhere it is needed.</p>
            </div>
            <ul className="lp-list">
              {FEATURES.map(([title, text]) => (
                <li key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="lp-section lp-tint" id="compliance">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <h2>Built around DGMS Circular 01/2026</h2>
              <p>Guidelines for preparation of training scheme under Rule 157, issued 25 August 2026. This is how each requirement is handled.</p>
            </div>
            <div className="lp-table-wrap">
              <table className="lp-table">
                <thead>
                  <tr><th>Clause</th><th>Requirement</th><th>In MineMagma</th></tr>
                </thead>
                <tbody>
                  {CHECKLIST.map(([clause, req, how]) => (
                    <tr key={clause}>
                      <td className="lp-clause">{clause}</td>
                      <td>{req}</td>
                      <td>{how}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="lp-section" id="process">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <h2>How a record moves through the system</h2>
            </div>
            <ol className="lp-steps">
              {STEPS.map(([title, text], i) => (
                <li key={title}>
                  <span className="lp-step-no">{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="lp-section lp-tint" id="roles">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <h2>Sign in as the person you are</h2>
            </div>
            <div className="lp-roles">
              <article className="lp-role">
                <h3>Employee</h3>
                <p>Follow your own training from enrolment to certificate.</p>
                <ul>
                  <li>See progress and days completed</li>
                  <li>Read every syllabus circular</li>
                  <li>Take the assessment</li>
                  <li>Download your certificate</li>
                </ul>
                <a className="lp-btn lp-btn-dark" href="/login?role=employee" onClick={signInAs("employee")}>Sign in as Employee</a>
              </article>
              <article className="lp-role">
                <h3>Manager</h3>
                <p>Run the training register for the whole mine.</p>
                <ul>
                  <li>Mark daily attendance for many employees at once</li>
                  <li>Add and update training records</li>
                  <li>Enter scores and field-test results</li>
                  <li>Download PDF reports for inspection</li>
                </ul>
                <a className="lp-btn lp-btn-dark" href="/login?role=manager" onClick={signInAs("manager")}>Sign in as Manager</a>
              </article>
            </div>
          </div>
        </section>

        <section className="lp-cta">
          <div className="lp-wrap lp-cta-in">
            <div>
              <h2>Try it with sample data</h2>
              <p>The demo has six employees across mine categories, with attendance, scores and certificates already filled in.</p>
            </div>
            <a className="lp-btn lp-btn-amber" href="/login" onClick={signIn}>Sign in</a>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-in">
          <a className="lp-brand" href="/"><span className="lp-logo">MM</span><span>MineMagma</span></a>
          <p>Training tracking and monitoring, built on DGMS (Legislative) Circular No. 01 of 2026. Demo prototype.</p>
        </div>
      </footer>
    </div>
  );
}
