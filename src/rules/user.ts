import { check } from 'express-validator/check';
import { findUserByName } from '../services/user';

const userRoules = {
  // アカウント作成
  signup: [
    // ユーザー名
    check('name')
      // 未入力禁止
      .not().isEmpty()
      .withMessage('ユーザー名が未入力です')
      // 書式は半角英数のみ
      .custom((name) => {
        return /^[a-zA-Z0-9]+$/.test(name);
      })
      .withMessage('ユーザー名は半角英数字のみ使用できます')
      // 最大20文字まで
      .isLength({ max: 20 })
      .withMessage('ユーザー名は20文字以下で入力してください')
      // 重複するユーザー名が存在しないか
      .custom(async (name) => {
        const result = await findUserByName(name);
        if (result.isSuccess) {
          return result.data.length === 0;
        } else {
          console.log(result.err);
        }
      })
      .withMessage('すでに登録されているユーザー名です'),
    // パスワード
    check('password')
      // 未入力禁止
      .not().isEmpty()
      .withMessage('パスワードが未入力です')
      // 書式は半角英数のみ
      .custom((password) => {
        return /^[a-zA-Z0-9]+$/.test(password);
      })
      .withMessage('パスワードは半角英数字のみ使用できます')
      // 最低8文字必要
      .isLength({ min: 8 })
      .withMessage('パスワードは8文字以上必要です')
      // 最大72文字まで
      .isLength({ max: 72 })
      .withMessage('パスワードは72文字以下で入力してください'),
    // 確認用パスワード
    check('confirmPassword')
      // 未入力禁止
      .not().isEmpty()
      .withMessage('確認用パスワードが未入力です')
      // パスワードと一致するか
      .custom((confirmPassword, { req }) => {
        return confirmPassword === req.body.password;
      })
      .withMessage('パスワードと確認用パスワードが一致しません'),
  ],
  // ログイン
  signin: [
    // ユーザー名
    check('name')
      // 未入力禁止
      .not().isEmpty()
      .withMessage('ユーザー名が未入力です'),
    // パスワード
    check('password')
      // 未入力禁止
      .not().isEmpty()
      .withMessage('パスワードが未入力です'),
  ],
};

export default userRoules;
