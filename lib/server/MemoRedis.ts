import { PAGINATE_LIMIT } from "consts";
import { Flag } from "enums";
import { IPost } from "types";
import { redisDel, redisGet, redisSet } from "./redisConenction";

class MemoRedis {
  private static instance: MemoRedis;

  static getInstance() {
    if (!this.instance) this.instance = new MemoRedis();
    return this.instance;
  }

  async read(
    username: string,
    isPrivate: boolean,
    limit = PAGINATE_LIMIT,
    date = ""
  ) {
    const key = this.getQueryKey(username, isPrivate, limit, date);
    return redisGet(key) as Promise<IPost[]>;
  }

  write(
    posts: IPost[],
    username: string,
    isPrivate: boolean,
    limit = PAGINATE_LIMIT,
    date = ""
  ) {
    const key = this.getQueryKey(username, isPrivate, limit, date);
    redisSet(key, !!username, posts);
  }

  resetCache(post: IPost) {
    const { username, isPrivate } = post;
    redisDel(this.getQueryKey(username, true, PAGINATE_LIMIT, "")); // /my-posts
    if (!isPrivate) {
      redisDel(this.getQueryKey("", false, PAGINATE_LIMIT, "")); // /home
      redisDel(this.getQueryKey(username, false, PAGINATE_LIMIT, "")); // /user
    }
  }

  getQueryKey(
    username: string,
    isPrivate: boolean,
    limit: number,
    date: string
  ) {
    return (
      `${Flag.USER_TAG}${username || ""}` +
      `${Flag.PRIVATE_TAG}${isPrivate || false}` +
      `${Flag.LIMIT_TAG}${limit}` +
      `${Flag.DATE_TAG}${date}`
    );
  }

  getDateTag = (date: string) => `${Flag.DATE_TAG}${date}`;
}

export default MemoRedis;
