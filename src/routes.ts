import { Router } from 'express';
import indexController from './controllers/v1/';
import signinController from './controllers/v1/signin';
import singupContoroller from './controllers/v1/signup';

const routes: Router = Router();

routes
  .use('/', indexController)
  .use('/sign_up', singupContoroller)
  .use('/sign_in', signinController);

export default routes;
