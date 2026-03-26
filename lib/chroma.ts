import "server-only";

import { ChromaClient } from "chromadb";

let chromaClient: ChromaClient | null = null;

export function getChromaClient() {
  if (!chromaClient) {
    const serverUrl = process.env.CHROMA_SERVER_URL;

    if (serverUrl) {
      chromaClient = new ChromaClient({ path: serverUrl });
    } else {
      chromaClient = new ChromaClient();
    }
  }
  return chromaClient;
}

export function getChromaClientSingleton() {
  return getChromaClient();
}
