import multer from 'multer';

// 一時領域
const storage = multer.diskStorage({
  destination: 'tmp/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// レポート投稿の写真を一時領域にアップロード
export const reportTmpUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = file.mimetype.substr(6);
    if (ext !== 'png' && ext !== 'jpg' && ext !== 'jpeg') {
      return cb(new Error('It is an unauthorized file'), false);
    }
    cb(null, true);
  },
})
  .single('image');
