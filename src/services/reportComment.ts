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

    const data = await comment.save();
    return { err: null, data };
  } catch (err) {
    return { err };
  }
};

// レポートに対するコメントの一覧を取得
export const getCommentsByReportId = async (reportId: string) => {
  try {
    const comments = await commentModel.find(
      { report_id: reportId },
      {
        text: 1,
        author: 1,
        created_at: 1,
      },
    )
      .populate('author', 'name')
      .exec();

    return { err: null, comments };
  } catch (err) {
    return { err };
  }
};
