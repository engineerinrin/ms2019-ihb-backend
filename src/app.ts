import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Application } from 'express';
import logger from 'morgan';
import errorHandler from './middlewares/errorHandler';
import routes from './routes';

const app: Application = express();

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(logger('dev'));
app.use(cors());
app.use('/api/v1', routes);
app.use('/static', express.static('static'));
app.use(errorHandler);

export default app;
