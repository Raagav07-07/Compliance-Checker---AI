import { chromaClient } from "./chroma";
export async function getCreateCollection(){
    return await chromaClient.getOrCreateCollection(
        {name:"Policy_vectors",metadata:{description:"Policy RAG Embeddings"}}
    );
}