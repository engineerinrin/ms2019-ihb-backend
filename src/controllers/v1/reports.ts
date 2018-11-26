import { NextFunction, Request, Response, Router } from 'express';
import { Result, validationResult } from 'express-validator/check';
import authCheck from '../../middlewares/authCheck';
import { reportTmpUpload } from '../../middlewares/upload';
import reportRule from '../../rules/report';
import { createReport, getAroundMeIncidents, getReportById, getSupportingUsers, imageAnalysis } from '../../services/report';

const router: Router = Router();

router
  // インシデントマップに表示するデータを取得
  .get('/map', async (req: Request, res: Response, next: NextFunction) => {
    const { lat, lng } = req.query;
    const { incidents, err } = await getAroundMeIncidents(lat, lng);

    if (err) {
      next(err);
    }

    if (incidents.length > 0) {
      res.status(200).json({ incidents });
    } else {
      res.status(404).send();
    }
  })
  // 単一のレポートのデータを取得
  .get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const reportId = req.params.id;

    const { report, err } = await getReportById(reportId);

    if (err) {
      next(err);
    }

    if (report) {
      const supportingUsers = await getSupportingUsers(reportId);
      res.status(200).json({ report: { ...report, ...{ supportingUsers } } });
    } else {
      res.status(404).send();
    }
  })
  // レポートの投稿
  .post('/', [reportTmpUpload, authCheck], reportRule.post, async (req: Request, res: Response, next: NextFunction) => {
    const errs: Result = validationResult(req);

    if (!errs.isEmpty()) {
      return res.status(400).json({ errs: errs.mapped() });
    }

    const { name, title, description, tags } = req.body;
    const { destination, filename } = req.file;

    const { err } = await createReport(name, title, description, destination, filename, tags);

    if (err) {
      next(err);
    }

    res.status(201).send();
  })
  // 選択されたレポート画像を解析する
  .post('/image-analysis', [reportTmpUpload, authCheck], async (req: Request, res: Response, next: NextFunction) => {
    const { destination, filename, mimetype } = req.file;

    const { err, tags, preview } = await imageAnalysis(destination, filename, mimetype);

    if (err) {
      next(err);
    }

    res.status(200).json({ tags, preview });
  });

export default router;
