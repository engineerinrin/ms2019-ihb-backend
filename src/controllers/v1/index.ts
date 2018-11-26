import { Router } from 'express';
import authCheck from '../../middlewares/authCheck';
import { findUserByName, getMySupportedReport } from '../../services/user';

const router: Router = Router();

router
  // リロード時の初期認証チェック
  .post('/', authCheck, async (req, res, next) => {
    const { name } = req.body;
    const accessToken = req.headers.authorization;

    const { err, findUser } = await findUserByName(name);

    if (err) {
      next(err);
    } else {
      if (findUser) {
        const reportId = await getMySupportedReport(name);
        res.status(200).json({ name, accessToken, reportId });
      } else {
        res.status(401).send();
      }
    }
  });

export default router;
