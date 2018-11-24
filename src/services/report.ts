import { renameSync } from 'fs';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import { ExifParserFactory } from 'ts-exif-parser';
import reportModel, { IReportModel } from '../models/report';
import { imageAnalysisRequest } from '../utils/client';
import incident from '../utils/incident';
import { redisReportsGet, redisReportsSet, redisUsersGet, redisUsersSet } from '../utils/redis';
import { findUserByName } from './user';

// 自分の周りのインシデントのデータを取得する
export const getAroundMeIncidents = async (lat: number, lng: number) => {
  try {
    const data = await reportModel.find({
      location: {
        $near: {
          $maxDistance: 1000,
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        },
      },
    }, { _id: 1, location: 1 })
      .exec();

    const incidents = [];
    for (const i of data) {
      incidents.push({
        _id: i._id,
        lng: i.location.coordinates[0],
        lat: i.location.coordinates[1],
      });
    }

    return { incidents };
  } catch (err) {
    return { err, incidents: [] };
  }
};

export const getReportById = async (reportId: string) => {
  try {
    const data = await reportModel.findOne(
      { _id: reportId },
      {
        title: 1,
        description: 1,
        path: 1,
        tags: 1,
        location: 1,
        author: 1,
        created_at: 1,
      },
    )
      .populate('author', 'name')
      .exec();

    if (data) {
      return {
        report: {
          title: data.title,
          description: data.description,
          imageUrl: data.path,
          tags: data.tags,
          lng: data.location.coordinates[0],
          lat: data.location.coordinates[1],
          author: data.author.name,
          createdAt: data.created_at,
        },
      };
    } else {
      return { report: null };
    }
  } catch (err) {
    return { err };
  }
};

export const setSupporter = async (reportId: string, name: string) => {
  const supporters = JSON.parse(await redisReportsGet(reportId));

  await redisReportsSet(reportId, JSON.stringify(supporters ? supporters.concat(name) : [name]));
  await redisUsersSet(name, reportId);
};

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
      report.location.coordinates = [GPSLongitude, GPSLatitude];
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

    const tags: string[] = [];
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
