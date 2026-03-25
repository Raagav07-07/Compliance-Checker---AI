
import { NextResponse } from "next/server";
import {retreiver} from "@/app/tools/policyRetreiver"
export async function POST(req:Request){
    const data=await req.formData();
    const query=data.get("query") as string
    console.log(data.get("query"))
    const retreived=await retreiver(query,"IT")
    console.log(retreived)
   return NextResponse.json({"message":"RAG POST"})
}