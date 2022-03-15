import { extend, isEmpty, reject } from "lodash";
import { ApiInfo, DBService } from "../../enum";
import { mongodbConn } from "../../lib/mongodb";
import { IItem, IResponse } from "../../types";

function createItem(params: Object) {
  const baseItem: Partial<IItem> = {
    item_name: "",
    description: "",
    condition: "",
    images: [],
    createdAt: "",
    updatedAt: "",
    price: 0,
    status: "",
    reviews: [],
    likes: [],
  };
  return extend(baseItem, params);
}

async function getById(params: object, limit = 1): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      const { db } = await mongodbConn();
      if (db) {
        if (limit === 1) {
          const ref = db.collection(DBService.ITEMS);
          await ref.findOne(params).then((data) => {
            if (isEmpty(data)) {
              resolve({ status: 200, message: ApiInfo.USER_NA });
            } else {
              resolve({
                status: 200,
                message: ApiInfo.USER_RETRIEVED,
                ...data,
              });
            }
          });
        }
      }
    } catch (err) {
      reject(err);
    }
  });
}
