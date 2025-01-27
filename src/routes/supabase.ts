import { Router } from "express";
import { supabase } from "../utils/supabase";
import { Contact } from "../contact";
import { validate } from "class-validator";

const api = Router();

api.get('/', (req, res) => {
    res.send({ "message": "Hello, Supabase" });
});

api.get('/all', async (req, res) => {
    const data = await supabase.from('contacts').select('*');
    res.send(data.data);
});

api.post('/add', async (req, res) => {
    const contact = new Contact(req.body);
    const val = await validate(contact);
    if (val.length > 0) {
        res.status(400).send(val);
        return;
    }
    const { data, error } = await supabase.from('contacts').insert(req.body);
    if (error) {
        res.status(400).send(error);
        return;
    }
    res.send(data);
});

function getFilter(query: qs.ParsedQs): string {
    return Object.entries(query).map(([key, value]) => {
        // if (key === "id") {
        //     if (Array.isArray(value)) {
        //         return { _id: { $in: value.filter(v => ObjectId.isValid(v.toString())).map((v) => ObjectId.createFromHexString(v.toString())) } };
        //     }
        //     return { _id: ObjectId.createFromHexString(value?.toString() ?? "") }
        // }
        if (Array.isArray(value)) {
            return `${key}.in.(${value.join(",")})`
        }
        return `${key}.eq.${value}`
    }).join(",")
}

api.get('/delete', async (req, res) => {
    const tmp = getFilter(req.query);
    const { count, error } = await supabase.from('contacts').delete({ count: "exact" }).or(tmp);
    if (error) {
        res.status(400).send(error);
    }
    res.send({ deleted: count });
});

api.get('/update', async (req, res) => {
    const tmp = getFilter(req.query);
    const wanted = await supabase.from('contacts').select('*').or(tmp);
    if (wanted.error) {
        res.status(400).send(wanted.error);
        return
    }
    if (wanted.data.length === 0) {
        res.status(404).send({ message: "No item fits the filter" })
        return
    }
    const poss = new Contact({ ...wanted.data[0], ...req.body });
    const val = await validate(poss);
    if (val.length > 0) {
        res.status(400).send(val);
        return;
    }
    const { count, error } = await supabase.from('contacts').update(req.body, { count: "exact" }).or(tmp);
    if (error) {
        res.status(400).send(error);
        return
    }
    res.send({ updated: count });
});

export default api;