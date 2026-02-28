import { Product } from "../models/Product";

export async function ensureUniqueSlug(
  baseSlug: string,
  checkFn: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (!(await checkFn(slug))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
