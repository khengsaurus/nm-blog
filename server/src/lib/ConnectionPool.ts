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
    this.connectionFactory = new ConnectionFactory<T>(type);
    this.connectionMap = new Map();
    this.type = type;
    this.initCleanup(cleanupInterval);
  }

  getConnection(id: string): ConnectionReq<T> {
    let index = 0;
    let searching = true;
    let connId = "";
    return new Promise(async (resolve) => {
      while (searching) {
        connId = `${id}_${index}`;
        const existingConn = this.connectionMap.get(connId);
        if (existingConn) {
          if (existingConn.ready && !existingConn.isInUse()) {
            // console.log(`reusing ${this.type}-${connId}`);
            existingConn.deferMarkForClose();
            return resolve({ errorStatus: 0, conn: existingConn });
          } else {
            index++;
          }
        } else {
          searching = false;
        }
      }

      try {
        // console.log(`creating ${this.type}-${connId}`);
        const newConnection = this.connectionFactory.createConnection(connId);
        this.connectionMap.set(connId, newConnection);

        await newConnection.initConnection().then(async (connection) => {
          if (connection) {
            this.connectionMap.set(connId, connection);
            resolve({ errorStatus: 0, conn: connection });
          } else {
            this.connectionMap.delete(connId);
            throw new Error(
              `ConnectionPool - failed to create ${this.type}_${connId}`
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
