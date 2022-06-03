import { IPost } from "types";
import { ErrorMessage } from "enums";

const maxFileSizeMB = 2;

export function isDev() {
  return process.env.REACT_APP_FLAG?.startsWith("dev");
}

export function postDocToObj(data: any) {
  if (data === null) return data;
  const { _id, user, createdAt, updatedAt, ...post } = data;
  post.id = _id?.toString();
  post.createdAt = createdAt?.toString();
  post.updatedAt = updatedAt?.toString();
  if (user?._id) {
    const { _id, updatedAt, createdAt, ..._user } = user;
    _user.id = _id.toString();
    post.user = _user;
  }
  return post;
}

export function userDocToObj(data: any) {
  if (data === null) return data;
  const { _id, posts, createdAt, updatedAt, ...user } = data;
  if (_id) {
    user.id = _id.toString();
  }
  const processedPosts: IPost[] = [];
  for (let i = 0; i < posts.length; i++) {
    processedPosts.push(postDocToObj(posts[i]));
  }
  user.posts = processedPosts;
  return user;
}

export function checkOneFileSelected(
  event: any,
  errorHandler: (msg: string) => void
) {
  let files = event.target.files;
  if (files.length !== 1) {
    event.target.value = null;
    errorHandler(ErrorMessage.ONE_IMAGE_ONLY);
    return false;
  }
  return true;
}

export function checkFileSize(
  event: any,
  errorHandler: (msg?: string) => void
) {
  let file = event.target.files[0];
  if (file.size > maxFileSizeMB * 1000 * 1000) {
    errorHandler(`The maximum file size is ${maxFileSizeMB}MB\n`);
    event.target.value = null;
    return false;
  }
  return true;
}

export function checkFileType(
  event: React.ChangeEvent<HTMLInputElement>,
  errorHandler: (msg?: string) => void,
  allowedTypes = ["image/jpeg", "image/png"]
) {
  let file = event.target.files[0];
  if (allowedTypes.includes(file.type)) return true;
  errorHandler("File type not supported");
}
