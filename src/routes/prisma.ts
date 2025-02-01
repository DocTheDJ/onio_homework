import { Router } from "express";
import { Contact } from "../contact";
import { validate } from "class-validator";
import { prisma } from "../utils/prisma";
import { Prisma } from "@prisma/client";

const api = Router();

api.get('/', (req, res) => {
    res.send({ "message": "Hello, Supabase" });
});

api.get('/all', async (req, res) => {
    // const data = await supabase.from('contacts').select('*');
    const data = await prisma.contact.findMany({});
    res.send(data);
});

api.post('/add', async (req, res) => {
    const contact = new Contact(req.body);
    const val = await validate(contact);
    if (val.length > 0) {
        res.status(400).send(val);
        return;
    }
    // const { data, error } = await supabase.from('contacts').insert(req.body);
    const data = await prisma.contact.create({ data: { ...contact } })
    // if (error) {
    //     res.status(400).send(error);
    //     return;
    // }
    res.send(data);
});

function getFilter(query: qs.ParsedQs): Prisma.ContactWhereInput {
    return {
        OR: Object.entries(query).map(([key, value]) => {
            if (Array.isArray(value)) {
                return {
                    [key]: {
                        in: value
                    }
                }
            }
            return {
                [key]: { equals: value }
            }
        })
    }
    // return Object.entries(query).map(([key, value]) => {
    //     if (Array.isArray(value)) {
    //         return `${key}.in.(${value.join(",")})`
    //     }
    //     return `${key}.eq.${value}`
    // }).join(",")
}

api.get('/delete', async (req, res) => {
    const tmp = getFilter(req.query);
    // const { count, error } = await supabase.from('contacts').delete({ count: "exact" }).or(tmp);
    const out = await prisma.contact.deleteMany({
        where: tmp
    })
    // if (error) {
    //     res.status(400).send(error);
    // }
    res.send({ deleted: out.count });
});

api.get('/update', async (req, res) => {
    const tmp = getFilter(req.query);
    // const wanted = await supabase.from('contacts').select('*').or(tmp);
    const wanted = await prisma.contact.findMany({where: tmp});
    // if (wanted.error) {
    //     res.status(400).send(wanted.error);
    //     return
    // }
    if (wanted.length === 0) {
        res.status(404).send({ message: "No item fits the filter" })
        return
    }
    const poss = new Contact({ ...wanted[0], ...req.body });
    const val = await validate(poss);
    if (val.length > 0) {
        res.status(400).send(val);
        return;
    }
    const updated = await prisma.contact.updateMany({
        where: tmp,
        data: poss
    })
    // const { count, error } = await supabase.from('contacts').update(req.body, { count: "exact" }).or(tmp);
    // if (error) {
    //     res.status(400).send(error);
    //     return
    // }
    res.send({ updated: updated.count });
});

export default api;