import axios from "axios";
import { CACHE_DEFAULT, EXPERIMENTAL_RUNTIME, SERVER_URL } from "consts";
import { APIAction, ErrorMessage, HttpRequest, ServerInfo } from "enums";
import {
  decodeToken,
  forwardResponse,
  generateToken,
  handleAPIError,
  handleBadRequest,
  handleRequest,
  processUserData,
  verify,
} from "lib/middlewares";
import { throwAPIError } from "lib/middlewares/util";
import { MongoConnection, ServerError } from "lib/server";
import { isEmpty } from "lodash";
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
      return handleRequest(req, res, patchDoc);
    case HttpRequest.DELETE:
      return handleRequest(req, res, deleteDoc);
    default:
      return handleBadRequest(res);
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
  const { action, ...reqBody } = req.body as Partial<IUserReq>;
  const { email = "", username = "", password = "" } = reqBody;
  if (action === APIAction.USER_TOKEN_LOGIN) {
    console.log("-> USER_TOKEN_LOGIN");
    return handleTokenLogin(req, res);
  } else if ((!email && !username) || !password) {
    return handleBadRequest(res);
  } else {
    await (action === APIAction.LOGIN
      ? handleLogin(reqBody)
      : handleRegister(reqBody)
    )
      .then((payload) => forwardResponse(res, payload))
      .catch((err) => handleAPIError(res, err));
  }
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
            return resolve({ status: 200, message: ServerInfo.EMAIL_USED });
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

/**
 * @param reqBody: username, password, login, ...
 * Handle login and register depending on login arg.
 * @resolve {..., token: JWT}
 */
async function handleLogin(reqBody: Partial<IUserReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { username, password } = reqBody;
    const { User } = await MongoConnection();
    User.findOne({ username })
      .then((userData) => {
        const user = userData?._doc;
        if (isEmpty(user) || !verify({ username, password }, user)) {
          resolve({
            status: 200,
            message: ServerInfo.USER_BAD_LOGIN,
            data: { token: null },
          });
        } else {
          resolve({
            status: 200,
            message: ServerInfo.USER_LOGIN,
            data: {
              token: generateToken(
                user._id,
                user.email,
                username,
                user.isAdmin
              ),
              user: processUserData(user, user._id, true),
            },
          });
        }
      })
      .catch((err) => throwAPIError(reject, err, ErrorMessage.U_LOGIN_FAILED));
  });
}

async function handleTokenLogin(
  req: NextApiRequest,
  res: NextApiResponse<IResponse | any>
) {
  const { id } = decodeToken<Partial<IUser>>(req);
  if (!id) {
    handleAPIError(res, new ServerError(401));
  } else {
    await getUser({ _id: id }, true)
      .then((payload) => forwardResponse(res, payload))
      .catch((err) => handleAPIError(res, err));
  }
}

async function patchDoc(req: NextApiRequest): Promise<IResponse> {
  const reqBody: Partial<IUserReq> = req.body;
  return new Promise(async (resolve, reject) => {
    const userId = req.headers["user-id"];
    const { action, ..._existingUser } = reqBody;
    const { email, username } = _existingUser;
    try {
      const { User } = await MongoConnection();
      let user;
      if (action === APIAction.USER_SET_USERNAME) {
        await User.exists({ username }).then(async (exists) => {
          if (exists) {
            resolve({
              status: 200,
              message: ServerInfo.USERNAME_TAKEN,
            });
            return;
          }
        });
        user = await User.findById(userId);
        user.username = username;
      } else {
        user = await User.findById(userId);
        for (const key of Object.keys(_existingUser))
          user[key] = _existingUser[key];
      }
      await user
        .save()
        .then((userData) => {
          const user = userData?._doc;
          const token = generateToken(user._id, email, username, user.isAdmin);
          resolve({
            status: 200,
            message: ServerInfo.USER_UPDATED,
            data: {
              user: processUserData(user, user._id, true),
              token,
            },
          });
        })
        .catch((err) => reject(new ServerError(500, err.message)));
    } catch (err) {
      throwAPIError(reject, err, ErrorMessage.U_UPDATE_FAILED);
    } finally {
      resolve({ status: 200 });
    }
  });
}

async function deleteDoc(req: NextApiRequest) {
  const userId = req.headers["user-id"];
  return new Promise(async (resolve, reject) => {
    const { User } = await MongoConnection();
    User.findByIdAndDelete(userId, (err, _, __) => {
      if (!!err) {
        reject(new ServerError(500, err.message));
      } else {
        resolve({ status: 200, message: ServerInfo.USER_DELETED });
      }
    }).catch((err) => {
      throwAPIError(reject, err, ErrorMessage.U_DELETE_FAILED);
    });
  });
}
