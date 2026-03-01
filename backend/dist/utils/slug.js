"use strict";
// Premium Pack -> premium-pack
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSlug = toSlug;
exports.ensureUniqueSlug = ensureUniqueSlug;
function toSlug(input) {
    return input
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
}
// apend -2, -3, -4
async function ensureUniqueSlug(base, exists) {
    let slug = base;
    let n = 2;
    while (await exists(slug)) {
        slug = `${base}-${n}`;
        n++;
    }
    return slug;
}
