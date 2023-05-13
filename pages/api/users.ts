import axios from "axios";
import { CACHE_DEFAULT, EXPERIMENTAL_RUNTIME, SERVER_URL } from "consts";
import {
  APIAction,
  ErrorMessage,
  HttpRequest,
  HttpResponse,
  ServerInfo,
} from "enums";
import {
  decodeToken,
  forwardResponse,
  handleAPIError,
  handleAuthRequest,
} from "lib/middlewares";
import { throwAPIError } from "lib/middlewares/util";
import { ServerError } from "lib/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { IResponse, IUser, IUserReq } from "types";

export const config = EXPERIMENTAL_RUNTIME;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case HttpRequest.GET:
      return handleGet(req, res);
    case HttpRequest.POST:
      return handlePost(req, res);
    case HttpRequest.PATCH:
      return handleAuthRequest(req, res, authPatchDoc);
    case HttpRequest.DELETE:
      return handleAuthRequest(req, res, authDeleteDoc);
    default:
      return res.status(405);
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const reqQuery = req.query as Partial<IUserReq>;
  if (!reqQuery.username) {
    return forwardResponse(res, {
      status: 200,
      message: ServerInfo.USER_NA,
      data: { user: {} },
    });
  } else {
    const getSlugs = reqQuery.action === APIAction.GET_POST_SLUGS;
    res.setHeader("Cache-Control", getSlugs ? "no-cache" : CACHE_DEFAULT);

    return getUser(reqQuery)
      .then((payload) => forwardResponse(res, payload))
      .catch((err) => handleAPIError(res, err));
  }
}

function getUser(
  params: Partial<IUserReq>,
  isPrivate = false
): Promise<IResponse> {
  return new Promise((resolve, reject) => {
    axios
      .get(`${SERVER_URL}/user`, { params: { ...params, isPrivate } })
      .then((res) => {
        const { message, error, user } = res?.data;
        if (error) throw new Error(message);

        resolve({
          status: res?.status || 500,
          message,
          data: { user },
        });
      })
      .catch((err) =>
        throwAPIError(reject, err, ErrorMessage.U_RETRIEVE_FAILED)
      );
  });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const {
    action,
    email = "",
    username = "",
    password = "",
  } = req.body as Partial<IUserReq>;

  if (action === APIAction.USER_TOKEN_LOGIN) {
    return handleTokenLogin(req, res);
  } else if ((!email && !username) || !password) {
    return res.status(400).json({ message: HttpResponse._400 });
  } else {
    await (action === APIAction.LOGIN
      ? handleLogin(req.body)
      : handleRegister(req.body)
    )
      .then((payload) => forwardResponse(res, payload))
      .catch((err) => handleAPIError(res, err));
  }
}

async function handleTokenLogin(
  req: NextApiRequest,
  res: NextApiResponse<IResponse | any>
) {
  const user = decodeToken<Partial<IUser>>(req);
  const { id } = user;
  if (!id) {
    handleAPIError(res, new ServerError(401));
  } else {
    return getUser({ _id: id }, true)
      .then((payload) => forwardResponse(res, payload))
      .catch((err) => handleAPIError(res, err));
  }
}

/**
 * @param reqBody: username, password, login, ...
 * Handle login and register depending on login arg.
 * @resolve {..., token: JWT}
 */
async function handleLogin(reqBody: Partial<IUserReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    axios
      .post(`${SERVER_URL}/user`, reqBody)
      .then((res) => {
        const { message, data } = res?.data;
        resolve({ status: res.status, message, data });
      })
      .catch((err) => throwAPIError(reject, err, ErrorMessage.U_LOGIN_FAILED));
  });
}

/**
 * @param reqBody: username, password, login, ...
 * Handle login and register depending on login arg.
 * @resolve {..., token: JWT, user: user object without username}
 */
function handleRegister(reqBody: Partial<IUserReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    await axios
      .post(`${SERVER_URL}/user`, reqBody)
      .then((res) => {
        const { message, user, token, error } = res?.data;
        if (error || !token || !user) {
          if (message === ServerInfo.EMAIL_USED) {
            return resolve({ status: 200, message });
          } else {
            throw new Error(message);
          }
        } else {
          return resolve({
            status: 200,
            message: ServerInfo.USER_REGISTERED,
            data: { token, user },
          });
        }
      })
      .catch((err) =>
        throwAPIError(reject, err, ErrorMessage.U_REGISTER_FAILED)
      );
  });
}

async function authPatchDoc(req: NextApiRequest): Promise<IResponse> {
  const reqBody: Partial<IUserReq> = req.body;
  return new Promise(async (resolve, reject) => {
    const userId = req.headers["user-id"];

    axios
      .patch(`${SERVER_URL}/user`, { ...reqBody, userId })
      .then((res) => {
        const { error, message, user, token } = res?.data;
        if (error) {
          throw new Error(message);
        }
        return resolve({ status: res.status, message, data: { user, token } });
      })
      .catch((err) => throwAPIError(reject, err, ErrorMessage.U_UPDATE_FAILED));
  });
}

async function authDeleteDoc(req: NextApiRequest) {
  const userId = req.headers["user-id"];

  return new Promise(async (resolve, reject) => {
    axios
      .delete(`${SERVER_URL}/user`, { data: { userId } })
      .then((res) => {
        const { message } = res?.data;
        resolve({ status: res.status, message });
      })
      .catch((err) => {
        throwAPIError(reject, err, ErrorMessage.U_DELETE_FAILED);
      });
  });
}
