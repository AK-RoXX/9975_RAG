import { Pinecone } from "@pinecone-database/pinecone";

// Check if API key is available
const apiKey = process.env.PINECONE_API_KEY;
export const pinecone = apiKey ? new Pinecone({ apiKey }) : null;

export const INDEX_NAME = process.env.PINECONE_INDEX || "rag-index";

export async function getPineconeIndex() {
  if (!pinecone || !apiKey) {
    throw new Error("PINECONE_API_KEY is not set. Please set it in your environment variables.");
  }
  
  return pinecone.Index(INDEX_NAME);
}