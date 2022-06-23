import { ServerInfo } from "enums";
import { createClient } from "redis";

const client = createClient({ url: process.env.ENV_REDIS_URL });

export function redisSet(key: string, user: boolean, value: any) {
  const val = typeof value === "string" ? value : JSON.stringify(value);
  client
    .connect()
    .then(() => {
      client.set(key, val);
      client.expire(key, user ? 300 : 600); // expire value
    })
    .then(() => console.info(`${ServerInfo.REDIS_SET_SUCCESS}: ${key}`))
    .catch((err) =>
      console.info(
        `${ServerInfo.REDIS_SET_FAIL} - ${key}. Error message: ${err?.message}`
      )
    )
    .finally(() => client.quit());
}

export async function redisGet(key: string) {
  return new Promise((resolve) => {
    client
      .connect()
      .then(() => client.get(key))
      .then((val) => resolve(JSON.parse(val)))
      .then(() => console.info(`${ServerInfo.REDIS_GET_SUCCESS}: ${key}`))
      .catch((err) => {
        console.info(
          `${ServerInfo.REDIS_GET_FAIL} - ${key}. Error message: ${err?.message}`
        );
        resolve([]);
      })
      .finally(() => client.quit());
  });
}

export async function redisDel(key: string) {
  client
    .connect()
    .then(() => client.del(key))
    .then(() => console.info(`${ServerInfo.REDIS_DEL_SUCCESS}: ${key}`))
    .catch((err) => {
      console.info(
        `${ServerInfo.REDIS_DEL_FAIL} - ${key}. Error message: ${err?.message}`
      );
    });
}
