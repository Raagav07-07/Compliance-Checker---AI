import mongoClient from "@/lib/mongodb";
import { NextResponse } from "next/server";
import {pdfToText} from 'pdf-ts'
export async function GET(){
    try{
        const client= await mongoClient;
        const db=await client.db("ComplianceChecker")
        const post=await db.collection("policies").find({},{projection:{text:0}}).sort({createdAt:-1}).toArray();
        return NextResponse.json(post)
    }
    catch(err){
        console.error("Failed to fetch");
        return NextResponse.json({error:"Failed to fetch policies"},{status:500});
    }
}
export async function POST(req:Request){
    try{
    const client=await mongoClient;
    const db=client?.db("ComplianceChecker");
    const formData=await req.formData();
    const file=formData.get("file") as File;
    const arrayBuffer = await file.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);
    const name=formData.get("name") as string;
    const category=formData.get("Category") as string;
    if(!file || !category){
        return NextResponse.json({error:"File and Category are required"}, {status:400});
    }
        const text=await pdfToText(buffer);
        console.log(text);
      const collection = db.collection("policies");


await collection.insertOne({
  name,
  text,
  category,        
  status: "ACTIVE",
  indexed: false,
  createdAt: new Date(),
  updatedAt: new Date(),})  
  return NextResponse.json({message:"Policy uploaded successfully"});
} 
  catch(err){throw new Error("Failed to insert")}
}