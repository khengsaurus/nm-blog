import axios from "axios";
import { APIAction, DBService, ErrorMessage, HttpRequest } from "enums";
import fileDownload from "js-file-download";
import { IPost, IResponse } from "types";
import { HTTPService } from ".";

// Tasks to be run as non-render-blocking

export async function getPostSlugs(username: string): Promise<IResponse> {
  return new Promise((resolve, reject) => {
    try {
      HTTPService.makeGetReq(DBService.USERS, {
        username,
        action: APIAction.GET_POST_SLUGS,
      }).then(resolve);
    } catch (err) {
      console.info(err);
      reject(new Error(err.message));
    }
  });
}

export async function getPresignedS3URL(
  signal?: AbortSignal
): Promise<IResponse | null> {
  return HTTPService.makeAuthHttpReq(
    DBService.FILES,
    HttpRequest.GET,
    { action: APIAction.GET_UPLOAD_KEY },
    { signal }
  );
}

export async function getUploadedFileKey(
  file: File,
  signal?: AbortSignal
): Promise<string> {
  let url = "";
  let key = "";
  return new Promise(async (resolve, reject) => {
    if (!file) resolve("");
    await getPresignedS3URL(signal)
      .then((res) => {
        url = res?.data?.url;
        key = res?.data?.Key;
      })
      .catch((err) => {
        reject(err);
        return;
      });
    if (url && key) {
      await HTTPService.uploadFile(url, file, signal)
        .then(() => resolve(key))
        .catch(reject);
    } else {
      reject(new Error(ErrorMessage.F_UPLOAD_500));
    }
  });
}

export async function deleteFiles(keys: string[]) {
  if (!keys?.length) return;
  return HTTPService.makeAuthHttpReq(DBService.FILES, HttpRequest.DELETE, {
    keys: JSON.stringify(keys),
  });
}

export function deletePost(post: IPost): Promise<IResponse> {
  const { id, username, isPrivate, imageKey } = post;
  return new Promise((resolve, reject) => {
    deleteFiles([imageKey]);
    HTTPService.makeAuthHttpReq(DBService.POSTS, HttpRequest.DELETE, {
      id,
      username,
      isPrivate,
    })
      .then(resolve)
      .catch(reject);
  });
}

export async function downloadFile(
  name: string,
  key: string,
  errorHandler: (msg: string) => void
) {
  HTTPService.makeAuthHttpReq(DBService.FILES, HttpRequest.GET, {
    action: APIAction.GET_DOWNLOAD_KEY,
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
