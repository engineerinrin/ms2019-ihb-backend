import { renameSync } from 'fs';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import { ExifParserFactory } from 'ts-exif-parser';
import reportModel, { IReportModel } from '../models/report';
import { imageAnalysisRequest } from '../utils/client';
import incident from '../utils/incident';
import { findUserByName } from './user';

export const createReport = async (name: string, title: string, description: string, destination: string, filename: string, tags: string[]) => {
  const tmpPath = path.join(destination, filename);
  const staticPath = path.join('static', 'reports', filename);
  const image = fs.readFileSync(tmpPath);

  renameSync(tmpPath, staticPath);

  try {
    const report: IReportModel = new reportModel();
    const { findUser } = await findUserByName(name);
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const { GPSLongitude, GPSLatitude }: any = ExifParserFactory.create(image).parse().tags;

    report.title = /^[\s]*$/.test(title) ? 'なし' : title;
    report.description = /^[\s]*$/.test(description) ? 'なし' : description;
    report.path = filename;
    report.tags = tags;
    if (GPSLongitude && GPSLatitude) {
      report.location.condinates = [GPSLongitude, GPSLatitude];
    }
    report.author = findUser;
    report.created_at = now;
    report.updated_at = now;

    await report.save();
    return { err: null };
  } catch (err) {
    return { err };
  }
};

export const imageAnalysis = async (destination: string, filename: string, mimetype: string): Promise<{ err: any, tags?: string[], preview?: string }> => {
  const tmpPath = path.join(destination, filename);
  const image = fs.readFileSync(tmpPath);
  const base64Image = new Buffer(image).toString('base64');

  try {
    const body = await imageAnalysisRequest(base64Image) as any;
    fs.unlinkSync(tmpPath);

    const tags: string[] = ['テスト'];
    for (const { description } of body.responses[0].labelAnnotations) {
      if (description in incident) {
        tags.push(incident[description]);
      }
    }

    const preview = `data:${mimetype};base64,${base64Image}`;

    return { err: null, tags, preview };
  } catch (err) {
    return { err };
  }
};
