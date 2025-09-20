// Simple text embedding function for development
// In production, you'd want to use a proper embeddings API

export async function embedText(text: string): Promise<number[]> {
  // Simple hash-based embedding for development
  // This creates a basic vector representation based on character frequencies
  const vector = new Array(384).fill(0);
  
  // Create a simple hash-based embedding
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const index = charCode % 384;
    vector[index] += 1;
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] = vector[i] / magnitude;
    }
  }
  
  return vector;
}