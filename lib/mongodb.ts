import { Db, MongoClient } from "mongodb";
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.DB_NAME;

interface IMongoAccess {
  client?: MongoClient;
  db?: Db;
}

let cached: IMongoAccess = {};

export async function mongodbConn(): Promise<IMongoAccess> {
  return new Promise(async (res) => {
    if (cached.client && cached.db) {
      res(cached);
    }
    try {
      if (!MONGODB_URI || !MONGODB_DB) {
        throw new Error("Check environmental variables");
      }
      const initClient = new MongoClient(MONGODB_URI);
      await initClient.connect().then(() => {
        cached.client = initClient;
        cached.db = initClient.db(MONGODB_DB);
      });
    } catch (err) {
      console.error(err);
    } finally {
      res(cached);
    }
  });
}

// const opts = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// };
