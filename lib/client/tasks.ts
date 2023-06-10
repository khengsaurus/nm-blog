import axios from "axios";
import { ApiAction, DbService, ErrorMessage, HttpRequest } from "enums";
import fileDownload from "js-file-download";
import { IPost, IResponse } from "types";
import { nextHttpService } from ".";

// Tasks to be run as non-render-blocking

export async function getPostSlugs(username: string): Promise<IResponse> {
  return new Promise((resolve, reject) => {
    try {
      nextHttpService
        .makeGetReq(DbService.USERS, {
          username,
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
  const { id, username, isPrivate, imageKey, files = [] } = post;
  return new Promise((resolve, reject) => {
    const fileKeys = files?.map((f) => f.key);
    if (imageKey) fileKeys.push(imageKey);
    if (fileKeys.length) deleteFiles(fileKeys);
    nextHttpService
      .makeAuthHttpReq(DbService.POSTS, HttpRequest.DELETE, {
        id,
        username,
        isPrivate,
      })
      .then(resolve)
      .catch(reject);
  });
}

export async function getPresignedS3URL(
  userId: string,
  signal?: AbortSignal
): Promise<IResponse | null> {
  return nextHttpService.makeAuthHttpReq(
    DbService.FILES,
    HttpRequest.POST,
    { action: ApiAction.GET_UPLOAD_KEY, userId },
    { signal }
  );
}

export async function getUploadedFileKey(
  userId: string,
  file: File,
  signal?: AbortSignal
): Promise<string> {
  let url = "";
  let key = "";
  return new Promise(async (resolve, reject) => {
    if (!file) resolve("");
    await getPresignedS3URL(userId, signal)
      .then((res) => {
        url = res?.data?.url;
        key = res?.data?.Key;
      })
      .catch((err) => {
        reject(err);
        return;
      });
    if (url && key) {
      await nextHttpService
        .uploadFile(url, userId, file, signal)
        .then(() => resolve(key))
        .catch(reject);
    } else {
      reject(new Error(ErrorMessage.F_UPLOAD_500));
    }
  });
}

export async function downloadFile(
  name: string,
  key: string,
  errorHandler: (msg: string) => void
) {
  nextHttpService
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
  return nextHttpService.makeAuthHttpReq(DbService.FILES, HttpRequest.DELETE, {
    keys: JSON.stringify(keys),
  });
}
