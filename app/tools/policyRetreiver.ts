import { embedText } from "@/lib/embedText";
import { getCreateCollection } from "@/lib/policyVectorStore";

export async function retreiver(query: string,category:string,topk=4){
const embed=await embedText([query]);
const collection=await getCreateCollection();
const results=await collection.query({
    queryEmbeddings:embed,
    nResults:topk,where:{category}})
  return results.documents?.[0] || [];
} 