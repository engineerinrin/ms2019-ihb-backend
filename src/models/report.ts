import { Document, model, Schema } from 'mongoose';

const report: Schema = new Schema({
  title: { type: String },
  description: { type: String },
  path: { type: String, required: true },
  tags: { type: [String], required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [136.885731, 35.168136] },
  },
  author: { type: Schema.Types.ObjectId, ref: 'users' },
  is_delete: { type: Boolean, default: false },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
}, {
    versionKey: false,
  });

report.index({ location: '2dsphere' });

interface IReportDocumnet {
  title: string;
  description: string;
  path: string;
  tags: string[];
  location: {
    type: string,
    coordinates: number[],
  };
  author: any;
  created_at: string;
  updated_at: string;
  is_delete: boolean;
}

export interface IReportModel extends IReportDocumnet, Document { }
export default model<IReportModel>('reports', report);
