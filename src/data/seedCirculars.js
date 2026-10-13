// Sample syllabus content. Replace with the real circular text from the Admin panel (Circulars & Syllabus).
export const seedCirculars = [
  {
    id: "CIR-001",
    title: "Training Syllabus – General Mine Safety",
    refNo: "MM/TRG/2026/01",
    date: "2026-01-01",
    course: "General Mine Safety",
    description: "Syllabus for the basic safety training of all persons employed in the mine.",
    topics: [
      { title: "Introduction to mining & mine layout", hours: 2, details: "Types of mining, surface and underground layout, roles and responsibilities." },
      { title: "Hazard identification & risk control", hours: 3, details: "Hazard, risk, near-miss, risk assessment and control measures." },
      { title: "Personal protective equipment (PPE)", hours: 2, details: "Selection, use, care and limitations of PPE." },
      { title: "Emergency procedures & first aid", hours: 3, details: "Fire, inundation, accidents, evacuation, basic first aid." },
      { title: "Statutory provisions & safe work practices", hours: 2, details: "Applicable rules, permits, signs and signals." },
    ],
  },
  {
    id: "CIR-002",
    title: "Training Syllabus – HEMM Operator Training",
    refNo: "MM/TRG/2026/02",
    date: "2026-01-01",
    course: "HEMM Operator Training",
    description: "Syllabus for operators of heavy earth moving machinery.",
    topics: [
      { title: "Machine familiarisation & controls", hours: 3, details: "Parts, instruments, controls and pre-start checks." },
      { title: "Safe operation & traffic rules", hours: 3, details: "Haul road rules, signals, blind spots, speed limits." },
      { title: "Routine maintenance & defect reporting", hours: 2, details: "Daily checks, lubrication, reporting defects." },
      { title: "Practical driving under supervision", hours: 8, details: "Supervised operation on the training track and in the working area." },
    ],
  },
];
