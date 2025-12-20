import mongoClient from "@/lib/mongodb";
import { indexPolicy } from "@/lib/indexPolicy";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req:Request,context:{params:Promise<{id:string}>}){
    const {id}= await context.params
    if(!ObjectId.isValid(id)){
        return NextResponse.json({error:"Invalid policy id"},{status:400});
    }
    try{
        const client=await mongoClient;
        const db=client.db("ComplianceChecker");
        const policiesCollection=db.collection("policies");
        const policy=await policiesCollection.findOne({_id:new ObjectId(id)});
        if(!policy){return NextResponse.json({error:"Policy not found"},{status:404});}
        await indexPolicy(
        {   policyId:policy._id.toString(),
            category:policy.category,
            text:policy.text}
        );
        await policiesCollection.updateOne(
            {_id:new ObjectId(id)},
            {$set:{indexed:true,updatedAt:new Date()}}
        );
        return NextResponse.json({message:"Policy indexed successfully"});
    }
    catch(err){
        return NextResponse.json({error:"Failed to index policy"},{status:500});
    }
}