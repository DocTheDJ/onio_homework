import { configDotenv } from "dotenv";
import { MongoClient } from "mongodb";

configDotenv();

export const client = new MongoClient(process.env.DB_CONN_STRING!)

async function run() {
    try {
        await client.connect()
        await client.db(process.env.DB_NAME).command({ ping: 1 });
        console.log("pinged mongo db")
    } finally {
        await client.close()
    }
}

run().catch(console.dir)

export async function execute(runabale: (client: MongoClient) => Promise<any>) {
    let output = null;
    try {
        await client.connect()
        output = await runabale(client)
    } catch (e) {
        console.error(e)
    } finally {
        await client.close()
    }
    return output;

}