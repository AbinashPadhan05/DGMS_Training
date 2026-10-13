import { useState } from "react";
import { getPassMark } from "../../utils/settings";
import { useData } from "../../context/DataContext";
import useCurrentEmployee from "../../hooks/useCurrentEmployee";
import { hasScore, isPassed, progressOf } from "../../utils/training";

function Result({ employee, onRetake, onNavigate }) {
  const passed = isPassed(employee);
  let message;
  if (!passed) message = "Assessment not passed. Additional training and re-assessment can be assigned.";
  else if (employee.certificate === "Issued") message = "Assessment passed. Your certificate has been issued.";
  else message = "Assessment passed. Your certificate will be issued once practical and OJT verification are completed.";

  return (
    <div className={`result ${passed ? "" : "fail"}`}>
      <h2>Assessment Result</h2>
      <p className={`result-score ${passed ? "pass" : "fail"}`}>{Number(employee.score)}%</p>
      <p>{message}</p>
      {passed ? (
        <button className="btn" onClick={() => onNavigate("certificate")}>View Certificate Status →</button>
      ) : (
        <button className="btn" onClick={onRetake}>Re-attempt</button>
      )}
    </div>
  );
}

function ExamForm({ questions, onSubmit }) {
  const [answers, setAnswers] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const correct = questions.reduce((n, q, i) => n + (answers[i] === q.c ? 1 : 0), 0);
    onSubmit(Math.round((correct / questions.length) * 100));
  };

  return (
    <div className="card">
      <p className="muted">{questions.length} questions. Passing threshold: {getPassMark()}%.</p>
      <form onSubmit={handleSubmit}>
        {questions.map((q, i) => (
          <div className="exam-q" key={i}>
            <h4>{i + 1}. {q.q}</h4>
            {q.a.map((option, j) => (
              <label className="option" key={j}>
                <input
                  type="radio"
                  name={`q${i}`}
                  value={j}
                  checked={answers[i] === j}
                  onChange={() => setAnswers((prev) => ({ ...prev, [i]: j }))}
                />{" "}
                {option}
              </label>
            ))}
          </div>
        ))}
        <button className="btn" type="submit">Submit Assessment</button>
      </form>
    </div>
  );
}

export default function Exam({ onNavigate }) {
  const employee = useCurrentEmployee();
  const { questions, submitAssessment } = useData();
  const [retake, setRetake] = useState(false);

  if (!employee) return null;

  let body;
  if (!questions.length) {
    body = (
      <div className="card">
        <h3>No assessment questions available</h3>
        <p className="muted">Questions are added by the administrator.</p>
      </div>
    );
  } else if (progressOf(employee) < 100) {
    body = (
      <div className="card">
        <h3>Assessment Locked</h3>
        <p className="muted">
          The assessment opens once your training is marked as completed (100%) by the administrator. Current training
          progress: <strong>{progressOf(employee)}%</strong>.
        </p>
        <button className="btn" onClick={() => onNavigate("dashboard")}>View My Training Status</button>
      </div>
    );
  } else if (hasScore(employee) && !retake) {
    body = <Result employee={employee} onRetake={() => setRetake(true)} onNavigate={onNavigate} />;
  } else {
    body = (
      <ExamForm
        questions={questions}
        onSubmit={(score) => {
          submitAssessment(employee.id, score);
          setRetake(false);
        }}
      />
    );
  }

  return (
    <section>
      <div className="section-title">
        <h2>Online Assessment</h2>
        <span className="pill">Passing score: {getPassMark()}%</span>
      </div>
      {body}
    </section>
  );
}
