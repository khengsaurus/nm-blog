import { APIAction, DBService, ErrorMessage, HttpRequest } from "enums";
import { IPost, IResponse } from "types";
import { HTTPService } from ".";

// Tasks to be run as non-render-blocking, e.g. API calls to populate data etc

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
  let uploadURL = "";
  let key = "";
  return new Promise(async (resolve, reject) => {
    if (!file) resolve("");
    await getPresignedS3URL(signal)
      .then((res) => {
        uploadURL = res?.data?.uploadURL;
        key = res?.data?.Key;
      })
      .catch((err) => {
        reject(err);
        return;
      });
    if (uploadURL && key) {
      await HTTPService.uploadFile(uploadURL, file, signal)
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
