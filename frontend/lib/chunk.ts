export function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
const clean = text.replace(/\s+/g, " ").trim();
if (!clean) return [];
const chunks = [];
let start = 0;
while (start < clean.length) {
const end = Math.min(start + chunkSize, clean.length);
chunks.push(clean.slice(start, end));
if (end === clean.length) break;
start = end - overlap;
}
return chunks;
}