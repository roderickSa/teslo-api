import { Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  async uploadImage(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<UploadApiResponse[]> {
    const arrayPromises = [];
    files.forEach((file) => {
      const promise = new Promise((resolve, reject) => {
        const upload = v2.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        toStream(file.buffer).pipe(upload);
      });
      arrayPromises.push(promise);
    });

    return Promise.all(arrayPromises);
  }

  async uploadImageByPath(
    files: string[],
    folder: string,
  ): Promise<UploadApiResponse[]> {
    const arrayPromises = [];
    files.forEach((file) => {
      const promise = new Promise((resolve, reject) => {
        v2.uploader.upload(file, { folder }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
      });
      arrayPromises.push(promise);
    });

    return Promise.all(arrayPromises);
  }

  async deleteImage(public_ids: string[]) {
    return new Promise((resolve, reject) => {
      v2.api.delete_resources(public_ids, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }
}
