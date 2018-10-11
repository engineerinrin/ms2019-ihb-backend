import { Router } from 'express';
import authCheck from '../../middlewares/authCheck';

const router: Router = Router();

router
  // ハロワ
  .get('/', (req, res) => {
    res.send('Hello world.');
  })
  // アクセストークンチェックミドルウェアテスト用
  .post('/', authCheck, (req, res) => {
    console.log(req.body);
    res.send('Test test, auth check middleware test.');
  });

export default router;
