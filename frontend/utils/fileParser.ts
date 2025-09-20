import pdf from "pdf-parse";
import mammoth from "mammoth";


export async function parseFile(file: File): Promise<string> {
const buffer = Buffer.from(await file.arrayBuffer());
if (file.type === "application/pdf") {
const data = await pdf(buffer);
return data.text;
}
if (file.name.endsWith(".docx")) {
const { value } = await mammoth.extractRawText({ buffer });
return value;
}
return buffer.toString("utf-8");
}