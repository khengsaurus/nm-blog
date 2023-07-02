import S3 from "aws-sdk/clients/s3";
import { IS_DEV_S } from "consts";
import { randomBytes } from "crypto";
import { ServerInfo } from "enums";
import { IObject } from "types";
import ServerError from "./ServerError";

const Bucket = process.env.ENV_AWS_BUCKET;

const s3 = new S3(
  IS_DEV_S
    ? {
        endpoint: process.env.DEV_AWS_S3,
        region: process.env.ENV_AWS_REGION,
        accessKeyId: "test",
        secretAccessKey: "test",
        signatureVersion: "v4",
        s3ForcePathStyle: true,
      }
    : {
        region: process.env.ENV_AWS_REGION,
        accessKeyId: process.env.ENV_AWS_ACCESS_KEY,
        secretAccessKey: process.env.ENV_AWS_SECRET_KEY,
        signatureVersion: "v4",
      }
);

export const generateUploadURL = async (
  userId: string
): Promise<IObject<String>> => {
  return new Promise(async (resolve, reject) => {
    const rawBytes = await randomBytes(16);
    const Key = `user_${userId}/${rawBytes.toString("hex")}`;
    const params = {
      Bucket,
      Key,
      Expires: 60,
      Tagging: "",
    };
    await s3
      .getSignedUrlPromise("putObject", params)
      .then((url) => resolve({ url, Key }))
      .catch(reject);
  });
};

export const generateDownloadURL = async (
  Key: string
): Promise<IObject<String>> => {
  return new Promise(async (resolve, reject) => {
    const params = {
      Bucket,
      Key,
      Expires: 60,
    };
    await s3
      .getSignedUrlPromise("getObject", params)
      .then((url) => resolve({ url }))
      .catch(reject);
  });
};

export function getFileStream(fileKey) {
  const downloadParams = {
    Bucket,
    Key: fileKey,
  };
  return s3.getObject(downloadParams).createReadStream();
}

export function deleteFile(keys: string[]) {
  return new Promise((resolve, reject) => {
    let allDeleted = true;
    const failedDelete = [];
    for (const Key of keys) {
      s3.deleteObject({ Bucket, Key }, function (err, _) {
        if (err) {
          allDeleted = false;
          failedDelete.push(Key);
          console.error(err);
        }
      });
    }
    if (allDeleted) {
      resolve({
        status: 200,
        message: ServerInfo.FILE_DELETED,
      });
    } else {
      reject(
        new ServerError(
          500,
          `Failed to delete S3 objects: ${JSON.stringify(failedDelete)}`
        )
      );
    }
  });
}
