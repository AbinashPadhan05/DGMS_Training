import { useState } from "react";
import { useData } from "../../context/DataContext";

const EMPTY = { q: "", options: ["", "", "", ""], correct: "0" };

const fromQuestion = (x) => ({ q: x.q, options: [...x.a], correct: String(x.c) });

// Add mode by default; pass `editing` ({ index, question }) to edit an existing question.
export default function QuestionForm({ editing, onClose }) {
  const { addQuestion, updateQuestion } = useData();
  const [form, setForm] = useState(editing ? fromQuestion(editing.question) : EMPTY);

  const setOption = (i) => (e) =>
    setForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? e.target.value : o)) }));

  const handleAdd = () => {
    const q = form.q.trim();
    const a = form.options.map((o) => o.trim());
    if (!q || a.some((x) => !x)) { alert("Please fill the question and all four options."); return; }
    const question = { q, a, c: Number(form.correct) };
    if (editing) {
      updateQuestion(editing.index, question);
      onClose?.();
      return;
    }
    addQuestion(question);
    setForm(EMPTY);
    alert("Question added successfully.");
  };

  return (
    <div className="card mt-18">
      <h3>{editing ? `Edit Question ${editing.index + 1}` : "Add Assessment Question"}</h3>
      <p className="muted">Create an MCQ and select the correct answer.</p>

      <label className="muted" htmlFor="adminQ">Question</label>
      <textarea
        id="adminQ"
        className="question-textarea"
        placeholder="Enter question..."
        value={form.q}
        onChange={(e) => setForm((f) => ({ ...f, q: e.target.value }))}
      />

      <div className="option-grid">
        {form.options.map((o, i) => (
          <input
            key={i}
            className="toolbar-input"
            placeholder={`Option ${String.fromCharCode(65 + i)}`}
            value={o}
            onChange={setOption(i)}
          />
        ))}
      </div>

      <label className="muted block mt-12" htmlFor="adminCorrect">Correct answer</label>
      <select
        id="adminCorrect"
        className="toolbar-input full"
        value={form.correct}
        onChange={(e) => setForm((f) => ({ ...f, correct: e.target.value }))}
      >
        {["A", "B", "C", "D"].map((l, i) => <option key={l} value={i}>Option {l}</option>)}
      </select>

      <div className="row-gap mt-12">
        <button className="btn" onClick={handleAdd}>{editing ? "Save Question" : "+ Add Question"}</button>
        {editing && <button className="btn secondary" onClick={onClose}>Cancel</button>}
      </div>
    </div>
  );
}
