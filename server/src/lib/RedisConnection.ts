import isEmpty from "lodash.isempty";
import { RedisClientType, createClient } from "redis";
import {
  CURR,
  DEFAULT_EXPIRE_S,
  HOME,
  IS_DEV,
  PAGINATE_LIMIT,
} from "../consts";
import { ConnectionType, DurationMS, Flag, ServerInfo } from "../enums";
import { setPromiseTimeout } from "../utils";
import ConnectionInstance from "./ConnectionInstance";

class RedisConnection extends ConnectionInstance {
  private client: RedisClientType;
  private redisUrl = IS_DEV ? process.env.REDIS_URL_DEV : process.env.REDIS_URL;

  constructor(id?: string) {
    super(id || `${Math.random()}`);
    this.type = ConnectionType.REDIS;
    this.client = createClient({ url: this.redisUrl });
  }

  initConnection(): Promise<RedisConnection> {
    if (this.client?.isOpen) return Promise.resolve(this);

    return new Promise((resolve, reject) =>
      this.client
        .connect()
        .then(() => {
          // TEST: wrap the following in setTimeout to test creating duplicate connections in the case of connection delay/failure
          this.ready = true;
          this.emitter.emit("ready");
          this.deferMarkForClose();
          resolve(this);
        })
        .catch(reject)
    );
  }

  close() {
    // console.log(`closing redis-${this.id}`);
    return this.client.quit();
  }

  getCurrent(): Promise<string> {
    return new Promise((resolve) => {
      this.client
        .get(CURR)
        .then(resolve)
        .catch((err) => {
          console.error(err);
          resolve(`${new Date().valueOf()}`);
        });
    });
  }

  updateCurrent() {
    return new Promise((resolve) => {
      const d1 = new Date();
      const d2 = new Date(d1.getTime() + DurationMS.MIN).valueOf(); // 1 min delay
      this.client
        .set(CURR, d2)
        .then(resolve)
        .catch((err) => {
          console.info(
            `RedisConenction ${this.id} ${ServerInfo.REDIS_SET_FAIL}: ${CURR}`
          );
          console.info(`Error: ${err?.message}`);
        });
    });
  }

  set(value: any, pKey: string, sKey?: string): Promise<any | void> {
    const val = typeof value === "string" ? value : JSON.stringify(value);
    const isHSet = sKey !== undefined;
    return new Promise((resolve) => {
      (isHSet ? this.client.HSET(pKey, sKey, val) : this.client.set(pKey, val))
        .then(() => this.client.expire(pKey, DEFAULT_EXPIRE_S))
        .then(resolve)
        .catch((err) => {
          const key = isHSet ? `${pKey}-${sKey}` : pKey;
          console.info(
            `RedisConenction ${this.id} ${ServerInfo.REDIS_SET_FAIL}: ${key}`
          );
          console.info(`Error: ${err?.message}`);
          resolve(-1);
        });
    });
  }

  setKeyValue(key: string, value: any, ttl?: number): Promise<number> {
    const val = typeof value === "string" ? value : JSON.stringify(value);
    return new Promise((resolve) => {
      this.client
        .set(key, val)
        .then(() => resolve(1))
        .catch((err) => {
          console.info(
            `RedisConenction ${this.id} ${ServerInfo.REDIS_SET_FAIL}: ${key}`
          );
          console.info(`Error: ${err?.message}`);
          resolve(-1);
        })
        .finally(() => ttl && this.client.expire(key, ttl));
    });
  }

  _get<T = any>(defaultVal: T, pKey: string, sKey?: string): Promise<T> {
    return new Promise((resolve) => {
      const isHGet = sKey !== undefined;
      (isHGet ? this.client.HGET(pKey, sKey) : this.client.get(pKey))
        .then((val) => {
          if (!val) resolve(defaultVal);
          else {
            if (pKey !== HOME) this.client.expire(pKey, DEFAULT_EXPIRE_S);
            resolve(JSON.parse(val) as T);
          }
        })
        .catch((err) => {
          const key = isHGet ? `${pKey}-${sKey}` : pKey;
          console.info(
            `RedisConenction ${this.id} ${ServerInfo.REDIS_GET_FAIL}: ${key}`
          );
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
          console.error(err);
          resolve(null);
        });
    });
  }

  _hgetall<T = any>(
    defaultVal: Record<string, T>[],
    keys: string[]
  ): Promise<Record<string, T>[]> {
    return new Promise((resolve) => {
      Promise.all(keys.map(this._hget<Record<string, T>>))
        .then((maps) => resolve(maps))
        .catch((err) => {
          console.info(
            `RedisConenction ${this.id} ${
              ServerInfo.REDIS_HGETALL_FAIL
            }: ${JSON.stringify(keys)}`
          );
          console.info(`Error: ${err?.message}`);
          resolve(defaultVal);
        });
    });
  }

  get<T = any>(defaultVal: T, pKey: string, sKey?: string): Promise<T> {
    return setPromiseTimeout<T>(
      () => this._get(defaultVal, pKey, sKey),
      2000,
      defaultVal
    );
  }

  getMaps<T = any>(keys: string | string[]): Promise<Record<string, T>[]> {
    const _keys = typeof keys === "string" ? [keys] : keys;
    return setPromiseTimeout(() => this._hgetall<T>([], _keys), 2000, []);
  }

