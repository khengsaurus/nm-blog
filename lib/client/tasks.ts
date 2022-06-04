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
      }).then((res) => resolve(res));
    } catch (err) {
      console.info(err);
      reject(new Error(err.message));
    }
  });
}

export async function uploadImage(attachment: any): Promise<string> {
  return new Promise(async (resolve, reject) => {
    await HTTPService.uploadImage(attachment)
      .then((res) => {
        if (res.status === 200 && res.data?.key) {
          resolve(res.data.key);
        } else {
          reject(new Error(ErrorMessage.IMAGE_UPLOAD_FAIL));
        }
      })
      .catch((err) => reject(err));
  });
}

export async function deleteImage(imageKey: string): Promise<IResponse> {
  if (!imageKey) return;
  return new Promise(async (resolve, reject) => {
    await HTTPService.makeAuthHttpReq(DBService.IMAGES, HttpRequest.DELETE, {
      imageKey,
    })
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });
}

export function deletePost(post: Partial<IPost>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    deleteImage(post.imageKey);
    await HTTPService.makeAuthHttpReq(DBService.POSTS, HttpRequest.DELETE, {
      id: post.id,
    })
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });
}
