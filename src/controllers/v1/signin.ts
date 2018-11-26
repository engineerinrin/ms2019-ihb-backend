import { NextFunction, Request, Response, Router } from 'express';
import { Result, validationResult } from 'express-validator/check';
import userRule from '../../rules/user';
import { getMySupportedReport, signin } from '../../services/user';

const router: Router = Router();

router
  // ログイン
  .post('/', userRule.signin, async (req: Request, res: Response, next: NextFunction) => {
    const errs: Result = validationResult(req);

    if (!errs.isEmpty()) {
      const errMsgs = [];

      for (const err of errs.array()) {
        errMsgs.push(err.msg);
      }

      return res.status(400).json({ errMsgs });
    }

    const { name, password } = req.body;
    const { err, result } = await signin(name, password);

    if (err) {
      next(err);
    } else {
      const { isSuccess, accessToken, errMsgs } = result;
      if (isSuccess) {
        const reportId = await getMySupportedReport(name);
        res.status(200).json({ name, accessToken, reportId });
      } else {
        res.status(401).json({ errMsgs });
      }
    }
  });

export default router;
