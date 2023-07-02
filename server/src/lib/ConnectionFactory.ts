import { ConnectionType } from "../enums";
import ConnectionInstance from "./ConnectionInstance";
import MongoConnection from "./MongoConnection";
import RedisConnection from "./RedisConnection";

class ConnectionFactory<T extends ConnectionInstance> {
  private connectionType: ConnectionType;

  constructor(connectionType: ConnectionType) {
    this.connectionType = connectionType;
  }

  createConnection(id: string) {
    switch (this.connectionType) {
      case ConnectionType.MONGO:
        return new MongoConnection(id) as unknown as T;
      case ConnectionType.REDIS:
        return new RedisConnection(id) as unknown as T;
      default:
        return null;
    }
  }
}

export default ConnectionFactory;
