import { Router, Request } from "express";
import { execute } from "./connection";
import { Contact, ContactFilter } from "./contact";
import { validate } from "class-validator";
import { Filter, ObjectId } from "mongodb";

const api = Router();

api.get('/', (req, res) => {
    res.send({ "message": "Hello, TypeScript Express!" });
});

api.get('/all', async (req, res) => {
    const out = await execute(async (client) => {
        return client.db(process.env.DB_NAME).collection(process.env.CONTACTS_COLLECTION_NAME!).find({}).toArray();
    })
    res.send(out);
});

api.post('/add', async (req, res) => {
    const contact = new Contact(req.body);
    const val = await validate(contact);
    if (val.length > 0) {
        res.status(400).send(val);
        return;
    }
    const created = await execute(async (client) => {
        return (await client.db(process.env.DB_NAME).collection(process.env.CONTACTS_COLLECTION_NAME!).insertOne(contact)).insertedId;
    });
    res.send(created);
});

function getFilter(query: qs.ParsedQs): Array<Filter<Contact>> {
    return Object.entries(query).map(([key, value]) => {
        if(key === "id"){
            if(Array.isArray(value)) {
                return { _id: {$in: value.filter(v => ObjectId.isValid(v.toString())).map((v) => ObjectId.createFromHexString(v.toString()))} };
            }
            return { _id: ObjectId.createFromHexString(value?.toString() ?? "") }
        }
        if(Array.isArray(value)) {
            return { [key]: { $in: value } }
        }
        return { [key]: value }
    })
}

api.get('/delete', async (req, res) => {
    const tmp = getFilter(req.query);
    const deleted = await execute(async (client) => {
        return (await client
            .db(process.env.DB_NAME)
            .collection<Contact>(process.env.CONTACTS_COLLECTION_NAME!)
            .deleteMany({
                $or: tmp
            })
        ).deletedCount;
    });
    res.send({ deleted: deleted });
});

export default api;