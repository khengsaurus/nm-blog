import { ConnectionType } from "../enums";
import ConnectionFactory from "./ConnectionFactory";
import ConnectionInstance from "./ConnectionInstance";
import MongoConnection from "./MongoConnection";
import RedisConnection from "./RedisConnection";

type ConnectionReq<T> = Promise<{ errorStatus: number; conn: T }>;

class ConnectionPool<T extends ConnectionInstance> {
  private connectionFactory: ConnectionFactory<T>;
  private connectionMap: Map<string, T>;
  private type: ConnectionType;

  constructor(type: ConnectionType, cleanupInterval = 30_000) {
    this.type = type;
    this.connectionMap = new Map();
    this.connectionFactory = new ConnectionFactory<T>(type);
    this.initCleanup(cleanupInterval);
  }

  getConnection(id: string): ConnectionReq<T> {
    const defaultId = `${id}_0`;
    let defaultExists = false;
    return new Promise(async (resolve) => {
      const existingConn = this.connectionMap.get(defaultId);
      if (existingConn) {
        defaultExists = true;
        let error = false;
        if (existingConn.ready) {
          existingConn.deferMarkForClose();
        } else {
          await existingConn.awaitReady().catch((err) => {
            console.info(
              `ConnectionPool getConnection ${this.type}-${defaultId} failed: ${err?.message}`
            );
            error = true;
          });
        }
        if (!error) {
          return resolve({ errorStatus: 0, conn: existingConn });
        }
      }

      try {
        let count = defaultExists ? 1 : 0;
        while (this.connectionMap.has(`${id}-${count}`)) count++;
        const _id = `${id}_${count}`;

        const newConnection = this.connectionFactory.createConnection(_id);
        this.connectionMap.set(_id, newConnection);

        await newConnection.initConnection().then(async (connection) => {
          if (connection) {
            this.connectionMap.set(_id, connection);
            resolve({ errorStatus: 0, conn: connection });
          } else {
            this.connectionMap.delete(_id);
            throw new Error(
              `ConnectionPool - failed to create ${this.type}-${_id}`
            );
          }
        });
      } catch (err) {
        console.error(err);
        resolve({ errorStatus: 1, conn: null });
      }
    });
  }

  initCleanup(interval: number) {
    setInterval(() => {
      for (const [id, conn] of this.connectionMap) {
        if (conn.markedForClose) {
          conn
            .close()
            .catch(console.error)
            .finally(() => this.connectionMap.delete(id));
        }
      }
    }, interval);
  }

  getInfo() {
    const totalConns = Array.from(this.connectionMap.values());
    const active = totalConns.filter((c) => !c.markedForClose);
    const inactive = totalConns.filter((c) => c.markedForClose);

    return {
      total: totalConns.length,
      active: active.map((c) => c.id),
      inactive: inactive.map((c) => c.id),
    };
  }
}

const MongoConnectionPool = new ConnectionPool<MongoConnection>(
  ConnectionType.MONGO
);

const RedisConnectionPool = new ConnectionPool<RedisConnection>(
  ConnectionType.REDIS
);

export { MongoConnectionPool, RedisConnectionPool };
