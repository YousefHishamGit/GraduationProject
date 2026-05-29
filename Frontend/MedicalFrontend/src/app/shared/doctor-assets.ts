import { resolveMediaUrl } from './media-url.util';

/** Stock template paths stored in DB that have no matching files in assets. */
const TEMPLATE_PERSON_IMAGE = /\/person-(m|f)-\d+\.webp$/i;

export const DOCTOR_IMAGES: Record<string, string> = {
  'Ahmed Hassan': '/assets/img/person/Ahmed Hassan.webp',
  'Sara Mohamed': '/assets/img/person/Sara Mohamed.webp',
  'Omar Ali': '/assets/img/person/Omar Ali.webp',
  'Nour Ibrahim': '/assets/img/person/Nour Ibrahim.webp',
  'Khaled Mahmoud': '/assets/img/person/Khaled Mahmoud.webp',
  'Hana Youssef': '/assets/img/person/Hana Youssef.webp',
  'Mona Fawzy': '/assets/img/person/Mona Fawzy.webp',
  'Tarek Saad': '/assets/img/person/Tarek Saad.webp',
  // Seeded doctors (Nile Hospital demo data)
  'Khaled Mansour': '/assets/img/person/Khaled Mahmoud.webp',
  'Nour El-Sayed': '/assets/img/person/Nour Ibrahim.webp',
  'Tarek Fahmy': '/assets/img/person/Tarek Saad.webp',
  'Rania Hosny': '/assets/img/person/Mona Fawzy.webp',
  'Mohamed Gamal': '/assets/img/person/Omar Ali.webp',
  'Dina Shawky': '/assets/img/person/Hana Youssef.webp',
  'Amr Zaki': '/assets/img/person/Ahmed Hassan.webp',
  'Amira Zaki': '/assets/img/person/Ahmed Hassan.webp',
  'Yasmine Kamal': '/assets/img/person/Sara Mohamed.webp',
};

export function getDoctorImage(fullName: string): string | null {
  return DOCTOR_IMAGES[fullName] ?? null;
}

export function isTemplatePersonImage(path?: string | null): boolean {
  return !!path && TEMPLATE_PERSON_IMAGE.test(path);
}

/** Resolves a doctor photo URL: uploaded images, local assets, or name-based fallback. */
export function resolveDoctorPhoto(
  imgPath?: string | null,
  fullName?: string
): string | undefined {
  const fallback = fullName ? getDoctorImage(fullName) : null;

  if (!imgPath || isTemplatePersonImage(imgPath)) {
    return fallback ?? undefined;
  }

  if (imgPath.startsWith('/assets/') || imgPath.startsWith('assets/')) {
    return imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
  }

  const resolved = resolveMediaUrl(imgPath);
  return resolved || fallback || undefined;
}
