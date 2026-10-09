import { pillKind } from "../../utils/training";

export default function Pill({ text, kind }) {
  const label = text || "Pending";
  return <span className={`pill ${kind ?? pillKind(label)}`.trim()}>{label}</span>;
}
