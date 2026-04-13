import { OpenAIEmbeddings } from "@langchain/openai"
import { serverEnv } from "@/configs/server.config"

const embeddings = new OpenAIEmbeddings({
  apiKey: serverEnv.openAiApiKey,
  batchSize: 512,
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
