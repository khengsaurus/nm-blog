import { APIAction, DBService } from "enums";
import { IResponse } from "types";
import { HTTPService } from ".";

// Tasks to be run as non-render-blocking, e.g. API calls to populate data etc

export async function getPostSlugs(username: string): Promise<IResponse> {
  return new Promise((resolve, reject) => {
    try {
      HTTPService.makeGetReq(DBService.USERS, {
        username,
        action: APIAction.GET_POST_SLUGS,
      }).then((res) => resolve(res));
    } catch (err) {
      console.info(err);
      reject(new Error(err.message));
    }
  });
}
