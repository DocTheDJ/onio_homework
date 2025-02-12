import { Router, Request } from "express";
import { connectToDatabase, useContacts } from "./connection";
import { Contact, ContactFilter } from "./contact";
import { validate } from "class-validator";
import { Filter, ObjectId } from "mongodb";

const api = Router();

api.get('/', (req, res) => {
    res.send({ "message": "Hello, TypeScript Express!" });
});

api.get('/all', async (req, res) => {
    // const out = await execute(async (client) => {
    //     return client.db(process.env.DB_NAME).collection(process.env.CONTACTS_COLLECTION_NAME!).find({}).toArray();
    // })
    // const { db } = await connectToDatabase()
    const { contacts } = await useContacts()
    const out = await contacts.find({}).toArray();
    res.send(out);
});

api.post('/add', async (req, res) => {
    const contact = new Contact(req.body);
    const val = await validate(contact);
    if (val.length > 0) {
        res.status(400).send(val);
        return;
    }
    const { contacts } = await useContacts()
    // const created = await execute(async (client) => {
    //     return (await client.db(process.env.DB_NAME).collection(process.env.CONTACTS_COLLECTION_NAME!).insertOne(contact)).insertedId;
    // });
    const created = (await contacts.insertOne(contact)).insertedId;
    res.send(created);
});

function getFilter(query: qs.ParsedQs): Array<Filter<Contact>> {
    return Object.entries(query).map(([key, value]) => {
        if (key === "id") {
            if (Array.isArray(value)) {
                return { _id: { $in: value.filter(v => ObjectId.isValid(v.toString())).map((v) => ObjectId.createFromHexString(v.toString())) } };
            }
            return { _id: ObjectId.createFromHexString(value?.toString() ?? "") }
        }
        if (Array.isArray(value)) {
            return { [key]: { $in: value } }
        }
        return { [key]: value }
    })
}

api.get('/delete', async (req, res) => {
    const tmp = getFilter(req.query);
    // const { db } = await connectToDatabase()

    const { contacts } = await useContacts()
    // const deleted = await execute(async (client) => {
    //     return (await client
    //         .db(process.env.DB_NAME)
    //         .collection<Contact>(process.env.CONTACTS_COLLECTION_NAME!)
    //         .deleteMany({
    //             $or: tmp
    //         })
    //     ).deletedCount;
    // });
    const deleted = (await contacts.deleteMany({ $or: tmp })).deletedCount;
    res.send({ deleted: deleted });
});

api.post('/update', async (req, res) => {
    const tmp = getFilter(req.query);
    // const { db } = await connectToDatabase()
    const { contacts } = await useContacts()

    let wanted = await contacts.find({ $or: tmp }).toArray()
    if (wanted.length === 0) {
        res.status(404).send({ message: "No item fits the filter" });
        return;
    }
    const poss = new Contact({ ...wanted[0], ...req.body });
    const val = await validate(poss);
    if (val.length > 0) {
        res.status(400).send(val);
        return;
    }
    let v = (await contacts.updateMany({ $or: tmp }, { $set: poss })).modifiedCount;


    // const v = await execute(async (client) => {
    //     let wanted = await client.db(process.env.DB_NAME).collection<Contact>(process.env.CONTACTS_COLLECTION_NAME!).find({ $or: tmp }).toArray();
    //     if (wanted.length === 0) {
    //         res.status(404).send({ message: "No item fits the filter" });
    //         return null;
    //     }
    //     const poss = new Contact({ ...wanted[0], ...req.body });
    //     const val = await validate(poss);
    //     if (val.length > 0) {
    //         res.status(400).send(val);
    //         return null;
    //     }
    //     return (await client.db(process.env.DB_NAME).collection<Contact>(process.env.CONTACTS_COLLECTION_NAME!).updateMany({ $or: tmp }, { $set: poss })).modifiedCount;
    // });
    res.send({ updated: v });
});

export default api;