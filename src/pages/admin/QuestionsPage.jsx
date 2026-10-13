import QuestionForm from "../../components/admin/QuestionForm";
import QuestionList from "../../components/admin/QuestionList";
import { useData } from "../../context/DataContext";

export default function QuestionsPage() {
  const { resetQuestions } = useData();

  const handleReset = () => {
    if (!window.confirm("Reset the question bank to the original sample questions?")) return;
    resetQuestions();
    alert("Question bank reset.");
  };

  return (
    <section>
      <div className="section-title">
        <div>
          <h2>Question Bank</h2>
          <div className="muted">Add, edit or delete assessment questions.</div>
        </div>
      </div>
      <QuestionForm />
      <QuestionList />
      <div className="card mt-18">
        <h3>Reset</h3>
        <p className="muted">Reset the assessment question bank back to the original sample questions.</p>
        <button className="btn danger" onClick={handleReset}>Reset Question Bank</button>
      </div>
    </section>
  );
}
