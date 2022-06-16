import S3 from "aws-sdk/clients/s3";
import { ServerInfo } from "enums";
import fs from "fs";

const bucketName = process.env.ENV_AWS__BUCKET;

const s3 = new S3({
  region: process.env.ENV_AWS__REGION,
  accessKeyId: process.env.ENV_AWS__ACCESS_KEY,
  secretAccessKey: process.env.ENV_AWS__SECRET_KEY,
});

export function getFileStream(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };
  return s3.getObject(downloadParams).createReadStream();
}

export function uploadFile(file) {
  const uploadParams = {
    Bucket: bucketName,
    Body: fs.createReadStream(file.path),
    Key: file.filename,
  };
  return s3.upload(uploadParams).promise();
}

export function deleteFile(imageKey: string) {
  return new Promise((resolve, reject) => {
    s3.deleteObject({ Bucket: bucketName, Key: imageKey }, function (err, _) {
      if (err) reject(err);
      else {
        resolve({
          status: 200,
          message: ServerInfo.FILE_DELETED,
        });
      }
    });
  });
}
