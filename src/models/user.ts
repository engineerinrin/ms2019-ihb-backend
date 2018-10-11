import { Document, model, Schema } from 'mongoose';

const user: Schema = new Schema({
  name: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  is_delete: { type: Boolean, default: false },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
}, {
    versionKey: false,
  });

interface IUserDocumnet {
  name: string;
  password: string;
  created_at: string;
  updated_at: string;
  is_delete: boolean;
}

export interface IUserModel extends IUserDocumnet, Document { }
export default model<IUserModel>('users', user);
