import { getChromaClientSingleton } from "./chroma";

export async function getCreateCollection(){
    const client = getChromaClientSingleton();
    return await client.getOrCreateCollection(
        {name:"Policy_vectors",metadata:{description:"Policy RAG Embeddings"}}
    );
}
