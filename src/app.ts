import bodyParser from 'body-parser';
import express, { Application } from 'express';
import logger from 'morgan';
import errorHandler from './middlewares/errorHandler';
import routes from './routes';

const app: Application = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use('/api/v1', routes);
app.use(errorHandler);

export default app;
