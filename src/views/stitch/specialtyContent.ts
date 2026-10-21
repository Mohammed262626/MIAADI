// Shared specialty labelling for the staff dashboard, the booking pass and the
// public doctor dossier.
//
// This module used to carry an editorial profile per specialty — bio, invented
// credentials, check-list highlights, service lists, clinic wayfinding. None of
// it came from the database, so it was removed: a doctor page now only states
// what the doctors row actually contains.
import { SPECIALTIES, specialtyKeyOf, type SpecialtyKey } from "../../lib/specialties";

type ProfileKey = SpecialtyKey | "family";

// Family medicine is not one of the eight catalog specialties (it has no home
// page tile), so it resolves locally before falling back to the shared mapper.
function profileKeyOf(specialization: string): ProfileKey {
  const s = String(specialization || "");
  if (/أسرة|الأسرة|وقائي/.test(s)) return "family";
  return specialtyKeyOf(s) || "family";
}

const FAMILY_LABEL = "طب الأسرة والرعاية الوقائية";

// Breadcrumb / category label for a raw doctors.specialization string.
export function specialtyLabel(specialization: string): string {
  const key = profileKeyOf(specialization);
  if (key === "family") return FAMILY_LABEL;
  return SPECIALTIES.find((s) => s.key === key)?.label || FAMILY_LABEL;
}
