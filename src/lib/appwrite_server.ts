import { Client } from "node-appwrite";

const client = new Client();

if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ) {
    throw new Error("Missing required environment variable NEXT_PUBLIC_APPWRITE_PROJECT_ID ");
}
if (!process.env.APPWRITE_HOSTNAME_OR_IP) {
    throw new Error("Missing required environment variable APPWRITE_HOSTNAME_OR_IP");
}
if (!process.env.APPWRITE_API_KEY) {
    throw new Error("Missing required environment variable APPWRITE_API_KEY");
}

client
    .setEndpoint(`https://${process.env.APPWRITE_HOSTNAME_OR_IP}/v1`)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID )
    .setKey(process.env.APPWRITE_API_KEY);

