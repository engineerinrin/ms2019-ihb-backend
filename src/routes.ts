import { Router } from 'express';
import indexController from './controllers/v1/';
import prefsController from './controllers/v1/prefs';
import reportsController from './controllers/v1/reports';
import signinController from './controllers/v1/signin';
import singupController from './controllers/v1/signup';

const routes: Router = Router();

routes
  .use('/', indexController)
  .use('/sign_up', singupController)
  .use('/sign_in', signinController)
  .use('/reports', reportsController)
  .use('/prefs', prefsController);

export default routes;
