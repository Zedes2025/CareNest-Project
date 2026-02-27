import express from 'express';
import cors from 'cors';
import { completionRoutes } from '#routes';
import { errorHandler, notFoundHandler } from '#middleware';

const app = express();
const port = process.env.PORT || '5050';

app.use(cors({ origin: '*' }), express.json());

app.use('/ai', completionRoutes);

app.use('*splat', notFoundHandler);
app.use(errorHandler);

app.listen(port, () => console.log(`\x1b[35mApp listening at http://localhost:${port}\x1b[0m`));