  del(keys: string | string[]): Promise<void> {
    const _keys = typeof keys === "string" ? [keys] : keys;
    return _keys?.length
      ? new Promise((resolve) => {
          try {
            _keys.forEach((key) => this.client.del(key));
          } catch (err) {
            console.info(
              `${ServerInfo.REDIS_DEL_FAIL}: ${JSON.stringify(_keys)}`
            );
            console.info(`Error: ${err?.message}`);
          } finally {
            resolve();
          }
        })
      : Promise.resolve();
  }

  /**
   * @TODO how to hdel(pKey, ...sKeys)
   */
  hdel(pKey: string, sKey: string): Promise<number> {
    return new Promise((resolve) => {
      this.client
        .HDEL(pKey, sKey)
        .then(resolve)
        .catch((err) => {
          console.error(err);
          resolve(-1);
        });
    });
  }

  async read(
    uN: string,
    pr: boolean,
    date = "",
    search = "",
    limit = PAGINATE_LIMIT
  ): Promise<IPost[]> {
    const _date = date || (await this.getCurrent());
    const { pKey, sKey, fullKey } = this.getKeys(uN, pr, _date, search, limit);
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
    search = "",
    limit = PAGINATE_LIMIT
  ): Promise<void> {
    if (!posts.length) return;
    return new Promise(async (resolve) => {
      const _date = date || (await this.getCurrent());
      const keys = this.getKeys(uN, pr, _date, search, limit);
      const { pKey, sKey, fullKey } = keys;
      let postIds = "";
      posts.forEach((post) => (postIds += post.id + "|"));
      this.set(postIds, pKey, sKey)
        .then(() => this.set(posts, fullKey))
        .then(resolve);
      if (!uN && !pr && !date) this.setKeyValue(HOME, posts);
    });
  }

  /**
   * Reset cached values in Redis if they contain the edited/deleted post.
   * @NB this will not reset `HOME` value as it is a preliminary return for
   * SSR and will be overriden on each `HOME` request by `usePaginatePosts`.
   *
   * @param privacyChange:
   *  0 (no change); 1 (public -> private); 2 (private -> public)
   */
  resetCache(post: Partial<IPost>, privacyChange = 0): Promise<void> {
    return new Promise((resolve) => {
      const { id, isPrivate, slug, username } = post;
      if (!id) return;
      const prKey = this.getPrimaryKey(username, true); // private Q for user
      const puKey = this.getPrimaryKey(username, false); // public Q for user
      const hKey = // public Q for recent
        !isPrivate || Boolean(privacyChange)
          ? this.getPrimaryKey("", false)
          : "";
      this.getMaps([prKey, puKey, hKey])
        .then((maps) => {
          const parentMap = {
            [prKey]: maps[0],
            [puKey]: maps[1],
            [hKey]: maps[2],
          };
          return this.resetHelper(
            parentMap,
            id,
            Boolean(hKey),
            privacyChange === 2 ? hKey : ""
          );
        })
        .then((toDelete) => this.del([...toDelete, `NM_${username}-${slug}`]))
        .catch(console.info)
        .finally(resolve);
    });
  }

  resetHelper(
    map: Record<string, Record<string, string>>,
    postId: string,
    resetHome = false,
    resetAll = ""
  ): Promise<string[]> {
    return new Promise((resolve) => {
      const fullKeys = [];
      if (isEmpty(map)) resolve(fullKeys);
      for (const pKey of Object.keys(map)) {
        const sMap = map[pKey];
        if (resetAll === pKey) {
          for (const sKey of Object.keys(sMap)) {
            this.hdel(pKey, sKey);
            fullKeys.push(pKey + Flag.DATE_TAG + sKey);
          }
        } else if (isEmpty(sMap)) {
          continue;
        } else {
          for (const sKey of Object.keys(sMap)) {
            if (!sMap[sKey]) continue;
            const postIds = sMap[sKey].split("|");
            if (postIds.indexOf(postId) !== -1) {
              this.hdel(pKey, sKey);
              fullKeys.push(pKey + Flag.DATE_TAG + sKey);
            }
          }
        }
      }
      if (resetHome) this.del(HOME);
      resolve(fullKeys);
    });
  }

  newPostCreated(post: IPost): Promise<void> {
    return new Promise((resolve) => {
      const { username, isPrivate } = post;
      const privateQUser = this.getPrimaryKey(username, isPrivate);
      let toDelete = [privateQUser, HOME];
      if (!isPrivate) {
        const publicQUser = this.getPrimaryKey(username, true); // public Q for user
        const publicQHome = this.getPrimaryKey("", false); // public Q for recent
        toDelete = [...toDelete, publicQUser, publicQHome];
      }
      this.del(toDelete)
        .then(async () => await this.updateCurrent())
        .catch(console.info)
        .finally(resolve);
    });
  }

  getPrimaryKey(username: string, isPrivate: boolean, search = "") {
    return `NM_${Flag.USER_TAG}${username || ""}&${Flag.PRIVATE_TAG}${
      isPrivate ? "y" : "n"
    }&${Flag.SEARCH}${search}`;
  }

  getKeys(
    username: string,
    isPrivate: boolean,
    date: string,
    search: string,
    limit: number
  ) {
    const pKey = this.getPrimaryKey(username, isPrivate, search);
    const sKey = `${Flag.DATE_TAG}${date}&${Flag.LIMIT_TAG}${limit}`;
    const fullKey = `${pKey}&${sKey}`;
    return { pKey, sKey, fullKey };
  }
}

export default RedisConnection;
