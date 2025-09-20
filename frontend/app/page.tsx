"use client";
import { useState } from "react";


export default function Home() {
const [file, setFile] = useState<File | null>(null);
const [question, setQuestion] = useState("");
const [answer, setAnswer] = useState("");


async function handleUpload() {
if (!file) return;
const formData = new FormData();
formData.append("file", file);
const res = await fetch("/api/ingest", { method: "POST", body: formData });
const data = await res.json();
alert(data.ok ? `Ingested ${data.chunks} chunks` : data.error);
}


async function handleAsk() {
const res = await fetch("/api/chat", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ question }),
});
const data = await res.json();
setAnswer(data.answer || data.error);
}


return (
<div className="p-6 max-w-2xl mx-auto space-y-4">
<h1 className="text-2xl font-bold">RAG with Gemini + Pinecone</h1>


<input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
<button onClick={handleUpload} className="px-4 py-2 bg-black text-white rounded">Upload</button>


<div>
<input
type="text"
value={question}
onChange={(e) => setQuestion(e.target.value)}
placeholder="Ask a question"
className="border p-2 w-full rounded"
/>
<button onClick={handleAsk} className="px-4 py-2 bg-blue-600 text-white rounded mt-2">Ask</button>
</div>


{answer && <div className="p-4 bg-gray-100 rounded">{answer}</div>}
</div>
);
}