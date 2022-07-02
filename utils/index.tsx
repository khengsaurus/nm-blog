import { CircleLoader } from "components";
import { MAX_FILE_SIZE } from "consts";
import { Dimension, Status, ToastMessage } from "enums";
import { IPost } from "types";

export function parse(val: any) {
  return typeof val === "string" ? JSON.stringify(val) : val;
}

export function promiseTimeout<T = any>(
  msg: string,
  ms = 1000,
  callback?: any
): Promise<T> {
  return new Promise((_, reject) =>
    setTimeout(() => {
      if (callback) callback();
      reject(new Error(msg));
    }, ms)
  );
}

export async function setPromiseTimeout<T>(
  promiseCallback: () => Promise<T>,
  val: T,
  ms = 2000
): Promise<T> {
  return new Promise((resolve) => {
    Promise.race([
      promiseTimeout(`Timeout of ${ms}ms reached`, ms),
      promiseCallback(),
    ])
      .then((res) => resolve(res || val))
      .catch((err) => {
        console.info(err.message);
        resolve(val);
      });
  });
}

export async function sleepSync(ms = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function processPostWithUser(data: any): IPost {
  if (!data) return null;
  const { _id, user, createdAt, updatedAt, isPrivate, ...post } =
    data._doc || data;
  post.id = _id?.toString() || post.id;
  post.createdAt = createdAt?.toString();
  post.updatedAt = updatedAt?.toString();
  post.isPrivate = castAsBoolean(isPrivate);
  if (user?._id) {
    const { _id, updatedAt, createdAt, ..._user } = user;
    _user.id = _id.toString();
    post.user = _user;
  }
  return post;
}

export function processPostWithoutUser(_post: any): IPost {
  const { _id, __v, createdAt, updatedAt, isPrivate, ...post } = _post;
  post.id = _id?.toString() || post.id;
  post.createdAt = createdAt?.toString();
  post.updatedAt = updatedAt?.toString();
  post.isPrivate = castAsBoolean(isPrivate);
  return post;
}

// each post coming in as { ...IPost, _id, __v } -> this will give a POJO IPost without user
export function processPostsWithoutUser(_posts: any[]): IPost[] {
  if (!_posts) return [];
  return _posts.map((_post) => processPostWithoutUser(_post));
}

export function userDocToObj(data: any) {
  if (data === null) return data;
  const { _id, posts, createdAt, updatedAt, ...user } = data;
  if (_id) {
    user.id = _id.toString();
  }
  const processedPosts: IPost[] = [];
  for (let i = 0; i < posts?.length; i++) {
    processedPosts.push(processPostWithUser(posts[i]));
  }
  user.posts = processedPosts;
  return user;
}

export function checkOneFileSelected(
  event: any,
  errorHandler: (msg: string) => void
) {
  let files = event.target.files;
  if (files.length === 0) return;
  if (files.length > 1) {
    event.target.value = null;
    errorHandler(ToastMessage.I_ONE_ONLY);
    return false;
  }
  return true;
}

export function checkFileSize(
  event: any,
  errorHandler: (msg?: string) => void
) {
  let file = event.target.files[0];
  if (file.size > MAX_FILE_SIZE * 1000 * 1000) {
    errorHandler(`The maximum file size is ${MAX_FILE_SIZE}MB\n`);
    event.target.value = null;
    return false;
  }
  return true;
}

export function checkFileType(
  event: React.ChangeEvent<HTMLInputElement>,
  errorHandler: (msg?: string) => void
) {
  let file = event.target.files[0];
  if (file.type?.startsWith("image")) return true;
  errorHandler("File type not supported");
}

export const getStatusLabel = (saveStatus: Status) => {
  switch (saveStatus) {
    case Status.IDLE:
      return "Save";
    case Status.PENDING:
      return <CircleLoader />;
    case Status.SUCCESS:
      return "👌🏻";
    case Status.ERROR:
      return "⚠️";
  }
};

export function getCardSrc(imageKey: string) {
  if (!imageKey) return "";
  return `${process.env.ENV_IMG_SRC}${imageKey}?tr=w-${Dimension.CARD_W},h-80,q-70`;
}

export function getBannerSrc(imageKey: string) {
  if (!imageKey) return "";
  return `${process.env.ENV_IMG_SRC}${imageKey}?tr=q-100`;
}

export function getAvatarSmall(imageKey: string) {
  if (!imageKey) return "";
  return `${process.env.ENV_IMG_SRC}${imageKey}?tr=w-${Dimension.AVATAR_S},h-${Dimension.AVATAR_S}`;
}

export function getAvatarMedium(imageKey: string) {
  if (!imageKey) return "";
  return `${process.env.ENV_IMG_SRC}${imageKey}?tr=w-${Dimension.AVATAR_M},h-${Dimension.AVATAR_M}`;
}

export function getAvatarLarge(imageKey: string) {
  if (!imageKey) return "";
  return `${process.env.ENV_IMG_SRC}${imageKey}?tr=w-${Dimension.AVATAR_L},h-${Dimension.AVATAR_L}`;
}

export function castAsBoolean(str: string | boolean) {
  if (typeof str === "boolean") return str;
  return !(str === "false" || !str);
}
