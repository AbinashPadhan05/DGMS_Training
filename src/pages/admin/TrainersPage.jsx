import TrainersRegister from "../../components/admin/TrainersRegister";

export default function TrainersPage() {
  return (
    <section>
      <div className="section-title"><h2>Trainers & Instructors</h2></div>
      <TrainersRegister canDelete />
    </section>
  );
}
