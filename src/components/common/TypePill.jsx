import { typeOf } from "../../utils/training";

export default function TypePill({ employee }) {
  const t = typeOf(employee);
  return <span className={`pill ${t === "Contractual" ? "contract" : "regular"}`}>{t}</span>;
}
