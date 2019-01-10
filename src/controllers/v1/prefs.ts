import { NextFunction, Request, Response, Router } from 'express';
import { getAllPref } from '../../services/pref';

const router: Router = Router();

router
  // 都道府県一覧取得
  .get('/', async (req: Request, res: Response, next: NextFunction) => {
    const { err, prefs } = await getAllPref();

    if (err) {
      next(err);
    }

    res.status(200).json({ prefs });
  });

export default router;
