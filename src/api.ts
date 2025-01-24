import { Router } from "express";
import { execute } from "./connection";
import { Contact } from "./contact";
import { validate } from "class-validator";

const api = Router();

api.get('/', (req, res) => {
    res.send({"message": "Hello, TypeScript Express!"});
});

api.get('/all', async (req, res) => {
    const out = await execute(async (client) => {
        return client.db(process.env.DB_NAME).collection(process.env.GAMES_COLLECTION_NAME!).find({}).toArray();
    })
    res.send(out);
});

api.post('/add', async (req, res) => {
    const contact = new Contact(req.body);
    const val = await validate(contact);
    if(val.length > 0) {
        res.status(400).send(val);
        return;
    }
    res.send({"message": "Contact added"});
});

export default api;