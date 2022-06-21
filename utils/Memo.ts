import { Duration, Flag } from "enums";
import { IPost } from "types";
import LRUCache from "./LRUCache";

/**
 * LRUCache: cache `key-date` -> IPost[] response
 * queryMap: Map<parentKey, Map<childKey, postId[]>>: track existing keys in LRUCache
 *
 * On edit/delete post A
 * -> delete child keys in queryMap where A.id in postId[]
 * -> delete from LRUCache
 */
class Memo {
  private cache: LRUCache;
  private queryMap: Map<string, Map<string, string[]>>;
  public current: string;

  constructor(LRUCacheLimit = 50) {
    this.updateCurrent();
    this.cache = new LRUCache(LRUCacheLimit, this.deleteCallback);
    this.queryMap = new Map();
  }

  deleteCallback(key: string) {
    const keys = key.split[Flag.DATE_TAG];
    const tsMap = this.queryMap.get(keys[0]);
    if (!tsMap) return;
    if (tsMap.size === 1) this.queryMap.delete(keys[0]);
    else tsMap.delete(keys[1]);
  }

  updateCurrent() {
    const d1 = new Date();
    // with 2 mins delay
    const d2 = new Date(d1.getTime() + 2 * Duration.MIN).toString();
    this.current = d2;
  }

  read(username: string, isPrivate: boolean, date: string, limit: number) {
    const parentKey = this.getParentKey(username, isPrivate);
    const childKey = this.getChildKey(date, limit);
    const map = this.queryMap.get(parentKey);
    if (!map || !map.get(childKey)) return null;
    return this.cache.read(parentKey + childKey);
  }

  write(
    posts: IPost[],
    username: string,
    isPrivate: boolean,
    limit: number,
    date = this.current
  ) {
    const parentKey = this.getParentKey(username, isPrivate);
    const childKey = this.getChildKey(date, limit);
    try {
      if (!this.queryMap.get(parentKey))
        this.queryMap.set(parentKey, new Map());
      const postIds = posts.map((post) => post.id || post._id?.toString());
      this.queryMap.get(parentKey).set(childKey, postIds);
    } catch (err) {
      console.info(err);
    }
    const fullKey = parentKey + childKey;
    this.cache.write(fullKey, posts);
  }

  resetCache(post: Partial<IPost>) {
    const { id, isPrivate, username } = post;
    if (!id) return;
    let key1; // private queries for user's posts
    let key2; // public queries for user's posts
    let key3; // public queries for recent posts
    if (isPrivate) {
      key1 = this.getParentKey(username, true);
    } else {
      key2 = this.getParentKey(username, false);
      key3 = this.getParentKey("", false);
    }
    const map1 = this.queryMap.get(key1);
    const map2 = this.queryMap.get(key2);
    const map3 = this.queryMap.get(key3);

    if (this.resetHelper(map1, id)) this.queryMap.delete(key1);
    if (this.resetHelper(map2, id)) this.queryMap.delete(key2);
    if (this.resetHelper(map3, id)) this.queryMap.delete(key3);
  }

  resetHelper(map: Map<string, string[]>, postId: string) {
    if (!map) return;
    const toDelete = [];
    for (const [key, postIds] of map.entries()) {
      if ((postIds || []).includes(postId)) toDelete.push(key);
    }
    toDelete.forEach((key) => map.delete(key));
    return map.size === 0;
  }

  getParentKey(username: string, isPrivate: boolean) {
    return (
      `${Flag.USER_TAG}${username || ""}` +
      `${Flag.PRIVATE_TAG}${isPrivate || false}`
    );
  }

  getChildKey(date: string, limit: number) {
    return `${Flag.DATE_TAG}${date}` + `${Flag.LIMIT_TAG}${limit}`;
  }

  getFullKey(
    username: string,
    isPrivate: boolean,
    date: string,
    limit: number
  ) {
    return (
      this.getParentKey(username, isPrivate) + this.getChildKey(date, limit)
    );
  }
}

export default Memo;
