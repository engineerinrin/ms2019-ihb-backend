import moment from 'moment';
import commentModel, { IReportCommentModel } from '../models/reportComment';
import { findUserByName } from './user';

// レポートに対するコメント
export const createComment = async (name: string, reportId: string, text: string) => {
  try {
    const { findUser } = await findUserByName(name);
    const now = moment().format('YYYY-MM-DD HH:mm:ss');

    const comment: IReportCommentModel = new commentModel();
    comment.text = text;
    comment.report_id = reportId;
    comment.author = findUser;
    comment.created_at = now;
    comment.updated_at = now;

    await comment.save();
    return { err: null };
  } catch (err) {
    return { err };
  }
};
