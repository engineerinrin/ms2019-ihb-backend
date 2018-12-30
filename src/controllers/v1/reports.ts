import { NextFunction, Request, Response, Router } from 'express';
import { Result, validationResult } from 'express-validator/check';
import authCheck from '../../middlewares/authCheck';
import { reportTmpUpload } from '../../middlewares/upload';
import reportRule from '../../rules/report';
import { createReport, getAroundMeIncidents, getReportById, getReports, getSupportingUsers, imageAnalysis, resolveIncident, stopRemovalWork } from '../../services/report';
import { createComment } from '../../services/reportComment';

const router: Router = Router();

router
  // レポート一覧を取得する
  .get('/', async (req: Request, res: Response, next: NextFunction) => {
    const { offset } = req.query;
    const reports = await getReports(parseInt(offset, 10));

    res.status(200).json({ reports });
  })
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
  // レポートを解決状態に更新
  .patch('/:id/resolve', authCheck, async (req: Request, res: Response, next: NextFunction) => {
    const reportId = req.params.id;
    const { name } = req.body;

    const { err, isSuccess } = await resolveIncident(reportId);

    if (err) {
      next(err);
    }

    if (isSuccess) {
      const supportingUsers = await stopRemovalWork(reportId, name);
      for (const i in supportingUsers) {
        await stopRemovalWork(reportId, supportingUsers[i]);
      }
      res.status(204).send();
    } else {
      res.status(409).send();
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
  })
  // レポートに対してコメントする
  .post('/:id/comment', authCheck, reportRule.postComment, async (req: Request, res: Response, next: NextFunction) => {
    const errs: Result = validationResult(req);

    if (!errs.isEmpty()) {
      return res.status(400).json({ errs: errs.array() });
    }

    const reportId = req.params.id;
    const { name, text } = req.body;

    const { err } = await createComment(name, reportId, text);
    if (err) {
      next(err);
    }

    res.status(201).send();
  });

export default router;
