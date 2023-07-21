import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { SERVER_URL } from "consts";
import { ApiAction, DbService, HttpRequest } from "enums";
import ip from "ip";
import { IFileReq, IPostReq, IUserReq } from "types";

const nextHandlers = [DbService.FILES];

class AuthHttpService {
  private serverInstance: AxiosInstance;
  private nextInstance: AxiosInstance;

  constructor() {
    this.nextInstance = axios.create({
      baseURL: "/api/",
      headers: {
        Authorization: `Bearer ${process.env.BEARER}`,
        "Content-Type": "application/json",
      },
    });
    this.serverInstance = axios.create({
      baseURL: SERVER_URL,
      headers: {
        Authorization: `Bearer ${process.env.BEARER}`,
        "Content-Type": "application/json",
        "x-client-ip": ip.address(),
      },
    });
  }

  /**
   * Current flow is to have this called twice on app mount:
   * -> first time to set bearer token
   * -> handleTokenLogin to retrieve userId
   * -> second time to set user-id header
   */
  setBearer(userId: string, token: string) {
    if (!userId || !token) return;
    this.nextInstance.defaults.headers.common["user-id"] = userId;
    this.nextInstance.defaults.headers.common["user-token"] = token;
    this.serverInstance.defaults.headers.common["user-id"] = userId;
    this.serverInstance.defaults.headers.common["user-token"] = token;
  }

  handleTokenLogin(token: string) {
    return this.makeAuthHttpReq(DbService.USER, HttpRequest.POST, {
      token,
      action: ApiAction.USER_TOKEN_LOGIN,
    });
  }

  /**
   * Content-Type: application/json by default.
   * Headers will contain user-id & user-token if user is logged in
   */
  makeAuthHttpReq(
    service: DbService,
    method: HttpRequest,
    bodyOrParams?: Partial<IPostReq | IUserReq | IFileReq>,
    config?: AxiosRequestConfig<any>
  ) {
    const handler = nextHandlers.includes(service)
      ? this.nextInstance
      : this.serverInstance;

    switch (method) {
      case HttpRequest.GET:
        return handler.get(service, { params: bodyOrParams, ...config });
      case HttpRequest.POST:
        return handler.post(service, { ...bodyOrParams }, config);
      case HttpRequest.PUT:
        return handler.put(service, { ...bodyOrParams }, config);
      case HttpRequest.PATCH:
        return handler.patch(service, { ...bodyOrParams }, config);
      case HttpRequest.DELETE:
        return handler.delete(service, {
          ...config,
          params: { ...bodyOrParams },
        });
      default:
        return null;
    }
  }
}

export default AuthHttpService;
