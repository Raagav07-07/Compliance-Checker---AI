import mongoClient from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
    const client = await mongoClient;
    const db=client?.db("ComplianceChecker")
    return NextResponse.json({ message: "Test DB Route is working", dbName: db?.databaseName });
}