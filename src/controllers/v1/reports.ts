import { NextFunction, Request, Response, Router } from 'express';
import { Result, validationResult } from 'express-validator/check';
import { renameSync } from 'fs';
import path from 'path';
import authCheck from '../../middlewares/authCheck';
import { reportTmpUpload } from '../../middlewares/upload';
import reportRule from '../../rules/report';

const router: Router = Router();

router
  // レポートの投稿
  .post('/', [authCheck, reportTmpUpload], reportRule.post, (req: Request, res: Response, next: NextFunction) => {
    const errs: Result = validationResult(req);

    if (!errs.isEmpty()) {
      return res.status(400).json({ errs: errs.mapped() });
    }

    const { destination, filename } = req.file;
    const tmpPath = path.join(destination, filename);
    const staticPath = path.join('static', 'reports', filename);

    renameSync(tmpPath, staticPath);

    res.status(201).send();
  });

export default router;
