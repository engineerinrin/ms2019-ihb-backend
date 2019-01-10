import { Document, model, Schema } from 'mongoose';

const pref: Schema = new Schema({
  name: String,
}, {
    versionKey: false,
  });

interface IPrefDocumnet {
  name: string;
}

export interface IPrefModel extends IPrefDocumnet, Document { }
export default model<IPrefModel>('prefs', pref);
