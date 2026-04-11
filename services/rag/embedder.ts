import { OpenAIEmbeddings } from "@langchain/openai"

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
  batchSize: 512, // Default value if omitted is 512. Max is 2048
  model: "text-embedding-3-small",
})

export async function embedDocuments(text: string[]) {
  const embedding = await embeddings.embedDocuments(text)
  return embedding
}

export async function embedQuery(text: string) {
  const embedding = await embeddings.embedQuery(text)
  return embedding
}
