import { NextFunction, Request, Response, Router } from 'express';
import { Result, validationResult } from 'express-validator/check';
import userRule from '../../rules/user';
import { signup } from '../../services/user';

const router: Router = Router();

router
  // アカウントを登録する(仮)
  .post('/', userRule.signup, async (req: Request, res: Response, next: NextFunction) => {
    const errs: Result = validationResult(req);

    if (!errs.isEmpty()) {
      return res.status(400).json({ errs: errs.mapped() });
    }

    const { err } = await signup(req.body.name, req.body.password);

    if (err) {
      next(err);
    } else {
      res.status(201).send();
    }
  });

export default router;
