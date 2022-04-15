import { NextApiRequest, NextApiResponse } from "next";
import { DBService } from "../../enum";
import { IResponse } from "../../types";

export abstract class Service {
  protected service: DBService;

  constructor(service: DBService) {
    this.service = service;
  }

  abstract createObj(params: Object);

  abstract createDoc<T>(reqBody: Partial<T>): Promise<IResponse>;

  abstract getDoc(params: object, limit: number): Promise<IResponse>;

  abstract updateDoc<T>(params: Partial<T>): Promise<IResponse>;

  abstract runTransaction<T>(params: Partial<T>): Promise<IResponse>;

  abstract deleteDoc(params: Object);

  public abstract handler(
    req: NextApiRequest,
    res: NextApiResponse<IResponse | any>
  );

  // Type instantiation is excessively deep and possibly infinite.
  // Argument of type 'Collection<Document>' is not assignable to parameter of type 'Collection<Document> | PromiseLike<Collection<Document>>'
  // protected getConnection = (): Promise<Collection<Document>> => {
  //   return new Promise(async (resolve, reject) => {
  //     const { db } = await mongodbConn();
  //     if (db) {
  //       const ref = db.collection(this.service);
  //       resolve(ref);
  //     } else {
  //       reject(
  //         new Error(`Failed to establish conenction to ${this.service} service`)
  //       );
  //     }
  //   });
  // };
}
