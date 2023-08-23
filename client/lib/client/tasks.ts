import axios from "axios";
import { ApiAction, DbService, ErrorMessage, HttpRequest } from "enums";
import fileDownload from "js-file-download";
import { IPost, IResponse } from "types";
import { authHttpService } from ".";
import { IS_DEV_S } from "consts";

export async function getPostSlugs(): Promise<IResponse> {
  return new Promise((resolve, reject) => {
    try {
      authHttpService
        .makeAuthHttpReq(DbService.USER, HttpRequest.GET, {
          action: ApiAction.GET_POST_SLUGS,
        })
        .then(resolve);
    } catch (err) {
      console.error(err);
      reject(new Error(err.message));
    }
  });
}

export function deletePost(post: IPost): Promise<IResponse> {
  const { id, isPrivate, imageKey, files = [] } = post;
  return new Promise((resolve, reject) => {
    const fileKeys = files?.map((f) => f.key);
    if (imageKey) fileKeys.push(imageKey);
    if (fileKeys.length) deleteFiles(fileKeys);
    authHttpService
      .makeAuthHttpReq(DbService.POST, HttpRequest.DELETE, {
        id,
        isPrivate,
      })
      .then(resolve)
      .catch(reject);
  });
}

/**
 * Upload a file to S3 via a presigned `PutObject` URL.
 * Invokes a PUT fetch with header "Content-Type": "multipart/form-data"
 *
 * https://github.com/localstack/localstack/issues/3266
 * Localstack S3: ensure the same `Content-Type` header is sent when
 * generating the presigned-url as when uploading to it via PUT request
 */
export async function getUploadedFileKey(
  file: File,
  userId: string,
  signal?: AbortSignal
): Promise<string> {
  let resolvedKey = "";
  return new Promise(async (resolve, reject) => {
    if (!file) resolve("");

    authHttpService
      .makeAuthHttpReq(
        DbService.FILES,
        HttpRequest.POST,
        { action: ApiAction.GET_UPLOAD_KEY },
        { signal }
      )
      .then((res) => {
        const { url, key } = res?.data || {};
        if (!url || !key) reject(new Error(ErrorMessage.F_UPLOAD_500));
        resolvedKey = key;
        return fetch(url, {
          method: HttpRequest.PUT,
          headers: IS_DEV_S
            ? {
                "Content-Type": "application/json",
                "x-amz-acl": "public-read-write",
                "x-amz-tagging": `user_id=${userId}&file_name=${file.name}`,
              }
            : { "Content-Type": "multipart/form-data" },
          body: file,
          signal,
        });
      })
      .then(() => resolve(resolvedKey))
      .catch(reject);
  });
}

export async function downloadFile(
  name: string,
  key: string,
  errorHandler: (msg: string) => void
) {
  authHttpService
    .makeAuthHttpReq(DbService.FILES, HttpRequest.POST, {
      action: ApiAction.GET_DOWNLOAD_KEY,
      key,
    })
    .then((res) => {
      const url = res?.data?.url;
      if (!url) {
        throw new Error(ErrorMessage.F_DOWNLOAD_500);
      } else {
        return axios.get(url, { responseType: "blob" });
      }
    })
    .then((res) => fileDownload(res.data, name))
    .catch((err) => {
      if (err?.message?.endsWith("404")) {
        errorHandler(ErrorMessage.F_DOWNLOAD_404);
      } else {
        console.error(err);
        errorHandler(ErrorMessage.F_DOWNLOAD_FAILED);
      }
    });
}

export async function deleteFiles(keys: string[]) {
  if (!keys?.length) return;
  return authHttpService.makeAuthHttpReq(DbService.FILES, HttpRequest.DELETE, {
    keys: JSON.stringify(keys),
  });
}
