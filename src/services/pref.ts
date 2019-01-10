import prefModel from '../models/pref';

// 都道府県一覧取得
export const getAllPref = async () => {
  try {
    const prefs = await prefModel.find().exec();
    return { err: null, prefs };
  } catch (err) {
    return { err };
  }
};

// 名前を元に都道府県の取得
export const getPrefByName = async (name: string) => {
  try {
    const pref = await prefModel.findOne({ name }).exec();
    return { err: null, pref };
  } catch (err) {
    return { err };
  }
};
