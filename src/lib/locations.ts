export type SudanCity = { city: string; en: string; districts: string[] };

// المصدر الموحد للمدن السودانية المستخدمة في القوائم الثابتة (الرئيسية/الأطباء)
export const SUDAN_CITIES: SudanCity[] = [
  { city: "الخرطوم", en: "Khartoum", districts: ["أمبات", "المقرن", "الجامعة"] },
  { city: "أم درمان", en: "Omdurman", districts: ["أمباجة", "اللياب"] },
  { city: "الخرطوم بحري", en: "Khartoum North", districts: ["السقائين", "بشريات"] },
  { city: "بورتسودان", en: "Port Sudan", districts: ["الميناء"] },
  { city: "ود مداني", en: "Wad Medani", districts: ["قونزة", "المدينة"] },
  { city: "نيالا", en: "Nyala", districts: ["المدرسة"] },
  { city: "الفاشر", en: "El Fasher", districts: ["السوق"] },
  { city: "عطبرة", en: "Atbara", districts: ["كرري", "السكة"] },
  { city: "كسلا", en: "Kassala", districts: ["توتيل"] },
  { city: "الأبيض", en: "El Obeid", districts: ["الجمهورية"] },
  { city: "سنار", en: "Sennar", districts: ["المرتفعات"] },
  { city: "دنقلا", en: "Dongola", districts: ["السوق"] },
];
