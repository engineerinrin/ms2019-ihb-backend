import { NextFunction, Request, Response, Router } from 'express';
import { Result, validationResult } from 'express-validator/check';
import authCheck from '../../middlewares/authCheck';
import { reportTmpUpload } from '../../middlewares/upload';
import reportRule from '../../rules/report';
import { createReport } from '../../services/report';

const router: Router = Router();

router
  // レポートの投稿
  .post('/', [reportTmpUpload, authCheck], reportRule.post, async (req: Request, res: Response, next: NextFunction) => {
    const errs: Result = validationResult(req);

    if (!errs.isEmpty()) {
      return res.status(400).json({ errs: errs.mapped() });
    }

    const { name, title, description } = req.body;
    const { destination, filename } = req.file;

    const { err } = await createReport(name, title, description, destination, filename);

    if (err) {
      next(err);
    }

    res.status(201).send();
  });

export default router;
