import mongoClient from "@/lib/mongodb"
import {NextResponse} from 'next/server'
import { ObjectId } from "mongodb";
export async function PATCH(req:Request,context: { params: Promise<{ id: string }> }
) {
 
    try{
     const { id } = await context.params;
       if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid policy id" },
        { status: 400 }
      );
    }
    const client = await mongoClient;
    const db = client.db("ComplianceChecker");
    const policiesCollection = db.collection("policies");
    const result = await policiesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set:{
            "status":"INACTIVE",
            "updatedAt":new Date()
        }
    });
       if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Policy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Policy deactivated successfully" },
      { status: 200 }
    );
     
        }
            catch(error){
        console.error("Error deactivating policy:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
    }
}
    

    