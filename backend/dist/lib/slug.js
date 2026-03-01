"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureUniqueSlug = ensureUniqueSlug;
exports.generateSlug = generateSlug;
async function ensureUniqueSlug(baseSlug, checkFn) {
    let slug = baseSlug;
    let counter = 1;
    while (!(await checkFn(slug))) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
}
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
