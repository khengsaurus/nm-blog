/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from "bcryptjs";

export function parse(val: any) {
  return typeof val === "string" ? JSON.stringify(val) : val;
}

export function promiseTimeout(ms = 1000): Promise<string> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`timeout of ${ms}ms reached`)), ms)
  );
}

export async function setPromiseTimeout<T>(
  promiseCallback: () => Promise<T>,
  timeout = 2000,
  defaultVal?: T
): Promise<T> {
  return new Promise((resolve, reject) => {
    Promise.race([promiseTimeout(timeout), promiseCallback()])
      .then((res) => resolve((res as T) || defaultVal))
      .catch((err) => {
        if (defaultVal) {
          console.error(err);
          resolve(defaultVal);
        } else {
          reject(err);
        }
      });
  });
}

export function processPost(data: any): IPost {
  if (!data) return null;
  const { id, _id, user, createdAt, updatedAt, isPrivate, __v, ...post } =
    data._doc || data;
  post.id = id || _id?.toString();
  post.createdAt = createdAt?.toString();
  post.updatedAt = updatedAt?.toString();
  post.isPrivate = castAsBoolean(isPrivate);
  if (user?._id || user?.id) {
    const { id, _id, updatedAt, createdAt, __v, ..._user } = user;
    _user.id = id || _id.toString();
    post.user = _user;
  }
  return post;
}

export function processPosts(posts: any[]): IPost[] {
  if (!posts?.length) return [];
  return posts.map(processPost);
}

export function userDocToObj(data: any) {
  if (!data) return data;
  const { _id, posts, createdAt, updatedAt, __v, ...user } = data;
  if (_id) {
    user.id = _id.toString();
  }
  user.posts = processPosts(posts);
  return user;
}

export function castAsBoolean(str: string | boolean) {
  if (typeof str === "boolean") return str;
  return !(str === "false" || !str);
}

export function getQueryFromPostReq(postReq: Partial<IPostReq>) {
  const { username, isPrivate, createdAt, search } = postReq;
  const query: any = createdAt ? { createdAt: { $lt: createdAt } } : {};
  if (username) query.username = username;
  if (!isPrivate) query.isPrivate = false;
  if (search)
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } },
      { body: { $regex: search, $options: "i" } },
    ];
  return query;
}

export function hashPassword(pw: string) {
  return bcrypt.hashSync(pw, Number(process.env.SALT_ROUNDS));
}

export function verifyPassword(pw: string, hash: string) {
  return bcrypt.compareSync(pw, hash);
}
