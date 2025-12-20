import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";


export async function chunk(text:string,chunksize=600,overlap=100){
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: chunksize, chunkOverlap: overlap });
    const texts = await splitter.splitText(text);
    return texts;
}