import { chunk } from "./chunkText";
import { embedText } from "./embedText";
import { getCreateCollection } from "./policyVectorStore";


export async function indexPolicy({policyId,category,text}:{
  policyId: string;
  category: string;
  text: string;
}){
    const chunked=await chunk(text)
    const embed=await embedText(chunked)
    const collection=await getCreateCollection();
    collection.add({
        ids:chunked.map((_ , i)=>`${policyId}_c${i}`),
        embeddings:embed,
        documents:chunked,
        metadatas:chunked.map((_,i)=>({policyId,category,chunkIndex:i})),
    });
}