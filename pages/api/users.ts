import { isEmpty } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { APIAction, HttpRequest, ServerInfo } from "enums";
import {
  createUserObject,
  decodeToken,
  forwardResponse,
  generateToken,
  handleAPIError,
  handleBadRequest,
  handleRequest,
  processUserData,
  verify,
} from "lib/middlewares";
import { hashPassword, mongoConnection, ServerError } from "lib/server";
import { IResponse, IUser, IUserReq } from "types";

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
      message: ServerInfo.POST_NA,
      data: { user: {} },
    });
  } else {
    return (
      reqQuery.action === APIAction.GET_POST_SLUGS
        ? getPostSlugs(reqQuery)
        : getDoc(reqQuery)
    )
      .then((payload) => forwardResponse(res, payload))
      .catch((err) => handleAPIError(res, err));
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const reqBody = req.body as Partial<IUserReq>;
  const { email = "", username = "", password = "", action = "" } = reqBody;
  if (action === APIAction.USER_TOKEN_LOGIN) {
    return handleTokenLogin(req, res);
  } else if ((!email && !username) || !password) {
    return handleBadRequest(res);
  } else {
    (action === APIAction.LOGIN
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
async function handleRegister(reqBody: Partial<IUserReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { email, password } = reqBody;
    try {
      const { User } = await mongoConnection();
      await User.exists({ email }).then((exists) => {
        if (exists) {
          resolve({ status: 200, message: ServerInfo.EMAIL_USED });
        } else {
          // Create acc without setting username
          const user = createUserObject({
            email,
            password: hashPassword(password),
          });
          User.create(user).then((res) => {
            if (!!res.id) {
              const token = generateToken(email, email, res.id);
              resolve({
                status: 200,
                message: ServerInfo.USER_REGISTERED,
                data: { token, user: processUserData(user, res.id) },
              });
            } else {
              reject(new ServerError());
            }
          });
        }
      });
    } catch (err) {
      reject(new ServerError(500, err.message));
    }
  });
}

async function getDoc(params: object): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      const { User } = await mongoConnection();
      await User.findOne(params).then((userData) => {
        if (isEmpty(userData)) {
          resolve({ status: 200, message: ServerInfo.USER_NA });
        } else {
          resolve({
            status: 200,
            message: ServerInfo.USER_RETRIEVED,
            data: {
              user: processUserData(userData, userData._id),
            },
          });
        }
      });
    } catch (err) {
      reject(new ServerError(500, err.message));
    }
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
    try {
      const { User } = await mongoConnection();
      await User.findOne({ username }).then((userData) => {
        if (isEmpty(userData) || !verify({ username, password }, userData)) {
          resolve({
            status: 200,
            message: ServerInfo.USER_BAD_LOGIN,
            data: { token: null },
          });
        } else {
          const token = generateToken(userData.email, username, userData._id);
          resolve({
            status: 200,
            message: ServerInfo.USER_LOGIN,
            data: {
              token,
              user: processUserData(userData, userData._id),
            },
          });
        }
      });
    } catch (err) {
      reject(new ServerError(500, err.message));
    }
  });
}

async function getPostSlugs(reqBody: Partial<IUserReq>): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { username } = reqBody;
    try {
      const { User } = await mongoConnection();
      await User.findOne({ username })
        .populate(
          "posts",
          "-__v -user -username -title -body -isPrivate -createdAt -updatedAt -imageKey"
        )
        .then((userData) => {
          resolve({
            status: 200,
            message: ServerInfo.POST_SLUGS_RETRIEVED,
            data: {
              user: processUserData(userData, userData._id),
            },
          });
        });
    } catch (err) {
      reject(new ServerError(500, err.message));
    }
  });
}

async function handleTokenLogin(
  req: NextApiRequest,
  res: NextApiResponse<IResponse | any>
): Promise<IResponse> {
  return new Promise(async (_, reject) => {
    const { id } = decodeToken<Partial<IUser>>(req);
    if (!id) {
      reject(new ServerError(401));
    } else {
      await getDoc({ _id: id })
        .then((payload) => forwardResponse(res, payload))
        .catch((err) => handleAPIError(res, err));
    }
  });
}

async function patchDoc(req: NextApiRequest): Promise<IResponse> {
  const reqBody: Partial<IUserReq> = req.body;
  return new Promise(async (resolve, reject) => {
    const userId = req.headers["user-id"];
    const { action, ..._existingUser } = reqBody;
    const { email, username } = _existingUser;
    try {
      let user;
      const { User } = await mongoConnection();
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
          const token = generateToken(email, username, userData._id);
          resolve({
            status: 200,
            message: ServerInfo.USER_UPDATED,
            data: {
              user: processUserData(userData, userData._id),
              token,
            },
          });
        })
        .catch((err) => reject(new ServerError(500, err.message)));
    } catch (err) {
      reject(new ServerError(500, err.message));
    }
    resolve({ status: 200 });
  });
}

async function deleteDoc(req: NextApiRequest) {
  const userId = req.headers["user-id"];
  return new Promise(async (resolve, reject) => {
    try {
      const { User } = await mongoConnection();
      User.findByIdAndDelete(userId, (err, _, __) => {
        if (!!err) {
          reject(new ServerError(500, err.message));
        } else {
          resolve({ status: 200, message: ServerInfo.USER_DELETED });
        }
      });
    } catch (err) {
      reject(new ServerError(500, err.message));
    }
  });
}
