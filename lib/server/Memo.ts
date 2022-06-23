import { DurationMS, Flag } from "enums";
import { IPost } from "types";
import LRUCache from "./LRUCache";

/**
 * LRUCache schema: Map<parentKey-childKey, Array<Post>>
 * queryMap schema: Map<parentKey, Map<childKey, Array<postId>>>: track existing keys in LRUCache
 *
 * On read
 * -> generate parentKey, childKey
 * -> if queryMap.get(parentKey).get(childKey), return LRUCache.read(parentKey-childKey)
 * -> else, get posts from DB, cache in LRUCache and write parentKey & childKey to queryMap
 *
 * On create post A, if post A is not private
 * -> delete `publicHomeKey` from queryMap
 * -> delete `publicUserKey` from queryMap
 * -> delete `privateUserKey` from queryMap
 *
 * On edit/delete post A
 * -> delete all child keys in queryMap where A's postId is in postId[]
 * -> if queryMap.get(parentKey) is empty, delete key from queryMap
 *
 * parentKey-childKey ref:
 * `publicHomeKey`: `get most recent <limit> public posts`
 * `publicUserKey`: `get most recent <limit> public posts by user`
 * `privateUserKey`: `get most recent <limit> posts by user`
 */
class Memo {
  private current: string;
  private cache: LRUCache;
  private queryMap: Map<string, Map<string, string[]>>;

  constructor(LRUCacheLimit = 50) {
    console.info("-> Memo.constructor(): " + LRUCacheLimit);
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
    const d2 = new Date(d1.getTime() + 2 * DurationMS.MIN).toString(); // 2 mins delay
    this.current = d2;
    console.info("-> Memo.updatedCurrent()");
  }

  read(username: string, isPrivate: boolean, date: string, limit: number) {
    const parentKey = this.getParentKey(username, isPrivate);
    const childKey = this.getChildKey(date, limit);
    const map = this.queryMap.get(parentKey);
    if (!map || !map.get(childKey)) return null;
    const fullKey = parentKey + childKey;
    console.info("-> Memo.read(): " + fullKey);
    return this.cache.read(fullKey);
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
    console.info("-> Memo.write(): " + fullKey);
    this.cache.write(fullKey, posts);
  }

  resetCache(post: Partial<IPost>) {
    const { id, isPrivate, username } = post;
    if (!id) return;
    let prUserKey; // private queries for user's posts
    let puUserKey; // public queries for user's posts
    let homeKey; // public queries for recent posts
    prUserKey = this.getParentKey(username, true);
    puUserKey = this.getParentKey(username, false);
    homeKey = isPrivate ? "" : this.getParentKey("", false);
    const prUserMap = this.queryMap.get(prUserKey);
    const puUserMap = this.queryMap.get(puUserKey);
    const homeMap = this.queryMap.get(homeKey);

    console.info(
      `-> Memo.resetCache(): + [${prUserKey}, ${puUserKey}, ${homeKey}]`
    );
    if (this.resetHelper(prUserMap, id)) this.queryMap.delete(prUserKey);
    if (this.resetHelper(puUserMap, id)) this.queryMap.delete(puUserKey);
    if (this.resetHelper(homeMap, id)) this.queryMap.delete(homeKey);
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

  newPostCreated(post: IPost) {
    const { username, isPrivate } = post;
    let key = this.getParentKey(username, isPrivate);
    this.queryMap.delete(key);
    if (!isPrivate) {
      key = this.getParentKey("", false);
      this.queryMap.delete(key);
      this.updateCurrent();
    }
    console.info("-> Memo.newPostCreated(): " + key);
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

  getCurrent() {
    if (!this.current) this.updateCurrent();
    return this.current;
  }
}

export default Memo;
