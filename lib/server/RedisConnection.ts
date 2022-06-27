import { CURR_STAMP, DEFAULT_SKEY, PAGINATE_LIMIT, QUERY_MAP } from "consts";
import { DurationMS, Flag, ServerInfo } from "enums";
import { isEmpty } from "lodash";
import { createClient, RedisClientType } from "redis";
import { IPost, IResponse } from "types";
import { setPromiseTimeout } from "utils";

class RedisConnection {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({ url: process.env.ENV_REDIS_URL });
    this.connect();
    // .then(() => console.info("Redis client connection opened"));
  }

  async connect() {
    return new Promise(async (resolve) => {
      await this.client.connect().then(resolve).catch(console.error);
    });
  }

  close() {
    if (this?.client?.isOpen) {
      this.client.quit().catch(console.info);
    }
  }

  async getCurrent(): Promise<string> {
    if (!this.client.isOpen) await this.connect();
    return new Promise((resolve) => {
      this.client
        .get(CURR_STAMP)
        .then(resolve)
        .catch((err) => {
          console.info(err);
          resolve("");
        });
    });
  }

  async updateCurrent() {
    return new Promise(async (resolve) => {
      if (!this.client.isOpen) await this.connect();
      const d1 = new Date();
      const d2 = new Date(d1.getTime() + 2 * DurationMS.MIN).valueOf(); // 2 mins delay
      this.client
        .set(CURR_STAMP, d2)
        .catch((err) => {
          console.info(`${ServerInfo.REDIS_SET_FAIL}: ${CURR_STAMP}`);
          console.info(`Error: ${err?.message}`);
        })
        .then(resolve);
    });
  }

  async set(key: string, value: any, extend = true) {
    const val = typeof value === "string" ? value : JSON.stringify(value);
    return new Promise(async (resolve) => {
      if (!this.client.isOpen) await this.connect();
      this.client
        .set(key, val)
        .then(() => this.client.expire(key, extend ? 600 : 300))
        .then(resolve)
        .catch((err) => {
          console.info(`${ServerInfo.REDIS_SET_FAIL}: ${key}`);
          console.info(`Error: ${err?.message}`);
        });
    });
  }

  _get<T>(key: string, defaultVal: T): Promise<IResponse<T>> {
    return new Promise(async (resolve) => {
      if (!this.client.isOpen) await this.connect();
      await this.client
        .get(key)
        .then((val) => {
          this.client.expire(key, 300);
          resolve({
            message: `${ServerInfo.REDIS_GET_SUCCESS}: ${key}`,
            data: JSON.parse(val) as T,
          });
        })
        .catch((err) => {
          resolve({
            message: `${ServerInfo.REDIS_GET_FAIL}: ${key}, error: ${err?.message}`,
            data: defaultVal,
          });
        });
    });
  }

  async get<T = any>(key: string, defaultVal: T): Promise<T> {
    return setPromiseTimeout<T>(() => this._get(key, defaultVal), defaultVal);
  }

  async del(keys: string[]): Promise<void> {
    if (!keys?.length) return;
    if (!this.client.isOpen) await this.connect();
    return new Promise((resolve) => {
      try {
        keys.forEach((key) => this.client.del(key));
      } catch (err) {
        console.info(`${ServerInfo.REDIS_DEL_FAIL}: ${JSON.stringify(keys)}`);
        console.info(`Error: ${err?.message}`);
      } finally {
        resolve();
      }
    });
  }

  async read(
    uN: string,
    pr: boolean,
    date = "",
    limit = PAGINATE_LIMIT
  ): Promise<IPost[]> {
    const _date = date || (await this.getCurrent());
    const { pKey, sKey, fullKey } = this.getKeys(uN, pr, _date, limit);
    let fetchFresh = false;
    await this.get<object>(QUERY_MAP, {}).then((pMap) => {
      if (!pMap?.[pKey]?.[sKey]) fetchFresh = true;
    });
    return fetchFresh ? Promise.resolve([]) : this.get<IPost[]>(fullKey, []);
  }

  write(
    posts: IPost[],
    uN: string,
    pr: boolean,
    date = "",
    limit = PAGINATE_LIMIT
  ): Promise<void> {
    return new Promise(async (resolve) => {
      const _date = date || (await this.getCurrent());
      const { pKey, sKey, fullKey } = this.getKeys(uN, pr, _date, limit);
      const postIds = posts.map((post) => post.id || post._id?.toString());
      if (isEmpty(postIds)) return;
      this.get<object>(QUERY_MAP, {})
        .then(async (pMap) => {
          if (!pMap[pKey]) pMap[pKey] = {};
          pMap[pKey][sKey] = postIds;
          await this.set(QUERY_MAP, pMap);
          await this.set(fullKey, posts);
          resolve();
        })
        .catch(console.info);
    });
  }

  resetCache(post: Partial<IPost>, close?: boolean): Promise<void> {
    return new Promise((resolve) => {
      const { id, isPrivate, username } = post;
      if (!id) return;
      let prKey; // private Q for user
      let puKey; // public Q for user
      let hKey; // public Q for recent
      prKey = this.getPrimaryKey(username, true);
      puKey = this.getPrimaryKey(username, false);
      hKey = isPrivate ? "" : this.getPrimaryKey("", false);
      let toDelete = [];
      this.get<object>(QUERY_MAP, {})
        .then(async (pMap) => {
          toDelete = [
            ...this.resetHelper(pMap, prKey, id),
            ...this.resetHelper(pMap, puKey, id),
            ...this.resetHelper(pMap, hKey, id),
          ];
          await this.set(QUERY_MAP, pMap);
        })
        .then(async () => await this.del(toDelete))
        .then(() => {
          if (close) {
            this.close();
          }
          resolve();
        })
        .catch(console.info);
    });
  }

  resetHelper(parentMap: object, pKey: string, postId: string): string[] {
    const sMap = parentMap[pKey];
    if (!sMap) return [];
    const fullKeys = [];
    for (const sKey of Object.keys(sMap)) {
      if (sMap[sKey].includes(postId)) {
        delete sMap[sKey];
        fullKeys.push(pKey + Flag.DATE_TAG + sKey);
      }
    }
    if (isEmpty(sMap)) delete parentMap[pKey];
    return fullKeys;
  }

  newPostCreated(post: IPost, close?: boolean): Promise<void> {
    return new Promise((resolve) => {
      const { username, isPrivate } = post;
      this.get<object>(QUERY_MAP, {})
        .then(async (pMap) => {
          const privateQUser = this.getPrimaryKey(username, isPrivate);
          let toDelete = [privateQUser + DEFAULT_SKEY];
          delete pMap[privateQUser]; // private Q for user
          if (!isPrivate) {
            const curr = await this.getCurrent();
            const publicQUser = this.getPrimaryKey(username, true); // public Q for user
            const publicQHome = this.getPrimaryKey("", false); // public Q for recent
            delete pMap[publicQUser];
            delete pMap[publicQHome];
            const S_KEY =
              Flag.DATE_TAG + curr + Flag.LIMIT_TAG + PAGINATE_LIMIT;
            toDelete = [
              privateQUser + S_KEY,
              publicQUser + S_KEY,
              publicQHome + S_KEY,
            ];
          }
          await this.del(toDelete);
          await this.set(QUERY_MAP, pMap);
        })
        .then(() => {
          if (close) this.close();
          resolve();
        })
        .catch(console.info);
    });
  }

  getPrimaryKey(username: string, isPrivate: boolean) {
    return `${Flag.USER_TAG}${username || ""}${Flag.PRIVATE_TAG}${
      isPrivate || false
    }`;
  }

  getKeys(username: string, isPrivate: boolean, date: string, limit: number) {
    const pKey = this.getPrimaryKey(username, isPrivate);
    const sKey = `${date}` + `${Flag.LIMIT_TAG}${limit}`;
    const fullKey = pKey + Flag.DATE_TAG + sKey;
    return { pKey, sKey, fullKey };
  }
}

export default RedisConnection;
