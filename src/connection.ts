import { configDotenv } from "dotenv";
import { Collection, Db, MongoClient } from "mongodb";
import { Contact } from "./contact";

configDotenv();

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let contacts: Collection<Contact> | null = null;

// async function run() {
//     try {
//         await client.connect()
//         await client.db(process.env.DB_NAME).command({ ping: 1 });
//         // console.log("pinged mongo db")
//     } finally {
//         await client.close()
//     }
// }

// run().catch(console.dir)


export async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = new MongoClient(process.env.DB_CONN_STRING!);
    await client.connect();
    const db = client.db(process.env.DB_NAME);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
}

export async function disconnectFromDatabase() {
    if (cachedClient) {
        await cachedClient.close();
        cachedClient = null;
        cachedDb = null;
        console.log('MongoDB connection closed.');
    }
}

export async function useContacts() {
    if (contacts) {
        return { contacts: contacts };
    }
    const { db } = await connectToDatabase();
    const collection = db.collection<Contact>(process.env.CONTACTS_COLLECTION_NAME!);
    contacts = collection;

    return { contacts: contacts };
}

// export async function execute(runabale: (client: MongoClient) => Promise<any>) {
//     var output = null;
//     try {
//         await client.connect()
//         output = await runabale(client)
//     } catch (e) {
//         console.error(e)
//     } finally {
//         await client.close()
//     }
//     return output;

// }