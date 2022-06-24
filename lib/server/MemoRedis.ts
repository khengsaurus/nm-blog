import { PAGINATE_LIMIT } from "consts";
import { Flag } from "enums";
import { IPost } from "types";
import { redisDel, redisGet, redisSet } from "./redisConenction";

class MemoRedis {
  private static instance: MemoRedis;
  private queryMap: Map<string, Map<string, string[]>>;

  constructor(queryMap = new Map()) {
    this.queryMap = queryMap;
  }

  static getInstasnce() {
    if (this.instance) return this.instance;
    this.instance = new MemoRedis();
    return this.instance;
  }

  read(
    username: string,
    isPrivate: boolean,
    date = "",
    limit = PAGINATE_LIMIT
  ) {
    const { parentKey, childKey, fullKey } = this.getKeys(
      username,
      isPrivate,
      date,
      limit
    );
    const map = this.queryMap.get(parentKey);
    if (!map || !map.get(childKey)) return null;
    return redisGet(fullKey);
  }

  write(
    posts: IPost[],
    username: string,
    isPrivate: boolean,
    date = "",
    limit = PAGINATE_LIMIT
  ) {
    const { parentKey, childKey, fullKey } = this.getKeys(
      username,
      isPrivate,
      date,
      limit
    );
    try {
      if (!this.queryMap.get(parentKey))
        this.queryMap.set(parentKey, new Map());
      const postIds = posts.map((post) => post.id || post._id?.toString());
      this.queryMap.get(parentKey).set(childKey, postIds);
      console.log("---------------- UPDATED QUERY MAP ----------------");
      console.log(this.queryMap);
      console.log("---------------------------------------------------");
    } catch (err) {
      console.info(err);
    }
    return redisSet(fullKey, !!username, posts);
  }

  resetCache(post: Partial<IPost>) {
    const { id, isPrivate, username } = post;
    if (!id) return;
    let prKey; // private Q for user
    let puKey; // public Q for user
    let hKey; // public Q for recent
    prKey = this.getParentKey(username, true);
    puKey = this.getParentKey(username, false);
    hKey = isPrivate ? "" : this.getParentKey("", false);
    const prMap = this.queryMap.get(prKey);
    const puMap = this.queryMap.get(puKey);
    const hMap = this.queryMap.get(hKey);

    const toDelete = [
      ...this.resetHelper(prMap, prKey, id),
      ...this.resetHelper(puMap, puKey, id),
      ...this.resetHelper(hMap, hKey, id),
    ];
    console.log("---------------- UPDATED QUERY MAP ----------------");
    console.log(this.queryMap);
    console.log("---------------------------------------------------");
    redisDel(toDelete);
  }

  resetHelper(
    map: Map<string, string[]>,
    parentKey: string,
    postId: string
  ): string[] {
    if (!map) return [];
    const fullKeys = [];
    for (const [date, postIds] of map.entries()) {
      if ((postIds || []).includes(postId)) {
        map.delete(date);
        fullKeys.push(parentKey + Flag.DATE_TAG + date);
      }
    }
    if (map.size === 0) this.queryMap.delete(parentKey);
    return fullKeys;
  }

  newPostCreated(post: IPost) {
    const { username, isPrivate } = post;
    let key = this.getParentKey(username, isPrivate); // private Q for user
    this.queryMap.delete(key);
    if (!isPrivate) {
      this.queryMap.delete(this.getParentKey("", false)); // public Q for recent
      this.queryMap.delete(this.getParentKey(username, true)); // public Q for user
    }
  }

  getParentKey(username: string, isPrivate: boolean) {
    return (
      `${Flag.USER_TAG}${username || ""}` +
      `${Flag.PRIVATE_TAG}${isPrivate || false}`
    );
  }

  getKeys(username: string, isPrivate: boolean, date: string, limit: number) {
    const parentKey = this.getParentKey(username, isPrivate);
    const childKey = `${date}` + `${Flag.LIMIT_TAG}${limit}`;
    const fullKey = parentKey + Flag.DATE_TAG + childKey;
    return { parentKey, childKey, fullKey };
  }
}

export default MemoRedis;
