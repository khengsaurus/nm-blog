import S3 from "aws-sdk/clients/s3";
import { ServerInfo } from "enums";
import { randomBytes } from "crypto";
import { IObject } from "types";

const bucketName = process.env.ENV_AWS_BUCKET;

const s3 = new S3({
  region: process.env.ENV_AWS_REGION,
  accessKeyId: process.env.ENV_AWS_ACCESS_KEY,
  secretAccessKey: process.env.ENV_AWS_SECRET_KEY,
  signatureVersion: "v4",
});

export const generateUploadURL = async (): Promise<IObject<String>> => {
  return new Promise(async (resolve, reject) => {
    const rawBytes = await randomBytes(16);
    const imageKey = rawBytes.toString("hex");
    const params = {
      Bucket: process.env.ENV_AWS_BUCKET,
      Key: imageKey,
      Expires: 60,
    };
    await s3
      .getSignedUrlPromise("putObject", params)
      .then((uploadURL) => resolve({ uploadURL, imageKey }))
      .catch(reject);
  });
};

export function getFileStream(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };
  return s3.getObject(downloadParams).createReadStream();
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
