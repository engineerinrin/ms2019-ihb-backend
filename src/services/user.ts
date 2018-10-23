import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import userModel, { IUserModel } from '../models/user';
import { jwtSecretKey } from '../utils/config';

// ユーザー名でユーザー検索
export const findUserByName =
  async (name: string): Promise<{ err: null, findUser: IUserModel } | { err: any, findUser: null }> => {
    try {
      const [findUser] = await userModel.find({ name }).exec();
      return { err: null, findUser };
    } catch (err) {
      return { err, findUser: null };
    }
  };

// アカウントを登録する(仮)
export const signup =
  async (name: string, password: string): Promise<{ err: null | any }> => {
    const user: IUserModel = new userModel();
    const now = moment().format('YYYY-MM-DD HH:mm:ss');

    user.name = name;
    user.password = bcrypt.hashSync(password, 10);
    user.created_at = now;
    user.updated_at = now;

    try {
      await user.save();
      return { err: null };
    } catch (err) {
      return { err };
    }
  };

// ログイン処理
export const signin =
  async (name: string, password: string): Promise<{ err: null | any, result: any | null }> => {
    try {
      const [findUser] = await userModel.find({ name }).exec();

      if (findUser) {
        const isMatch = bcrypt.compareSync(password, findUser.password);

        if (isMatch) {
          const now = moment().format('YYYY-MM-DD HH:mm:ss');
          const accessToken = jwt.sign({ name, now }, jwtSecretKey, { expiresIn: '3 days' });

          return {
            err: null,
            result: {
              isSuccess: true,
              accessToken,
            },
          };
        }
      }

      return {
        err: null,
        result: {
          isSuccess: false,
          errMsgs: ['ユーザー名またはパスワードが違います'],
        },
      };
    } catch (err) {
      return { err, result: null };
    }
  };
