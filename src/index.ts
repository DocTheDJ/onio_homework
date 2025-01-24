import express, { json, urlencoded } from 'express';
import api from './api';

const app = express();
const port = process.env.PORT || 3000;

app.use(urlencoded({ extended: true }));
app.use(json());

// app.get('/', (req: Request, res: Response) => {
//     res.send('Hello, TypeScript Express!');
// });

app.use("/api", api);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});