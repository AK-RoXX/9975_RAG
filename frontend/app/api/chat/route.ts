import { NextResponse } from "next/server";
import { embedText } from "@/lib/embedding";
import { getPineconeIndex } from "@/lib/pinecone";
import { generateAnswer } from "@/lib/llm";


export async function POST(req: Request) {
try {
const { question } = await req.json();
if (!question) return NextResponse.json({ error: "Question required" }, { status: 400 });


const index = await getPineconeIndex();
const queryVector = await embedText(question);
const queryResponse = await index.query({
vector: queryVector,
topK: 5,
includeMetadata: true,
});


const context = queryResponse.matches?.map((m) => m.metadata?.text).join("\n\n") || "";
const answer = await generateAnswer(question, context);


return NextResponse.json({ answer, context });
} catch (err: unknown) {
const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
return NextResponse.json({ error: errorMessage }, { status: 500 });
}
}