import { Collection, Db, MongoClient } from "mongodb";
import { DBService } from "../../enum";
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

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
      if (!MONGODB_URI || !DB_NAME) {
        throw new Error("Check environmental variables");
      }
      const initClient = new MongoClient(MONGODB_URI);
      await initClient.connect().then(() => {
        cached.client = initClient;
        cached.db = initClient.db(DB_NAME);
      });
    } catch (err) {
      console.error(err);
    } finally {
      res(cached);
    }
  });
}

export async function getConnection(
  service: DBService
): Promise<Collection<Document>> {
  try {
    const { db } = await mongodbConn();
    if (db) {
      return db.collection(service);
    } else {
      return null;
    }
  } catch (err) {
    throw err;
  }
}
