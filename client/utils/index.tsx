import { CircleLoader } from "components";
import { MAX_FILE_SIZE_MB } from "consts";
import { Dimension, Size, Status, ToastMessage } from "enums";
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
        console.error(err);
        resolve(val);
      });
  });
}

export async function sleepSync(ms = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function processPost(data: any): IPost {
  if (!data) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, _id, user, createdAt, updatedAt, isPrivate, __v, ...post } =
    data._doc || data;
  post.id = id || _id?.toString();
  post.createdAt = createdAt?.toString() || "";
  post.updatedAt = updatedAt?.toString() || "";
  post.isPrivate = castAsBoolean(isPrivate);
  if (user?._id || user?.id) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, _id, updatedAt, createdAt, __v, ..._user } = user;
    _user.id = id || _id.toString();
    post.user = _user;
  }
  return post;
}

export function checkOneFileSelected(
  event: any,
  errorHandler: (msg: string) => void
) {
  const files = event.target.files;
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
  const file = event.target.files[0];
  if (file.size > MAX_FILE_SIZE_MB * 1000_000) {
    errorHandler(`The maximum file size is ${MAX_FILE_SIZE_MB}MB\n`);
    event.target.value = null;
    return false;
  }
  return true;
}

export function checkFileType(
  event: React.ChangeEvent<HTMLInputElement>,
  errorHandler: (msg?: string) => void
) {
  const file = event.target.files[0];
  if (file.type?.startsWith("image")) return true;
  errorHandler("File type not supported");
}

export const getStatusLabel = (saveStatus: Status) => {
  switch (saveStatus) {
    case Status.IDLE:
      return "Save";
    case Status.PENDING:
      return <CircleLoader size={Size.S} />;
    case Status.SUCCESS:
      return "👌🏻";
    case Status.ERROR:
      return "⚠️";
  }
};

export function getCardSrc(imageKey: string) {
  if (!imageKey) return "";
  return `${process.env.ENV_IMG_SRC}${imageKey}?tr=w-${Dimension.CARD_W},h-${Dimension.CARD_IMG_H},q-100`;
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

export function sleep(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
