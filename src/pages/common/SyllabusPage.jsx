import { useMemo, useState } from "react";
import { useData } from "../../context/DataContext";
import useCurrentEmployee from "../../hooks/useCurrentEmployee";

export const totalHours = (c) => (c.topics || []).reduce((n, t) => n + (Number(t.hours) || 0), 0);

export function CircularCard({ circular, mine, defaultOpen }) {
  const hours = totalHours(circular);
  return (
    <details className="card circular" open={defaultOpen}>
      <summary>
        <div>
          <div className="admin-row-title">
            {circular.title} {mine && <span className="pill ok">Your course</span>}
          </div>
          <div className="admin-row-meta">
            {circular.course ? `Course: ${circular.course}` : "All courses"}
            {circular.refNo ? ` • Ref: ${circular.refNo}` : ""}
            {circular.date ? ` • Dated: ${circular.date}` : ""}
            {` • ${(circular.topics || []).length} topics${hours ? ` • ${hours} hrs` : ""}`}
          </div>
        </div>
      </summary>
      {circular.description && <p className="muted mt-12">{circular.description}</p>}
      <div className="table-wrap mt-12">
        <table>
          <thead><tr><th>#</th><th>Topic</th><th>Details</th><th>Hours</th></tr></thead>
          <tbody>
            {(circular.topics || []).length === 0 && <tr><td colSpan={4} className="empty-row">No syllabus topics added yet.</td></tr>}
            {(circular.topics || []).map((t, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td><strong>{t.title}</strong></td>
                <td className="wrap-cell">{t.details || "—"}</td>
                <td>{t.hours || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

// Every logged-in user (employee or manager) can read every circular and its syllabus.
export default function SyllabusPage() {
  const { circulars } = useData();
  const me = useCurrentEmployee();
  const [search, setSearch] = useState("");

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const isMine = (c) => me && c.course && c.course === me.course;
    return circulars
      .filter((c) => !q || `${c.title} ${c.course} ${c.refNo}`.toLowerCase().includes(q))
      .sort((a, b) => Number(isMine(b)) - Number(isMine(a)));
  }, [circulars, search, me]);

  return (
    <section>
      <div className="section-title">
        <div>
          <h2>Syllabus & Circulars</h2>
          <div className="muted">Course syllabus as per the training circulars. All circulars are visible to everyone.</div>
        </div>
        <span className="pill">{circulars.length}</span>
      </div>

      <input className="toolbar-input full mb-16" placeholder="Search circular / course..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {list.length === 0 && <div className="card empty-row">No circulars found.</div>}
      {list.map((c, i) => {
        const mine = !!(me && c.course && c.course === me.course);
        return <CircularCard key={c.id} circular={c} mine={mine} defaultOpen={mine || (!me && i === 0)} />;
      })}
    </section>
  );
}
