import { Router } from 'express';
import indexController from './controllers/v1/';

const routes: Router = Router();

routes.use('/', indexController);

export default routes;
