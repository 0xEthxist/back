import { extname } from "path";
import { diskStorage, StorageEngine, FileFilterCallback } from 'multer';
import { Logger } from "@nestjs/common";

const profile = diskStorage({
  destination: "./public/profile",
  filename: (req, file, callback) => {
    let _filename = generateFilename(file)
    Logger.warn('uploading file with name: ', _filename, ' ...')
    callback(null, _filename);
  }
});

const storage = diskStorage({
  destination: "./uploads",
  filename: (req, file, callback) => {
    callback(null, generateFilename(file));
  }
});

export const multerOption = {
  storage,
  limits: {
    fieldSize: 50 * 1024 * 1024,

  }

}

export const multerOptionProfile = {
  storage: profile,
  limits: {
    fieldSize: 10 * 1024 * 1024,
  },
}

function generateFilename(file) {
  return `${Date.now()}-${Math.floor(1 + Math.random() * 9)}-.${file.mimetype.split('/')[1]}`;
}