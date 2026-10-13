import { useState } from "react";
import { CircularCard } from "../common/SyllabusPage";
import { useData } from "../../context/DataContext";
import { today } from "../../utils/training";

const blank = () => ({
  id: "", title: "", refNo: "", date: today(), course: "", description: "",
  topics: [{ title: "", hours: "", details: "" }],
});

function CircularForm({ initial, onClose }) {
  const { circulars, addCircular, updateCircular } = useData();
  const editing = !!initial;
  const [form, setForm] = useState(initial ? { ...initial, topics: initial.topics.map((t) => ({ ...t })) } : blank());

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setTopic = (i, key) => (e) =>
    setForm((f) => ({ ...f, topics: f.topics.map((t, idx) => (idx === i ? { ...t, [key]: e.target.value } : t)) }));
  const addTopic = () => setForm((f) => ({ ...f, topics: [...f.topics, { title: "", hours: "", details: "" }] }));
  const removeTopic = (i) => setForm((f) => ({ ...f, topics: f.topics.filter((_, idx) => idx !== i) }));

  const handleSave = () => {
    const title = form.title.trim();
    const topics = form.topics
      .filter((t) => t.title.trim())
      .map((t) => ({ title: t.title.trim(), hours: t.hours === "" ? "" : Number(t.hours) || 0, details: t.details.trim() }));
    if (!title) { alert("Circular title is required."); return; }
    if (!topics.length) { alert("Add at least one syllabus topic."); return; }

    const data = { title, refNo: form.refNo.trim(), date: form.date, course: form.course.trim(), description: form.description.trim(), topics };
    if (editing) {
      updateCircular(form.id, data);
    } else {
      const next = circulars.reduce((n, c) => Math.max(n, Number(String(c.id).replace(/\D/g, "")) || 0), 0) + 1;
      addCircular({ id: `CIR-${String(next).padStart(3, "0")}`, ...data });
    }
    onClose();
  };

  return (
    <div className="panel open mb-16">
      <h3>{editing ? `Edit Circular – ${form.id}` : "Add Circular & Syllabus"}</h3>
      <div className="grid cols-3 mt-12">
        <div><label className="muted" htmlFor="ci-title">Title *</label><input id="ci-title" className="admin-input" value={form.title} onChange={set("title")} /></div>
        <div><label className="muted" htmlFor="ci-ref">Circular / Reference No.</label><input id="ci-ref" className="admin-input" value={form.refNo} onChange={set("refNo")} /></div>
        <div><label className="muted" htmlFor="ci-date">Date</label><input id="ci-date" type="date" className="admin-input" value={form.date} onChange={set("date")} /></div>
        <div><label className="muted" htmlFor="ci-course">Course (must match employee's Training Programme)</label><input id="ci-course" className="admin-input" value={form.course} onChange={set("course")} /></div>
      </div>
      <label className="muted" htmlFor="ci-desc">Description</label>
      <textarea id="ci-desc" className="question-textarea" value={form.description} onChange={set("description")} />

      <h4>Syllabus topics</h4>
      {form.topics.map((t, i) => (
        <div className="topic-row" key={i}>
          <input className="admin-input" placeholder="Topic *" value={t.title} onChange={setTopic(i, "title")} />
          <input className="admin-input" placeholder="Details" value={t.details} onChange={setTopic(i, "details")} />
          <input className="admin-input" type="number" min="0" placeholder="Hours" value={t.hours} onChange={setTopic(i, "hours")} />
          <button className="btn danger" onClick={() => removeTopic(i)} disabled={form.topics.length === 1}>✕</button>
        </div>
      ))}
      <button className="btn secondary" onClick={addTopic}>+ Add Topic</button>

      <div className="row-gap mt-15">
        <button className="btn" onClick={handleSave}>{editing ? "Save Changes" : "Create Circular"}</button>
        <button className="btn secondary" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default function CircularsPage() {
  const { circulars, deleteCircular } = useData();
  const [formFor, setFormFor] = useState(null); // null | "new" | circular id

  const handleDelete = (c) => {
    if (!window.confirm(`Delete circular "${c.title}"?`)) return;
    deleteCircular(c.id);
  };

  return (
    <section>
      <div className="section-title">
        <div>
          <h2>Circulars & Syllabus</h2>
          <div className="muted">Every circular and its syllabus is visible to all employees and managers.</div>
        </div>
        <button className="btn" onClick={() => setFormFor("new")}>+ Add Circular</button>
      </div>

      {formFor === "new" && <CircularForm key="new" onClose={() => setFormFor(null)} />}

      {circulars.length === 0 && <div className="card empty-row">No circulars yet.</div>}
      {circulars.map((c) =>
        formFor === c.id ? (
          <CircularForm key={c.id} initial={c} onClose={() => setFormFor(null)} />
        ) : (
          <div key={c.id}>
            <CircularCard circular={c} />
            <div className="row-gap mb-16">
              <button className="btn secondary" onClick={() => setFormFor(c.id)}>Edit</button>
              <button className="btn danger" onClick={() => handleDelete(c)}>Delete</button>
            </div>
          </div>
        )
      )}
    </section>
  );
}
