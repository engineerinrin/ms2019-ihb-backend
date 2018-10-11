import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import userModel, { IUserModel } from '../models/user';
import { jwtSecretKey } from '../utils/config';

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

// ログイン処理(仮)
export const signin =
  async (name: string, password: string): Promise<{ err: null, result: any } | { err: any, result: null }> => {
    try {
      const [findUser] = await userModel.find({ name }).exec();

      let result;
      if (findUser) {
        const isMatch = bcrypt.compareSync(password, findUser.password);

        if (isMatch) {
          const now = moment().format('YYYY-MM-DD HH:mm:ss');
          const accessToken = jwt.sign({ name, now }, jwtSecretKey, { expiresIn: '3 days' });

          result = { isSuccess: true, accessToken };
        }
      } else {
        result = { isSuccess: false, errMsgs: ['ユーザー名またはパスワードが違います'] };
      }

      return { err: null, result };
    } catch (err) {
      return { err, result: null };
    }
  };
