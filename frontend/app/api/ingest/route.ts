import { NextResponse } from "next/server";
import { embedText } from "@/lib/embedding";
import { getPineconeIndex } from "@/lib/pinecone";
import { parseFile } from "@/utils/fileParser";
import { chunkText } from "@/lib/chunk";


export const runtime = "nodejs";


export async function POST(req: Request) {
try {
const formData = await req.formData();
const file = formData.get("file") as File;
if (!file) return NextResponse.json({ error: "File required" }, { status: 400 });


const text = await parseFile(file);
const chunks = chunkText(text);
const index = await getPineconeIndex();


const vectors = await Promise.all(
chunks.map(async (chunk, i) => ({
id: `${Date.now()}-${i}`,
values: await embedText(chunk),
metadata: { text: chunk },
}))
);


await index.upsert(vectors);
return NextResponse.json({ ok: true, chunks: chunks.length });
} catch (err: unknown) {
const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
return NextResponse.json({ error: errorMessage }, { status: 500 });
}
}