import { Router } from 'express';
import indexController from './controllers/v1/';
import singupContoroller from './controllers/v1/signup';

const routes: Router = Router();

routes
  .use('/', indexController)
  .use('/sign_up', singupContoroller);

export default routes;
