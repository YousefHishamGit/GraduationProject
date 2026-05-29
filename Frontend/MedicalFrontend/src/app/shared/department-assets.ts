export const DEPARTMENT_IMAGES: Record<string, string> = {
  Cardiology: '/assets/img/Department/cardiology.png',
  Neurology: '/assets/img/Department/neurology.png',
  Orthopedics: '/assets/img/Department/orthopedics.png',
  Ophthalmology: '/assets/img/Department/Ophthalmology.png',
};

export function getDepartmentImage(name: string): string | null {
  return DEPARTMENT_IMAGES[name] ?? null;
}
