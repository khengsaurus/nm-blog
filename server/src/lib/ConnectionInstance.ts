import EventEmitter from "events";
import { ConnectionType } from "../enums";
import { setPromiseTimeout } from "../utils";

abstract class ConnectionInstance {
  public id: string;
  public type: ConnectionType;
  public connTimeout: number; // how long the connection stays open for
  public closeTimeout: NodeJS.Timeout; // timeout to close the connection
  public emitter = new EventEmitter();
  public markedForClose = false;
  public ready = false;

  abstract initConnection(): Promise<any>;
  abstract close(): Promise<any>;

  constructor(id: string, connTimeout = 15_000) {
    this.id = id;
    this.markedForClose = false;
    this.connTimeout = connTimeout;
  }

  awaitReady(timeout = 5_000) {
    return setPromiseTimeout(
      () => new Promise((resolve) => this.emitter.on("ready", resolve)),
      timeout
    );
  }

  clearEventListeners() {
    // console.log(`clearing all listeners ${this.type}-${this.id}`);
    this.emitter.removeAllListeners();
  }

  deferMarkForClose(close = false, connTimeout = this.connTimeout) {
    if (this.closeTimeout) clearTimeout(this.closeTimeout);
    this.closeTimeout = setTimeout(() => {
      this.clearEventListeners();
      this.markedForClose = true;
      if (close) this.close();
    }, connTimeout);
  }
}

export default ConnectionInstance;
