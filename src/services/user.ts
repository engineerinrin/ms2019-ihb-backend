import bcrypt from 'bcryptjs';
import moment from 'moment';
import userModel, { IUserModel } from '../models/user';

// ユーザー名でユーザー検索
export const findUserByName =
  async (name: string): Promise<{ isSuccess: true, data: IUserModel[] } | { isSuccess: false, err: any }> => {
    try {
      const data = await userModel.find({ name }).exec();
      return { isSuccess: true, data };
    } catch (err) {
      return { isSuccess: false, err };
    }
  };

// アカウントを登録する(仮)
export const signup =
  async (name: string, password: string): Promise<{ isSuccess: true } | { isSuccess: false, err: any }> => {
    const user: IUserModel = new userModel();
    const now = moment().format('YYYY-MM-DD HH:mm:ss');

    user.name = name;
    user.password = bcrypt.hashSync(password, 10);
    user.created_at = now;
    user.updated_at = now;

    try {
      await user.save();
      return { isSuccess: true };
    } catch (err) {
      return { isSuccess: false, err };
    }
  };
