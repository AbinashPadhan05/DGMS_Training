import { useData } from "../../context/DataContext";

export default function QuestionList() {
  const { questions, deleteQuestion } = useData();

  const handleDelete = (i) => {
    if (questions.length <= 1) { alert("At least one question must remain."); return; }
    if (!window.confirm("Delete this question?")) return;
    deleteQuestion(i);
  };

  return (
    <div className="card mt-18">
      <div className="section-title">
        <h3>Assessment Question Bank</h3>
        <span className="pill">{questions.length}</span>
      </div>
      {questions.map((x, i) => (
        <div className="admin-row" key={i}>
          <div>
            <div className="admin-row-title">{i + 1}. {x.q}</div>
            <div className="admin-row-meta">Correct: {String.fromCharCode(65 + x.c)} — {x.a[x.c]}</div>
          </div>
          <button className="btn danger" onClick={() => handleDelete(i)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
