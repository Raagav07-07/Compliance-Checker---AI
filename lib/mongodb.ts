import { MongoClient } from "mongodb";

let mongoClient:Promise<MongoClient> | undefined;

declare global {
    var _globalmongoclient: Promise<MongoClient> | undefined;
}
const uri=process.env.MONGODB_URI || "";
if(uri==""){
    throw new Error("Please provide a valid MONGODB_URI environment variable");
}
if(process.env.NODE_ENV=="development"){
    if(!global._globalmongoclient){
        global._globalmongoclient=MongoClient.connect(uri);
    }
    mongoClient=global._globalmongoclient;
}else{
    mongoClient=MongoClient.connect(uri);
}

export default mongoClient;