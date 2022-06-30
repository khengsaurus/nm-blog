import { CURR_STAMP, DEFAULT_EXPIRE, PAGINATE_LIMIT } from "consts";
import { DurationMS, Flag, ServerInfo } from "enums";
import { isEmpty } from "lodash";
import { createClient, RedisClientType } from "redis";
import { IObject, IPost } from "types";
import { setPromiseTimeout } from "utils";

class RedisConnection {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({ url: process.env.ENV_REDIS_URL });
    this.connect();
  }

  async connect() {
    return new Promise(async (resolve) => {
      if (this.client?.isOpen) resolve(1);
      else {
        await this.client
          .connect()
          .then(() => resolve(1))
          .catch(console.info);
      }
    });
  }

  close() {
    if (this?.client?.isOpen) this.client.quit().catch(console.info);
  }

  async getCurrent(): Promise<string> {
    return new Promise((resolve) => {
      this.connect()
        .then(() => this.client.get(CURR_STAMP))
        .then(resolve)
        .catch((err) => {
          console.info(err);
          resolve(`${new Date().valueOf()}`);
        });
    });
  }

  async updateCurrent() {
    return new Promise(async (resolve) => {
      const d1 = new Date();
      const d2 = new Date(d1.getTime() + DurationMS.MIN).valueOf(); // 1 min delay
      this.connect()
        .then(() => this.client.set(CURR_STAMP, d2))
        .then(resolve)
        .catch((err) => {
          console.info(`${ServerInfo.REDIS_SET_FAIL}: ${CURR_STAMP}`);
          console.info(`Error: ${err?.message}`);
        });
    });
  }

  async set(value: any, pKey: string, sKey?: string): Promise<any | void> {
    const val = typeof value === "string" ? value : JSON.stringify(value);
    const isHSet = sKey !== undefined;
    return new Promise(async (resolve) => {
      this.connect()
        .then(() => {
          isHSet
            ? this.client.HSET(pKey, sKey, val)
            : this.client.set(pKey, val);
        })
        .then(() => this.client.expire(pKey, DEFAULT_EXPIRE))
        .then(resolve)
        .catch((err) => {
          const key = isHSet ? `${pKey}-${sKey}` : pKey;
          console.info(`${ServerInfo.REDIS_SET_FAIL}: ${key}`);
          console.info(`Error: ${err?.message}`);
          resolve(-1);
        });
    });
  }

  _get<T extends any>(defaultVal: T, pKey: string, sKey?: string): Promise<T> {
    return new Promise(async (resolve) => {
      const isHGet = sKey !== undefined;
      this.connect()
        .then(() =>
          isHGet ? this.client.HGET(pKey, sKey) : this.client.get(pKey)
        )
        .then((val) => {
          if (!val) resolve(defaultVal);
          else {
            this.client.expire(pKey, DEFAULT_EXPIRE);
            resolve(JSON.parse(val) as T);
          }
        })
        .catch((err) => {
          const key = isHGet ? `${pKey}-${sKey}` : pKey;
          console.info(`${ServerInfo.REDIS_GET_FAIL}: ${key}`);
          console.info(`Error: ${err?.message}`);
          resolve(defaultVal);
        });
    });
  }

  _hget<T = any>(key: string): Promise<T> {
    return new Promise((resolve) => {
      this.client
        .HGETALL(key)
        .then((res) => resolve(res as unknown as T))
        .catch((err) => {
          console.info(err);
          resolve(null);
        });
    });
  }

  _hgetall<T = any>(
    defaultVal: IObject<T>[],
    keys: string[]
  ): Promise<IObject<T>[]> {
    return new Promise(async (resolve) => {
      this.connect()
        .then(() => {
          const queries = keys.map((key) => this._hget<IObject<T>>(key));
          Promise.all(queries).then((maps) => resolve(maps));
        })
        .catch((err) => {
          console.info(
            `${ServerInfo.REDIS_HGETALL_FAIL}: ${JSON.stringify(keys)}`
          );
          console.info(`Error: ${err?.message}`);
          resolve(defaultVal);
        });
    });
  }

  async get<T = any>(defaultVal: T, pKey: string, sKey?: string): Promise<T> {
    return setPromiseTimeout<T>(
      () => this._get(defaultVal, pKey, sKey),
      defaultVal
    );
  }

  async getMaps<T = any>(keys: string | string[]): Promise<IObject<T>[]> {
    const _keys = typeof keys === "string" ? [keys] : keys;
    return setPromiseTimeout(() => this._hgetall<T>([], _keys), []);
  }

  async del(keys: string | string[]): Promise<void> {
    const _keys = typeof keys === "string" ? [keys] : keys;
    if (!_keys?.length) return;
    await this.connect();
    return new Promise((resolve) => {
      try {
        _keys.forEach((key) => this.client.del(key));
      } catch (err) {
        console.info(`${ServerInfo.REDIS_DEL_FAIL}: ${JSON.stringify(_keys)}`);
        console.info(`Error: ${err?.message}`);
      } finally {
        resolve();
      }
    });
  }

  async hdel(pKey: string, sKey: string): Promise<number> {
    return new Promise((resolve) => {
      this.client
        .HDEL(pKey, sKey)
        .then(resolve)
        .catch((err) => {
          console.info(err?.message);
          resolve(-1);
        });
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
    return new Promise((resolve) => {
      this.getMaps<object>(pKey).then((maps) => {
        if (isEmpty(maps) || !maps[0]?.[sKey]) resolve([]);
        else this.get<IPost[]>([], fullKey).then(resolve);
      });
    });
  }

  write(
    posts: IPost[],
    uN: string,
    pr: boolean,
    date = "",
    limit = PAGINATE_LIMIT
  ): Promise<void> {
    if (!posts.length) return;
    return new Promise(async (resolve) => {
      const _date = date || (await this.getCurrent());
      const { pKey, sKey, fullKey } = this.getKeys(uN, pr, _date, limit);
      let postIds = "";
      posts.forEach((post) => (postIds += post.id + "|"));
      this.set(postIds, pKey, sKey)
        .then(() => this.set(posts, fullKey))
        .then(resolve);
    });
  }

  resetCache(post: Partial<IPost>, keepAlive = true): Promise<void> {
    return new Promise((resolve) => {
      const { id, isPrivate, username } = post;
      if (!id) return;
      let prKey; // private Q for user
      let puKey; // public Q for user
      let hKey; // public Q for recent
      prKey = this.getPrimaryKey(username, true);
      puKey = this.getPrimaryKey(username, false);
      hKey = isPrivate ? "" : this.getPrimaryKey("", false);
      this.getMaps([prKey, puKey, hKey])
        .then((maps) => {
          const parentMap = {
            [prKey]: maps[0],
            [puKey]: maps[1],
            [hKey]: maps[2],
          };
          return this.resetHelper(parentMap, id);
        })
        .then(async (toDelete) => await this.del(toDelete))
        .catch(console.info)
        .finally(() => {
          if (!keepAlive) this.close();
          resolve();
        });
    });
  }

  resetHelper(map: IObject, postId: string): Promise<string[]> {
    return new Promise((resolve) => {
      const fullKeys = [];
      if (isEmpty(map)) resolve(fullKeys);
      for (const pKey of Object.keys(map)) {
        const sMap = map[pKey];
        if (isEmpty(sMap)) continue;
        for (const sKey of Object.keys(sMap)) {
          if (sMap[sKey].includes(postId)) {
            this.hdel(pKey, sKey);
            fullKeys.push(pKey + Flag.DATE_TAG + sKey);
          }
        }
      }
      resolve(fullKeys);
    });
  }

  newPostCreated(post: IPost, keepAlive = true): Promise<void> {
    return new Promise((resolve) => {
      const { username, isPrivate } = post;
      const privateQUser = this.getPrimaryKey(username, isPrivate);
      let toDelete = [privateQUser];
      if (!isPrivate) {
        const publicQUser = this.getPrimaryKey(username, true); // public Q for user
        const publicQHome = this.getPrimaryKey("", false); // public Q for recent
        toDelete = [privateQUser, publicQUser, publicQHome];
      }
      this.del(toDelete)
        .then(async () => await this.updateCurrent())
        .catch(console.info)
        .finally(() => {
          if (!keepAlive) this.close();
          resolve();
        });
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
