import { renameSync } from 'fs';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import reportModel, { IReportModel } from '../models/report';
import { imageAnalysisRequest } from '../utils/client';
import incident from '../utils/incident';
import { findUserByName } from './user';

export const createReport = async (name: string, title: string, description: string, destination: string, filename: string) => {
  const tmpPath = path.join(destination, filename);
  const staticPath = path.join('static', 'reports', filename);

  renameSync(tmpPath, staticPath);

  try {
    const report: IReportModel = new reportModel();
    const { findUser } = await findUserByName(name);
    const now = moment().format('YYYY-MM-DD HH:mm:ss');

    report.title = /^[\s]*$/.test(title) ? 'なし' : title;
    report.description = /^[\s]*$/.test(description) ? 'なし' : description;
    report.path = filename;
    report.author = findUser;
    report.created_at = now;
    report.updated_at = now;

    await report.save();
    return { err: null };
  } catch (err) {
    return { err };
  }
};

export const imageAnalysis = async (destination: string, filename: string): Promise<{err: any, tags?: string[]}> => {
  const tmpPath = path.join(destination, filename);
  const image = fs.readFileSync(tmpPath);
  const base64Image = new Buffer(image).toString('base64');

  try {
    const body = await imageAnalysisRequest(base64Image) as any;
    fs.unlinkSync(tmpPath);

    const tags: string[] = [];
    for (const { description } of body.responses[0].labelAnnotations) {
      if (description in incident) {
        tags.push(incident[description]);
      }
    }

    return { err: null, tags };
  } catch (err) {
    return { err };
  }
};
