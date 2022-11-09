import { Request } from 'express';
import {v4 as uuid} from 'uuid'

export const fileNamer = (
  req: Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File is empty'), false);

  const fileExtention = file.mimetype.split('/')[1];
  const fileName= `${uuid()}.${fileExtention}`

  callback(null, fileName);
};
