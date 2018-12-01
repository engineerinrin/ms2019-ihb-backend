import { renameSync } from 'fs';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import { ExifParserFactory } from 'ts-exif-parser';
import reportModel, { IReportModel } from '../models/report';
import { geoCodingRequest, imageAnalysisRequest } from '../utils/client';
import incident from '../utils/incident';
import { redisReportsGet, redisReportsSet, redisUsersDel, redisUsersSet } from '../utils/redis';
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
      is_resolved: false,
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
        is_resolved: 1,
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
          isResolved: data.is_resolved,
        },
      };
    } else {
      return { report: null };
    }
  } catch (err) {
    return { err };
  }
};

export const getSupportingUsers = async (reportId: string) => {
  return JSON.parse(await redisReportsGet(reportId));
};

export const startRemovalWork = async (reportId: string, name: string) => {
  let supportingUsers = JSON.parse(await redisReportsGet(reportId));
  supportingUsers = supportingUsers ? supportingUsers.concat(name) : [name];

  await redisReportsSet(reportId, JSON.stringify(supportingUsers));
  await redisUsersSet(name, reportId);

  return supportingUsers;
};

export const stopRemovalWork = async (reportId: string, name: string) => {
  let supportingUsers: string[] = JSON.parse(await redisReportsGet(reportId));
  supportingUsers = supportingUsers.filter((supportingUser) => supportingUser !== name);
  await redisReportsSet(reportId, JSON.stringify(supportingUsers));
  await redisUsersDel(name);

  return supportingUsers;
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

    const { GPSLongitude, GPSLatitude }: any = ExifParserFactory.create(image).parse().tags;
    const geoData: any = GPSLatitude && GPSLongitude ? await geoCodingRequest(GPSLatitude, GPSLongitude) : null;

    console.log(`
    >============================解析結果出力開始=============================>

      - 検出されたインシデント
        ${tags.length > 0 ? tags : 'なし'}

      - 検出された位置情報
        - 場所: ${geoData ? geoData.results[8].formatted_address : '不定'}
        - 緯度: ${GPSLatitude}
        - 経度: ${GPSLongitude}

    >============================解析結果出力終了=============================>
    `);

    return { err: null, tags, preview };
  } catch (err) {
    return { err };
  }
};

export const getReports = async (offset: number) => {
  return (
    reportModel
      .find(
        { is_resolved: false },
        {
          title: 1,
          path: 1,
          tags: 1,
          created_at: 1,
        }
      )
      .limit(10)
      .skip(offset)
  );
};

// インシデントレポートを解決状態にする
export const resolveIncident = async (reportId: string) => {
  try {
    const result = await reportModel.update({ _id: reportId }, { $set: { is_resolved: true } });
    const isSuccess = result.nModified === 1 ? true : false;
    return { err: null, isSuccess };
  } catch (err) {
    return { err };
  }
};
