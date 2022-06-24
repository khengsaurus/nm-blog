import { ServerInfo } from "enums";
import { createClient } from "redis";

const client = createClient({ url: process.env.ENV_REDIS_URL });

function openClient(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    if (client.isOpen) resolve();
    else {
      await client
        .connect()
        .then(() => resolve())
        .catch((err) => reject(err));
    }
  });
}

function closeClient() {
  if (client.isOpen) client.quit().catch((err) => console.info(err?.message));
}

export function redisSet(key: string, user: boolean, value: any) {
  const val = typeof value === "string" ? value : JSON.stringify(value);
  openClient()
    .then(() => {
      client.set(key, val);
      client.expire(key, user ? 240 : 480);
    })
    .then(() => console.info(`${ServerInfo.REDIS_SET_SUCCESS}: ${key}`))
    .catch((err) => {
      console.info(`${ServerInfo.REDIS_SET_FAIL}: ${key}`);
      console.info(`Error message: ${err?.message}`);
    })
    .finally(closeClient);
}

export async function redisGet(key: string) {
  return new Promise((resolve) => {
    openClient()
      .then(() => client.get(key))
      .then((val) => resolve(JSON.parse(val)))
      .then(() => console.info(`${ServerInfo.REDIS_GET_SUCCESS}: ${key}`))
      .catch((err) => {
        console.info(`${ServerInfo.REDIS_GET_FAIL}: ${key}`);
        console.info(`Error message: ${err?.message}`);
        resolve([]);
      })
      .finally(closeClient);
  });
}

export async function redisDel(keys: string[]) {
  openClient()
    .then(() => keys.forEach((key) => client.del(key)))
    .then(() =>
      console.info(`${ServerInfo.REDIS_DEL_SUCCESS}: ${JSON.stringify(keys)}`)
    )
    .catch((err) => {
      console.info(`${ServerInfo.REDIS_DEL_FAIL}: ${JSON.stringify(keys)}`);
      console.info(`Error message: ${err?.message}`);
    })
    .finally(closeClient);
}

// // Hash operations
// export function redisHSet(
//   parentKey: string,
//   childKey: string,
//   user: boolean,
//   value: any
// ) {
//   const val = typeof value === "string" ? value : JSON.stringify(value);
//   client
//     .connect()
//     .then(() => {
//       client.HSET(parentKey, childKey, val);
//       client.expire(parentKey, user ? 240 : 480);
//     })
//     .then(() =>
//       console.info(`${ServerInfo.REDIS_HSET_SUCCESS}: ${parentKey}-${childKey}`)
//     )
//     .catch((err) =>
//       console.info(
//         `${ServerInfo.REDIS_HSET_FAIL}: ${parentKey}-${childKey}: ${err?.message}`
//       )
//     )
//     .finally(() => client.quit());
// }

// export async function redisHGet(parentKey: string, childKey: string) {
//   return new Promise((resolve) => {
//     client
//       .connect()
//       .then(() => client.HGET(parentKey, childKey))
//       .then((val) => resolve(JSON.parse(val)))
//       .then(() =>
//         console.info(
//           `${ServerInfo.REDIS_HGET_SUCCESS}: ${parentKey}-${childKey}`
//         )
//       )
//       .catch((err) => {
//         console.info(
//           `${ServerInfo.REDIS_HGET_FAIL}: ${parentKey}-${childKey}: ${err?.message}`
//         );
//         resolve([]);
//       })
//       .finally(() => client.quit());
//   });
// }
