import { Document, model, Schema } from 'mongoose';

const report: Schema = new Schema({
  title: { type: String },
  description: { type: String },
  path: { type: String, required: true },
  tags: { type: [String], required: true },
  author: { type: Schema.Types.ObjectId, ref: 'users' },
  is_delete: { type: Boolean, default: false },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
}, {
    versionKey: false,
  });

interface IReportDocumnet {
  title: string;
  description: string;
  path: string;
  tags: string[];
  author: any;
  created_at: string;
  updated_at: string;
  is_delete: boolean;
}

export interface IReportModel extends IReportDocumnet, Document { }
export default model<IReportModel>('reports', report);
