export default function StatCard({ value, label }) {
  return (
    <div className="card">
      <div className="stat">{value}</div>
      <div className="muted">{label}</div>
    </div>
  );
}
