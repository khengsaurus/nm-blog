import axios from "axios";
import { CACHE_DEFAULT, EXPERIMENTAL_RUNTIME, SERVER_URL } from "consts";
import { ErrorMessage, HttpRequest } from "enums";
import {
  forwardResponse,
  handleAPIError,
  handleAuthRequest,
} from "lib/middlewares";
import { throwAPIError } from "lib/middlewares/util";
import { ServerError } from "lib/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { getClientIp } from "request-ip";
import { IPostReq, IResponse } from "types";

export const config = EXPERIMENTAL_RUNTIME;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case HttpRequest.GET:
      return handleGet(req, res);
    case HttpRequest.POST:
      return handleAuthRequest(req, res, createDoc);
    case HttpRequest.PATCH:
      return handleAuthRequest(req, res, patchDoc);
    case HttpRequest.DELETE:
      return handleAuthRequest(req, res, deleteDoc);
    default:
      return res.status(405);
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const reqQuery = req.query as Partial<IPostReq>;
  const singlePost = (reqQuery?.limit || 1) <= 1;
  const clientIp = getClientIp(req);
  await (singlePost
    ? getPost(reqQuery, clientIp)
    : getPosts(reqQuery, clientIp)
  )
    .then((payload) => {
      if (payload.status === 200) {
        res.setHeader("Cache-Control", singlePost ? "no-cache" : CACHE_DEFAULT);
      }
      forwardResponse(res, payload);
    })
    .catch((err) => handleAPIError(res, err));
}

function getPost(
  params: Pick<IPostReq, "id" | "slug" | "username" | "fresh">,
  clientIp: string
): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const { id, slug, username } = params;
    if (!id && !username && !slug) return reject(new ServerError(400));

    axios
      .get(`${SERVER_URL}/post`, {
        params,
        headers: { "x-client-ip": clientIp },
      })
      .then((res) => {
        const { message, post, error } = res?.data;
        if (error) throw new Error(message);

        resolve({ status: res.status, message, data: { post } });
      })
      .catch((err) => throwAPIError(reject, err, ErrorMessage.P_RETRIEVE_FAIL));
  });
}

function getPosts(
  params: Partial<IPostReq>,
  clientIp: string
): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    axios
      .get(`${SERVER_URL}/posts`, {
        params,
        headers: { "x-client-ip": clientIp },
      })
      .then((res) => {
        const { message, posts, error } = res?.data;
        if (error) throw new Error(message);

        resolve({ status: res.status, message, data: { posts } });
      })
      .catch((err) => throwAPIError(reject, err, ErrorMessage.P_RETRIEVE_FAIL));
  });
}

function createDoc(req: NextApiRequest): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const userId = req.headers["user-id"];
    if (!userId) return reject(new ServerError(400));

    axios
      .post(
        `${SERVER_URL}/post`,
        { ...req.body, userId },
        { headers: { "x-client-ip": getClientIp(req) } }
      )
      .then((res) => {
        const { message, post, error } = res?.data;
        if (error) throw new Error(message);

        resolve({ status: res.status, message, data: { post } });
      })
      .catch((err) => throwAPIError(reject, err, ErrorMessage.P_CREATE_FAIL));
  });
}

function patchDoc(req: NextApiRequest): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    axios
      .put(`${SERVER_URL}/post`, req.body, {
        headers: { "x-client-ip": getClientIp(req) },
      })
      .then((res) => {
        const { error, message, post } = res?.data;
        if (error) throw new Error(message);

        resolve({
          status: res.status,
          message,
          data: { post },
        });
      })
      .catch((err) => throwAPIError(reject, err, ErrorMessage.P_UPDATE_FAIL));
  });
}

function deleteDoc(req: NextApiRequest): Promise<IResponse> {
  return new Promise(async (resolve, reject) => {
    const userId = req.headers["user-id"];
    if (!userId) return reject(new ServerError(400));

    axios
      .delete(`${SERVER_URL}/post`, {
        data: { ...req.query, userId },
        headers: { "x-client-ip": getClientIp(req) },
      })
      .then((res) => {
        const { error, message } = res?.data;
        if (error) throw new Error(message);
        else resolve({ status: res.status, message });
      })
      .catch((err) => throwAPIError(reject, err, ErrorMessage.P_UPDATE_FAIL));
  });
}
