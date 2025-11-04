import { UnprocessableEntityException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import * as path from 'path';

export const multerConfig: MulterOptions = {
  fileFilter(req, file, callback) { 
        
    const extencion = path.extname(file.originalname);
    if (extencion !== '.xlsx') {
      return callback(new UnprocessableEntityException(), false);
    }
    callback(null, true);
  },
  storage: diskStorage({
    destination: './upload',
    filename(req, file, callback) {
      const date = new Date();
      const formattedDate = `fecha-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${formattedDate}`;
      const extencion = path.extname(file.originalname);
      callback(null, uniqueSuffix + extencion);
    },
  }),
};