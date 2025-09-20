import { GoogleGenerativeAI } from "@google/generative-ai";

// Check if API key is available
const apiKey = process.env.GOOGLE_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const MODEL = "gemini-2.0-flash";

export async function generateAnswer(question: string, context: string) {
  if (!genAI || !apiKey) {
    // Fallback for development without API key
    return `[Development Mode] Question: ${question}\n\nContext: ${context}\n\nPlease set GOOGLE_API_KEY in your environment variables to use the actual Gemini API.`;
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const prompt = `Use only the provided context to answer the question.\nContext: ${context}\nQuestion: ${question}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return `Error generating answer: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}