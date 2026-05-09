import { QdrantVectorStore } from "@langchain/qdrant";
import { getEmbeddings } from "../gemini";
import { Document } from "@langchain/core/documents";

export const getVectorStore = async (collectionName: string) => {
  if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
    throw new Error("QDRANT_URL and QDRANT_API_KEY must be defined");
  }

  const embeddings = getEmbeddings();

  return await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: collectionName,
  });
};

export const createVectorStore = async (docs: Document[], collectionName: string) => {
  if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
    throw new Error("QDRANT_URL and QDRANT_API_KEY must be defined");
  }

  const embeddings = getEmbeddings();

  return await QdrantVectorStore.fromDocuments(docs, embeddings, {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: collectionName,
  });
};
