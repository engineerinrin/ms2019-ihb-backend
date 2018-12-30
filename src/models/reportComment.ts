import { Document, model, Schema } from 'mongoose';

const reportComment: Schema = new Schema({
  text: { type: String, required: true },
  report_id: { type: Schema.Types.ObjectId, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'users' },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
}, {
  versionKey: false,
});

interface IReportCommentDocumnet {
  text: string;
  report_id: string;
  author: any;
  created_at: string;
  updated_at: string;
}

export interface IReportCommentModel extends IReportCommentDocumnet, Document { }
export default model<IReportCommentModel>('report_comments', reportComment);
