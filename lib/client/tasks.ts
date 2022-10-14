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

export async function getPresignedS3URL(): Promise<IResponse | null> {
  return HTTPService.makeAuthHttpReq(DBService.IMAGES, HttpRequest.GET, {
    action: APIAction.GET_UPLOAD_KEY,
  });
}

export async function getUploadedImageKey(image: any): Promise<string> {
  let uploadURL = "";
  let key = "";
  return new Promise(async (resolve, reject) => {
    if (!image) resolve("");
    await getPresignedS3URL()
      .then((res) => {
        uploadURL = res?.data?.uploadURL;
        key = res?.data?.Key;
      })
      .catch((err) => {
        reject(err);
        return;
      });
    if (uploadURL && key) {
      await HTTPService.uploadFile(uploadURL, image)
        .then(() => resolve(key))
        .catch(reject);
    } else {
      reject(new Error(ErrorMessage.I_UPLOAD_500));
    }
  });
}

export async function deleteImage(imageKey: string): Promise<IResponse> {
  if (!imageKey) return;
  return new Promise(async (resolve, reject) => {
    HTTPService.makeAuthHttpReq(DBService.IMAGES, HttpRequest.DELETE, {
      imageKey,
    })
      .then(resolve)
      .catch(reject);
  });
}

export function deletePost(post: IPost): Promise<IResponse> {
  const { id, username, isPrivate, imageKey } = post;
  return new Promise(async (resolve, reject) => {
    deleteImage(imageKey);
    await HTTPService.makeAuthHttpReq(DBService.POSTS, HttpRequest.DELETE, {
      id,
      username,
      isPrivate,
    })
      .then(resolve)
      .catch(reject);
  });
}
