// Single source of truth for the medical specialties used by the public catalog
// (home page bento tiles + doctors directory filters). Specializations stored in
// the DB are free-text, so we classify them by Arabic keyword substrings.
export type SpecialtyKey =
  | "cardiology" | "dental" | "pediatrics" | "dermatology"
  | "orthopedics" | "ophthalmology" | "ent" | "internal";

export type Specialty = { key: SpecialtyKey; label: string; keywords: string[] };

export const SPECIALTIES: Specialty[] = [
  { key: "cardiology", label: "أمراض القلب والشرايين", keywords: ["قلب", "قسطرة", "شرايين"] },
  { key: "dental", label: "طب وجراحة الأسنان", keywords: ["أسنان", "تقويم", "زراعة الأسنان"] },
  { key: "pediatrics", label: "طب الأطفال وحديثي الولادة", keywords: ["أطفال", "حديثي الولادة", "الطفل"] },
  { key: "dermatology", label: "الجلدية والليزر والتجميل", keywords: ["جلدي", "ليزر"] },
  { key: "orthopedics", label: "العظام والمفاصل", keywords: ["عظام", "مفاصل"] },
  { key: "ophthalmology", label: "طب وجراحة العيون", keywords: ["عيون", "إبصار", "بصر"] },
  { key: "ent", label: "أنف وأذن وحنجرة", keywords: ["أنف", "أذن", "حنجرة"] },
  { key: "internal", label: "الباطنية والجهاز الهضمي", keywords: ["باطني", "هضم"] },
];

export function specialtyKeyOf(specialization: string): SpecialtyKey | null {
  const s = String(specialization || "");
  for (const sp of SPECIALTIES) if (sp.keywords.some((w) => s.includes(w))) return sp.key;
  return null;
}

export function countSpecialties(specializations: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  SPECIALTIES.forEach((sp) => { counts[sp.key] = 0; });
  specializations.forEach((spec) => {
    const key = specialtyKeyOf(spec);
    if (key) counts[key] += 1;
  });
  return counts;
}
