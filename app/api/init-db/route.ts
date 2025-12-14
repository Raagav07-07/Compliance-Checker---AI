import mongoClient from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await mongoClient;
    const db = client?.db("ComplianceChecker");
    const collections=await db?.listCollections().toArray();
    const collectionNames=collections?.map(col=>col.name) || [];
    if(!collectionNames.includes("policies")){
        await db?.createCollection("policies");
        await db?.collection("policies").createIndex({category:1});
        await db?.collection("policies").createIndex({status:1});
        await db?.collection("policies").createIndex({name:1});
    }
    return NextResponse.json({ message: "Database initialized", collections: collectionNames });
}