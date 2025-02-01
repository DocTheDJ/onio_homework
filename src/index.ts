import express, { json, urlencoded } from 'express';
import api from './routes/api';
import supabase from './routes/supabase';
import prisma from "./routes/prisma";
import { connectToDatabase, disconnectFromDatabase } from './connection';

export const app = express();
const port = process.env.PORT || 3000;

app.use(urlencoded({ extended: true }));
app.use(json());

// app.get('/', (req: Request, res: Response) => {
//     res.send('Hello, TypeScript Express!');
// });

app.use("/api", api);
app.use("/supabase", supabase);
app.use("/prisma", prisma)

export const server = app.listen(port, async () => {
    await connectToDatabase();
    console.log(`Server running at http://localhost:${port}`);
});

const shutdown = async () => {
    console.log('Shutting down server...');
    await disconnectFromDatabase();
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
};

// Handle SIGINT (e.g., Ctrl+C) and SIGTERM (e.g., `kill` command)
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);