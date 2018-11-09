import { check } from 'express-validator/check';
import { findUserByName } from '../services/user';

const reportRule = {
  // 投稿
  post: [
    // タイトル
    check('title')
      // 最大50文字まで
      .isLength({ max: 50 })
      .withMessage('タイトルは50文字以下で入力してください。'),
    // 状況の説明
    check('description')
      // 最大500文字まで
      .isLength({ max: 500 })
      .withMessage('状況の説明は500文字以下で入力してください。'),
  ],
};

export default reportRule;
